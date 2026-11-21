# HEYREN — interactive voice-first assistant experience

HEYREN is a web experience exploring how a service-business assistant could introduce itself, explain workflows and demonstrate voice interactions through a 3D character and a guided interface.

> **Scope note:** The voice samples are scripted audio previews. This repository is an interactive product/UI concept, not a live phone agent. It does not place calls or write to a production CRM or calendar.

## What is included

- A 3D hero experience built around Spline and the React Three ecosystem.
- A voice-demo section with selectable scenarios and prerecorded audio playback.
- Guided sections explaining capabilities and customer workflows.
- Responsive service, process, FAQ and contact sections.
- A Supabase Edge Function implementation for contact-inquiry experimentation. The current contact UI uses an email fallback; the edge function is not represented as a live CRM integration.
- Playwright end-to-end specifications for the voice-demo and website flows.

## Technology

- React 18 and TypeScript
- Vite
- Three.js, React Three Fiber, Drei and Spline
- GSAP and Lucide icons
- Supabase JavaScript client and Edge Function source
- Playwright for browser-level checks

## Run locally

**Requirements:** Node.js 18+ and npm.

```bash
npm ci
npm run dev
```

Vite prints the local development URL. To validate the app:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Playwright browser binaries may need to be installed on a fresh machine with `npx playwright install`.

## Repository structure

- `src/components/` — page sections and interactive UI components.
- `public/` — visual assets and prerecorded voice-demo audio.
- `supabase/functions/` — contact-inquiry edge-function source.
- `tests/` — Playwright end-to-end specifications.
- `review/` — implementation and review notes.

## Current boundaries

The 3D character and conversation playback are presentation/demo features. Live speech recognition, real-time telephony, CRM writes, calendar booking and production contact delivery should not be inferred from the UI. The current contact component opens an email draft; the Supabase function is included as a separate implementation path.

## November 18, 2026: responsive robot + opt-in chat integration

The hero uses a static WebP rendered from the original Spline model and a responsive pose sheet for the helmet. Pointer, touch and supported device tilt affect the helmet only. On iOS, tapping the robot can enable tilt on HTTPS. The hero displays the complete neutral pose before the sheet loads and when reduced motion is enabled.

The original prerecorded conversation showcase is still a demo, **not** a real phone agent. A mobile-friendly AI chat UI and Supabase Edge Function are now implemented **locally**, behind an explicit production opt-in. No paid AI key is bundled into the browser, and neither the chat endpoint nor its quota migration has been deployed as part of this work.

Before enabling public chat, an owner must approve API spending and deployment, then:

1. Apply `supabase/migrations/20261118000000_heyrin_chat_quota.sql` to the intended Supabase project; the protected RPC atomically enforces eight requests per IP per rolling hour and a global ceiling of 100 requests per rolling day (additional abuse and provider account budget controls remain advisable).
2. Deploy `supabase/functions/heyrin-chat/index.ts` with `verify_jwt = false` as specified in `supabase/config.toml`. Review allowed origins and public API abuse safeguards first.
3. Set **server-only** Edge Function secrets `OPENAI_API_KEY`, `HEYREN_CHAT_HASH_SALT` and optionally `HEYREN_CHAT_ALLOWED_ORIGINS` (comma-separated; defaults to the production site) and `HEYREN_CHAT_MODEL`. The existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server secrets must also be present. Never put the OpenAI or service-role key into a `VITE_` variable.
4. Ensure the client build has the *public* Supabase project URL and browser key (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, or the corresponding mapped Vercel `NEXT_PUBLIC_` values). Set `VITE_HEYRIN_CHAT_ENABLED=true` **only** after the function is tested and spending limits are approved. Otherwise the chat panel explicitly says live AI is not connected.
5. Separately, `VITE_HEYRIN_CONTACT_ENABLED=true` opts the contact form into the existing `contact-inquiry` function. Without this flag, the form now prepares a user-confirmed email draft and preserves the entered data; it never claims the mail has been sent.

Local verification (no external AI requests):

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
node scripts/verify-chat-gateway.mjs
```

Additional opt-in Playwright tests live in `tests/chat-live.spec.ts` and `tests/contact-live.spec.ts`. They must be run with temporary, dummy build-time public configuration plus request-route mocks; see the test file headers. They never require real provider credentials.

Known launch prerequisites: provider account/key and budget approval, SQL migration/function deployment, backend live smoke test, rate-limit/abuse review, mobile Safari and Android real-device checks, GPU/memory profiling, and actual LCP/INP/CLS field measurements. This local work did not push commits or redeploy production.
