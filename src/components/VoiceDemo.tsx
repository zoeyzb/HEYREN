import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarCheck2, CheckCircle2, Clock3, Mic2, Pause, Play, RotateCcw, Sparkles, Volume2 } from 'lucide-react';

interface DialogueLine {
  speaker: 'agent' | 'caller';
  text: string;
  delay: number;
}

interface Scenario {
  id: string;
  number: string;
  title: string;
  description: string;
  context: string;
  dialogue: DialogueLine[];
  outcome: string;
  outcomeLabel: string;
  outcomeDetail: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'appointment', number: '01', title: 'Book an Appointment', description: 'Move from intent to a clear next step.', context: 'SERVICE REQUEST / PLUMBING',
    dialogue: [
      { speaker: 'agent', text: 'Hi, thanks for calling. This is Heyrin. How can I help you today?', delay: 0 },
      { speaker: 'caller', text: 'Hi, I need to book an appointment for a plumbing repair.', delay: 1800 },
      { speaker: 'agent', text: 'Of course. Could you share what kind of repair you need and your preferred day?', delay: 3200 },
      { speaker: 'caller', text: 'A kitchen sink leak. Sometime this week if possible.', delay: 4800 },
      { speaker: 'agent', text: 'I have Wednesday at 2 PM or Thursday at 10 AM available. Which works better?', delay: 6200 },
      { speaker: 'caller', text: 'Wednesday at 2 works perfectly.', delay: 7800 },
      { speaker: 'agent', text: 'I’ve held Wednesday at 2 PM in this example. You’ll get a confirmation prompt to review.', delay: 9200 },
    ],
    outcome: 'Wednesday at 2:00 PM', outcomeLabel: 'Illustrative scheduling outcome', outcomeDetail: 'No external booking was created.',
  },
  {
    id: 'inquiry', number: '02', title: 'Answer a Customer Inquiry', description: 'Resolve questions with approved business context.', context: 'BUSINESS QUESTION / HOURS + SERVICE',
    dialogue: [
      { speaker: 'agent', text: 'Hi, this is Heyrin. How can I assist you today?', delay: 0 },
      { speaker: 'caller', text: 'What are your business hours and do you handle commercial properties?', delay: 1600 },
      { speaker: 'agent', text: 'We’re open Monday through Friday, 8 AM to 6 PM, and Saturday 9 to 2. Yes, we service commercial properties.', delay: 3000 },
      { speaker: 'caller', text: 'Great. Do you offer free estimates for commercial work?', delay: 5000 },
      { speaker: 'agent', text: 'Yes, we provide free on-site estimates for commercial projects. Would you like me to arrange one?', delay: 6400 },
      { speaker: 'caller', text: 'Yes, please. My business is on Oak Street.', delay: 8200 },
      { speaker: 'agent', text: 'Noted. I’ll have the team reach out to coordinate an estimate. Is there a good callback number?', delay: 9600 },
    ],
    outcome: 'Estimate request captured', outcomeLabel: 'Illustrative inquiry outcome', outcomeDetail: 'The next step is ready for a human team.',
  },
  {
    id: 'lead', number: '03', title: 'Capture a New Lead', description: 'Turn a first conversation into useful context.', context: 'NEW LEAD / DENTAL PRACTICE',
    dialogue: [
      { speaker: 'agent', text: 'Hi, thanks for calling. This is Heyrin. What brings you to us today?', delay: 0 },
      { speaker: 'caller', text: 'I’m exploring options for an AI receptionist for my dental practice.', delay: 1600 },
      { speaker: 'agent', text: 'That’s exactly what we do. Could you tell me a bit about your current call volume?', delay: 3000 },
      { speaker: 'caller', text: 'Probably 30 to 40 calls a day, mostly for appointments.', delay: 4600 },
      { speaker: 'agent', text: 'Got it. Are you currently using scheduling software we should connect with?', delay: 5800 },
      { speaker: 'caller', text: 'Yes, we use a popular dental management platform.', delay: 7400 },
      { speaker: 'agent', text: 'Perfect. I’ll record the context so the team can prepare a tailored conversation flow.', delay: 8800 },
    ],
    outcome: 'Lead context captured', outcomeLabel: 'Illustrative lead outcome', outcomeDetail: 'A tailored follow-up can be prepared next.',
  },
];

