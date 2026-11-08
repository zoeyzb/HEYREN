import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { SplineRobot } from './SplineRobot';

const HeroAtmosphere = lazy(() => import('./HeroAtmosphere').then(module => ({ default: module.HeroAtmosphere })));

interface HeroSceneProps {
  listening?: boolean;
  speaking?: boolean;
  activated?: boolean;
  active?: boolean;
  onReady?: () => void;
  onError?: () => void;
  onContextLost?: () => void;
}

export function HeroScene({ listening, speaking, active = true, onReady, onError, onContextLost }: HeroSceneProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  // The robot and the ring/particle layer must appear together: report ready only when BOTH have painted,
  // so nothing pops in after the static poster has already gone.
  const robotReady = useRef(false);
  const atmosphereReady = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const fired = useRef(false);
  const fire = () => { if (!fired.current) { fired.current = true; onReadyRef.current?.(); } };
  const maybeReady = () => { if (robotReady.current && atmosphereReady.current) fire(); };
  // The robot is the main thing: if the ring layer is slow or fails (slow phone network, iOS WebGL limits), show the robot anyway after 2.5s.
  const handleRobotReady = () => { robotReady.current = true; maybeReady(); window.setTimeout(fire, 2500); };
  const handleAtmosphereReady = () => { atmosphereReady.current = true; maybeReady(); };

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return (
    <div className="hero-spline-stack" aria-label="Interactive Heyrin AI character">
      <div className="hero-spline-character">
        <SplineRobot active={active} onReady={handleRobotReady} onError={onError} onContextLost={onContextLost} />
      </div>
      <div className="hero-spline-atmosphere" aria-hidden="true">
        <Suspense fallback={null}>
          <HeroAtmosphere speaking={speaking} listening={listening} active={active} lite={isMobile} onCreated={handleAtmosphereReady} />
        </Suspense>
      </div>
    </div>
  );
}
