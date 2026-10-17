import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';

const HeroScene = lazy(() => import('@/three/HeroScene').then((m) => ({ default: m.HeroScene })));

export function Hero() {
  const [heroState, setHeroState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [sceneReady, setSceneReady] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .fromTo('.hero-eyebrow', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo('.hero-heading', { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.95 }, '-=0.42')
        .fromTo('.hero-copy', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.52')
        .fromTo('.hero-actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, '-=0.4')
        .fromTo('.hero-meta', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=0.3');
      gsap.fromTo(sceneRef.current, { opacity: 0, x: 56, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, duration: 1.35, delay: 0.15, ease: 'power4.out' });
      gsap.to('.hero-orbit-glow', { scale: 1.08, opacity: 0.72, duration: 3.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, heroRef);
    return () => context.revert();
  }, []);

  const scrollToExperience = () => document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToContact = () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section ref={heroRef} id="home" className="hero-shell relative min-h-screen w-full overflow-hidden bg-ink-base">
      <div className="absolute inset-0 tech-grid opacity-40" />
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute -left-32 top-[24%] h-[34rem] w-[34rem] rounded-full bg-lime/5 blur-[130px] pointer-events-none" />
      <div className="hero-orbit-glow pointer-events-none absolute right-[7%] top-[17%] h-[34rem] w-[34rem] rounded-full bg-violet/10 blur-[110px]" />

      <div ref={sceneRef} className={`hero-scene absolute inset-y-0 right-0 z-[1] w-[60%] min-w-[560px] ${sceneReady ? 'is-ready' : ''}`}>
        {/* Never display a frozen robot pose on desktop: the real Spline robot
            starts moving as it loads, so swapping from a photo creates an
            obvious change in body pose and missing limbs. */}
        {/* A real, alpha-matted frame from this exact Spline model is shown on
            first paint. Its placement matches the live canvas and there are
            no baked-in rectangular edges or mismatched synthetic robot. */}
        <div className={`hero-robot-standin ${sceneReady ? 'is-hidden' : ''}`} aria-hidden="true">
          <img
            src="/heyrin-robot-instant.webp"
            alt=""
            width={864}
            height={900}
            fetchPriority="high"
            decoding="async"
          />
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
        {/* Mobile has no WebGL character; keep a small static picture there. */}
        <div className="hero-mobile-poster" aria-hidden="true">
          <img src="/heyrin-robot-instant.webp" alt="" width={864} height={900} loading="eager" decoding="async" />
        </div>
        <Suspense fallback={null}>
          <HeroScene listening={heroState === 'listening'} speaking={heroState === 'speaking'} activated active={heroVisible} onReady={() => setSceneReady(true)} />
        </Suspense>
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
