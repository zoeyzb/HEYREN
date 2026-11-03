import { useState } from 'react';
import { ArrowUpRight, PhoneIncoming, ScanFace, CalendarCheck2, BrainCircuit, AudioLines, MessageSquareText } from 'lucide-react';
const stages=[
 {id:'listening',label:'Listen',title:'Hear what they actually need.',copy:'Pick up the reason behind the message, not just a few matching words.',phrase:'“I need to move my appointment to Friday.”',signal:'INTENT DETECTED',steps:['Read the message','Recognize the request','Keep the context']},
 {id:'understanding',label:'Understand',title:'Keep the details connected.',copy:'Use the request and the conversation so far to understand what matters next.',phrase:'Intent: reschedule · Existing appointment',signal:'CONTEXT CONNECTED',steps:['Identify intent','Check known details','Resolve what is missing']},
 {id:'responding',label:'Respond',title:'Give a useful next step.',copy:'Reply in your business voice, ask only what is needed, and move the request forward.',phrase:'“Of course. What time on Friday works best?”',signal:'RESPONSE COMPOSED',steps:['Use business knowledge','Ask a clear question','Prepare the next step']},
];
const capabilities=[
 {number:'01',title:'Inbound enquiries',detail:'Welcome every customer, understand why they reached out, and guide them to a useful answer.',icon:PhoneIncoming},
 {number:'02',title:'Lead qualification',detail:'Collect the details that matter and prepare a clear handoff, without making people repeat themselves.',icon:ScanFace},
 {number:'03',title:'Bookings & follow-through',detail:'Check your connected scheduling workflow, arrange the next step, and confirm the outcome.',icon:CalendarCheck2},
];
export function Capabilities(){
 const [stage,setStage]=useState(0); const [capability,setCapability]=useState(0); const active=stages[stage]; const selected=capabilities[capability]; const StageIcon=[AudioLines,BrainCircuit,MessageSquareText][stage]; const CapIcon=selected.icon;
 return <section id="capabilities" className="rin-section rin-capabilities rin-unified-intelligence">
  <div className="rin-container">
   <div className="rin-overline"><span>03 / UNDERSTANDING IN ACTION</span><span>FROM FIRST MESSAGE TO NEXT STEP</span></div>
   <div className="rin-heading-row"><h2>Understands people.<br/><em>Moves work forward.</em></h2><p>Not a scripted answer machine. Heyrin follows the meaning, keeps the context, and responds with a useful next step.</p></div>
   <div className="rin-unified-shell">
    <div className="rin-unified-tabs" role="tablist" aria-label="How Heyrin understands a message">{stages.map((item,i)=>{const Icon=[AudioLines,BrainCircuit,MessageSquareText][i];return <button key={item.id} type="button" role="tab" aria-selected={stage===i} className={stage===i?'is-selected':''} onClick={()=>setStage(i)}><span>0{i+1}</span><Icon size={19}/><strong>{item.label}</strong><ArrowUpRight size={15}/></button>})}</div>
    <div className="rin-unified-main" key={active.id}>
      <div className={'rin-unified-visual mode-'+active.id}><div className="rin-unified-orbit one"/><div className="rin-unified-orbit two"/><div className="rin-unified-orbit three"/><div className="rin-unified-icon"><StageIcon size={38} strokeWidth={1.4}/></div><span className="rin-unified-pulse"/><div className="rin-unified-status"><i/> {active.signal}</div></div>
      <div className="rin-unified-copy"><span className="rin-mini-label">0{stage+1} / {active.label.toUpperCase()}</span><h3>{active.title}</h3><p>{active.copy}</p><div className="rin-unified-message"><span>EXAMPLE CONTEXT</span><strong>{active.phrase}</strong></div><div className="rin-unified-steps">{active.steps.map((step,i)=><span key={step}><i>{i+1}</i>{step}</span>)}</div></div>
    </div>
   </div>
   <div className="rin-capability-lower"><div><span className="rin-mini-label">BUILT AROUND YOUR WORKFLOW</span><h3>Useful from the first hello.</h3><p>Choose a workflow to see where the conversation can go next.</p></div>
    <div className="rin-capability-index" role="tablist" aria-label="Business workflows">{capabilities.map((item,i)=>{const Icon=item.icon;return <button key={item.number} type="button" role="tab" aria-selected={capability===i} className={'rin-capability-choice '+(i===capability?'is-selected':'')} onClick={()=>setCapability(i)}><span>{item.number}</span><Icon size={19}/><strong>{item.title}</strong><ArrowUpRight size={16}/></button>})}</div>
    <div className="rin-capability-result" key={selected.number}><div className="rin-capability-result-icon"><CapIcon size={25}/></div><div><span className="rin-mini-label">WORKFLOW 0{capability+1}</span><h4>{selected.title}</h4><p>{selected.detail}</p></div><a href="#contact" className="rin-text-link">Explore this workflow <ArrowUpRight size={16}/></a></div>
   </div>
  </div>
 </section>;
}
