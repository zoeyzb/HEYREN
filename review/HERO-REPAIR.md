# HEYRIN hero rendering repair — October 22, 2026

## Observed defects
- Blank hero robot during startup: the desktop loading image was intentionally hidden and Spline delayed the reveal 5 seconds after `onLoad`.
- Wrong pose / disconnected-looking forearms: the embedded Spline intro moves both shoulder, elbow, and forearm transforms well beyond a connected natural resting range.
- Giant head / clipping if the reveal delay is simply removed: the embedded camera animation starts about 359 units from the robot and transitions to 1000 units over several seconds.
- Wasted mobile bandwidth: the desktop Spline runtime and scene preload were not appropriately gated for screens under 768px.

## Applied changes
- Remove the artificial 5-second reveal. Display a soft-masked robot preview while the Spline scene initializes, never a blank canvas.
- Reveal the live 3D character only after the rig exists and the final camera framing is set.
- Use the original Spline robot, retain its scene and expression, lock its camera to the scene's verified final resting position, and constrain both arms' mirrored joints during the overly aggressive built-in animation.
- Mount the extra WebGL atmosphere only after Spline is ready.
- Preload the remote Spline scene on desktop only. Skip desktop 3D loading entirely on mobile; keep the already-existing static preview. Restore the preview on resize.
- Preserve the hero copy, CTAs, typography, layout, brand colors, and every lower section.

## Verification
- TypeScript typecheck, ESLint and production Vite build pass.
- Playwright full regression: 6/6 tests pass with one Chrome worker.
- Hero-specific final regression: 3/3 tests pass (delayed remote scene, corrected live scene, mobile data/resize).
- Chrome screenshots: `hero-loading-fixed.jpg` and `hero-repaired-fixed.jpg`.
- No fake call activity, replacement 3D model, or new external integration introduced.

## Limitations
- Spline still needs to download and render its existing 3D model on desktop; actual load time depends on bandwidth/GPU. The repair removes unnecessary waiting and provides a visible fallback, rather than claiming zero load time.
