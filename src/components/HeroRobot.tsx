import { useEffect, useRef } from 'react';

const neutralColumn = 6;
const neutralRow = 2;
const motionQuery = '(prefers-reduced-motion: reduce)';
const clamp = (value: number) => Math.max(-1, Math.min(1, value));

type OrientationWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export function HeroRobot() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const greetRef = useRef<() => void>(() => {});

  useEffect(() => {
    const scene = sceneRef.current;
    const head = headRef.current;
    const poster = posterRef.current;
    if (!scene || !head || !poster) return;

    const hero = scene.closest('.hero-shell');
    const phone = window.matchMedia('(max-width: 767px)');
    const touch = window.matchMedia('(any-pointer: coarse)');
    const motion = window.matchMedia(motionQuery);
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
    }).connection;
    const orientation = window.DeviceOrientationEvent as OrientationWithPermission | undefined;
    let tiltAllowed = window.isSecureContext && Boolean(orientation && !orientation.requestPermission);
    let permissionRequested = false;
    let origin: { beta: number; gamma: number; angle: number } | undefined;
    let inView = !('IntersectionObserver' in window);
    let disposed = false;
    let atlas: HTMLImageElement | undefined;
    let ready = false;
    let frame = 0;
    let previous = 0;
    let column = neutralColumn;
    let row = neutralRow;
    let yaw = 0;
    let pitch = 0;
    let targetYaw = 0;
    let targetPitch = 0;
    let nodAt: number | undefined;
    let nodPending = false;

    const visible = () => inView && !document.hidden && !motion.matches;
    const setPose = (nextColumn: number, nextRow: number) => {
      if (nextColumn === column && nextRow === row) return;
      column = nextColumn;
      row = nextRow;
      head.style.backgroundPosition = `${column / 12 * 100}% ${row / 4 * 100}%`;
    };
    const update = (now: number) => {
      frame = 0;
      if (!visible() || !ready) return;
      const step = previous ? Math.min(now - previous, 40) : 16.7;
      const blend = 1 - Math.exp(-step / 95);
      previous = now;
      const phase = nodAt === undefined ? 1 : Math.min((now - nodAt) / 570, 1);
      const nod = Math.sin(Math.PI * phase) ** 2;
      if (phase === 1) nodAt = undefined;
      const nextYaw = targetYaw * (1 - .42 * nod);
      const nextPitch = clamp(targetPitch + nod * Math.max(.7, 1 - targetPitch));
      yaw += (nextYaw - yaw) * blend;
      pitch += (nextPitch - pitch) * blend;
      setPose(Math.round(neutralColumn + yaw * neutralColumn), Math.round(neutralRow + pitch * neutralRow));
      if (nodAt !== undefined || Math.abs(nextYaw - yaw) + Math.abs(nextPitch - pitch) > .02) {
        frame = requestAnimationFrame(update);
      } else {
        previous = 0;
      }
    };
    const schedule = () => {
      if (!frame && ready && visible()) frame = requestAnimationFrame(update);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = previous = yaw = pitch = targetYaw = targetPitch = 0;
      nodAt = origin = undefined;
      nodPending = false;
      setPose(neutralColumn, neutralRow);
    };
    const loadAtlas = (onDemand = false) => {
      if (!visible() || (!onDemand && (!poster.complete || !poster.naturalWidth || connection?.saveData ||
          /(^|-)2g$/.test(connection?.effectiveType ?? '')))) return;
      const url = phone.matches ? '/heyrin-gaze-mobile.webp' : '/heyrin-gaze-desktop.webp';
      if (atlas?.getAttribute('src') === url) return;
      const image = new Image();
      atlas = image;
      image.fetchPriority = 'low';
      image.onload = () => {
        if (disposed || atlas !== image) return;
        ready = true;
        head.style.backgroundImage = `url("${url}")`;
        scene.classList.add('is-gaze-ready');
        if (nodPending) {
          nodPending = false;
          nodAt = performance.now();
        }
        schedule();
      };
      image.onerror = () => { if (atlas === image) atlas = undefined; };
      image.src = url;
    };
    const onPosterLoad = () => loadAtlas();
    const sync = () => {
      hero?.classList.toggle('is-in-view', inView);
      if (!visible()) reset();
      else loadAtlas();
    };
    const onResize = () => {
      reset();
      if (atlas) {
        atlas = undefined;
        ready = false;
        scene.classList.remove('is-gaze-ready');
        head.style.backgroundImage = '';
      }
      sync();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !visible()) return;
      const box = scene.getBoundingClientRect();
      targetYaw = clamp((event.clientX - (box.left + box.width / 2)) / (box.width * .43));
      targetPitch = clamp((event.clientY - (box.top + box.height * .26)) / (box.height * .5));
      schedule();
    };
    const onTilt = ({ beta, gamma }: DeviceOrientationEvent) => {
      if (!tiltAllowed || !touch.matches || !visible() || beta === null || gamma === null ||
          !Number.isFinite(beta) || !Number.isFinite(gamma)) return;
      const angle = screen.orientation?.angle ?? window.orientation ?? 0;
      if (!origin || origin.angle !== angle || Math.abs(gamma - origin.gamma) > 70) origin = { beta, gamma, angle };
      const rotation = angle * Math.PI / 180;
      const x = (gamma - origin.gamma) * Math.cos(rotation) - (beta - origin.beta) * Math.sin(rotation);
      const y = (beta - origin.beta) * Math.cos(rotation) + (gamma - origin.gamma) * Math.sin(rotation);
      if (Math.abs(x) < 1 && Math.abs(y) < 1 && targetYaw === 0 && targetPitch === 0) return;
      targetYaw = Math.abs(x) < 1 ? 0 : clamp(x / 18);
      targetPitch = Math.abs(y) < 1 ? 0 : clamp(y / 23);
      schedule();
    };
    const onAudio = (event: Event) => {
      scene.dataset.voiceState = (event as CustomEvent<{ active: boolean }>).detail.active ? 'speaking' : 'idle';
    };
    greetRef.current = () => {
      if (!visible()) return;
      if (ready) {
        nodAt = performance.now();
        schedule();
      } else {
        nodPending = true;
        loadAtlas(true);
      }
      if (!permissionRequested && touch.matches && window.isSecureContext && orientation?.requestPermission) {
        permissionRequested = true;
        void orientation.requestPermission().then(result => {
          if (!disposed) tiltAllowed = result === 'granted';
        }).catch(() => {});
      }
    };

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { threshold: .02 }) : undefined;
    observer?.observe(scene);
    scene.classList.add('has-robot-interaction');
    poster.addEventListener('load', onPosterLoad);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('deviceorientation', onTilt);
    window.addEventListener('heyrin:recorded-audio', onAudio);
    document.addEventListener('visibilitychange', sync);
    phone.addEventListener('change', onResize);
    motion.addEventListener('change', sync);
    connection?.addEventListener('change', sync);
    sync();

    return () => {
      disposed = true;
      observer?.disconnect();
      reset();
      greetRef.current = () => {};
      scene.classList.remove('has-robot-interaction', 'is-gaze-ready');
      head.style.backgroundImage = '';
      poster.removeEventListener('load', onPosterLoad);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('deviceorientation', onTilt);
      window.removeEventListener('heyrin:recorded-audio', onAudio);
      document.removeEventListener('visibilitychange', sync);
      phone.removeEventListener('change', onResize);
      motion.removeEventListener('change', sync);
      connection?.removeEventListener('change', sync);
    };
  }, []);

  return (
    <div ref={sceneRef} data-voice-state="idle" className="hero-scene absolute inset-y-0 right-0 z-[1] w-[60%] min-w-[560px]">
      <div className="hero-robot-stage" aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" srcSet="/heyrin-lit-mobile.webp" />
          <img ref={posterRef} className="hero-robot-body" src="/heyrin-lit-desktop.webp" alt="" width={1152} height={900} fetchPriority="high" />
        </picture>
        <div ref={headRef} className="hero-robot-head" />
      </div>
      <button type="button" className="hero-robot-greet" aria-label="Say hello to Heyrin's robot" onClick={() => greetRef.current()} />
    </div>
  );
}
