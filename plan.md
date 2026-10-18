# HEYRIN Awwwards Phase 1 — Non-hero experiences

## Scope
Upgrade only `VoiceDemo`, `Capabilities`, and `VoiceVisualization`. The Spline hero, hero layout, navigation, other sections, integrations, and route manifest remain unchanged. No deployment.

## Design direction
- **Design movement:** cinematic instrument panel / editorial product film.
- **Core principles:** evidence over decoration, responsive motion, compact density, clear state changes.
- **Color philosophy:** black and graphite create focus; electric lime marks live system activity and successful next steps; violet marks caller context, intent, and secondary signal layers.
- **Layout paradigm:** a left-side narrative rail paired with a single high-information stage, avoiding repeated card grids.
- **Signature elements:** thin telemetry rules, luminous state nodes, layered waveform/orbit depth, and small mono labels.
- **Interaction philosophy:** every click changes a meaningful state, not just styling; illustrative data is clearly labeled and never presented as a real booking.
- **Animation:** 30fps canvas signal motion only while visible; CSS/React transitions for panels; reduced-motion paths remain legible and still.
- **Typography:** existing Inter display hierarchy with JetBrains Mono telemetry labels.
- **Brand essence:** an AI receptionist that turns voice into a clear business next step; precise, calm, capable.

## Implementation
- `VoiceDemo.tsx`: retain scenario selection, autoplay, pause, replay, and transcript timing; improve waveform synchronization, add call metadata and a clear illustrative outcome panel; revise appointment copy to avoid implying a real booking.
- `Capabilities.tsx`: replace five repetitive cards with three interactive workflows—answering, qualifying, scheduling—using a compact selector rail and one animated stage.
- `VoiceVisualization.tsx`: retain the lightweight canvas and visibility pausing; add pointer depth, distinct listening/understanding/responding render grammars, depth layers, semantic nodes, and responsive state copy.
- `experience.css` / `polish.css`: add isolated selectors for only the three target sections and responsive mobile layouts.

## Project structure
Existing Vite React TypeScript app. Target components stay in `src/components`; section-specific styling stays in `src/experience.css` and `src/polish.css`; hero and Spline files are not modified.
