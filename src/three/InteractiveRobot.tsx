import { SplineRobot } from './SplineRobot';

/** Loads only on explicit interaction. One WebGL context; no decorative R3F canvas. */
export function InteractiveRobot({ speaking, onReady, onError }: {
  speaking: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  return (
    <div className="hero-spline-character hero-rig-canvas">
      <SplineRobot active speaking={speaking} onReady={onReady} onError={onError} onContextLost={onError} />
    </div>
  );
}
