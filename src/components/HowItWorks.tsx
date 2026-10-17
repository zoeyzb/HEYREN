import { useRef, useEffect, useState } from 'react';
import { PhoneIncoming, Brain, MessageSquare, Zap } from 'lucide-react';

const STAGES = [
  {
    icon: PhoneIncoming,
    label: '01',
    title: 'Incoming Call',
    desc: 'A customer calls your business number.',
    detail: 'The call is answered instantly — no hold music, no missed opportunities.',
    ui: 'call',
  },
  {
    icon: Brain,
    label: '02',
    title: 'Voice Intelligence',
    desc: 'Heyrin processes speech in real time.',
    detail: 'Natural language understanding identifies intent and extracts key information.',
    ui: 'process',
  },
  {
    icon: MessageSquare,
    label: '03',
    title: 'Customer Conversation',
    desc: 'A natural dialogue unfolds between caller and agent.',
    detail: 'Context-aware responses using your business information and conversation flows.',
    ui: 'conversation',
  },
  {
    icon: Zap,
    label: '04',
    title: 'Business Action',
    desc: 'The conversation triggers a connected workflow.',
    detail: 'Appointment booked, lead saved, or follow-up scheduled through your integrations.',
    ui: 'action',
  },
];

function StageUI({ type }: { type: string }) {
  if (type === 'call') {
    return (
      <div className="bg-ink-deep/60 rounded-lg border border-ink-line p-3 w-full max-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          <span className="text-[10px] font-mono text-silver">Ring...</span>
        </div>
        <div className="text-[10px] font-mono text-silver/50">+1 (555) 0142</div>
      </div>
    );
  }
  if (type === 'process') {
    return (
      <div className="bg-ink-deep/60 rounded-lg border border-ink-line p-3 w-full max-w-[200px] space-y-1.5">
        {['Intent: book_appointment', 'Confidence: 94%', 'Action: check_calendar'].map((line, i) => (
          <div key={i} className="text-[10px] font-mono text-silver/70 flex items-center gap-1.5">
            <span className="text-lime">{'>'}</span> {line}
          </div>
        ))}
      </div>
    );
  }
  if (type === 'conversation') {
    return (
      <div className="bg-ink-deep/60 rounded-lg border border-ink-line p-3 w-full max-w-[200px] space-y-2">
        <div className="text-[10px] text-silver/70 bg-ink-graphite/60 rounded px-2 py-1.5">"I need to book a repair."</div>
        <div className="text-[10px] text-soft bg-lime/8 border border-lime/15 rounded px-2 py-1.5">"What day works for you?"</div>
      </div>
    );
  }
  return (
    <div className="bg-ink-deep/60 rounded-lg border border-lime/20 p-3 w-full max-w-[200px]">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-lime/15 flex items-center justify-center">
          <Zap size={10} className="text-lime" />
        </div>
        <span className="text-[10px] font-mono text-lime">Appointment booked</span>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const lineRef = useRef<HTMLDivElement>(null);
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const start = rect.top - window.innerHeight * 0.6;
      const end = rect.bottom - window.innerHeight * 0.4;
      const total = end - start;
      const progress = Math.max(0, Math.min(1, (window.scrollY - (rect.top + window.scrollY - window.innerHeight * 0.6)) / total));

      const scrolled = window.scrollY - (rect.top + window.scrollY - start);
      const p = Math.max(0, Math.min(1, scrolled / total));
      setLineProgress(p);

      const stage = Math.min(3, Math.floor(p * 4));
      setActiveStage(stage);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-24 lg:py-32 bg-ink-deep overflow-hidden">
      <div className="absolute inset-0 tech-grid-fine opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-lime/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="mb-12 lg:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-lime/60" />
            <span className="text-xs font-mono tracking-[0.2em] text-lime/80 uppercase">How It Works</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight">
            One call. Endless possibilities.
          </h2>
        </div>

        {/* Desktop: horizontal circuit */}
        <div className="hidden lg:block relative">
          {/* Circuit line */}
          <div className="absolute left-0 right-0 top-[80px] h-px bg-ink-line">
            <div
              ref={lineRef}
              className="h-full bg-gradient-to-r from-lime via-lime to-violet transition-all duration-300"
              style={{ width: `${lineProgress * 100}%`, boxShadow: '0 0 12px rgba(185,255,50,0.5)' }}
            />
          </div>

          {/* Signal dot */}
          <div
            className="absolute top-[77px] w-2 h-2 rounded-full bg-lime transition-all duration-300"
            style={{
              left: `calc(${lineProgress * 100}% - 4px)`,
              boxShadow: '0 0 16px rgba(185,255,50,0.8)',
            }}
          />

          {/* Stages */}
          <div className="grid grid-cols-4 gap-6">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx <= activeStage;
              return (
                <div key={idx} className="relative pt-[60px]">
                  {/* Node */}
                  <div className={`absolute left-0 top-[60px] w-5 h-5 rounded-full border-2 transition-all duration-500 ${
                    isActive ? 'border-lime bg-lime/20' : 'border-ink-line bg-ink-base'
                  }`}>
                    {isActive && <div className="absolute inset-0 rounded-full bg-lime/30 animate-ping" />}
                  </div>

                  <div className={`transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={16} className={isActive ? 'text-lime' : 'text-silver/50'} />
                      <span className="text-[10px] font-mono tracking-wider text-silver/50 uppercase">{stage.label}</span>
                    </div>
                    <h3 className="text-lg font-medium text-soft mb-2 tracking-tight">{stage.title}</h3>
                    <p className="text-xs text-silver/70 mb-3 leading-relaxed">{stage.desc}</p>
                    <p className="text-xs text-silver/50 mb-4 leading-relaxed">{stage.detail}</p>
                    <StageUI type={stage.ui} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical flow */}
        <div className="lg:hidden space-y-8 relative">
          <div className="absolute left-[10px] top-2 bottom-2 w-px bg-ink-line" />
          <div
            className="absolute left-[10px] top-2 w-px bg-gradient-to-b from-lime to-violet transition-all duration-300"
            style={{ height: `${lineProgress * 100}%` }}
          />
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx <= activeStage;
            return (
              <div key={idx} className="relative pl-8">
                <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 transition-all ${
                  isActive ? 'border-lime bg-lime/20' : 'border-ink-line bg-ink-base'
                }`} />
                <div className={isActive ? 'opacity-100' : 'opacity-50'}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className={isActive ? 'text-lime' : 'text-silver/50'} />
                    <span className="text-[10px] font-mono tracking-wider text-silver/50 uppercase">{stage.label}</span>
                  </div>
                  <h3 className="text-base font-medium text-soft mb-1.5">{stage.title}</h3>
                  <p className="text-xs text-silver/70 mb-2">{stage.desc}</p>
                  <p className="text-xs text-silver/50 mb-3">{stage.detail}</p>
                  <StageUI type={stage.ui} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
