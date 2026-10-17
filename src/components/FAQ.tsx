import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useFadeUp } from '@/hooks/useReveal';

const FAQS = [
  {
    q: 'What exactly is an AI voice agent?',
    a: 'An AI voice agent is a software system that answers phone calls and conducts natural spoken conversations with callers. Heyrin is configured with your business information and conversation flows to handle inquiries, qualify leads, and schedule appointments — much like a receptionist would.',
  },
  {
    q: 'Can Heyrin answer calls outside business hours?',
    a: 'Yes. Heyrin can be configured to answer calls 24/7, ensuring no call goes to voicemail — even after hours, on weekends, or during peak times when your team is unavailable.',
  },
  {
    q: 'Can it book appointments?',
    a: 'Yes, when connected to a compatible scheduling system. Heyrin can check availability, offer time slots, and confirm bookings through integrated calendar tools. Scheduling integrations depend on your specific setup.',
  },
  {
    q: 'Can it use my business information?',
    a: 'Absolutely. Heyrin is configured with your business details — services, hours, pricing, policies, and frequently asked questions — so responses are accurate and consistent with how you want to represent your business.',
  },
  {
    q: 'Can it transfer calls to a person?',
    a: 'Yes, in configurations that support call transfers. Heyrin can identify when a caller needs human assistance and route the call to the appropriate team member. Transfer capability depends on your phone system integration.',
  },
  {
    q: 'Does Heyrin work with my existing phone system?',
    a: 'Phone system compatibility depends on your provider and setup. We assess your current telephony during onboarding and determine the best integration approach. Most modern VoIP systems can be connected.',
  },
  {
    q: 'How is my AI agent customized?',
    a: 'We build your agent around your business. You share your call patterns, services, and common customer questions. We configure the voice, conversation flows, business knowledge, and integrations — then refine with you through testing.',
  },
  {
    q: 'How do I get started?',
    a: 'Reach out through the contact form or email us directly. We learn about your business, configure your agent, and test it together before launching. The process is collaborative from start to finish.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, visible } = useFadeUp<HTMLDivElement>();

  return (
    <section className="heyrin-faq relative py-24 lg:py-32 bg-ink-base overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-15" />

      <div ref={ref} className={`relative max-w-[800px] mx-auto px-6 lg:px-10 fade-up ${visible ? 'visible' : ''}`}>
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-6 h-px bg-violet/60" />
            <span className="text-xs font-mono tracking-[0.2em] text-violet/80 uppercase">FAQ</span>
            <div className="w-6 h-px bg-violet/60" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-soft tracking-tight">
            Questions, answered.
          </h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-300 ${
                  isOpen ? 'border-lime/20 bg-ink-panel/40' : 'border-ink-line bg-ink-panel/20'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`heyrin-faq-answer-${idx}`}
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-lime' : 'text-soft'}`}>
                    {faq.q}
                  </span>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isOpen ? 'bg-lime/15 rotate-180' : 'bg-ink-deep border border-ink-line'
                  }`}>
                    {isOpen ? <Minus size={12} className="text-lime" /> : <Plus size={12} className="text-silver" />}
                  </div>
                </button>
                <div
                  id={`heyrin-faq-answer-${idx}`}
                  className="heyrin-faq-answer"
                  hidden={!isOpen}
                >
                  <p className="px-5 pb-4 text-sm text-silver/70 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
