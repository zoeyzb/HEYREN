import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { VoiceDemo } from '@/components/VoiceDemo';
import { Capabilities } from '@/components/Capabilities';
import { HowItWorks } from '@/components/HowItWorks';
import { VoiceVisualization } from '@/components/VoiceVisualization';
import { UseCases } from '@/components/UseCases';
import { GetStarted } from '@/components/GetStarted';
import { Contact } from '@/components/Contact';
import { FAQ } from '@/components/FAQ';
import { FinalCTA, Footer } from '@/components/FinalCTA';

function App() {
  return (
    <div className="relative min-h-screen bg-ink-base text-soft">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <Navigation />

      {/* Sections */}
      <main>
        <Hero />
        <VoiceDemo />
        <Capabilities />
        <HowItWorks />
        <VoiceVisualization />
        <UseCases />
        <GetStarted />
        <Contact />
        <FAQ />
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
