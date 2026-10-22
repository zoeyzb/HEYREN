import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Application } from '@splinetool/runtime';
import Spline from '@splinetool/react-spline';
import { FloatingIndicators, ProcessingRings, SignalParticles, VoiceWaveform3D } from './Effects';

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
  const [splineReady, setSplineReady] = useState(false);
  const rigRef = useRef<ReturnType<Application['getAllObjects']> | null>(null);
  const scheduledRef = useRef<number | null>(null);
  const sceneRef = useRef<Application | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  // The published Spline file animates its elbows far above the shoulders during
  // its startup sequence. Keep the original 3D character and subtle movement,
  // while keeping the articulated arms within their connected neutral range.
  useEffect(() => {
    if (!splineReady || !rigRef.current) return;
    const rigs = rigRef.current;
    const matched = (name: string) => rigs.filter((object) => object.name === name);
    const shoulders = matched('Hand LEFT');
    const upperArms = matched('arm');
    const elbows = matched('elbow');
    const forearms = matched('forearm');
    const hands = matched('Hand').filter((object) => (object as unknown as { type?: string }).type === 'Mesh');
    const camera = matched('Camera 2')[0];
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const holdRig = () => {
      if (!active || document.hidden) return;
      // Spline's camera startup transition otherwise zooms the head from
      // ~359 to 1000 units over several seconds; lock the final framing.
      if (camera) {
        camera.position.y = 146.98;
        camera.position.z = 1000;
      }
      shoulders.forEach((joint) => { joint.rotation.z = clamp(joint.rotation.z, -.1, .13); });
      upperArms.forEach((joint) => { joint.rotation.x = clamp(joint.rotation.x, -.17, .13); });
      elbows.forEach((joint) => {
        joint.position.y = clamp(joint.position.y, -95, -68);
        joint.position.x = clamp(joint.position.x, 17, 21);
      });
      forearms.forEach((joint) => {
        joint.position.y = clamp(joint.position.y, -24, -5);
        joint.rotation.x = clamp(joint.rotation.x, -.18, .38);
      });
      hands.forEach((joint) => {
        joint.rotation.x = clamp(joint.rotation.x, -.05, .35);
        joint.rotation.y = clamp(joint.rotation.y, .65, 1.35);
        joint.rotation.z = clamp(joint.rotation.z, -.85, -.3);
      });
    };
    holdRig();
    const id = window.setInterval(holdRig, 16);
    return () => window.clearInterval(id);
  }, [active, splineReady]);

  useEffect(() => () => {
    if (scheduledRef.current !== null) cancelAnimationFrame(scheduledRef.current);
    rigRef.current = null;
    sceneRef.current = null;
  }, []);

  if (isMobile) return null;

  const handleSplineLoad = (app: Application) => {
    sceneRef.current = app;
    app.setZoom(SPLINE_ZOOM);
    app.setGlobalEvents(true);

    const waitForRealRig = () => {
      if (sceneRef.current !== app) return;
      const objects = app.getAllObjects();
      if (!objects.some((object) => object.name === 'Bot') || !objects.some((object) => object.name === 'forearm')) {
        scheduledRef.current = requestAnimationFrame(waitForRealRig);
        return;
      }
      rigRef.current = objects;
      const camera = objects.find((object) => object.name === 'Camera 2');
      if (camera) { camera.position.y = 146.98; camera.position.z = 1000; }
      // Two rendering frames are sufficient to settle the Spline camera; the
      // old unconditional five-second blank interval was not required.
      app.setZoom(SPLINE_ZOOM);
      scheduledRef.current = requestAnimationFrame(() => {
        app.setZoom(SPLINE_ZOOM);
        scheduledRef.current = requestAnimationFrame(() => {
          app.setZoom(SPLINE_ZOOM);
          setSplineReady(true);
          onReady?.();
        });
      });
    };
    scheduledRef.current = requestAnimationFrame(waitForRealRig);
  };

  return (
    <div className="hero-spline-stack" aria-label="Interactive Heyrin AI character">
      <div className="hero-spline-character">
        <Spline scene={SPLINE_SCENE} className="h-full w-full" onLoad={handleSplineLoad} />
      </div>
      {splineReady && (
        <div className="hero-spline-atmosphere" aria-hidden="true">
          <Atmosphere speaking={speaking} listening={listening} active={active} />
        </div>
      )}
    </div>
  );
}
