import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Application } from '@splinetool/runtime';
import * as THREE from 'three';
import { FloatingIndicators, ProcessingRings, SignalParticles, VoiceWaveform3D } from './Effects';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

interface HeroSceneProps {
  listening?: boolean;
  speaking?: boolean;
  activated?: boolean;
  active?: boolean;
  onReady?: () => void;
}

function Atmosphere({ speaking, listening, active }: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance', stencil: false, depth: false }}
      style={{ background: 'transparent' }}
    >
      <ProcessingRings />
      <SignalParticles count={42} />
      <VoiceWaveform3D speaking={speaking} listening={listening} />
      <FloatingIndicators />
    </Canvas>
  );
}

export function HeroScene({ listening, speaking, active = true, onReady }: HeroSceneProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  const appRef = useRef<Application | null>(null);
  const maxDpr = useMemo(() => typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 1.25), []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    if (active) app.play();
    else app.stop();
  }, [active]);

  if (isMobile) return null;

  const handleSplineLoad = (app: Application) => {
    appRef.current = app;
    app.renderOnDemand = true;
    app.setGlobalEvents(false);
    requestAnimationFrame(() => app.stop());
    onReady?.();
  };

  const wakeSpline = () => appRef.current?.play();
  const sleepSpline = () => appRef.current?.stop();

  return (
    <div className="hero-spline-stack" aria-label="Interactive Heyrin AI character">
      <div className="hero-spline-character" onPointerEnter={wakeSpline} onPointerLeave={sleepSpline}>
        <Suspense fallback={null}>
          <Spline scene={SPLINE_SCENE} className="h-full w-full" renderOnDemand onLoad={handleSplineLoad} />
        </Suspense>
      </div>
      <div className="hero-spline-atmosphere" aria-hidden="true">
        <Atmosphere speaking={speaking} listening={listening} active={active} />
      </div>
    </div>
  );
}
