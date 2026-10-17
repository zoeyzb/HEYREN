import { useFadeUp } from '@/hooks/useReveal';
import { PhoneIncoming, UserCheck, CalendarClock, MessageSquareQuote, Send, Activity } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: PhoneIncoming,
    title: 'Answer Incoming Calls',
    desc: 'Make customer calls easier to handle with an AI voice agent configured for business inquiries.',
    label: 'INCOMING',
    widget: 'call',
  },
  {
    icon: UserCheck,
    title: 'Qualify New Leads',
    desc: 'Collect relevant customer information and identify what each caller needs.',
    label: 'LEAD QUAL',
    widget: 'lead',
  },
  {
    icon: CalendarClock,
    title: 'Schedule Appointments',
    desc: 'Help callers find and request appointments through connected scheduling systems.',
    label: 'SCHEDULE',
    widget: 'appointment',
  },
  {
    icon: MessageSquareQuote,
    title: 'Handle Common Questions',
    desc: 'Provide responses using business-approved information.',
    label: 'FAQ',
    widget: 'message',
  },
  {
    icon: Send,
    title: 'Follow Up Intelligently',
    desc: 'Support appropriate follow-up workflows and handoffs through configured integrations.',
    label: 'FOLLOW-UP',
    widget: 'followup',
  },
];

function MiniWidget({ type }: { type: string }) {
  if (type === 'call') {
    return (
      <div className="bg-ink-deep/60 rounded-lg border border-ink-line p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-[10px] font-mono text-silver">Incoming call</span>
          </div>
          <span className="text-[10px] font-mono text-silver/50">+1 (555) 0142</span>
        </div>
        <div className="flex items-center justify-center gap-0.5 h-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="wave-bar" style={{ animationDelay: `${i * 0.08}s`, color: '#B9FF32', opacity: 0.6 }} />
          ))}
        </div>
      </div>
    );
  }
  if (type === 'lead') {
    return (
      <div className="bg-ink-deep/60 rounded-lg border border-ink-line p-3 space-y-1.5">
        {['Name captured', 'Service need identified', 'Callback number saved'].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${i < 2 ? 'bg-lime' : 'bg-silver/30'}`} />
            <span className={`text-[10px] font-mono ${i < 2 ? 'text-silver' : 'text-silver/40'}`}>{step}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'appointment') {
    return (
      <div className="bg-ink-deep/60 rounded-lg border border-ink-line p-3">
        <div className="text-[10px] font-mono text-silver/50 mb-2">WED — OCT 22</div>
        <div className="grid grid-cols-3 gap-1">
          {['9:00', '11:00', '2:00'].map((time, i) => (
            <div key={i} className={`text-center text-[10px] font-mono py-1 rounded ${i === 2 ? 'bg-lime/15 text-lime border border-lime/30' : 'text-silver/40 border border-ink-line'}`}>
              {time}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === 'message') {
    return (
      <div className="bg-ink-deep/60 rounded-lg border border-ink-line p-3 space-y-1.5">
        <div className="text-[10px] font-mono text-violet/60">Caller asks:</div>
        <div className="text-[10px] text-silver/70">"What are your business hours?"</div>
        <div className="text-[10px] font-mono text-lime/60 pt-1">Heyrin responds:</div>
        <div className="text-[10px] text-silver/70">"We're open Mon–Fri, 8 AM to 6 PM."</div>
      </div>
    );
  }
  return (
    <div className="bg-ink-deep/60 rounded-lg border border-ink-line p-3">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={10} className="text-lime" />
        <span className="text-[10px] font-mono text-silver">Follow-up sent</span>
      </div>
      <div className="text-[10px] text-silver/60">SMS confirmation delivered to caller</div>
    </div>
  );
}

export function Capabilities() {
  const { ref, visible } = useFadeUp<HTMLDivElement>();

  return (
    <section id="capabilities" className="heyrin-capabilities relative py-24 lg:py-32 bg-ink-base overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-violet/4 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className={`relative max-w-[1200px] mx-auto px-6 lg:px-10 fade-up ${visible ? 'visible' : ''}`}>
        <div className="mb-12 lg:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-lime/60" />
            <span className="text-xs font-mono tracking-[0.2em] text-lime/80 uppercase">Capabilities</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight">
            More than answering calls.
          </h2>
        </div>

        {/* Asymmetric grid */}
        <div className="heyrin-capability-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className={`heyrin-capability-card ${idx < 2 ? 'featured' : ''} group relative p-5 rounded-xl border border-ink-line bg-ink-panel/40 hover:bg-ink-panel/70 hover:border-lime/20 transition-all duration-500`}
              >
                {/* Label */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-mono tracking-[0.15em] text-silver/40 uppercase">{cap.label}</span>
                  <div className="w-7 h-7 rounded-lg bg-ink-deep border border-ink-line flex items-center justify-center group-hover:border-lime/30 transition-colors">
                    <Icon size={14} className="text-silver group-hover:text-lime transition-colors" />
                  </div>
                </div>

                <h3 className="text-base font-medium text-soft mb-2 tracking-tight">{cap.title}</h3>
                <p className="text-xs text-silver/70 leading-relaxed mb-4">{cap.desc}</p>

                <MiniWidget type={cap.widget} />
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
