import { useFadeUp } from '@/hooks/useReveal';

const STEPS = [
  {
    number: '01',
    title: 'Tell us about your business',
    desc: 'Share your calls, services, and communication requirements.',
    detail: 'We learn how your phone currently rings, what callers ask, and where opportunities are being missed.',
  },
  {
    number: '02',
    title: 'We build your agent',
    desc: 'We configure your voice experience, conversation flows, and supported integrations.',
    detail: 'Your agent is tailored with your business information, scheduling tools, and follow-up workflows.',
  },
  {
    number: '03',
    title: 'Test and launch',
    desc: 'We validate behavior and help prepare the agent for real customer conversations.',
    detail: 'You hear it in action, refine the voice and responses, and go live when everything feels right.',
  },
];

export function GetStarted() {
  const { ref, visible } = useFadeUp<HTMLDivElement>();

  return (
    <section className="heyrin-get-started relative py-24 lg:py-32 bg-ink-base overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-lime/3 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className={`relative max-w-[1100px] mx-auto px-6 lg:px-10 fade-up ${visible ? 'visible' : ''}`}>
        <div className="mb-12 lg:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-violet/60" />
            <span className="text-xs font-mono tracking-[0.2em] text-violet/80 uppercase">Getting Started</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight">
            Your AI receptionist, built around you.
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-[15%] right-[15%] top-7 h-px bg-gradient-to-r from-lime/20 via-violet/20 to-lime/20" />

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="relative">
                {/* Number node */}
                <div className="relative w-14 h-14 rounded-full bg-ink-deep border-2 border-lime/30 flex items-center justify-center mb-5 mx-auto md:mx-0">
                  <span className="text-sm font-mono text-lime">{step.number}</span>
                  {idx < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-full w-full h-px" />
                  )}
                </div>

                <h3 className="text-lg font-medium text-soft mb-2 tracking-tight">{step.title}</h3>
                <p className="text-sm text-silver/70 mb-3 leading-relaxed">{step.desc}</p>
                <p className="text-xs text-silver/50 leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="magnetic-btn inline-flex items-center gap-2 px-6 py-3 bg-lime text-ink-base font-medium text-sm rounded-full hover:bg-lime-glow transition-all duration-300 hover:shadow-[0_0_24px_rgba(185,255,50,0.4)]"
          >
            Start Building Your Agent
          </button>
        </div>
      </div>
    </section>
  );
}
