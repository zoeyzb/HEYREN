import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Experience', href: '#experience' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Contact', href: '#contact' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const wideScreen = window.matchMedia('(min-width: 768px)');
    const closeOnResize = () => { if (wideScreen.matches) setMenuOpen(false); };
    window.addEventListener('keydown', onEscape);
    wideScreen.addEventListener('change', closeOnResize);
    return () => {
      window.removeEventListener('keydown', onEscape);
      wideScreen.removeEventListener('change', closeOnResize);
    };
  }, [menuOpen]);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    if (window.location.hash !== href) window.history.pushState(null, '', href);
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
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
            <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#9DCA31" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="7.5" stroke="#9265C5" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="3" fill="#B9FF32" />
            </svg>
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
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="heyrin-mobile-menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="heyrin-mobile-menu" className="fixed inset-0 z-40 md:hidden bg-ink-base/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
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
