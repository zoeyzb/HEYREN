import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';


// `startHeavy` is still passed by App but no longer needed: the hero is a lightweight looping clip now.
export function Hero(_props: { startHeavy?: boolean }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);



  useEffect(() => {
    if (!heroRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0.01 });
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  // No JS entrance animation: the headline, copy and buttons are visible from the very first paint (they used to start
  // at opacity 0 and fade in over ~2.5s after the whole bundle had loaded, which read as a blank, stuck page on phones).

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !heroVisible) video.pause();
    else void video.play().catch(() => {});
  }, [heroVisible]);

  const scrollToExperience = () => document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToContact = () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section ref={heroRef} id="home" className="hero-shell relative min-h-screen w-full overflow-hidden bg-ink-base">
      <div className="absolute inset-0 tech-grid opacity-40" />
      <div className="absolute inset-0 hero-vignette pointer-events-none" />
      <div className="absolute -left-32 top-[24%] h-[34rem] w-[34rem] rounded-full bg-lime/5 blur-[130px] pointer-events-none" />
      <div className="hero-orbit-glow pointer-events-none absolute right-[7%] top-[17%] h-[34rem] w-[34rem] rounded-full bg-violet/10 blur-[110px]" />

      <div className="hero-scene absolute inset-y-0 right-0 z-[1] w-[60%] min-w-[560px]">
        {/* One pre-rendered, seamlessly looping clip of the finished scene (robot + rings + particles): paints instantly,
            moves on every device (phones too), no swap between a still and a 3D canvas, and ~6 MB less to download. */}
        <div className="hero-static-preview is-fallback" aria-hidden="true">
          <video
            ref={videoRef}
            className="hero-static-preview-image"
            src={isPhone ? '/heyrin-robot-v4-sm.mp4' : '/heyrin-robot-v4.mp4'}
            poster={isPhone ? '/heyrin-robot-v4-sm.jpg' : '/heyrin-robot-v4.jpg'}
            width={1152}
            height={900}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
          />
        </div>
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
