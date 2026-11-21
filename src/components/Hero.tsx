import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export function Hero() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reactionRef = useRef<Animation | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const video = videoRef.current;
    if (!scene || !video) return;

    const phone = window.matchMedia('(max-width: 767px)');
    const motion = window.matchMedia(reducedMotionQuery);
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
    }).connection;
    let inView = !('IntersectionObserver' in window);
    let ready = false;
    let startFrame = 0;
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
      if (motion.matches || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) {
        video.pause();
        showPoster();
        return;
      }
      if (!ready || !inView || document.hidden) {
        video.pause();
        return;
      }

      const source = phone.matches ? '/heyrin-robot-clean-sm.mp4' : '/heyrin-robot-clean.mp4';
      if (selectedSource !== source) {
        selectedSource = source;
        showPoster();
        video.src = source;
      }
      if (video.paused && !video.error) {
        void video.play().catch(error => {
          if (error.name !== 'AbortError') showPoster();
        });
      }
    };

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      scene.closest('.hero-shell')?.classList.toggle('is-in-view', inView);
      sync();
    }, { threshold: 0.01 }) : null;
    observer?.observe(scene);
    if (!observer) scene.closest('.hero-shell')?.classList.add('is-in-view');

    // Give the poster a paint before requesting the motion clip.
    startFrame = requestAnimationFrame(() => {
      startFrame = requestAnimationFrame(() => {
        ready = true;
        sync();
      });
    });

    video.addEventListener('playing', showVideo);
    video.addEventListener('error', showPoster);
    document.addEventListener('visibilitychange', sync);
    phone.addEventListener('change', sync);
    motion.addEventListener('change', sync);
    connection?.addEventListener('change', sync);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(startFrame);
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
    };
    window.addEventListener('heyrin:recorded-audio', onRecordedAudio);
    return () => window.removeEventListener('heyrin:recorded-audio', onRecordedAudio);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const visual = visualRef.current;
    if (!scene || !visual) return;

    scene.classList.add('has-robot-interaction');
    const hero = scene.closest('.hero-shell');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motion = window.matchMedia(reducedMotionQuery);
    let frame = 0;
    let x = 0;
    let y = 0;

    const update = () => {
      frame = 0;
      visual.style.transform = x || y
        ? `translate3d(${x * 20}px, ${y * 10}px, 0) rotate(${x * 1.6}deg)`
        : '';
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      x = y = 0;
      update();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !finePointer.matches || motion.matches || document.hidden ||
          !hero?.classList.contains('is-in-view')) return;
      x = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1));
      y = Math.max(-1, Math.min(1, event.clientY / innerHeight * 2 - 1));
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onConditionsChanged = () => {
      if (document.hidden || motion.matches) reactionRef.current?.cancel();
      reset();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', onConditionsChanged);
    finePointer.addEventListener('change', reset);
    motion.addEventListener('change', onConditionsChanged);
    return () => {
      scene.classList.remove('has-robot-interaction');
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', onConditionsChanged);
      finePointer.removeEventListener('change', reset);
      motion.removeEventListener('change', onConditionsChanged);
      reset();
      reactionRef.current?.cancel();
    };
  }, []);

  const greetRobot = () => {
    const preview = previewRef.current;
    if (!preview || window.matchMedia(reducedMotionQuery).matches) return;
    const video = videoRef.current;
    if (video?.paused && video.hasAttribute('src') && !video.error) {
      void video.play().catch(() => {});
    }
    reactionRef.current?.cancel();
    reactionRef.current = preview.animate([
      { transform: 'none' },
      { transform: 'translateY(-7px) rotate(-2.4deg) scale(1.025)', offset: 0.4 },
      { transform: 'translateY(2px) rotate(.7deg)', offset: 0.74 },
      { transform: 'none' },
    ], { duration: 640, easing: 'ease-in-out' });
  };

  return (
    <section id="home" className="hero-shell relative min-h-screen w-full overflow-hidden bg-ink-base">
      <div className="absolute inset-0 tech-grid opacity-40" />
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute -left-32 top-[24%] h-[34rem] w-[34rem] rounded-full bg-lime/5 blur-[130px] pointer-events-none" />
      <div className="hero-orbit-glow pointer-events-none absolute right-[7%] top-[17%] h-[34rem] w-[34rem] rounded-full bg-violet/10 blur-[110px]" />

      <div ref={sceneRef} data-voice-state="idle" className="hero-scene absolute inset-y-0 right-0 z-[1] w-[60%] min-w-[560px]">
        <div ref={visualRef} className="hero-robot-visual" aria-hidden="true">
          <div ref={previewRef} className="hero-static-preview">
            <picture>
              <source media="(max-width: 767px)" srcSet="/heyrin-robot-clean-sm.jpg" />
              <img className="hero-static-preview-image" src="/heyrin-robot-clean.jpg" alt="" width={1152} height={900} fetchPriority="high" />
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
        </div>
        <button type="button" className="hero-robot-greet" aria-label="Say hello to Heyrin's robot" onClick={greetRobot} />
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
