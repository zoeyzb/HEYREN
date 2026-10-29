import { lazy, Suspense, useEffect, useState } from 'react';
import { SplineRobot } from './SplineRobot';

const HeroAtmosphere = lazy(() => import('./HeroAtmosphere').then(module => ({ default: module.HeroAtmosphere })));

interface HeroSceneProps {
  listening?: boolean;
  speaking?: boolean;
  activated?: boolean;
  active?: boolean;
  onReady?: () => void;
}

export function HeroScene({ listening, speaking, active = true, onReady }: HeroSceneProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  if (isMobile) return null;

  const handleReady = () => {
    setSceneReady(true);
    onReady?.();
  };

  return (
    <div className="hero-spline-stack" aria-label="Interactive Heyrin AI character">
      <div className="hero-spline-character">
        <SplineRobot active={active} onReady={handleReady} />
      </div>
      {sceneReady && (
        <div className="hero-spline-atmosphere" aria-hidden="true">
          <Suspense fallback={null}>
            <HeroAtmosphere speaking={speaking} listening={listening} active={active} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
