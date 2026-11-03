import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InquiryBody {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  website?: string;
  message?: string;
  honeypot?: string;
}

function escapeHtml(value: string | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + "heyrin-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body: InquiryBody = await req.json();

    // Honeypot check — bots fill hidden fields
    if (body.honeypot && body.honeypot.trim() !== "") {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validation
    const errors: string[] = [];
    if (!body.name || body.name.trim().length < 2) errors.push("Name is required");
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push("Valid business email is required");
    if (!body.message || body.message.trim().length < 10) errors.push("Please tell us what your AI agent should handle");

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: errors.join(". ") }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting via Supabase — check recent submissions from same IP
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIP = forwarded?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = await hashIP(clientIP);

    // Check rate limit — max 3 submissions per hour per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent, error: rateError } = await supabase
      .from("contact_inquiries")
      .select("id")
      .eq("ip_hash", ipHash)
      .gte("created_at", oneHourAgo);

    if (rateError) {
      console.error("Rate limit query failed:", rateError);
      return new Response(JSON.stringify({ error: "Please try again later." }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (recent && recent.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store inquiry
    const { error: insertError } = await supabase
      .from("contact_inquiries")
      .insert({
        name: body.name.trim(),
        email: body.email.trim(),
        company: body.company?.trim() || null,
        phone: body.phone?.trim() || null,
        website: body.website?.trim() || null,
        message: body.message.trim(),
        ip_hash: ipHash,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to submit inquiry" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Attempt email delivery via Resend if configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "noreply@heyrin.ai";
    const toEmail = "sierra@recoverrevenue.company";

    let emailSent = false;

    if (resendApiKey) {
      try {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #111416; padding: 32px; border-radius: 12px;">
            <div style="font-size: 24px; font-weight: bold; color: #B9FF32; letter-spacing: -0.03em; margin-bottom: 24px;">HEYRIN — New Inquiry</div>
            <table style="width: 100%; color: #F6F7F4; font-size: 14px;">
              <tr><td style="color: #929A96; padding: 4px 0; width: 120px;">Name</td><td>${escapeHtml(body.name)}</td></tr>
              <tr><td style="color: #929A96; padding: 4px 0;">Email</td><td>${escapeHtml(body.email)}</td></tr>
              <tr><td style="color: #929A96; padding: 4px 0;">Company</td><td>${escapeHtml(body.company) || "—"}</td></tr>
              <tr><td style="color: #929A96; padding: 4px 0;">Phone</td><td>${escapeHtml(body.phone) || "—"}</td></tr>
              <tr><td style="color: #929A96; padding: 4px 0;">Website</td><td>${escapeHtml(body.website) || "—"}</td></tr>
            </table>
            <div style="margin-top: 20px; color: #929A96; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">What should the AI agent handle?</div>
            <div style="color: #F6F7F4; font-size: 14px; line-height: 1.6; margin-top: 8px; padding: 16px; background: #050607; border-radius: 8px;">${escapeHtml(body.message)}</div>
          </div>
        `;

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `HEYRIN <${fromEmail}>`,
            to: [toEmail],
            reply_to: body.email,
            subject: `New HEYRIN Inquiry — ${body.name}`,
            html: emailHtml,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
        } else {
          const errText = await resendResponse.text();
          console.error("Resend error:", errText);
        }
      } catch (err) {
        console.error("Email error:", err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSent,
        emailConfigured: !!resendApiKey,
        message: emailSent
          ? "Your inquiry has been sent. We'll be in touch soon."
          : "Your inquiry has been received. We'll be in touch soon.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
