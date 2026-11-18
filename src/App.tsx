import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import BelowFold, { Footer } from './BelowFold';
import { LiveChat } from '@/components/LiveChat';

export default function App() {
  return (
    <div className="relative min-h-screen bg-ink-base text-soft">
      <div className="noise-overlay" />
      <Navigation />
      <main>
        <Hero />
        <BelowFold />
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
}
