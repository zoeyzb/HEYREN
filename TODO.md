# Phase 1 — 3D hero rebuild

## Premium 3D robot hero
- [x] Rebuild the existing hero robot into a visible, premium futuristic AI character with sculpted geometry, graphite/titanium materials, lime eyes, violet rim lighting, realistic reflections, and depth.
- [x] Position the robot on the right and keep hero text/buttons on the left without overlap.
- [x] Add smooth floating motion, cursor tracking, subtle particles, and cinematic GSAP entrance animation.
- [x] Preserve the black/lime/violet brand and all other website sections.
- [x] Optimize Three.js for fast loading and smooth rendering, with responsive desktop and mobile layouts.
- [x] Run and visually test the website at desktop and mobile sizes, fixing issues found.
- [x] No deployment or Phase 2 work performed.

# Targeted Spline arm repair

## Connected arm rig and stable animation
- [x] Repair the actual Spline robot’s shoulder, upper-arm, elbow, forearm, wrist, and hand continuity without replacing the humanoid or using CSS arms.
- [x] Replace the asset’s unsafe split-part arm transitions with a synchronized, low-amplitude idle pose that preserves Spline playback, face, lighting, pointer interaction, and orbital effects.
- [x] Verify fresh loading, repeated refreshes, pointer interaction, desktop and mobile layouts, visible live canvases after idle time, route health, typecheck, and production build.
- [x] No Vercel deployment performed.

# Hero pose and expression refinement

## Premium state-based presentation motion
- [x] Keep the existing Spline humanoid, page layout, typography, CTA buttons, palette, loading pipeline, and all non-hero sections unchanged.
- [x] Replace the awkward hands-up arm presentation with a calmer, mechanically believable pose: shoulders seated to the torso, elbows bent inward, forearms aligned, and hands kept attached.
- [x] Add restrained idle/listening/speaking behavior through subtle head tilt, head turn, torso rhythm, and timed arm movement.
- [x] Verify three fresh browser loads, live Spline canvas visibility after handoff, pointer interaction, desktop capture, mobile fallback capture, route health, typecheck, and production build.

# Awwwards Phase 1 — non-hero experiences

## Voice Experience
- [x] Create a cinematic interactive call interface with appointment booking selected by default, animated caller/AI messages, synchronized waveforms, realistic conversation flow, replay/pause controls, and an elegant outcome panel.
- [x] Clearly label the conversation as illustrative and never present scripted events as real bookings.

## Capabilities
- [x] Replace repetitive SaaS cards with three visually distinct, premium interactive experiences for answering calls, qualifying leads, and scheduling appointments.
- [x] Use useful workflow visuals and sophisticated, performant animations in desktop and mobile layouts.

## Voice Intelligence
- [x] Replace the generic visualization with an extraordinary interactive signal system with three distinctly animated states: Listening, Understanding, and Responding.
- [x] Add subtle 3D depth, luminous particles, responsive motion, and strong performance while preserving reduced-motion and offscreen pausing behavior.

## Scope and delivery
- [x] Do not modify the hero robot, Spline scene, hero layout, existing functionality, or other website sections.
- [x] Run typecheck/build, visually inspect all changed sections on desktop and mobile, push a new GitHub branch, provide a working preview and screenshots, and do not deploy to Vercel.

Validation note: `npm run typecheck` and `npm run build` pass. `npm run lint` remains blocked by the unrelated pre-existing `emailError` unused-variable error in `supabase/functions/contact-inquiry/index.ts`; no unrelated file was changed.
