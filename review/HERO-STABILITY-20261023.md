# HEYRIN: stable, fast-loading original-robot hero

## Root cause confirmed in real Chrome capture
The original Spline scene can partially render before the robot's materials/meshes settle. Recorded cold-load frames showed only the head and legs at 1 second, with arms and torso arriving around 3 seconds. The previous handoff used scene-object existence as the readiness criterion, so it removed the preview too early. The hero also initialized two WebGL contexts (Spline + React Three Fiber atmosphere) and changed rig transforms every 16ms. Those choices put extra load on users' GPUs and could still display partially rendered geometry.

## Stable rendering implementation
- Preserve the original Spline source and 3D robot asset in the codebase without mounting Spline during initial site load.
- Record a small, muted looping MP4 directly from the fully settled original Spline robot with the correct arm pose: `public/hero-robot-loop.mp4` (about 145 KB).
- Extract a transparent WebP of the same scene and pose as immediate first-frame/failure/reduced-motion fallback: `public/hero-robot-clean.webp` (about 28 KB).
- Retain the hero text, CTA placement, black/lime/violet palette and visual identity. Draw the original lime/violet orbit look with lightweight SVG layers; provide gentle compositor-based motion.
- Do not import WebGL/Three/Spline into the user-facing app bundle. Avoid expensive runtime, broken-frame transitions, and shader issues on consumer devices.
- Preserve current contact integration, all downstream sections, mobile menu and interaction behavior.

## Tradeoff
The hero now plays prerendered animation made from the *same original 3D character*, rather than a real-time, mouse-reactive Spline simulation. The source scene is retained for editing and possible later opt-in 3D modes. This was chosen to prioritize instant stable appearance and responsiveness, rather than reintroducing GPU glitches during startup.

## Verification
- `npm run typecheck` PASS
- `npm run lint` PASS
- `npm run build` PASS; built app JS approx 309 KB (uncompressed); no Spline remote-scene URL in built JS.
- `npm run test:e2e` PASS: 8/8 Chrome checks. Includes instant poster visibility, no scene/WebGL downloads, video playback, media failure fallback, reduced motion, mobile overflow, functional CTAs, contact form failure state, and full-page screenshots.
- Screenshots: `review/hero-stable-desktop.jpg`, `review/hero-stable-mobile.jpg`.

The MP4 is muted and looping; the fallback image remains visible for users whose browsers or accessibility settings prevent playback. Load-time numbers on individual networks/devices will vary.