const CONNECTING_MS = 700;
const COMPLETE_DELAY_MS = 1700;
const TICK_MS = 100;

export function VoiceDemo() {
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [everPlayed, setEverPlayed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const autoStartedRef = useRef(false);
  const elapsedRef = useRef(0);
  const isReducedMotionRef = useRef(false);
  const lastLine = scenario.dialogue[scenario.dialogue.length - 1];
  const finishMs = CONNECTING_MS + lastLine.delay + COMPLETE_DELAY_MS;
  const isComplete = elapsedMs >= finishMs;
  const connecting = playing && elapsedMs < CONNECTING_MS;
  const lines = scenario.dialogue.filter((line) => CONNECTING_MS + line.delay <= elapsedMs);
  const visibleLines = !everPlayed && !playing ? scenario.dialogue.slice(0, 1) : lines;
  const currentSpeaker = !isComplete && elapsedMs >= CONNECTING_MS && lines.length ? lines[lines.length - 1].speaker : null;
  const nextLine = scenario.dialogue.find((line) => CONNECTING_MS + line.delay > elapsedMs);
  const progress = Math.min(100, (elapsedMs / finishMs) * 100);
  const status = isComplete ? 'Conversation complete' : connecting ? 'Connecting' : playing ? 'Conversation in progress' : everPlayed ? 'Paused' : 'Ready to explore';

  const resetTo = useCallback((next: Scenario, shouldPlay: boolean) => {
    setScenario(next);
    elapsedRef.current = 0;
    setElapsedMs(0);
    setPlaying(shouldPlay);
    setEverPlayed(shouldPlay);
  }, []);

  useEffect(() => {
    isReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotionRef.current) return;
    const element = sectionRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || autoStartedRef.current) return;
      autoStartedRef.current = true;
      if (!everPlayed) resetTo(SCENARIOS[0], true);
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [everPlayed, resetTo]);

  useEffect(() => {
    if (!playing || isComplete) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(500, now - previous);
      previous = now;
      const next = Math.min(finishMs, elapsedRef.current + dt);
      elapsedRef.current = next;
      setElapsedMs(next);
      if (next >= finishMs) setPlaying(false);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [finishMs, isComplete, playing]);

  useEffect(() => {
    const container = dialogueRef.current;
    if (!container || (!playing && !isComplete)) return;
    container.scrollTop = container.scrollHeight;
  }, [visibleLines.length, playing, isComplete]);

  const switchScenario = (next: Scenario) => { autoStartedRef.current = true; resetTo(next, true); };
  const togglePlayback = () => {
    autoStartedRef.current = true;
    if (isComplete) { resetTo(scenario, true); return; }
    setEverPlayed(true);
    setPlaying((value) => !value);
  };
  const replay = () => { autoStartedRef.current = true; resetTo(scenario, true); };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <section id="experience" ref={sectionRef} className="heyrin-experience relative overflow-hidden bg-ink-deep" aria-labelledby="experience-heading">
      <div className="absolute inset-0 tech-grid-fine opacity-20 pointer-events-none" />
      <div className="heyrin-experience-glow" aria-hidden="true" />
      <div className="heyrin-experience-content relative mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="heyrin-section-kicker"><span className="heyrin-kicker-rule" />VOICE CONVERSATIONS <span className="heyrin-index">01 / THE EXPERIENCE</span></div>
        <div className="heyrin-experience-heading">
          <div>
            <h2 id="experience-heading" className="font-display text-soft">A conversation<br/><span>worth answering.</span></h2>
            <p>Follow an illustrative call from first hello to a useful next step—without pretending the scripted outcome is a live booking.</p>
          </div>
          <div className="heyrin-heading-footnote"><span className="heyrin-live-dot" /> A glimpse into the voice experience <ArrowRight size={15} /></div>
        </div>
        <div className="heyrin-experience-grid">
          <div className="heyrin-scenarios" aria-label="Conversation examples">
            <div className="heyrin-scenarios-label">CHOOSE A CONVERSATION <span>01 — 03</span></div>
            {SCENARIOS.map((item) => (
              <button type="button" key={item.id} aria-pressed={scenario.id === item.id} onClick={() => switchScenario(item)} className={`heyrin-scenario ${scenario.id === item.id ? 'selected' : ''}`}>
                <span className="heyrin-scenario-number">{item.number}</span>
                <span className="heyrin-scenario-body"><strong>{item.title}</strong><span>{item.description}</span></span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))}
            <div className="heyrin-scenarios-note"><span className="heyrin-live-dot" /> Designed around real business conversations.</div>
          </div>
          <div className="heyrin-callpanel">
            <div className="heyrin-callpanel-top">
              <div className="heyrin-callpanel-status"><span className={`heyrin-status-light ${playing ? 'active' : ''}`} /><span aria-live="polite">{status}</span></div>
              <div className="heyrin-callpanel-clock"><Clock3 size={13} /> {formatTime(Math.floor(Math.max(0, elapsedMs - CONNECTING_MS) / 1000))}</div>
            </div>
            <div className="heyrin-callpanel-meter" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
            <div className="heyrin-callpanel-stage">
              <div className="heyrin-voice-presence">
                <div><span className="heyrin-signal-core" /><span>HEY RIN / VOICE SYSTEM</span><span className="heyrin-call-context">{scenario.context}</span></div>
                <div className={`heyrin-mini-wave ${currentSpeaker ? `is-${currentSpeaker}` : ''}`} aria-label={currentSpeaker ? `${currentSpeaker} waveform active` : 'Waveform idle'}>
                  {Array.from({ length: 29 }, (_, i) => <span key={i} style={{ '--i': i, '--height': `${5 + Math.abs(Math.sin(i * 1.91) * 18)}px` } as React.CSSProperties} className={`${playing ? 'active' : ''} ${currentSpeaker === 'caller' ? 'caller' : ''}`} />)}
                </div>
              </div>
              <div className="heyrin-call-next"><Sparkles size={13} /><span>{isComplete ? 'Outcome ready to review' : nextLine ? `Next: ${nextLine.speaker === 'agent' ? 'Heyrin' : 'caller'} response` : 'Conversation signal active'}</span></div>
              <div ref={dialogueRef} className="heyrin-dialogue" aria-label="Illustrative conversation transcript" aria-live="off">
                {visibleLines.map((line, i) => (
                  <div key={`${scenario.id}-${i}`} className={`heyrin-message ${line.speaker}`}>
                    <span className="heyrin-message-speaker">{line.speaker === 'agent' ? <Volume2 size={12} /> : <Mic2 size={12} />}{line.speaker === 'agent' ? 'HEYRIN' : 'CALLER'}</span>
                    <p>{line.text}</p>
                  </div>
                ))}
                {connecting && <div className="heyrin-typing"><span /><span /><span /> Establishing conversation…</div>}
              </div>
            </div>
            {isComplete && <div className="heyrin-complete" role="status"><CalendarCheck2 size={20} /><div><strong>{scenario.outcome}</strong><span>{scenario.outcomeLabel}</span><small>{scenario.outcomeDetail}</small></div><CheckCircle2 size={16} /></div>}
            <div className="heyrin-callpanel-controls">
              <div className="heyrin-callpanel-transport">
                <button type="button" onClick={togglePlayback} aria-label={isComplete ? 'Play again' : playing ? 'Pause conversation' : 'Play conversation'} className="heyrin-control-primary">
                  {playing && !isComplete ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  <span>{isComplete ? 'Play again' : playing ? 'Pause' : 'Play conversation'}</span>
                </button>
                <button type="button" onClick={replay} className="heyrin-control-secondary" aria-label="Replay conversation"><RotateCcw size={15} /> Replay</button>
              </div>
              <span className="heyrin-callpanel-disclaimer">ILLUSTRATIVE CONVERSATION · NOT A LIVE CALL · NO BOOKING CREATED</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
