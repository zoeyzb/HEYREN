import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, CalendarCheck2, Check, Headphones, Pause, Play, RotateCcw, CircleDot } from 'lucide-react';
import { LiveVoiceAgent } from './LiveVoiceAgent';

type Dialogue = { speaker: 'Heyrin' | 'Caller'; text: string; at: number };
type Scenario = { id: string; title: string; kicker: string; subtitle: string; result: string; steps: string[]; dialogue: Dialogue[] };
const SCENARIOS: Scenario[] = [
  { id: 'appointment', title: 'Appointment booking', kicker: '01 / SERVICE CALL', subtitle: 'A repair inquiry becomes a scheduled visit.', result: 'Appointment requested', steps: ['Intent identified', 'Preferred time collected', 'Booking request prepared'],
    dialogue: [
      {speaker:'Heyrin', text:'Thanks for calling. How can I help today?', at:0},
      {speaker:'Caller', text:'My kitchen sink is leaking. Can someone come by this week?', at:1800},
      {speaker:'Heyrin', text:'I can help with that. Would Wednesday afternoon work?', at:3800},
      {speaker:'Caller', text:'Wednesday at two would be perfect.', at:6100},
      {speaker:'Heyrin', text:'I have your preference. I’ll submit the appointment request for confirmation.', at:8200},
    ]},
  { id: 'qualify', title: 'Lead qualification', kicker: '02 / NEW OPPORTUNITY', subtitle: 'The right details, before a human handoff.', result: 'Lead details prepared', steps: ['Service identified', 'Project scope captured', 'Team handoff prepared'],
    dialogue: [
      {speaker:'Heyrin', text:'Welcome. What are you looking for help with?', at:0},
      {speaker:'Caller', text:'We need a new HVAC system for our office.', at:2000},
      {speaker:'Heyrin', text:'Is this a replacement or a new installation?', at:4300},
      {speaker:'Caller', text:'A full replacement for a two-floor space.', at:6400},
      {speaker:'Heyrin', text:'Understood. Let’s get the best contact for your project.', at:8500},
    ]},
  { id: 'inquiry', title: 'Customer questions', kicker: '03 / INBOUND SUPPORT', subtitle: 'Clear information when someone needs it.', result: 'Question answered', steps: ['Question recognized', 'Knowledge consulted', 'Next step offered'],
    dialogue: [
      {speaker:'Heyrin', text:'Hello, thanks for calling. What can I help you find?', at:0},
      {speaker:'Caller', text:'Do you offer maintenance for commercial buildings?', at:2100},
      {speaker:'Heyrin', text:'In this example, yes. Are you looking for routine servicing?', at:4500},
      {speaker:'Caller', text:'Yes, for a small office building.', at:6900},
      {speaker:'Heyrin', text:'I can collect the details for a follow-up from the team.', at:9000},
    ]},
];
const END_EXTRA = 2100;
function Wave({ active, speaker = 'agent' }: { active: boolean; speaker?: 'agent' | 'caller' }) {
  return <div className={`rin-wave ${active ? 'is-active' : ''} ${speaker === 'caller' ? 'is-caller' : ''}`} aria-hidden="true">
    {Array.from({length: 46}, (_,i) => <i key={i} style={{'--i':i, '--h': `${12 + ((i * 17 + 9) % 62)}%`} as React.CSSProperties} />)}
  </div>;
}
export function VoiceDemo() {
  const [scenario, setScenario] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const lastRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const selected = SCENARIOS[scenario];
  const duration = selected.dialogue[selected.dialogue.length-1].at + END_EXTRA;
  const complete = elapsed >= duration;
  const visible = useMemo(() => selected.dialogue.filter(line => line.at <= elapsed), [selected, elapsed]);
  const last = visible[visible.length-1];
  const displaySeconds = Math.floor(elapsed / 1000);
  useEffect(() => {
    const el = experienceRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) { setStarted(true); setPlaying(true); observer.disconnect(); }
    }, {threshold:0.15});
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);
  useEffect(() => {
    if (!playing) { lastRef.current = null; return; }
    const tick = (now: number) => {
      const prev = lastRef.current ?? now;
      lastRef.current = now;
      setElapsed(t => Math.min(duration, t + Math.min(80, now - prev)));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if(frameRef.current !== null) cancelAnimationFrame(frameRef.current); lastRef.current = null; };
  }, [playing, duration]);
  useEffect(() => { if (complete) setPlaying(false); }, [complete]);
  const switchScenario = (i: number) => { setScenario(i); setElapsed(0); setStarted(true); setPlaying(true); };
  const replay = () => { setElapsed(0); setPlaying(true); };
  return <section id="experience" className="rin-section rin-experience" ref={experienceRef}>
    <div className="rin-container">
      <div className="rin-overline"><span>01 / VOICE EXPERIENCE</span><span>EXPLORE THE INTERACTION</span></div>
      <div className="rin-heading-row">
        <h2>Every conversation<br/><em>moves things forward.</em></h2>
        <p>Hear the shape of a better first impression. Explore how Heyrin can guide common customer conversations into a clear next step.</p>
      </div>
      <div className="rin-call-composition">
        <div className="rin-scenario-rail" role="tablist" aria-label="Example conversations">
          {SCENARIOS.map((item, i) => <button key={item.id} type="button" role="tab" aria-selected={i===scenario} onClick={() => switchScenario(i)} className={`rin-scenario ${i===scenario?'is-selected':''}`}>
            <span className="rin-mini-label">{item.kicker}</span><strong>{item.title}</strong><span>{item.subtitle}</span><ArrowUpRight size={18} aria-hidden="true"/>
          </button>)}
          <p className="rin-demo-label"><CircleDot size={12}/> Scripted demonstration. No live call, audio, or calendar actions.</p>
        </div>
        <div className="rin-call-console" role="tabpanel" aria-label={selected.title}>
          <div className="rin-call-top"><div><span className="rin-status-light"/><span>HEYRIN / CONVERSATION PREVIEW</span></div><span className="rin-mono">00:{String(displaySeconds).padStart(2,'0')}</span></div>
          <div className="rin-call-stage">
            <div className="rin-call-halo" aria-hidden="true"><div className={`rin-orb ${playing?'is-speaking':''}`}><div className="rin-orb-core"/><span className="rin-orb-ring a"/><span className="rin-orb-ring b"/></div></div>
            <div className="rin-call-live">
              <span className="rin-mini-label">{complete ? 'CONVERSATION COMPLETE' : playing ? 'PLAYING SCRIPT' : 'PLAYBACK PAUSED'}</span>
              <div className="rin-call-speaking"><Headphones size={16}/>{last?.speaker || 'Heyrin'} <span>/</span> {selected.title}</div>
              <Wave active={playing && !complete} speaker={last?.speaker === 'Caller' ? 'caller' : 'agent'}/>
            </div>
          </div>
          <div className="rin-transcript" aria-live="off" aria-label="Conversation transcript">
            {visible.length ? visible.map((line,i)=><div key={i} className={`rin-dialogue ${line.speaker==='Heyrin'?'agent':''}`}><span>{line.speaker}</span><p>{line.text}</p></div>) : <p className="rin-muted">Starting conversation…</p>}
          </div>
          <div className="rin-console-controls">
            <div className="rin-progress" role="progressbar" aria-label="Demo playback progress" aria-valuenow={Math.round(elapsed / duration * 100)} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${elapsed/duration*100}%`}}/></div>
            <div className="rin-controls-line"><div className="rin-mono">SCRIPTED CALL / {String(Math.ceil(duration/1000)).padStart(2,'0')} SEC</div><div><button aria-label="Replay conversation" title="Replay conversation" onClick={replay}><RotateCcw size={17}/></button><button className="rin-play-btn" aria-label={playing?'Pause conversation':'Play conversation'} title={playing?'Pause':'Play'} onClick={() => { if (complete) replay(); else setPlaying(p=>!p); }}>{playing?<Pause size={17} fill="currentColor"/>:<Play size={17} fill="currentColor"/>}{playing?'Pause':complete?'Replay':'Play'}</button></div></div>
          </div>
        </div>
        <aside className="rin-outcome">
          <div className="rin-mini-label">ILLUSTRATIVE OUTCOME</div>
          <CalendarCheck2 size={28} className="rin-lime"/>
          <h3>{selected.result}</h3>
          <p>This preview shows the workflow Heyrin can support when the relevant systems are configured.</p>
          <div className="rin-outcome-steps">{selected.steps.map((step,i)=><div key={step} className={complete?'is-done':''}><span>{complete?<Check size={13}/>:String(i+1).padStart(2,'0')}</span>{step}</div>)}</div>
          <a href="#contact" className="rin-text-link">Explore your workflow <ArrowUpRight size={16}/></a>
        </aside>
      </div>
      <LiveVoiceAgent />
    </div>
  </section>;
}
