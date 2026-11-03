import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, CalendarCheck2, Check, Headphones, Pause, Play, RotateCcw, CircleDot, Volume2, VolumeX } from 'lucide-react';

type Dialogue = { speaker: 'Ren' | 'Caller'; text: string; at: number };
type Scenario = { id: string; title: string; kicker: string; subtitle: string; result: string; note?: string; steps: string[]; duration: number; dialogue: Dialogue[] };
const SCENARIOS: Scenario[] = [
  { id: "appointment", title: "Appointment booking", kicker: "01 / APPOINTMENT", subtitle: "A repair inquiry moves to a confirmed visit.", result: "Appointment confirmed", note: "The visit is booked and the confirmation is on its way.", steps: ["Service and time collected", "Calendar availability checked", "Booking confirmed and sent"], duration: 21384,
    dialogue: [
      { speaker: "Ren", text: "Hey, this is Ren. How can I help?", at: 0 },
      { speaker: "Caller", text: "Hi, my kitchen sink's leaking. Do you have anyone available this week?", at: 3404 },
      { speaker: "Ren", text: "I can check that for you. Would Wednesday afternoon work?", at: 7920 },
      { speaker: "Caller", text: "Wednesday should work. Do you have anything around two?", at: 11876 },
      { speaker: "Ren", text: "Yep, two o'clock is available. I'll get that booked for you and send over a confirmation.", at: 15336 },
    ]},
  { id: "qualify", title: "Lead qualification", kicker: "02 / NEW OPPORTUNITY", subtitle: "The right details, before a human handoff.", result: "Lead details prepared", steps: ["Service identified", "Project scope captured", "Team handoff prepared"], duration: 21552,
    dialogue: [
      { speaker: "Ren", text: "Hey, this is Ren. How can I help?", at: 0 },
      { speaker: "Caller", text: "Hi, we're thinking about replacing the HVAC system at our office.", at: 3404 },
      { speaker: "Ren", text: "Sure. Is the current system still running, or has it stopped working?", at: 7944 },
      { speaker: "Caller", text: "It's still running, but it's pretty old. We've got two floors.", at: 13148 },
      { speaker: "Ren", text: "Got it. And what's the best number for the team to reach you?", at: 17400 },
    ]},
  { id: "inquiry", title: "Customer questions", kicker: "03 / INBOUND SUPPORT", subtitle: "Clear information when someone needs it.", result: "Question answered", steps: ["Question recognized", "Knowledge consulted", "Next step offered"], duration: 22200,
    dialogue: [
      { speaker: "Ren", text: "Hey, this is Ren. How can I help?", at: 0 },
      { speaker: "Caller", text: "Hi, do you work with commercial buildings?", at: 3404 },
      { speaker: "Ren", text: "We do. Are you looking for ongoing maintenance, or is something not working right now?", at: 6480 },
      { speaker: "Caller", text: "Just regular maintenance. It's a small office building.", at: 12236 },
      { speaker: "Ren", text: "Okay, that sounds like a good fit. I can get a few details and have the team follow up with you.", at: 16032 },
    ]},
];
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
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRunRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const selected = SCENARIOS[scenario];
  const duration = selected.duration;
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
  const switchScenario = (i: number) => { stopAudio(); setScenario(i); setElapsed(0); setStarted(true); setPlaying(true); };
  const replay = () => { stopAudio(); setElapsed(0); setPlaying(true); };
  const stopAudio = () => {
    audioRunRef.current += 1;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setAudioPlaying(false);
  };
  const listenToScenario = () => {
    if (audioPlaying) { stopAudio(); return; }
    const run = ++audioRunRef.current;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlaying(false);
    setElapsed(0);
    setAudioPlaying(true);
    setAudioError(false);
    const audio = new Audio(`/audio/${selected.id}.mp3`);
    audioRef.current = audio;
    audio.preload = 'auto';
    audio.ontimeupdate = () => {
      if (run === audioRunRef.current) setElapsed(Math.min(duration, audio.currentTime * 1000));
    };
    audio.onended = () => {
      if (run !== audioRunRef.current) return;
      setElapsed(duration);
      setAudioPlaying(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      if (run !== audioRunRef.current) return;
      audioRef.current = null;
      setAudioPlaying(false);
      setAudioError(true);
    };
    void audio.play().catch(() => {
      if (run !== audioRunRef.current) return;
      audioRef.current = null;
      setAudioPlaying(false);
      setAudioError(true);
    });
  };
  useEffect(() => () => { audioRunRef.current += 1; audioRef.current?.pause(); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  useEffect(() => { stopAudio(); }, [scenario]);
  return <section id="experience" className="rin-section rin-experience" ref={experienceRef}>
    <div className="rin-container">
      <div className="rin-overline"><span>02 / CONVERSATION PLAYBACK</span><span>EXPLORE THE INTERACTION</span></div>
      <div className="rin-heading-row">
        <h2>Every conversation<br/><em>moves things forward.</em></h2>
        <p>Hear the shape of a better first impression. Explore how Heyrin can guide common customer conversations into a clear next step.</p>
      </div>
      <div className="rin-call-composition">
        <div className="rin-scenario-rail" role="tablist" aria-label="Example conversations">
          {SCENARIOS.map((item, i) => <button key={item.id} type="button" role="tab" aria-selected={i===scenario} onClick={() => switchScenario(i)} className={`rin-scenario ${i===scenario?'is-selected':''}`}>
            <span className="rin-mini-label">{item.kicker}</span><strong>{item.title}</strong><span>{item.subtitle}</span><ArrowUpRight size={18} aria-hidden="true"/>
          </button>)}
          <p className="rin-demo-label"><CircleDot size={12}/> Recorded conversation · Explore the workflow</p>
        </div>
        <div className="rin-call-console" role="tabpanel" aria-label={selected.title}>
          <div className="rin-call-top"><div><span className="rin-status-light"/><span>HEYRIN / CONVERSATION PREVIEW</span></div><span className="rin-mono">00:{String(displaySeconds).padStart(2,'0')}</span></div>
          <div className="rin-call-stage">
            <div className="rin-call-halo" aria-hidden="true"><div className={`rin-orb ${playing || audioPlaying?'is-speaking':''}`}><div className="rin-orb-core"/><span className="rin-orb-ring a"/><span className="rin-orb-ring b"/></div></div>
            <div className="rin-call-live">
              <span className="rin-mini-label">{complete ? 'CONVERSATION COMPLETE' : audioPlaying ? 'PLAYING RECORDED CONVERSATION' : playing ? 'PLAYING TRANSCRIPT' : 'PLAYBACK PAUSED'}</span>
              <div className="rin-call-speaking"><Headphones size={16}/>{last?.speaker || 'Ren'} <span>/</span> {selected.title}</div>
              <Wave active={(playing || audioPlaying) && !complete} speaker={last?.speaker === 'Caller' ? 'caller' : 'agent'}/>
            </div>
          </div>
          <div className="rin-transcript" aria-live="off" aria-label="Conversation transcript">
            {visible.length ? visible.map((line,i)=><div key={i} className={`rin-dialogue ${line.speaker==='Ren'?'agent':''}`}><span>{line.speaker}</span><p>{line.text}</p></div>) : <p className="rin-muted">Starting conversation…</p>}
          </div>
          <div className="rin-console-controls">
            <div className="rin-progress" role="progressbar" aria-label="Demo playback progress" aria-valuenow={Math.round(elapsed / duration * 100)} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${elapsed/duration*100}%`}}/></div>
            {audioError && <p className="rin-audio-error" role="status">The recording could not load. Please try again.</p>}
            <div className="rin-controls-line"><div className="rin-mono">RECORDED CALL / {String(Math.ceil(duration/1000)).padStart(2,'0')} SEC</div><div><button aria-label={audioPlaying ? 'Stop spoken demo' : 'Listen to spoken demo'} title={audioPlaying ? 'Stop audio' : 'Listen to audio'} onClick={listenToScenario}>{audioPlaying ? <VolumeX size={16}/> : <Volume2 size={16}/>}<span>{audioPlaying ? 'Stop audio' : 'Listen'}</span></button><button aria-label="Replay conversation" title="Replay conversation" onClick={replay}><RotateCcw size={17}/></button><button className="rin-play-btn" aria-label={playing?'Pause conversation':'Play conversation'} title={playing?'Pause':'Play'} onClick={() => { if (complete) replay(); else setPlaying(p=>!p); }}>{playing?<Pause size={17} fill="currentColor"/>:<Play size={17} fill="currentColor"/>}{playing?'Pause':complete?'Replay':'Play'}</button></div></div>
          </div>
        </div>
        <aside className="rin-outcome">
          <div className="rin-mini-label">WORKFLOW RESULT</div>
          <CalendarCheck2 size={28} className="rin-lime"/>
          <h3>{selected.result}</h3>
          <p>{selected.note || 'Heyrin checks the connected workflow, confirms the next step, and keeps the details together.'}</p>
          <div className="rin-outcome-steps">{selected.steps.map((step,i)=><div key={step} className={complete?'is-done':''}><span>{complete?<Check size={13}/>:String(i+1).padStart(2,'0')}</span>{step}</div>)}</div>
          <a href="#contact" className="rin-text-link">Explore your workflow <ArrowUpRight size={16}/></a>
        </aside>
      </div>
    </div>
  </section>;
}
