import { useEffect, useRef } from 'react';
import type { Application } from '@splinetool/runtime';

const SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

interface Props { active: boolean; onReady?: () => void; onError?: () => void; onContextLost?: () => void; }

/** One owner for the rig: Spline renders the original asset without its authored
 * startup events; rotations below articulate it without translating joint anchors. */
export function SplineRobot({ active, onReady, onError, onContextLost }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const readyRef = useRef(onReady);
  const errorRef = useRef(onError);
  const lostRef = useRef(onContextLost);
  activeRef.current = active;
  readyRef.current = onReady;
  errorRef.current = onError;
  lostRef.current = onContextLost;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let app: Application | undefined;
    let frame = 0;
    let elapsed = 0;
    let last = 0;
    let pointerX = 0;
    let pointerY = 0;
    const abort = new AbortController();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = (event: PointerEvent) => {
      pointerX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
    };
    const resetPointer = () => { pointerX = 0; pointerY = 0; };
    // Chrome drops WebGL contexts under GPU/memory pressure (many tabs). Without this the canvas silently goes blank.
    const contextLost = (event: Event) => { event.preventDefault(); lostRef.current?.(); };
    canvas.addEventListener('webglcontextlost', contextLost);
    window.addEventListener('pointermove', pointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetPointer);
    window.addEventListener('blur', resetPointer);

    void (async () => {
      // Start the runtime download and scene fetch together so neither blocks the other.
      const runtimePromise = import('@splinetool/runtime');
      const scenePromise = fetch(SCENE, { signal: abort.signal });
      const [{ Application }, response] = await Promise.all([runtimePromise, scenePromise]);
      if (disposed) return;
      app = new Application(canvas, { renderOnDemand: false });
      if (!response.ok) throw new Error('Robot scene unavailable');
      const scene = await response.arrayBuffer();
      if (disposed) return;
      await app.start(scene, { interactive: false });
      if (disposed) return;
      app.setZoom(0.58);
      const objects = app.getAllObjects();
      const camera = objects.find(object => object.name === 'Camera 2');
      if (camera) {
        camera.position.y = 146.98;
        camera.position.z = 1000;
        camera.rotation.x = 0.006996317664543058;
      }
      // Rest pose: the forearm armor panel is a child of `elbow`, so the elbow must bend for the panel to
      // follow the arm. Only rotations are touched; joint anchors keep their authored positions.
      const isWrist = (object: (typeof objects)[number]) => object.name === 'Hand' && (object as unknown as { type: string }).type === 'Mesh';
      const REST: Record<string, { x?: number; y?: number; z?: number }> = {
        'Hand LEFT': { z: 0.11 },
        arm: { x: 0 },
        elbow: { x: -0.62, y: -0.1 },
        forearm: { x: 0.1 },
        wrist: { x: 0.28, y: 0.939, z: -0.666 },
      };
      const joints = objects.filter(object => ['Hand LEFT', 'arm', 'elbow', 'forearm'].includes(object.name) || isWrist(object)).map(object => {
        const rest = REST[isWrist(object) ? 'wrist' : object.name] ?? {};
        Object.assign(object.rotation, rest);
        return { object, role: isWrist(object) ? 'wrist' : object.name, x: object.rotation.x, y: object.rotation.y, z: object.rotation.z };
      });
      const head = objects.find(object => object.name === 'Head');
      const headPose = head && { x: head.rotation.x, y: head.rotation.y };
      // Retain the diagnostic handle in development only; production has no globals.
      if (import.meta.env.DEV) Object.assign(window, { __spline: app });
      const animate = (now: number) => {
        if (disposed || !app) return;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        const moving = activeRef.current && !document.hidden && !reduced.matches;
        if (!activeRef.current || document.hidden) {
          if (!app.isStopped) app.stop();
        } else {
          if (app.isStopped) app.play();
          if (moving) elapsed += dt;
          const blend = 1 - Math.exp(-5 * dt);
          for (const joint of joints) {
            const { object, role, x, y, z } = joint;
            // Small phase-offset motion: shoulder breathes, elbow flexes, wrist trails behind.
            const sway = moving ? Math.sin(elapsed * 1.02 - (role === 'wrist' ? 1.1 : role === 'forearm' ? 0.65 : role === 'elbow' ? 0.35 : 0)) : 0;
            const targetX = x + (role === 'elbow' ? sway * 0.16 : role === 'wrist' ? sway * 0.14 : role === 'arm' ? sway * 0.08 : 0);
            const targetY = y;
            const targetZ = z + (role === 'Hand LEFT' ? sway * 0.05 : 0);
            object.rotation.x += (targetX - object.rotation.x) * blend;
            object.rotation.y += (targetY - object.rotation.y) * blend;
            object.rotation.z += (targetZ - object.rotation.z) * blend;
          }
          if (head && headPose) {
            head.rotation.y += (headPose.y + (moving ? pointerX * 0.40 : 0) - head.rotation.y) * blend;
            head.rotation.x += (headPose.x + (moving ? pointerY * 0.22 : 0) - head.rotation.x) * blend;
          }
        }
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(now => {
        if (disposed) return;
        readyRef.current?.();
        animate(now);
      });
    })().catch(() => {
      // Keep the existing static preview visible if the scene cannot be loaded.
      if (!disposed) { app?.dispose(); errorRef.current?.(); }
    });

    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      canvas.removeEventListener('webglcontextlost', contextLost);
      window.removeEventListener('pointermove', pointer);
      document.documentElement.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('blur', resetPointer);
      app?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
