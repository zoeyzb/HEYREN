import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Experience', href: '#experience' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact', href: '#contact' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-ink-base/80 backdrop-blur-xl border-b border-ink-line/50' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleNav('#home')} className="flex items-center gap-2.5 group">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-lime/60 group-hover:border-lime transition-colors" />
              <div className="absolute inset-1.5 rounded-full border border-violet/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-lime group-hover:shadow-[0_0_8px_#B9FF32] transition-shadow" />
            </div>
            <span className="wordmark text-soft text-lg tracking-tight">HEYRIN</span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-sm text-silver hover:text-soft transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-lime group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleNav('#contact')}
              className="magnetic-btn px-5 py-2 text-sm font-medium text-ink-base bg-lime hover:bg-lime-glow rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(185,255,50,0.4)]"
            >
              Get Your AI Agent
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-soft"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="heyrin-mobile-navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="heyrin-mobile-navigation" className="fixed inset-0 z-40 md:hidden bg-ink-base/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="text-xl text-silver hover:text-lime transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNav('#contact')}
            className="mt-4 px-6 py-3 text-base font-medium text-ink-base bg-lime rounded-full"
          >
            Get Your AI Agent
          </button>
        </div>
      )}
    </>
  );
}
