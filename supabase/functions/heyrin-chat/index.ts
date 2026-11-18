import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

type InputMessage = { role: 'user' | 'assistant'; content: string };
const ORIGINS = (Deno.env.get('HEYREN_CHAT_ALLOWED_ORIGINS') || 'https://heyrin-voice.vercel.app')
  .split(',').map(origin => origin.trim()).filter(Boolean);

function headers(origin: string | null): HeadersInit {
  return {
    ...(origin && ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Headers': 'Content-Type, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };
}
function json(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}
async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async request => {
  const origin = request.headers.get('origin');
  if (origin && !ORIGINS.includes(origin)) return json(403, { error: 'Origin not allowed.' }, origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(origin) });
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' }, origin);

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const hashSalt = Deno.env.get('HEYREN_CHAT_HASH_SALT');
  if (!apiKey || !url || !serviceKey || !hashSalt) {
    return json(503, { error: 'Live chat is not configured.' }, origin);
  }

  // Explicit content cap before parsing and before incurring provider costs.
  const raw = await request.text();
  if (raw.length > 9_000) return json(413, { error: 'Conversation is too long.' }, origin);
  let messages: InputMessage[];
  try {
    const input: unknown = JSON.parse(raw);
    const parsed = (input as { messages?: unknown })?.messages;
    if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 12 ||
        parsed.some(message => !message || typeof message !== 'object' ||
          !['user', 'assistant'].includes(message.role) ||
          typeof message.content !== 'string' ||
          message.content.trim().length < 1 || message.content.length > 2_000) ||
        parsed.reduce((total, message) => total + message.content.length, 0) > 8_000 ||
        parsed[parsed.length - 1].role !== 'user') {
      return json(400, { error: 'Invalid chat message.' }, origin);
    }
    messages = parsed.map(({ role, content }: InputMessage) => ({ role, content: content.trim() }));
  } catch {
    return json(400, { error: 'Invalid request body.' }, origin);
  }

  try {
    // Supabase's proxy supplies this header; the salt prevents retaining raw client addresses.
    const ip = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
      || request.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await sha256(`${hashSalt}:${ip}`);
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: quotaClaimed, error: quotaError } = await supabase.rpc('heyrin_chat_claim_quota', {
      p_ip_hash: ipHash, p_limit: 8, p_daily_limit: 100,
    });
    if (quotaError) return json(503, { error: 'Live chat is temporarily unavailable.' }, origin);
    if (!quotaClaimed) return json(429, { error: 'Too many messages. Please try again later.' }, origin);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        model: Deno.env.get('HEYREN_CHAT_MODEL') || 'gpt-4o-mini',
        max_completion_tokens: 350,
        store: false,
        messages: [
          { role: 'system', content: 'You are Heyrin, a helpful website assistant for a business voice-agent concept. Answer questions clearly and briefly about recorded demos, potential workflows, lead qualification, and integrations that could be configured. This website has prerecorded conversations only and does not currently place real calls or book appointments; never claim those features are already connected. Do not invent pricing, customer results, deployments, or guarantees. Refer custom setup questions to the site contact form. Do not ask for sensitive information.' },
          ...messages,
        ],
      }),
    });
    if (!response.ok) return json(502, { error: 'The AI service is unavailable. Please try again.' }, origin);
    const result: { choices?: Array<{ message?: { content?: unknown } }> } = await response.json();
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) return json(502, { error: 'No answer was returned. Please retry.' }, origin);
    return json(200, { reply: reply.slice(0, 3_000) }, origin);
  } catch {
    return json(504, { error: 'The assistant could not respond. Please retry.' }, origin);
  }
});
