import { useEffect, useState } from 'react';
import { AudioLines, BrainCircuit, MessageSquareText, ArrowRight, ChevronRight } from 'lucide-react';
const modes=[
 {id:'listening',name:'Listening',subtitle:'The human signal.',description:'A caller explains what they need. The conversation begins with their words.',tags:['VOICE INPUT','TURN DETECTION'],phrase:'“I need to move my appointment…”'},
 {id:'understanding',name:'Understanding',subtitle:'The moment of clarity.',description:'Relevant intent and details are brought into focus before the next response.',tags:['INTENT: RESCHEDULE','CONTEXT: EXISTING BOOKING'],phrase:'Change existing appointment'},
 {id:'responding',name:'Responding',subtitle:'A useful answer.',description:'The agent follows your configured knowledge and workflow to move the conversation forward.',tags:['RESPONSE READY','NEXT STEP: TIME PREFERENCE'],phrase:'“Of course. What day works better?”'},
];
const icons=[AudioLines,BrainCircuit,MessageSquareText];
export function VoiceVisualization(){
 const [selected,setSelected]=useState(0);const [auto,setAuto]=useState(false);
 useEffect(()=>{if(!auto)return;const id=setInterval(()=>setSelected(n=>(n+1)%3),4000);return()=>clearInterval(id)},[auto]);
 const mode=modes[selected];const Icon=icons[selected];
 return <section id="intelligence" className="rin-section rin-intelligence">
    <div className="rin-container">
      <div className="rin-overline"><span>04 / VOICE INTELLIGENCE</span><span>A CLOSER LOOK</span></div>
      <div className="rin-heading-row"><h2>Not just a voice.<br/><em>A chain of understanding.</em></h2><p>Three connected moments. Select a phase to explore what an intelligent voice interaction is designed to do.</p></div>
      <div className="rin-intelligence-shell">
        <div className="rin-intel-tabs" role="tablist" aria-label="Voice intelligence stages">{modes.map((stage,i)=>{const StageIcon=icons[i];return <button type="button" key={stage.id} role="tab" aria-selected={selected===i} className={selected===i?'is-selected':''} onClick={()=>{setSelected(i);setAuto(false)}}><span>0{i+1}</span><StageIcon size={19}/><strong>{stage.name}</strong><ChevronRight size={15}/></button>})}</div>
        <div className="rin-intel-art" role="tabpanel" aria-label={mode.name}>
          <div className={`rin-intel-sphere mode-${mode.id}`} aria-hidden="true">
            <div className="rin-intel-orbit orbit-a"/><div className="rin-intel-orbit orbit-b"/><div className="rin-intel-orbit orbit-c"/>
            <div className="rin-intel-nucleus"><Icon size={56} strokeWidth={1.2}/></div>
            {Array.from({length:18},(_,i)=><span key={i} className="rin-intel-ray" style={{transform:`rotate(${i*20}deg)`}}/>)}
          </div>
          <div className="rin-intel-display"><div className="rin-mini-label">SELECTED PHASE / {mode.name.toUpperCase()}</div><p>{mode.phrase}</p><div>{mode.tags.map(t=><span key={t}>{t}</span>)}</div></div>
        </div>
        <div className="rin-intel-description"><div className="rin-mini-label">SYSTEM STATE 0{selected+1}</div><h3>{mode.subtitle}</h3><p>{mode.description}</p><button type="button" onClick={()=>setSelected(s=>(s+1)%3)} className="rin-text-link">Next phase <ArrowRight size={16}/></button><button type="button" aria-pressed={auto} onClick={()=>setAuto(p=>!p)} className="rin-intel-autoplay">{auto?'Stop cycle':'Auto cycle states'}</button></div>
      </div>
      <p className="rin-intel-caption">Conceptual visualization of a voice interaction; not a live processing monitor.</p>
    </div>
 </section>;
}
