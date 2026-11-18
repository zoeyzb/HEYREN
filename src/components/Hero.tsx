import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const InteractiveRobot = lazy(() => import('../three/InteractiveRobot').then(module => ({ default: module.InteractiveRobot })));


export function Hero() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const interactiveReadyRef = useRef(false);
  const [rigRequested, setRigRequested] = useState(false);
  const [rigReady, setRigReady] = useState(false);
  const [rigError, setRigError] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const disableRig = (failed = false) => {
    interactiveReadyRef.current = false;
    setRigRequested(false);
    setRigReady(false);
    setRigError(failed);
    const video = videoRef.current;
    if (video && !document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void video.play().catch(() => {});
    }
  };
  const readyRig = () => {
    interactiveReadyRef.current = true;
    videoRef.current?.pause();
    setRigReady(true);
  };

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const check = () => {
      setReducedMotion(motion.matches);
      if (motion.matches && interactiveReadyRef.current) disableRig();
    };
    check();
    motion.addEventListener('change', check);
    return () => motion.removeEventListener('change', check);
  }, []);

  useEffect(() => {
    if (!rigRequested || rigReady) return;
    // Background pages have throttled WebGL and animation frames: count only
    // foreground loading time, so tab-switching cannot trigger a false failure.
    let timeLeft = 12_000;
    let startedAt = 0;
    let timeout: number | undefined;
    const stop = () => {
      if (timeout === undefined) return;
      window.clearTimeout(timeout);
      timeout = undefined;
      timeLeft -= Math.max(0, performance.now() - startedAt);
    };
    const update = () => {
      if (document.hidden) { stop(); return; }
      if (timeout !== undefined) return;
      if (timeLeft <= 0) { disableRig(true); return; }
      startedAt = performance.now();
      timeout = window.setTimeout(() => { timeout = undefined; disableRig(true); }, timeLeft);
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => { stop(); document.removeEventListener('visibilitychange', update); };
  }, [rigRequested, rigReady]);

  useEffect(() => {
    const scene = sceneRef.current;
    const video = videoRef.current;
    if (!scene || !video) return;

    const phone = window.matchMedia('(max-width: 767px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
    }).connection;
    let inView = !('IntersectionObserver' in window);
    let ready = false;
    let startTimer: number | undefined;
    let selectedSource = '';
    let firstFrame: number | undefined;

    const showPoster = () => {
      if (firstFrame !== undefined) video.cancelVideoFrameCallback(firstFrame);
      firstFrame = undefined;
      scene.classList.remove('is-playing');
    };
    const showVideo = () => {
      if (scene.classList.contains('is-playing') || firstFrame !== undefined) return;
      if (typeof video.requestVideoFrameCallback === 'function') {
        firstFrame = video.requestVideoFrameCallback(() => {
          firstFrame = undefined;
          scene.classList.add('is-playing');
        });
      } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        scene.classList.add('is-playing');
      }
    };

    const sync = () => {
      if (!ready || interactiveReadyRef.current || !inView || document.hidden || motion.matches || connection?.saveData ||
          /(^|-)2g$/.test(connection?.effectiveType ?? '')) {
        video.pause();
        return;
      }

      const source = phone.matches ? '/heyrin-robot-v4-sm.mp4' : '/heyrin-robot-v4.mp4';
      if (selectedSource !== source) {
        selectedSource = source;
        showPoster();
        video.src = source;
      }
      if (video.paused) void video.play().catch(showPoster);
    };

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      scene.closest('.hero-shell')?.classList.toggle('is-in-view', inView);
      sync();
    }, { threshold: 0.01 }) : null;
    observer?.observe(scene);
    if (!observer) scene.closest('.hero-shell')?.classList.add('is-in-view');

    const start = () => {
      // Let the initial HTML, styles, and poster render before starting the animation.
      startTimer = window.setTimeout(() => {
        ready = true;
        sync();
      }, 150);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    video.addEventListener('playing', showVideo);
    video.addEventListener('error', showPoster);
    document.addEventListener('visibilitychange', sync);
    phone.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    connection?.addEventListener('change', sync);

    return () => {
      observer?.disconnect();
      window.clearTimeout(startTimer);
      window.removeEventListener('load', start);
      video.removeEventListener('playing', showVideo);
      video.removeEventListener('error', showPoster);
      document.removeEventListener('visibilitychange', sync);
      phone.removeEventListener('change', sync);
      motion.removeEventListener('change', sync);
      connection?.removeEventListener('change', sync);
      video.pause();
      showPoster();
    };
  }, []);

  // A visual accent only while the real prerecorded audio element is playing.
  // This does not imply a live AI or microphone connection.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const onRecordedAudio = (event: Event) => {
      const active = (event as CustomEvent<{ active: boolean }>).detail.active;
      scene.dataset.voiceState = active ? 'speaking' : 'idle';
      setSpeaking(active);
    };
    window.addEventListener('heyrin:recorded-audio', onRecordedAudio);
    return () => window.removeEventListener('heyrin:recorded-audio', onRecordedAudio);
  }, []);

  // Lightweight pointer response for the existing pre-rendered robot clip.
  // The actual character rig is not loaded; this moves the entire composition,
  // avoiding a second WebGL render loop on phones and low-powered devices.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let lastFrame = 0;

    const tick = (now: number) => {
      const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 1 / 60;
      lastFrame = now;
      const ease = 1 - Math.exp(-8 * dt);
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      scene.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.06) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        lastFrame = 0;
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const reset = () => { targetX = targetY = 0; schedule(); };
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || document.hidden) return;
      targetX = Math.max(-12, Math.min(12, ((event.clientX / innerWidth) - 0.5) * 24));
      targetY = Math.max(-7, Math.min(7, ((event.clientY / innerHeight) - 0.5) * 14));
      schedule();
    };
    const onConditionsChanged = () => {
      if (!finePointer.matches || reducedMotion.matches || document.hidden) reset();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', onConditionsChanged);
    finePointer.addEventListener('change', onConditionsChanged);
    reducedMotion.addEventListener('change', onConditionsChanged);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', onConditionsChanged);
      finePointer.removeEventListener('change', onConditionsChanged);
      reducedMotion.removeEventListener('change', onConditionsChanged);
      cancelAnimationFrame(frame);
      scene.style.transform = '';
    };
  }, []);

  return (
    <section id="home" className="hero-shell relative min-h-screen w-full overflow-hidden bg-ink-base">
      <div className="absolute inset-0 tech-grid opacity-40" />
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute -left-32 top-[24%] h-[34rem] w-[34rem] rounded-full bg-lime/5 blur-[130px] pointer-events-none" />
      <div className="hero-orbit-glow pointer-events-none absolute right-[7%] top-[17%] h-[34rem] w-[34rem] rounded-full bg-violet/10 blur-[110px]" />

      <div ref={sceneRef} data-voice-state="idle" className={`hero-scene ${rigReady ? 'is-interactive' : ''} absolute inset-y-0 right-0 z-[1] w-[60%] min-w-[560px]`}>
        <div className="hero-static-preview is-fallback" aria-hidden="true">
          <picture>
            <source media="(max-width: 767px)" srcSet="/heyrin-robot-v4-sm.jpg" />
            <img className="hero-static-preview-image" src="/heyrin-robot-v4.jpg" alt="" width={1152} height={900} />
          </picture>
          <video
            ref={videoRef}
            className="hero-static-preview-image hero-robot-motion"
            width={1152}
            height={900}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
          />
        </div>
        {rigRequested && (
          <div className={`hero-rig-layer ${rigReady ? 'is-ready' : ''}`} aria-label="Original interactive Heyrin 3D robot">
            <Suspense fallback={null}>
              <InteractiveRobot speaking={speaking} onReady={readyRig} onError={() => disableRig(true)} />
            </Suspense>
          </div>
        )}
        <button
          type="button"
          className="hero-rig-toggle"
          disabled={reducedMotion}
          aria-label={rigRequested ? 'Return to animated robot' : 'Enable interactive 3D robot'}
          aria-pressed={rigRequested}
          onClick={() => rigRequested ? disableRig() : (setRigError(false), setRigRequested(true))}
        >{rigRequested ? 'Animated view' : 'Interactive 3D'}</button>
        {rigError && <span className="hero-rig-error" role="status">3D robot unavailable. Animated view restored.</span>}
      </div>

      <div className="hero-content relative z-10 mx-auto flex min-h-screen max-w-[1440px] items-center px-6 pb-16 pt-28 sm:px-10 lg:px-14 xl:px-20">
        <div className="hero-copy-column w-full max-w-[710px]">
          <div className="hero-eyebrow mb-7 flex items-center gap-3">
            <div className="h-px w-9 bg-lime/70" />
            <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-lime/85">Introducing Heyrin</span>
            <span className="hidden text-[11px] font-mono uppercase tracking-[0.18em] text-silver/45 sm:inline">Voice intelligence</span>
          </div>

          <h1 className="hero-heading max-w-[700px] font-display text-[3.35rem] leading-[0.98] tracking-[-0.055em] text-soft sm:text-6xl lg:text-[5.1rem]">
            Never miss
            <br />
            <span className="hero-heading-accent relative inline-block text-lime text-glow-lime">
              another call.
              <span className="absolute -bottom-3 left-0 h-px w-[88%] bg-gradient-to-r from-lime/80 via-lime/30 to-transparent" />
            </span>
          </h1>

          <div className="hero-copy mt-7 max-w-[550px]">
            <p className="text-lg font-medium tracking-[-0.02em] text-soft/90 sm:text-xl">
              <span className="text-lime">Always there.</span>{' '}
              <span className="text-violet-glow">Always ready.</span>
            </p>
            <p className="mt-4 max-w-[500px] text-[15px] leading-7 text-silver sm:text-base">
              An AI voice agent that answers every call, handles routine questions, and helps turn more conversations into customers.
            </p>
          </div>

          <div className="hero-actions mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#experience" className="magnetic-btn group flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink-base shadow-[0_0_28px_rgba(185,255,50,0.2)] transition-all duration-300 hover:bg-lime-glow hover:shadow-[0_0_35px_rgba(185,255,50,0.42)]">
              Hear Heyrin in Action
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a href="#contact" className="group flex items-center justify-center gap-2 rounded-full border border-ink-line bg-white/[0.02] px-6 py-3.5 text-sm font-medium text-soft backdrop-blur-sm transition-all duration-300 hover:border-lime/45 hover:bg-white/[0.05]">
              Get Your AI Agent
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="hero-meta mt-10 flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.19em] text-silver/45">
            <span>Voice intelligence</span>
            <span className="h-1 w-1 rounded-full bg-lime/45" />
            <span>Business automation</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-lime/45 to-transparent animate-pulse-slow" />
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-silver/40">Scroll</span>
      </div>
    </section>
  );
}
