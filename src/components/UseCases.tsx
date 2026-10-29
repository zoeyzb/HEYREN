import { useState } from 'react';
import { ArrowUpRight, Home, Scale, Building2, CalendarDays, BriefcaseBusiness } from 'lucide-react';
const industries=[
 {name:'Home services',icon:Home,question:'“My kitchen sink is leaking. Could someone come out today?”',answer:'“I can help. What’s the property address? I’ll check the team’s availability and arrange the soonest visit.”',flow:['Urgency and address','Check team availability','Arrange the next visit']},
 {name:'Legal practices',icon:Scale,question:'“I’d like to book an initial consultation.”',answer:'“Of course. Could you briefly tell me what the matter concerns? I’ll connect you with the right person.”',flow:['Understand the matter','Capture contact details','Route to the right person']},
 {name:'Real estate',icon:Building2,question:'“Could I arrange a viewing?”',answer:'“Absolutely. Which property are you interested in? I’ll check the available viewing times.”',flow:['Identify the property','Check viewing times','Arrange the viewing']},
 {name:'Clinics & appointments',icon:CalendarDays,question:'“Can I reschedule my appointment?”',answer:'“Of course. Can I confirm your name and current appointment? I’ll check the available times before changing anything.”',flow:['Verify the appointment','Check available times','Confirm the change']},
 {name:'Enterprise & business support',icon:BriefcaseBusiness,question:'“Can I speak with someone about your services?”',answer:'“Absolutely. Is this about a new project or support for an existing account? I’ll get you to the right team.”',flow:['Understand the request','Capture key details','Route to the right team']},
];
export function UseCases(){
 const [selected,setSelected]=useState(0);const active=industries[selected];
 return <section id="industries" className="rin-section rin-industries">
   <div className="rin-container">
     <div className="rin-overline"><span>05 / INDUSTRIES</span><span>ONE PLATFORM, DIFFERENT CONVERSATIONS</span></div>
     <div className="rin-heading-row"><h2>Every industry<br/><em>speaks differently.</em></h2><p>Your callers don’t use the same script. Your AI agent shouldn’t have to either.</p></div>
     <div className="rin-industry-layout"><div className="rin-industry-nav" role="tablist" aria-label="Choose an industry">{industries.map((item,i)=>{const Icon=item.icon;return <button type="button" role="tab" aria-selected={selected===i} className={selected===i?'is-active':''} onClick={()=>setSelected(i)} key={item.name}><Icon size={19}/><span>{item.name}</span><ArrowUpRight size={17}/></button>})}</div>
       <div className="rin-industry-conversation" role="tabpanel" aria-label={active.name} key={active.name}>
         <div className="rin-industry-top"><span className="rin-mini-label">EXAMPLE CALL / {active.name.toUpperCase()}</span><span>ILLUSTRATIVE FLOW</span></div>
         <div className="rin-bubble caller"><span>CALLER</span><p>{active.question}</p></div>
         <div className="rin-bubble agent"><span>HEYRIN</span><p>{active.answer}</p></div>
         <div className="rin-industry-path"><div className="rin-mini-label">POSSIBLE WORKFLOW</div>{active.flow.map((step,i)=><div key={step}><span>0{i+1}</span>{step}</div>)}</div>
       </div>
     </div>
     <p className="rin-industry-foot">Responses and business actions are examples; actual capabilities depend on your configured knowledge and integrations.</p>
   </div>
 </section>;
}
