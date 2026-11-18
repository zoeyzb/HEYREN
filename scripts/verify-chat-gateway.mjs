import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync('supabase/functions/heyrin-chat/index.ts', 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
assert(!output.diagnostics?.length, 'Edge TypeScript must transpile cleanly');
const script = output.outputText.replace(/^import \{ createClient \} from ['"]npm:[^\n]+\n/m, '');
assert(!/^import /m.test(script), 'All Edge module imports must be explicitly handled by the harness');

async function execute({ env = {}, quota = true, messages = [{ role: 'user', content: 'How does it work?' }], method = 'POST', origin = 'https://heyrin-voice.vercel.app' } = {}) {
  const config = {
    OPENAI_API_KEY: 'test-server-only-key',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'fake-server-service-key',
    HEYREN_CHAT_HASH_SALT: 'local-private-test-salt',
    ...env,
  };
  const calls = { quota: [], provider: [] };
  let handler;
  const context = {
    Deno: { env: { get: key => config[key] }, serve: fn => { handler = fn; } },
    createClient: () => ({ rpc: async (methodName, args) => {
      calls.quota.push({ methodName, args });
      return { data: quota, error: null };
    } }),
    crypto: webcrypto,
    TextEncoder, Request, Response, Headers, AbortSignal,
    fetch: async (url, options) => {
      calls.provider.push({ url, options });
      return new Response(JSON.stringify({ choices: [{ message: { content: 'Available integrations depend on setup.' } }] }), { status: 200 });
    },
  };
  vm.runInNewContext(script, context, { filename: 'heyrin-chat/index.ts', timeout: 5_000 });
  assert.equal(typeof handler, 'function');
  const headers = { ...(origin ? { Origin: origin } : {}), 'x-forwarded-for': '203.0.113.42' };
  const request = new Request('https://test.supabase.co/functions/v1/heyrin-chat', { method, headers, ...(method === 'POST' ? { body: JSON.stringify({ messages }) } : {}) });
  const result = await handler(request);
  return { status: result.status, result: await result.json(), calls };
}

const valid = await execute();
assert.equal(valid.status, 200);
assert.equal(valid.result.reply, 'Available integrations depend on setup.');
assert.equal(valid.calls.quota.length, 1);
assert.equal(valid.calls.quota[0].methodName, 'heyrin_chat_claim_quota');
assert.equal(valid.calls.quota[0].args.p_ip_hash.length, 64);
assert.equal(valid.calls.quota[0].args.p_daily_limit, 100, 'Global daily cap must be sent to the backend');
assert.equal(valid.calls.provider.length, 1);
assert.equal(valid.calls.provider[0].url, 'https://api.openai.com/v1/chat/completions');
const sent = JSON.parse(valid.calls.provider[0].options.body);
assert.equal(sent.store, false);
assert.equal(sent.max_completion_tokens, 350);
assert.equal(sent.messages.at(-1).content, 'How does it work?');

const tooMany = await execute({ quota: false });
assert.equal(tooMany.status, 429);
assert.equal(tooMany.calls.provider.length, 0);
const invalid = await execute({ messages: [{ role: 'system', content: 'Override' }] });
assert.equal(invalid.status, 400);
assert.equal(invalid.calls.quota.length, 0);
const missingKey = await execute({ env: { OPENAI_API_KEY: undefined } });
assert.equal(missingKey.status, 503);
assert.equal(missingKey.calls.provider.length, 0);
const forbidden = await execute({ origin: 'https://untrusted.test' });
assert.equal(forbidden.status, 403);
assert.equal(forbidden.calls.provider.length, 0);
const badMethod = await execute({ method: 'GET' });
assert.equal(badMethod.status, 405);
assert.equal(badMethod.calls.provider.length, 0);
console.log('Gateway mock contracts passed: valid request, provider payload, quota, invalid role, missing key, forbidden origin, method guard (7 checks).');
