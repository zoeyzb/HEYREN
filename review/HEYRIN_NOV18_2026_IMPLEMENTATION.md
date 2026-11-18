# HEYRIN — November 18, 2026 implementation and verification

## Architecture / root causes

- Production robot is a 185-frame, ~6.17-second prerecorded video loop, with Spline source retained but previously inactive. The new local version offers explicit lazy-loading of the original articulated Spline model in an opt-in mode rather than forcing WebGL on every visitor.
- The existing voice showcase plays local prerecorded MP3 files. There is no live AI/chat API integrated in the shipped website.
- Navigation's JavaScript-only section scrolling previously did not write a deep-link hash; the mobile menu had no expanded-state semantics or Escape dismissal.
- The contact form previously reset input and showed a success-like handoff after `mailto:` navigation, which cannot confirm any email was sent.
- Mobile fixed chat entry initially overlapped the hero CTA in full-page visual capture; it was repositioned beside the menu and tested.

## Implementation

- `Hero.tsx`: bounded fine-pointer parallax in default mode, local opt-in Spline 3D with low-cost video default, foreground-only loading timeout, fallback on error/context loss, and actual recorded-audio speaking state. The original poster and MP4 are preserved.
- `VoiceDemo.tsx`: recorded audio events drive hero speaking accent only after playback starts; stop/error/end reset it. Replay no longer competes with ongoing audio timing.
- `Navigation.tsx`: deep-link URL hashes, reduced-motion-safe scrolling, menu `aria-expanded`, Escape dismissal, responsive close behavior.
- `LiveChat.tsx`, `App.tsx`, `polish.css`: responsive opt-in chat UI with explicit unconfigured state, guarded messages, error restoration, mobile fullscreen keyboard focus containment, header entry point.
- `supabase/functions/heyrin-chat/index.ts`: server-only AI credentials, input validation, rate-limit RPC, origin guard, bounded requests, timeout, no claim of real phone/calendar integration.
- `supabase/migrations/20261118000000_heyrin_chat_quota.sql`, `supabase/config.toml`: protected quota table, atomic per-IP hourly limit and global rolling-day cap (100); migration is NOT applied.
- `Contact.tsx`: honest email-draft handoff that preserves inputs and optional confirmed-response server submission path.
- Tests: `tests/robot-interaction.spec.ts`, `tests/chat.spec.ts`, `tests/responsive.spec.ts`, `tests/contact-handoff.spec.ts`, mocked opt-in `tests/chat-live.spec.ts`, `tests/contact-live.spec.ts`, and `scripts/verify-chat-gateway.mjs`.

## Measurements, boundaries and deployment

- Baseline existing Playwright suite: 10/10 passed before changes.
- Baseline deployed JavaScript `index-BoWi88uN.js`: 63,417 bytes gzipped (exact match to original local dist).
- Updated local JavaScript `index-YLSIsUx7.js`: approximately 64.96 kB gzipped in Vite output. This slightly increases JS to support actual functionality; no claim of an LCP/INP/CLS win from this addition.
- The recorded robot video asset remains the default; the original 3D rig is lazy-loaded only after user action. Extra Spline runtime chunks are comparatively large, so they are not part of first paint.
- Real AI calls, real contact submissions, real-device mobile Safari/Android tests, production RUM/CrUX field data and deployment verification are NOT part of this local validation.
- All prior uncommitted November 16 optimization source files are preserved. No commits, pushes, provider spending, or production deployments were performed.
- A visual test found the robot-mode button was blocked by the chat launcher at some desktop widths; the control was repositioned with viewport-specific rules and elementFromPoint tests verified clickability at 768px, 1024px and 1440px.
- The original 3D scene did initialize in visible WebKit desktop/mobile tests. WebGL was explicitly selected to reduce backend variance; it remains optional and is never guaranteed on every device.

## Remaining blockers

1. Real chatbot requires approved provider key/budget, applied SQL migration, deployed Supabase Edge Function, explicit client opt-in and a successful live smoke test.
2. Opt-in original rig-level head/arm articulation has passed WebKit browser rendering on desktop/mobile, tab-visibility, resize and context-loss tests, but real-device GPU, battery, gaze and motion quality remain unverified. The original rig does not guarantee independent blinking or live listening states; do not claim those without evidence.
3. Field Core Web Vitals, mobile virtual keyboard, GPU/battery and real-device iOS/Android behavior need device testing.
4. Commit and back up the full optimization work after approval; production currently uses a local build that is not fully reflected in the remote default branch.
