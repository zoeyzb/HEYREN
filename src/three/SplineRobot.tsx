import { useEffect, useRef } from 'react';
import type { Application } from '@splinetool/runtime';

const SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

interface Props { active: boolean; onReady?: () => void; }

/** One owner for the rig: Spline renders the original asset without its authored
 * startup events; rotations below articulate it without translating joint anchors. */
export function SplineRobot({ active, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const readyRef = useRef(onReady);
  activeRef.current = active;
  readyRef.current = onReady;

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
    window.addEventListener('pointermove', pointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetPointer);
    window.addEventListener('blur', resetPointer);

    void (async () => {
      const { Application } = await import('@splinetool/runtime');
      if (disposed) return;
      app = new Application(canvas, { renderOnDemand: false });
      const response = await fetch(SCENE, { signal: abort.signal });
      if (!response.ok) throw new Error('Robot scene unavailable');
      const scene = await response.arrayBuffer();
      if (disposed) return;
      await app.start(scene, { interactive: false });
      if (disposed) return;
      app.setZoom(0.78);
      const objects = app.getAllObjects();
      const camera = objects.find(object => object.name === 'Camera 2');
      if (camera) {
        camera.position.y = 146.98;
        camera.position.z = 1000;
        camera.rotation.x = 0.006996317664543058;
      }
      // Connected relaxed pose measured from this scene's initial rig, applied
      // once before reveal. Never translate elbow/forearm anchors during motion.
      for (const object of objects) {
        if (object.name === 'Head') Object.assign(object.rotation, { x: 0, y: 0, z: 0 });
        if (object.name === 'Hand LEFT') object.rotation.z = 0.086;
        if (object.name === 'arm') object.rotation.x = 0;
        if (object.name === 'elbow') {
          Object.assign(object.position, { x: 20.542, y: -85.632, z: 2.657 });
          object.rotation.y = -0.142;
        }
        if (object.name === 'forearm') {
          Object.assign(object.position, { x: -4.79, y: -12.261, z: 1.36 });
          object.rotation.x = 0.324;
        }
        if (object.name === 'Hand' && (object as unknown as { type: string }).type === 'Mesh') {
          Object.assign(object.rotation, { x: 0.28, y: 0.939, z: -0.666 });
        }
      }
      const joints = objects.filter(object => ['Hand LEFT', 'arm', 'forearm'].includes(object.name) || (object.name === 'Hand' && (object as unknown as { type: string }).type === 'Mesh')).map(object => ({
        object, x: object.rotation.x, y: object.rotation.y, z: object.rotation.z,
      }));
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
            const { object, x, y, z } = joint;
            // Small, phase-offset arcs allow the forearms to follow the shoulders.
            const shoulder = object.name === 'Hand LEFT';
            const forearm = object.name === 'forearm';
            const wrist = object.name === 'Hand';
            const sway = moving ? Math.sin(elapsed * 0.85 - (wrist ? 1.1 : forearm ? 0.65 : 0)) : 0;
            const targetX = x + (shoulder ? 0 : sway * (wrist ? 0.025 : forearm ? 0.065 : 0.035));
            const targetZ = z + (shoulder ? sway * 0.035 : 0);
            object.rotation.x += (targetX - object.rotation.x) * blend;
            object.rotation.y += (y - object.rotation.y) * blend;
            object.rotation.z += (targetZ - object.rotation.z) * blend;
          }
          if (head && headPose) {
            head.rotation.y += (headPose.y + (moving ? pointerX * 0.12 : 0) - head.rotation.y) * blend;
            head.rotation.x += (headPose.x + (moving ? pointerY * 0.05 : 0) - head.rotation.x) * blend;
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
      if (!disposed) app?.dispose();
    });

    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', pointer);
      document.documentElement.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('blur', resetPointer);
      app?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
