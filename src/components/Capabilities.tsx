import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarClock, Check, CircleCheck, Clock3, Link2, PhoneIncoming, Sparkles, UserCheck, Workflow } from 'lucide-react';
import { useFadeUp } from '@/hooks/useReveal';

type CapabilityId = 'answering' | 'qualifying' | 'scheduling';

const CAPABILITIES: Array<{
  id: CapabilityId;
  number: string;
  label: string;
  title: string;
  description: string;
  icon: typeof PhoneIncoming;
  accent: 'lime' | 'violet';
}> = [
  { id: 'answering', number: '01', label: 'INCOMING / VOICE', title: 'Answer every call with context.', description: 'Heyrin greets the caller, understands the reason for calling, and routes the moment without making the customer repeat themselves.', icon: PhoneIncoming, accent: 'lime' },
  { id: 'qualifying', number: '02', label: 'INTENT / LEAD QUAL', title: 'Turn conversations into signal.', description: 'Capture the details that matter—service need, urgency, location, and callback context—before the opportunity goes cold.', icon: UserCheck, accent: 'violet' },
  { id: 'scheduling', number: '03', label: 'NEXT STEP / SCHEDULE', title: 'Make the next step obvious.', description: 'Surface the right availability and prepare a handoff or appointment flow that fits how your team already works.', icon: CalendarClock, accent: 'lime' },
];

function AnsweringVisual() {
  return <div className="capability-visual capability-visual-answering">
    <div className="capability-visual-top"><span><i className="capability-live-dot" /> LIVE ROUTING SIGNAL</span><span>00:12</span></div>
    <div className="capability-call-orb"><PhoneIncoming size={20} /><span>INCOMING CALL</span><strong>+1 (555) 0142</strong><div className="capability-waveform">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</div></div>
    <div className="capability-route" aria-label="Call workflow">
      <div className="capability-route-line" /><div className="capability-route-node is-active"><span>01</span><strong>Answer</strong><small>Greeting + intent</small></div><div className="capability-route-node"><span>02</span><strong>Understand</strong><small>Reason for call</small></div><div className="capability-route-node"><span>03</span><strong>Route</strong><small>Right next step</small></div>
    </div>
  </div>;
}

function QualifyingVisual() {
  const fields = [
    { label: 'SERVICE NEED', value: 'Emergency repair', state: 'captured' },
    { label: 'URGENCY', value: 'Today', state: 'captured' },
    { label: 'CALLBACK', value: '+1 (555) 0142', state: 'captured' },
    { label: 'LOCATION', value: 'Oak Street', state: 'pending' },
  ];
  return <div className="capability-visual capability-visual-qualifying">
    <div className="capability-visual-top"><span><i className="capability-live-dot violet" /> CONTEXT MAP</span><span>4 SIGNALS</span></div>
    <div className="lead-score"><div className="lead-score-ring"><strong>82</strong><span>signal</span></div><div><span className="lead-score-label">CONVERSATION QUALITY</span><strong>Ready for follow-up</strong><small>Enough context to move forward.</small></div></div>
    <div className="lead-fields">{fields.map((field) => <div className={`lead-field ${field.state}`} key={field.label}><span>{field.label}</span><strong>{field.value}</strong><Check size={13} /></div>)}</div>
    <div className="lead-footer"><Sparkles size={13} /> Prioritized from the conversation</div>
  </div>;
}

function SchedulingVisual() {
  return <div className="capability-visual capability-visual-scheduling">
    <div className="capability-visual-top"><span><i className="capability-live-dot" /> AVAILABILITY WINDOW</span><span>WED — OCT 22</span></div>
    <div className="schedule-layout"><div className="schedule-calendar"><div className="schedule-calendar-day"><span>WED</span><strong>22</strong></div><div className="schedule-calendar-month">OCTOBER<br/><small>2026</small></div></div><div className="schedule-slots"><div className="schedule-slot muted"><Clock3 size={13} /> 09:00 <span>occupied</span></div><div className="schedule-slot selected"><Clock3 size={13} /> 14:00 <span>best fit</span><Check size={13} /></div><div className="schedule-slot"><Clock3 size={13} /> 16:30 <span>available</span></div></div></div>
    <div className="schedule-handoff"><div className="handoff-node"><Workflow size={14} /><span>Conversation</span></div><div className="handoff-connector" /><div className="handoff-node is-active"><CalendarClock size={14} /><span>Next step ready</span></div><ArrowUpRight size={15} /></div>
  </div>;
}

function WorkflowVisual({ id }: { id: CapabilityId }) {
  if (id === 'answering') return <AnsweringVisual />;
  if (id === 'qualifying') return <QualifyingVisual />;
  return <SchedulingVisual />;
}

export function Capabilities() {
  const { ref, visible } = useFadeUp<HTMLDivElement>();
  const [activeId, setActiveId] = useState<CapabilityId>('answering');
  const active = useMemo(() => CAPABILITIES.find((item) => item.id === activeId) ?? CAPABILITIES[0], [activeId]);
  const Icon = active.icon;
  return (
    <section id="capabilities" className="heyrin-capabilities relative overflow-hidden bg-ink-base" aria-labelledby="capabilities-heading">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="capability-ambient capability-ambient-lime" aria-hidden="true" /><div className="capability-ambient capability-ambient-violet" aria-hidden="true" />
      <div ref={ref} className={`relative max-w-[1200px] mx-auto px-6 lg:px-10 fade-up ${visible ? 'visible' : ''}`}>
        <div className="capabilities-heading-row"><div><div className="flex items-center gap-3 mb-4"><div className="w-6 h-px bg-lime/60" /><span className="text-xs font-mono tracking-[0.2em] text-lime/80 uppercase">Capabilities</span></div><h2 id="capabilities-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight">More than answering calls.</h2><p className="capabilities-intro">One voice system, three ways to turn a conversation into momentum.</p></div><div className="capabilities-heading-meta"><span className="capability-live-dot" /> SYSTEMS / 03 <span className="capabilities-heading-meta-line" /></div></div>
        <div className="capability-experience-shell">
          <div className="capability-selector" role="tablist" aria-label="Explore Heyrin capabilities">
            <div className="capability-selector-label">EXPLORE THE SYSTEM</div>
            {CAPABILITIES.map((item) => { const ItemIcon = item.icon; const selected = item.id === activeId; return <button type="button" role="tab" aria-selected={selected} key={item.id} onClick={() => setActiveId(item.id)} className={`capability-selector-item ${selected ? 'is-active' : ''} accent-${item.accent}`}><span className="capability-selector-number">{item.number}</span><span className="capability-selector-copy"><small>{item.label}</small><strong>{item.title}</strong></span><ItemIcon size={17} /></button>; })}
            <div className="capability-selector-footer"><Link2 size={13} /><span>Works with your existing workflows.</span></div>
          </div>
          <div className={`capability-stage accent-${active.accent}`} key={active.id}>
            <div className="capability-stage-top"><div className="capability-stage-title"><div className="capability-stage-icon"><Icon size={17} /></div><div><span>{active.label}</span><h3>{active.title}</h3></div></div><div className="capability-stage-index">{active.number} <span>/ 03</span></div></div>
            <WorkflowVisual id={active.id} />
            <div className="capability-stage-bottom"><p>{active.description}</p><span className="capability-stage-note"><CircleCheck size={14} /> Designed for the handoff</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
