import { useState } from 'react';
import { ArrowUpRight, PhoneIncoming, ScanFace, CalendarCheck2, Check, MoveRight } from 'lucide-react';
type Capability = { number:string; title:string; short:string; details:string; signal:string; steps:string[] };
const data: Capability[] = [
 {number:'01',title:'Answer every first hello.',short:'Inbound conversations',details:'Give callers a consistent welcome, surface the reason for the call, and keep your team focused when the phone gets busy.',signal:'INBOUND ROUTING',steps:['Incoming connection','Intent recognized','Appropriate response']},
 {number:'02',title:'Find the opportunity in the details.',short:'Lead qualification',details:'Ask useful questions, capture contact information, and hand over structured context instead of a missed-call notification.',signal:'INTAKE ENGINE',steps:['Caller describes need','Key details collected','Qualified handoff']},
 {number:'03',title:'Turn interest into the next step.',short:'Appointment requests',details:'Guide callers toward a convenient time and coordinate with your scheduling setup when a compatible integration is in place.',signal:'SCHEDULING FLOW',steps:['Request a time','Check configured system','Confirm or escalate']},
];
const Icons=[PhoneIncoming,ScanFace,CalendarCheck2];
export function Capabilities() {
 const [selected,setSelected]=useState(0);
 const active=data[selected];
 const Icon=Icons[selected];
 return <section id="capabilities" className="rin-section rin-capabilities">
   <div className="rin-container">
     <div className="rin-overline"><span>02 / CAPABILITIES</span><span>BEYOND THE ANSWER</span></div>
     <div className="rin-heading-row"><h2>Built to do more<br/><em>than pick up.</em></h2><p>Not a maze of features. Three connected behaviors that help turn an incoming call into something useful.</p></div>
     <div className="rin-capability-layout">
       <div className="rin-capability-index">{data.map((item,i)=><button key={item.number} type="button" aria-pressed={selected===i} className={`rin-capability-choice ${i===selected?'is-selected':''}`} onClick={()=>setSelected(i)}><span>{item.number}</span><strong>{item.short}</strong><MoveRight size={18}/></button>)}</div>
       <div className="rin-capability-display" key={selected}>
          <div className="rin-capability-copy"><div className="rin-mini-label">{active.signal} / FEATURE {active.number}</div><h3>{active.title}</h3><p>{active.details}</p><a href="#contact" className="rin-text-link">Design your own flow <ArrowUpRight size={16}/></a></div>
          <div className="rin-capability-graphic" aria-label={active.signal + ' illustrative workflow'}>
            <div className="rin-capability-radar"><span className="rin-c-ring one"/><span className="rin-c-ring two"/><span className="rin-c-ring three"/><div className="rin-capability-center"><Icon size={36}/></div><span className="rin-radar-node node1"/><span className="rin-radar-node node2"/><span className="rin-radar-node node3"/></div>
            <div className="rin-capability-flow">{active.steps.map((s,i)=><div key={s}><span>{i===2?<Check size={12}/>:String(i+1).padStart(2,'0')}</span>{s}</div>)}</div>
          </div>
       </div>
     </div>
   </div>
 </section>;
}
