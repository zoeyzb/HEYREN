import { useState } from 'react';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';
const faqs=[
 ['What is an AI voice agent?','An AI voice agent can answer calls and speak with customers using configured business knowledge and conversation flows. Heyrin is tailored to the questions your customers actually ask.'],
 ['Can Heyrin answer calls after business hours?','The agent can be configured for after-hours coverage, subject to your phone system setup and call routing.'],
 ['Can it book appointments?','Yes. Heyrin checks your connected calendar, books an available time, and sends the customer a confirmation. If a requested slot is unavailable, it offers the next suitable option.'],
 ['Can it handle my company’s specific questions?','Yes. We set up the approved knowledge, services, policies, and conversation paths for your business, then test them with you.'],
 ['What happens when someone needs a person?','Heyrin passes the conversation and the important details to your team, so the customer does not have to start over.'],
 ['Will this work with the tools I already use?','Heyrin connects your phone, calendar, and business tools into one clear workflow, so conversations can lead to a real next step.'],
 ['How do we get started?','Tell us about the calls you want to handle. We map the experience, configure the agent, and work with you to test it before launch.'],
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
