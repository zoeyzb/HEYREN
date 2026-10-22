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

## Integration boundaries
The repo's existing Supabase Edge Function remains the production inquiry endpoint. A successful *real* inquiry requires the Edge Function to be deployed, its database migration to exist, and compatible Vercel public environment variables. This branch maps available NEXT_PUBLIC_ (or standard VITE_) Supabase URL and anonymous key at build time; secret keys never reach client code. The Edge Function can optionally email via Resend if its secret is configured. A live end-to-end submission and email delivery are **not claimed verified**; tests deliberately avoid sending fake customer inquiries into production.

## Preview and deployment safeguards
Run `npm run preview -- --host 127.0.0.1 --port 4173` on the authorized Mac. This produces a local preview, not a public deployment. The branch-specific `vercel.json` blocks Git-driven Vercel deployments for `redesign/immersive-nonhero-20261022`; remove that one branch block only after explicit deployment approval. Production remains unchanged.

## Implementation references
The original HEYRIN repo supplies all core React, TypeScript, Supabase, GSAP and Spline integration contracts. Design and verification decisions follow established incremental frontend/test patterns similar to `addyosmani/agent-skills`; acceptance criteria and isolated feature work draw from `github/spec-kit` principles. All new components and styles here are written specifically for HEYRIN, with no copied third-party code or added component-template libraries.
