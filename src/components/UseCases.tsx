import { useState } from 'react';
import { Home, Scale, Building2, CalendarCheck, Briefcase } from 'lucide-react';
import { useFadeUp } from '@/hooks/useReveal';

const USE_CASES = [
  {
    icon: Home,
    industry: 'Home Services',
    example: '"I need an emergency plumber for a burst pipe." — Heyrin can gather the urgency, location, and callback details for an available technician.',
  },
  {
    icon: Scale,
    industry: 'Law Firms',
    example: '"I need to speak with someone about a custody case." — Heyrin captures the case type and routes to the appropriate practice area.',
  },
  {
    icon: Building2,
    industry: 'Real Estate',
    example: '"Is the property on Elm Street still available?" — Heyrin can provide approved listing details and help arrange a viewing.',
  },
  {
    icon: CalendarCheck,
    industry: 'Appointment-Based Businesses',
    example: '"I need to reschedule my appointment." — Heyrin can check connected calendar availability and arrange a new slot.',
  },
  {
    icon: Briefcase,
    industry: 'Professional Services',
    example: '"What does your onboarding process look like?" — Heyrin walks the caller through services and captures their interest.',
  },
];

export function UseCases() {
  const [selected, setSelected] = useState(0);
  const { ref, visible } = useFadeUp<HTMLDivElement>();
  const active = USE_CASES[selected];
  const ActiveIcon = active.icon;

  return (
    <section id="industries" className="heyrin-industries relative py-24 lg:py-32 bg-ink-deep overflow-hidden">
      <div className="absolute inset-0 tech-grid-fine opacity-15" />

      <div ref={ref} className={`relative max-w-[1100px] mx-auto px-6 lg:px-10 fade-up ${visible ? 'visible' : ''}`}>
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px bg-lime/60" />
            <span className="text-xs font-mono tracking-[0.2em] text-lime/80 uppercase">Industry Use Cases</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight">
            Built for real conversations.
          </h2>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-10">
          {/* Selector */}
          <div className="space-y-1.5">
            {USE_CASES.map((uc, idx) => {
              const Icon = uc.icon;
              const isActive = idx === selected;
              return (
                <button
                  key={uc.industry}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelected(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                    isActive
                      ? 'bg-lime/8 border border-lime/25'
                      : 'border border-transparent hover:bg-ink-panel/50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-lime' : 'text-silver/50'} />
                  <span className={`text-sm ${isActive ? 'text-lime' : 'text-silver'}`}>{uc.industry}</span>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="relative p-6 lg:p-8 rounded-2xl border border-ink-line bg-ink-panel/40 min-h-[240px]">
            <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-lime/40 to-transparent" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
                <ActiveIcon size={18} className="text-lime" />
              </div>
              <div>
                <div className="text-sm font-medium text-soft">{active.industry}</div>
                <div className="text-[10px] font-mono tracking-wider text-silver/40 uppercase">Example Conversation</div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Caller bubble */}
              <div className="flex gap-3">
                <div className="text-[10px] font-mono text-violet/60 uppercase tracking-wider pt-1 w-12 flex-shrink-0">Caller</div>
                <div className="text-sm text-silver bg-ink-deep/60 rounded-lg px-4 py-3 border border-ink-line leading-relaxed">
                  {active.example.split('—')[0].trim()}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-2 pl-12">
                <div className="w-8 h-px bg-lime/30" />
                <div className="text-[10px] font-mono text-lime/60 uppercase tracking-wider">Heyrin handles</div>
              </div>

              {/* Agent response */}
              <div className="flex gap-3">
                <div className="text-[10px] font-mono text-lime/60 uppercase tracking-wider pt-1 w-12 flex-shrink-0">Heyrin</div>
                <div className="text-sm text-soft bg-lime/8 rounded-lg px-4 py-3 border border-lime/15 leading-relaxed">
                  {active.example.split('—')[1]?.trim()}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-line text-[10px] font-mono text-silver/40 uppercase tracking-wider">
              Actual behavior depends on configuration and integrations
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
