import { useState } from 'react';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
const faqs=[
 ['What is an AI voice agent?','It answers calls using the services, policies and scripts you approve.'],
 ['Can Heyrin answer calls after business hours?','Yes, when your phone system routes after-hours calls to Heyrin.'],
 ['Can it book appointments?','Yes. Connect your calendar so Heyrin can offer open times, book and confirm.'],
 ['Can it handle my company’s specific questions?','Yes. You approve the answers and test them before launch.'],
 ['What happens when someone needs a person?','Your team gets the call details so the caller can pick up where they left off.'],
 ['Will this work with the tools I already use?','We check your phone, calendar and business tools during setup.'],
 ['How do we get started?','Tell us which calls to handle. We build the flow and test it with you.'],
];
export function FAQ(){
 const [open,setOpen]=useState<number|null>(0);
 return <section id="faq" className="rin-section rin-faq">
  <div className="rin-container">
   <div className="rin-overline"><span>08 / GOOD TO KNOW</span><span>YOUR QUESTIONS, CLEAR ANSWERS</span></div>
   <div className="rin-faq-layout"><div><h2>A few things<br/><em>worth knowing.</em></h2><p>Have something more specific in mind?</p><a className="rin-text-link" href="#contact">Ask us directly <ArrowUpRight size={16}/></a></div>
    <div className="rin-faq-items">{faqs.map(([q,a],i)=><div className="rin-faq-item" key={q}><h3><button type="button" aria-controls={`faq-answer-${i}`} aria-expanded={open===i} onClick={()=>setOpen(open===i?null:i)}><span>{q}</span>{open===i?<Minus size={18}/>:<Plus size={18}/>}</button></h3><div id={`faq-answer-${i}`} className="rin-faq-answer" hidden={open!==i}><p>{a}</p></div></div>)}</div>
   </div>
  </div>
 </section>;
}
