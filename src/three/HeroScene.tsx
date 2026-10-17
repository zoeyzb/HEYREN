import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Application } from '@splinetool/runtime';
import { FloatingIndicators, ProcessingRings, SignalParticles, VoiceWaveform3D } from './Effects';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';
const SPLINE_ZOOM = 0.78;

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
      dpr={[1, 1.2]}
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
  const [atmosphereReady, setAtmosphereReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const atmosphereTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (atmosphereTimer.current !== null) window.clearTimeout(atmosphereTimer.current);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setIsMobile(query.matches); setReducedMotion(motionQuery.matches); };
    update();
    query.addEventListener?.('change', update);
    motionQuery.addEventListener?.('change', update);
    return () => { query.removeEventListener?.('change', update); motionQuery.removeEventListener?.('change', update); };
  }, []);

  if (isMobile) return null;

  const handleSplineLoad = (app: Application) => {
    // Set the camera before the live canvas is revealed so the user never sees Spline's
    // unframed initial camera state. The scene's own animation loop remains untouched.
    app.setZoom(SPLINE_ZOOM);
    app.setGlobalEvents(true);
    requestAnimationFrame(() => {
      app.setZoom(SPLINE_ZOOM);
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          app.setZoom(SPLINE_ZOOM);
          onReady?.();
          // Never compete with Spline's asset/renderer initialization.
          // Mount the secondary WebGL atmosphere after the character is shown.
          atmosphereTimer.current = window.setTimeout(() => setAtmosphereReady(true), 900);
        }, 1800);
      });
    });
  };

  return (
    <div className="hero-spline-stack" aria-label="Interactive Heyrin AI character">
      <div className="hero-spline-character">
        <Suspense fallback={null}>
          <Spline scene={SPLINE_SCENE} className="h-full w-full" onLoad={handleSplineLoad} />
        </Suspense>
      </div>
      {atmosphereReady && active && !reducedMotion && (
        <div className="hero-spline-atmosphere" aria-hidden="true">
          <Atmosphere speaking={speaking} listening={listening} active={active} />
        </div>
      )}
    </div>
  );
}
