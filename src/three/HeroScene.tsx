import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Application } from '@splinetool/runtime';
import { FloatingIndicators, ProcessingRings, SignalParticles, VoiceWaveform3D } from './Effects';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';
const SPLINE_ZOOM = 0.78;
const EXPRESSION_NODE_IDS = {
  head: 'ed42926e-48d3-4907-8975-3cec662ff058',
  neck: '03cba3e5-4e08-49e1-bd9c-c37a9cded0d5',
  body: '342265b2-6982-4c49-b670-fee0149640a3',
} as const;
const ARM_NODE_IDS = [
  'de26dd82-4dde-4254-875a-8dc236d86f55', 'ab1c1c5b-0163-44ea-a42b-1ee55073fa7b',
  'da4440d7-8876-4c40-b05b-9d770edeedfe', 'af6a5aaa-99ec-4ba3-b85c-1522b05385b5',
  'fa25da6e-3c3f-4272-8d90-b6213f6c6911', '101bc66e-ed93-4578-a9a5-56a2fa16bea7',
  'edfc2df1-9758-478a-9771-a59736f77086', 'c6a80d5f-accd-4fb6-a00b-6559f3c77a16',
  '1c244a05-58cc-4c2b-b127-62d7d290d995', '377263ac-e2d2-4042-b8f3-b532357d5aeb',
] as const;
const ARM_BASE_POSITION = {
  elbow: { x: 20.542, y: -85.632, z: 2.657 },
  forearm: { x: -4.79, y: -12.261, z: 1.36 },
  hand: { x: -9.435, y: -91.204, z: 36.55 },
};
type MotionState = 'idle' | 'listening' | 'speaking';
type Euler = { x: number; y: number; z: number };

function repairArmPose(app: Application, time: number, state: MotionState, baseRotations: Map<string, Euler>) {
  const speakingPulse = state === 'speaking' ? Math.sin(time * 2.15) * 0.045 : 0;
  const listeningLift = state === 'listening' ? 0.035 : 0;
  const sway = Math.sin(time * 0.72) * 0.018;
  const armLift = -0.06 - listeningLift + speakingPulse * 0.22;
  const elbowBend = -0.10 - listeningLift * 0.45 + speakingPulse * 0.12;
  for (const id of ARM_NODE_IDS) {
    const object = app.findObjectById(id);
    if (!object) continue;
    if (object.name === 'elbow') {
      object.position = ARM_BASE_POSITION.elbow;
      object.rotation = { x: 0, y: elbowBend + sway * 0.35, z: 0 };
    } else if (object.name === 'forearm') {
      object.position = ARM_BASE_POSITION.forearm;
      object.rotation = { x: 0.27 - speakingPulse * 0.18, y: 0, z: 0 };
    } else if (object.name === 'Hand') {
      object.position = ARM_BASE_POSITION.hand;
      object.rotation = {
        x: 0.16 + speakingPulse * 0.12,
        y: 0.84 + sway * 0.25,
        z: -0.56,
      };
    } else if (object.name === 'arm') {
      object.rotation = { x: armLift + sway, y: 0, z: 0 };
    } else if (object.name === 'Hand LEFT') {
      object.rotation = { x: 0, y: 0, z: 0.07 + sway * 0.2 };
    }
  }

  const head = app.findObjectById(EXPRESSION_NODE_IDS.head);
  const neck = app.findObjectById(EXPRESSION_NODE_IDS.neck);
  const body = app.findObjectById(EXPRESSION_NODE_IDS.body);
  const headTilt = state === 'listening' ? -0.035 : state === 'speaking' ? 0.018 : 0;
  const headNod = state === 'speaking' ? Math.sin(time * 2.15) * 0.012 : Math.sin(time * 0.48) * 0.012;
  const headTurn = state === 'listening' ? 0.025 : Math.sin(time * 0.35) * 0.012;
  const bodySway = state === 'speaking' ? Math.sin(time * 1.25) * 0.012 : Math.sin(time * 0.35) * 0.008;
  const applyRelativeRotation = (object: typeof head, offset: Euler) => {
    if (!object) return;
    const base = baseRotations.get(object.uuid) ?? { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z };
    object.rotation = { x: base.x + offset.x, y: base.y + offset.y, z: base.z + offset.z };
  };
  applyRelativeRotation(head, { x: headNod, y: headTurn, z: headTilt });
  applyRelativeRotation(neck, { x: -headNod * 0.35, y: -headTurn * 0.25, z: -headTilt * 0.2 });
  applyRelativeRotation(body, { x: 0, y: bodySway, z: bodySway * 0.25 });
}

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
  const armRepairFrame = useRef<number | null>(null);
  const motionStateRef = useRef<MotionState>('idle');

  useEffect(() => () => {
    if (atmosphereTimer.current !== null) window.clearTimeout(atmosphereTimer.current);
    if (armRepairFrame.current !== null) window.cancelAnimationFrame(armRepairFrame.current);
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

  useEffect(() => {
    motionStateRef.current = speaking ? 'speaking' : listening ? 'listening' : 'idle';
  }, [listening, speaking]);

  if (isMobile) return null;

  const handleSplineLoad = (app: Application) => {
    // Set the camera before the live canvas is revealed so the user never sees Spline's
    // unframed initial camera state. The scene's own animation loop remains untouched.
    app.setZoom(SPLINE_ZOOM);
    app.setGlobalEvents(true);
    const baseRotations = new Map<string, Euler>();
    for (const id of Object.values(EXPRESSION_NODE_IDS)) {
      const object = app.findObjectById(id);
      if (object) baseRotations.set(object.uuid, { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z });
    }
    const keepArmsConnected = () => {
      repairArmPose(app, performance.now() / 1000, motionStateRef.current, baseRotations);
      armRepairFrame.current = window.requestAnimationFrame(keepArmsConnected);
    };
    keepArmsConnected();
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
