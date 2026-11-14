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
