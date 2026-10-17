import { ArrowUpRight } from 'lucide-react';
import { useFadeUp } from '@/hooks/useReveal';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Experience', href: '#experience' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
];

export function FinalCTA() {
  const { ref, visible } = useFadeUp<HTMLDivElement>();

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-24 lg:py-40 bg-ink-deep overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-20" />

      {/* Illuminated trails converging to center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-full max-w-[1000px] h-[500px]" viewBox="0 0 1000 500" fill="none">
          {/* Left trails */}
          <path d="M0 150 Q 250 150, 450 250" stroke="url(#trail1)" strokeWidth="1" opacity="0.3" />
          <path d="M0 350 Q 250 350, 450 250" stroke="url(#trail2)" strokeWidth="1" opacity="0.2" />
          {/* Right trails */}
          <path d="M1000 150 Q 750 150, 550 250" stroke="url(#trail1)" strokeWidth="1" opacity="0.3" />
          <path d="M1000 350 Q 750 350, 550 250" stroke="url(#trail2)" strokeWidth="1" opacity="0.2" />
          {/* Center glow circle */}
          <circle cx="500" cy="250" r="80" stroke="#B9FF32" strokeWidth="0.5" opacity="0.15" fill="none" />
          <circle cx="500" cy="250" r="120" stroke="#A16BFF" strokeWidth="0.5" opacity="0.1" fill="none" />
          <defs>
            <linearGradient id="trail1" x1="0" y1="0" x2="500" y2="250" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B9FF32" stopOpacity="0" />
              <stop offset="0.5" stopColor="#B9FF32" stopOpacity="0.6" />
              <stop offset="1" stopColor="#B9FF32" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trail2" x1="0" y1="0" x2="500" y2="250" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A16BFF" stopOpacity="0" />
              <stop offset="0.5" stopColor="#A16BFF" stopOpacity="0.5" />
              <stop offset="1" stopColor="#A16BFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div ref={ref} className={`relative max-w-[900px] mx-auto px-6 text-center fade-up ${visible ? 'visible' : ''}`}>
        {/* Wordmark glow */}
        <div className="mb-8">
          <div className="wordmark text-5xl sm:text-6xl lg:text-7xl text-soft tracking-tight relative inline-block">
            <span className="text-glow-lime">HEYRIN</span>
          </div>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight mb-4">
          The next call could be the one.
        </h2>
        <p className="text-base text-silver max-w-md mx-auto mb-8">
          Make sure your business is ready to answer.
        </p>

        <button
          onClick={() => scrollTo('#contact')}
          className="magnetic-btn inline-flex items-center gap-2 px-7 py-4 bg-lime text-ink-base font-medium text-base rounded-full hover:bg-lime-glow transition-all duration-300 hover:shadow-[0_0_30px_rgba(185,255,50,0.4)]"
        >
          Meet Your AI Agent
          <ArrowUpRight size={18} />
        </button>

        <div className="flex items-center justify-center gap-4 mt-10 text-[10px] font-mono text-silver/30 uppercase tracking-wider">
          <span>Voice Intelligence</span>
          <span className="w-1 h-1 rounded-full bg-silver/20" />
          <span>Every Call. Every Opportunity.</span>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-ink-base border-t border-ink-line py-12 overflow-hidden">
      <div className="absolute inset-0 tech-grid-fine opacity-10" />

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-start mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="relative w-7 h-7 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-lime/60" />
                <div className="absolute inset-1.5 rounded-full border border-violet/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-lime" />
              </div>
              <span className="wordmark text-soft text-lg tracking-tight">HEYRIN</span>
            </div>
            <p className="text-xs text-silver/50 max-w-[200px]">AI Voice Intelligence</p>
          </div>

          {/* Nav */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-xs text-silver/60 hover:text-lime transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Contact */}
          <div className="md:text-right">
            <div className="text-[10px] font-mono text-silver/40 uppercase tracking-wider mb-1">Contact</div>
            <a href="mailto:sierra@recoverrevenue.company" className="text-xs text-soft hover:text-lime transition-colors">
              sierra@recoverrevenue.company
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-ink-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono text-silver/30 uppercase tracking-wider">
            © 2026 HEYRIN. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button className="text-[10px] font-mono text-silver/40 uppercase tracking-wider hover:text-silver transition-colors">
              Privacy
            </button>
            <button className="text-[10px] font-mono text-silver/40 uppercase tracking-wider hover:text-silver transition-colors">
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
