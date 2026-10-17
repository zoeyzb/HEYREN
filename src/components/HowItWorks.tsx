import { useEffect, useRef } from 'react';
import { PhoneIncoming, BrainCircuit, MessagesSquare, CalendarCheck2, ArrowUpRight } from 'lucide-react';

const STAGES = [
  { id: '01', icon: PhoneIncoming, title: 'A call comes in', description: 'Every opportunity starts with a question.', detail: 'A customer reaches your business.', type: 'incoming' },
  { id: '02', icon: BrainCircuit, title: 'Intent becomes clear', description: 'The agent recognizes what matters.', detail: 'Need: plumbing repair', type: 'intent' },
  { id: '03', icon: MessagesSquare, title: 'A helpful conversation', description: 'Natural questions reveal the next step.', detail: '“What time works best?”', type: 'response' },
  { id: '04', icon: CalendarCheck2, title: 'A business action', description: 'A configured workflow takes it from there.', detail: 'Appointment request', type: 'action' },
];

function StepIllustration({ type, active }: { type: string; active: boolean }) {
  return <div className={`heyrin-step-signal heyrin-step-signal--${type} ${active ? 'lit' : ''}`} aria-hidden="true">
    {type === 'incoming' && <><div className="heyrin-step-ring"><PhoneIncoming size={19} /></div><span className="heyrin-step-signal-text">INCOMING / VOICE</span><div className="heyrin-mini-vu">{Array.from({length:13},(_,i)=><i key={i} style={{'--i':i} as React.CSSProperties}/>)}</div></>}
    {type === 'intent' && <><div className="heyrin-intent-orbit"><BrainCircuit size={27}/><span/><span/></div><div className="heyrin-intent-tags"><small>identify</small><strong>APPOINTMENT</strong></div></>}
    {type === 'response' && <><div className="heyrin-dialogue-tiny"><i/>I need a repair.</div><div className="heyrin-dialogue-tiny reply"><i/>What day works?</div></>}
    {type === 'action' && <><div className="heyrin-step-calendar"><CalendarCheck2 size={23}/><span>READY TO BOOK</span></div><span className="heyrin-step-success">● NEXT STEP IDENTIFIED</span></>}
  </div>;
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastProgress = -1;
    const measure = () => {
      const rect = section.getBoundingClientRect();
      const start = window.innerHeight * .8;
      const end = window.innerHeight * .18 - rect.height * .28;
      const progress = prefersReduced ? 1 : Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      const percent = Math.round(progress * 100);
      if (percent === lastProgress) return;
      lastProgress = percent;
      // Update the few scroll-linked DOM nodes directly. Heavy Spline/WebGL
      // work elsewhere on the page can postpone React rerenders; the timeline
      // must not wait for them to advance.
      section.dataset.progress = String(percent);
      const track = section.querySelector<HTMLElement>('.heyrin-journey-steps');
      track?.style.setProperty('--progress', `${percent}%`);
      section.querySelectorAll<HTMLElement>('.heyrin-journey-step').forEach((node, i) => {
        node.classList.toggle('lit', progress >= (i / 4));
      });
    };
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    const intersectionObserver = new IntersectionObserver(measure, { threshold: [0, .1, .25, .5, .75, 1] });
    intersectionObserver.observe(section);
    measure();
    return () => {
      intersectionObserver.disconnect();
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="heyrin-journey relative bg-ink-deep overflow-hidden" aria-labelledby="journey-heading" data-progress={0}>
      <div className="absolute inset-0 tech-grid-fine opacity-15 pointer-events-none" />
      <div className="heyrin-journey-glow" aria-hidden="true" />
      <div className="heyrin-journey-content relative max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="heyrin-section-kicker"><span className="heyrin-kicker-rule"/>THE PROCESS <span className="heyrin-index">02 / HOW HEYRIN WORKS</span></div>
        <div className="heyrin-journey-title">
          <h2 id="journey-heading" className="font-display text-soft">One call.<br/><span>Endless possibilities.</span></h2>
          <p>Watch an ordinary customer call move from a question to a business opportunity.</p>
        </div>
        <div className="heyrin-journey-steps" style={{'--progress': '0%'} as React.CSSProperties}>
          <div className="heyrin-journey-track" aria-hidden="true"><div className="heyrin-journey-track-fill"/><span className="heyrin-journey-spark"/></div>
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const active = i === 0;
            return <article key={stage.id} className={`heyrin-journey-step ${active ? 'lit' : ''}`} data-stage={i+1}>
              <div className="heyrin-journey-node"><Icon size={17} /><span>{stage.id}</span></div>
              <div className="heyrin-journey-card">
                <StepIllustration type={stage.type} active={active}/>
                <div className="heyrin-journey-card-bottom">
                  <div><span className="heyrin-journey-step-id">STAGE {stage.id} / 04</span><h3>{stage.title}</h3></div>
                  <ArrowUpRight size={15} aria-hidden="true"/>
                </div>
                <p>{stage.description}</p>
              </div>
            </article>;
          })}
        </div>
        <div className="heyrin-journey-footer"><span>FROM FIRST RING TO NEXT STEP</span><span>SCROLL TO FOLLOW THE SIGNAL <span aria-hidden="true">↘</span></span></div>
      </div>
    </section>
  );
}
