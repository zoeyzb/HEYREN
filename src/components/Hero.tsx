import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const HeroScene = lazy(() => import('@/three/HeroScene').then((m) => ({ default: m.HeroScene })));

/** Spline can reject its remote scene request. Preserve the page and our
 * locally hosted animated stand-in instead of unmounting the whole app. */
class HeroSceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) console.warn('3D robot unavailable; using animated preview.', error);
  }
  render() { return this.state.failed ? null : this.props.children; }
}

export function Hero() {
  const [heroState, setHeroState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [sceneReady, setSceneReady] = useState(false);
  const [motionPreviewReady, setMotionPreviewReady] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const cycle = window.setInterval(() => {
      setHeroState((prev) => (prev === 'idle' ? 'listening' : prev === 'listening' ? 'speaking' : 'idle'));
    }, 4200);
    return () => window.clearInterval(cycle);
  }, []);

  useEffect(() => {
    if (!heroRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // Critical hero content is visible on the first paint. Do not use GSAP
  // fromTo(opacity:0): WebGL initialization can stall the first animation
  // frame and leave headings, CTAs, and the robot invisible for seconds.

  // Preload the 20 real Spline poses as one lightweight sprite. CSS moves
  // between frames reliably even when Chrome suspends animated WebP playback.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let alive = true;
    const sprite = new Image();
    sprite.src = '/heyrin-robot-motion-sprite.webp';
    const ready = () => { if (alive) setMotionPreviewReady(true); };
    sprite.decode().then(ready).catch(() => {
      if (sprite.complete && sprite.naturalWidth > 0) ready();
    });
    return () => { alive = false; };
  }, []);

  const scrollTo = (selector: string) => document.querySelector(selector)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
  const scrollToExperience = () => scrollTo('#experience');
  const scrollToContact = () => scrollTo('#contact');

  return (
    <section ref={heroRef} id="home" className="hero-shell relative min-h-screen w-full overflow-hidden bg-ink-base">
      <div className="absolute inset-0 tech-grid opacity-40" />
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute -left-32 top-[24%] h-[34rem] w-[34rem] rounded-full bg-lime/5 blur-[130px] pointer-events-none" />
      <div className="hero-orbit-glow pointer-events-none absolute right-[7%] top-[17%] h-[34rem] w-[34rem] rounded-full bg-violet/10 blur-[110px]" />

      <div className={`hero-scene absolute inset-y-0 right-0 z-[1] w-[60%] min-w-[560px] ${sceneReady ? 'is-ready' : ''}`}>
        {/* First paint is a lightweight frame from the real scene, followed by
            an alpha-matted loop recorded from the very same Spline animation.
            Unlike the previous static poster, the robot is already moving while
            the 3D engine starts; the layers crossfade when Spline is ready. */}
        <div className={`hero-robot-standin ${sceneReady ? 'is-hidden' : ''}`} aria-hidden="true">
          <img
            className="hero-robot-first-frame"
            src="/heyrin-robot-motion-poster.webp"
            alt=""
            width={480}
            height={500}
            fetchPriority="high"
            decoding="async"
          />
          <div className={`hero-robot-motion ${motionPreviewReady ? 'is-active' : ''}`} />
        </div>
        <div className={`hero-signal-loader ${sceneReady ? 'is-hidden' : ''}`} aria-hidden="true">
          <div className="hero-signal-loader-ring hero-signal-loader-ring-a" />
          <div className="hero-signal-loader-ring hero-signal-loader-ring-b" />
          <div className="hero-signal-loader-center">
            <span className="hero-signal-loader-light" />
            <span className="hero-signal-loader-label">VOICE INTELLIGENCE</span>
            <span className="hero-signal-loader-activity"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
          </div>
        </div>
        {/* Mobile has no WebGL character: the same animated transparent preview
            runs without downloading the large Spline runtime. */}
        <div className="hero-mobile-poster" aria-hidden="true">
          <img src="/heyrin-robot-motion-poster.webp" alt="" width={480} height={500} loading="eager" decoding="async" />
          <div className={`hero-robot-motion ${motionPreviewReady ? 'is-active' : ''}`} />
        </div>
        <HeroSceneErrorBoundary>
          <Suspense fallback={null}>
            <HeroScene listening={heroState === 'listening'} speaking={heroState === 'speaking'} activated active={heroVisible} onReady={() => setSceneReady(true)} />
          </Suspense>
        </HeroSceneErrorBoundary>
      </div>

      <div className="hero-content relative z-10 mx-auto flex min-h-screen max-w-[1440px] items-center px-6 pb-16 pt-28 sm:px-10 lg:px-14 xl:px-20">
        <div className="hero-copy-column w-full max-w-[710px]">
          <div className="hero-eyebrow mb-7 flex items-center gap-3">
            <div className="h-px w-9 bg-lime/70" />
            <span className="text-[11px] font-mono uppercase tracking-[0.26em] text-lime/85">Introducing Heyrin</span>
            <span className="hidden text-[11px] font-mono uppercase tracking-[0.18em] text-silver/45 sm:inline">Voice intelligence</span>
          </div>

          <h1 className="hero-heading max-w-[700px] font-display text-[3.35rem] leading-[0.98] tracking-[-0.055em] text-soft sm:text-6xl lg:text-[5.35rem]">
            Meet the voice
            <br />
            <span className="text-soft">behind your</span>
            <br />
            <span className="hero-heading-accent relative inline-block text-lime text-glow-lime">
              business.
              <span className="absolute -bottom-3 left-0 h-px w-[88%] bg-gradient-to-r from-lime/80 via-lime/30 to-transparent" />
            </span>
          </h1>

          <div className="hero-copy mt-7 max-w-[550px]">
            <p className="text-lg font-medium tracking-[-0.02em] text-soft/90 sm:text-xl">
              <span className="text-lime">Always there.</span>{' '}
              <span className="text-violet-glow">Always ready.</span>
            </p>
            <p className="mt-4 max-w-[500px] text-[15px] leading-7 text-silver sm:text-base">
              An intelligent AI voice agent that answers calls, handles inquiries, and helps turn every conversation into an opportunity.
            </p>
          </div>

          <div className="hero-actions mt-9 flex flex-col gap-3 sm:flex-row">
            <button onClick={scrollToExperience} className="magnetic-btn group flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-semibold text-ink-base shadow-[0_0_28px_rgba(185,255,50,0.2)] transition-all duration-300 hover:bg-lime-glow hover:shadow-[0_0_35px_rgba(185,255,50,0.42)]">
              Hear Heyrin in Action
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
            <button onClick={scrollToContact} className="group flex items-center justify-center gap-2 rounded-full border border-ink-line bg-white/[0.02] px-6 py-3.5 text-sm font-medium text-soft backdrop-blur-sm transition-all duration-300 hover:border-lime/45 hover:bg-white/[0.05]">
              Get Your AI Agent
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
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
