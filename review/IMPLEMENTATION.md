# HEYRIN — non-hero experience redesign

## Scope & acceptance
- Preserve `src/components/Hero.tsx`, all of `src/three/`, and original hero styles in `src/index.css` unchanged.
- Preserve the black / #B9FF32 / #A16BFF brand palette and the existing contact-inquiry payload and email address.
- Replace the previous repeating marketing cards with distinct, responsive, interactive experiences.
- Keep illustrative conversation playback explicit; there is no real incoming phone call, speech audio, CRM write, or calendar write from the showcase.

## Features implemented
- Conversation studio: appointment selected by default, three scripted scenarios, auto-start on viewport entry, simulated waveform, transcript progression, play/pause, replay, outcome steps.
- Capabilities: responsive illustrated feature selector, animated signal diagram, three workflows.
- How it works: GSAP ScrollTrigger stages connected by scroll-progress signal; reduced-motion accommodation.
- Voice intelligence: Listening / Understanding / Responding tabs, live view transitions, optional automatic cycle.
- Industries: five selectable workflows and representative caller/assistant conversations.
- Onboarding: three compact connected steps with contact CTA.
- Contact: semantic required inputs, accessible validation and failure messages, preserved Supabase function contract, build-time public Vite/Supabase env mapping; Resend email rendering escaped server-side.
- FAQ: accessible disclosure controls; footer: functional section links, email link and CTA.

## Verification
Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`.
Playwright tests cover scenario switching, replay, capabilities, voice intelligence, industries, FAQ, anchor targets, mobile nav, 390px overflow, form validation, missing-config failure, and screenshots at 1440px and 390px.

## Integration boundaries and real backend verification
- Supabase project: `wggcyivwjutxlqcnxwsv` (`supabase-aquamarine-island`, created October 17, matching the HEYRIN/Vercel setup). A dedicated `contact_inquiries` table was migrated and `contact-inquiry` Edge Function deployed on October 22, 2026.
- Table RLS **enabled**, anonymous database write policy **absent**; only the validated, rate-limited Edge Function uses the service-role server key. Edge function `verify_jwt = false` is deliberate for public form contact; it validates payload and rate-limits writes.
- Real HTTP integration smoke tests: OPTIONS returned 200, malformed POST returned 400, unsupported GET returned 405, valid tagged POST returned 200. The tagged inquiry was found in the database and subsequently deleted. Query verification: test rows remaining = 0, RLS enabled, public policies = 0.
- Real Chromium browser check from the Mac preview (`localhost:4173`) sent a tagged, valid form submission through the React UI. Backend returned HTTP 200, UI displayed “Inquiry received”, browser JS errors = 0, and the record was located in Supabase before being removed. Both test inquiries were cleaned up.
- Existing Resend optional notification path remains, but **emailConfigured=false**, so no notification email was sent. Inquiries persist in Supabase; email notifications require configuring `RESEND_API_KEY` and an authorized sender in the Edge Function's environment.
- The Mac's gitignored `.env.local` holds **public** URL/legacy anonymous key for the working local preview. It contains no service-role secret. Vercel already has Supabase public environment variables named `NEXT_PUBLIC_...`; `vite.config.ts` maps them for Vite on a future approved deployment. Vercel was not deployed during this branch update.
- Automated Playwright tests intentionally intercept submission errors to avoid inserting test records. No performance, call-volume, or real calendar activity is fabricated.

## Preview and deployment safeguards
Run `npm run preview -- --host 127.0.0.1 --port 4173` on the authorized Mac. This produces a local preview, not a public deployment. The branch-specific `vercel.json` blocks Git-driven Vercel deployments for `redesign/immersive-nonhero-20261022`; remove that one branch block only after explicit deployment approval. Production remains unchanged.

## Implementation references
The original HEYRIN repo supplies all core React, TypeScript, Supabase, GSAP and Spline integration contracts. Design and verification decisions follow established incremental frontend/test patterns similar to `addyosmani/agent-skills`; acceptance criteria and isolated feature work draw from `github/spec-kit` principles. All new components and styles here are written specifically for HEYRIN, with no copied third-party code or added component-template libraries.
