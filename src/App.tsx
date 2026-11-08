import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';

const BelowFold = lazy(() => import('./BelowFold'));
const LazyFooter = lazy(() => import('./BelowFold').then((m) => ({ default: m.Footer })));

function App() {
  // Paint nav + hero first, then pull in the rest of the page.
  const [showRest, setShowRest] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShowRest(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative min-h-screen bg-ink-base text-soft">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <Navigation />

      <main>
        <Hero />
        {showRest && (
          <Suspense fallback={null}>
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
