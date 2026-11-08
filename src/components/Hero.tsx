import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const HeroScene = lazy(() => import('@/three/HeroScene').then((m) => ({ default: m.HeroScene })));

export function Hero() {
  const [heroState, setHeroState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const contextLosses = useRef(0);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [loadScene, setLoadScene] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const cycle = window.setInterval(() => {
      setHeroState((prev) => (prev === 'idle' ? 'listening' : prev === 'listening' ? 'speaking' : 'idle'));
    }, 4200);
    return () => window.clearInterval(cycle);
  }, []);

  // Keep the first load light: the robot poster paints instantly, and the heavy live 3D scene (several MB of Spline
  // runtime + scene) starts right after first paint (its code and scene file are fetched in parallel). Skipped on phones,
  // data-saver, genuine 2g and very low-memory devices, where the poster stays.
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
    // Phones now get the live robot too (lighter atmosphere layer, see HeroScene); the poster only stays for the cases below.
    // Only skip the 3D for explicit data-saver, genuine 2g and very low-memory devices. Chrome often *reports* 3g on
    // perfectly usable connections (e.g. in Pakistan), which used to leave the robot stuck on the still poster forever:
    // on 3g we still load the scene, just a bit later so the page itself stays fast.
    const effectiveType = nav.connection?.effectiveType ?? '';
    const skip3d = nav.connection?.saveData || /(^|-)2g/.test(effectiveType) || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2);
    if (skip3d) return;
    const extraDelay = effectiveType === '3g' ? 800 : 0;
    // Start fetching the 3D code immediately (in parallel with the scene file, which index.html preloads) instead of
    // waiting for the full page load + an idle moment; the poster is already painted, so this stays out of the way.
    void import('@/three/HeroScene');
    void import('@splinetool/runtime');
    void import('@/three/HeroAtmosphere');
    // Warm the HTTP cache with the 1.3MB scene file now (it is no longer preloaded from <head>, where it fought the main bundle for phone bandwidth).
    void fetch('https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode').catch(() => {});
    const timer = window.setTimeout(() => setLoadScene(true), 150 + extraDelay);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!heroRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // No JS entrance animation: the headline, copy and buttons are visible from the very first paint (they used to start
  // at opacity 0 and fade in over ~2.5s after the whole bundle had loaded, which read as a blank, stuck page on phones).

  const scrollToExperience = () => document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToContact = () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section ref={heroRef} id="home" className="hero-shell relative min-h-screen w-full overflow-hidden bg-ink-base">
      <div className="absolute inset-0 tech-grid opacity-40" />
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute -left-32 top-[24%] h-[34rem] w-[34rem] rounded-full bg-lime/5 blur-[130px] pointer-events-none" />
      <div className="hero-orbit-glow pointer-events-none absolute right-[7%] top-[17%] h-[34rem] w-[34rem] rounded-full bg-violet/10 blur-[110px]" />

      <div className={`hero-scene absolute inset-y-0 right-0 z-[1] w-[60%] min-w-[560px] ${sceneReady ? 'is-ready' : ''}`}>
        <div className={`hero-static-preview ${sceneReady ? 'is-hidden' : sceneFailed ? 'is-fallback' : 'is-loading'}`} aria-hidden="true">
          <picture>
            <source media="(max-width: 767px)" srcSet="/heyrin-robot-v3-sm.webp" type="image/webp" />
            <img className="hero-static-preview-image" src="/heyrin-robot-v3.webp" alt="" width={1152} height={900} decoding="async" />
          </picture>
        </div>
        {loadScene && <Suspense fallback={null}>
          <HeroScene key={sceneKey} onContextLost={() => { setSceneReady(false); contextLosses.current += 1; if (contextLosses.current > 3) { setSceneFailed(true); return; } window.setTimeout(() => setSceneKey(k => k + 1), 500); }} listening={heroState === 'listening'} speaking={heroState === 'speaking'} activated active={heroVisible} onReady={() => { setSceneFailed(false); /* both layers have already drawn a real frame: swap on the next paint, no extra delay */ requestAnimationFrame(() => requestAnimationFrame(() => setSceneReady(true))); }} onError={() => setSceneFailed(true)} />
        </Suspense>}
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
