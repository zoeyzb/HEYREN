import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';

const BelowFold = lazy(() => import('./BelowFold'));
const LazyFooter = lazy(() => import('./BelowFold').then((m) => ({ default: m.Footer })));

function App() {
  // Paint nav + hero first, then pull in the rest of the page.
  const [showRest, setShowRest] = useState(false);
  const [restLoaded, setRestLoaded] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setShowRest(true);
      // The sections chunk is small; the 3D robot (several MB) only starts after it has arrived, so scrolling never shows empty black.
      Promise.all([import('./BelowFold')]).then(() => setRestLoaded(true), () => setRestLoaded(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative min-h-screen bg-ink-base text-soft">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <Navigation />

      <main>
        <Hero startHeavy={restLoaded} />
        {showRest && (
          <Suspense fallback={<div aria-hidden="true" style={{ minHeight: '100vh' }} />}>
            <BelowFold />
          </Suspense>
        )}
      </main>

      {showRest && (
        <Suspense fallback={null}>
          <LazyFooter />
        </Suspense>
      )}
    </div>
  );
}

export default App;
