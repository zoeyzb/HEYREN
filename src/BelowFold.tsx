import { VoiceDemo } from '@/components/VoiceDemo';
import { Reviews } from '@/components/Reviews';
import { Capabilities } from '@/components/Capabilities';
import { HowItWorks } from '@/components/HowItWorks';
import { UseCases } from '@/components/UseCases';
import { GetStarted } from '@/components/GetStarted';
import { Contact } from '@/components/Contact';
import { FAQ } from '@/components/FAQ';
import { FinalCTA } from '@/components/FinalCTA';

// Everything under the hero lives in its own chunk, so the first screen (nav + hero) paints from a much smaller bundle.
export default function BelowFold() {
  return (
    <>
        <HowItWorks />
        <VoiceDemo />
        <Capabilities />
        <UseCases />
        <Reviews />
        <GetStarted />
        <Contact />
        <FAQ />
        <FinalCTA />
    </>
  );
}

export { Footer } from '@/components/FinalCTA';
