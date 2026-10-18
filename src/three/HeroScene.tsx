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
type MotionState = 'idle' | 'listening' | 'speaking';
type Euler = { x: number; y: number; z: number };
type Point = { x: number; y: number; z: number };
type Transform = { position: Point; rotation: Euler };
type SplineObjectLike = { uuid: string; name: string; position: Point; rotation: Euler };

function getArmObjects(app: Application): SplineObjectLike[] {
  const runtime = app as unknown as { getAllObjects?: () => SplineObjectLike[] };
  const objects = runtime.getAllObjects?.();
  return (Array.isArray(objects) ? objects : []).filter((object) => /^(arm|elbow|forearm|Hand|Hand LEFT|Hand Instance)$/i.test(object.name));
}

function repairArmPose(app: Application, time: number, state: MotionState, baseRotations: Map<string, Euler>, baseTransforms: Map<string, Transform>) {
  const speakingPulse = state === 'speaking' ? Math.sin(time * 2.15) * 0.045 : 0;
  const listeningLift = state === 'listening' ? 0.035 : 0;
  const sway = Math.sin(time * 0.72) * 0.018;
  const armLift = -0.06 - listeningLift + speakingPulse * 0.22;
  const elbowBend = -0.10 - listeningLift * 0.45 + speakingPulse * 0.12;
  for (const object of getArmObjects(app)) {
    const baseTransform = baseTransforms.get(object.uuid);
    if (baseTransform && object.name !== 'arm') object.position = baseTransform.position;
    if (object.name === 'elbow') {
      object.rotation = { x: 0, y: elbowBend + sway * 0.35, z: 0 };
    } else if (object.name === 'forearm') {
      object.rotation = { x: 0.27 - speakingPulse * 0.18, y: 0, z: 0 };
    } else if (object.name === 'Hand') {
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
    const baseTransforms = new Map<string, Transform>();
    for (const object of getArmObjects(app)) {
      baseTransforms.set(object.uuid, {
        position: { x: object.position.x, y: object.position.y, z: object.position.z },
        rotation: { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
      });
    }
    for (const id of Object.values(EXPRESSION_NODE_IDS)) {
      const object = app.findObjectById(id);
      if (object) baseRotations.set(object.uuid, { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z });
    }
    const keepArmsConnected = () => {
      repairArmPose(app, performance.now() / 1000, motionStateRef.current, baseRotations, baseTransforms);
      armRepairFrame.current = window.requestAnimationFrame(keepArmsConnected);
    };
    keepArmsConnected();
    requestAnimationFrame(() => {
      app.setZoom(SPLINE_ZOOM);
      requestAnimationFrame(() => {
        app.setZoom(SPLINE_ZOOM);
        // Camera/framing is already locked and the arm repair loop is active.
        // Reveal the live character now; the old 1.5s delay made the static poster
        // look frozen even after Spline had finished loading.
        onReady?.();
        // Never compete with Spline's asset/renderer initialization.
        // Mount the secondary WebGL atmosphere after the character is shown.
        atmosphereTimer.current = window.setTimeout(() => setAtmosphereReady(true), 500);
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
