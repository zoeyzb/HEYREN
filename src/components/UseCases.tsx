import { useState } from 'react';
import { ArrowUpRight, Home, Scale, Building2, CalendarDays, BriefcaseBusiness } from 'lucide-react';
const industries=[
 {name:'Home services',icon:Home,question:'“My kitchen sink is leaking. Can someone take a look?”',answer:'“I can capture the details and your preferred visit time.”',flow:['Urgency noted','Service type identified','Visit request']},
 {name:'Legal practices',icon:Scale,question:'“I need to arrange an initial consultation.”',answer:'“I can collect your contact details and the type of matter.”',flow:['Practice area','New inquiry intake','Staff follow-up']},
 {name:'Real estate',icon:Building2,question:'“I’d like to arrange a viewing for a property.”',answer:'“Which listing are you interested in and when are you free?”',flow:['Property identified','Time preference','Viewing request']},
 {name:'Clinics & appointments',icon:CalendarDays,question:'“Can I reschedule my appointment?”',answer:'“I can help check what the next available options are.”',flow:['Existing booking','New time preference','Scheduling workflow']},
 {name:'Professional services',icon:BriefcaseBusiness,question:'“Can I speak with someone about your services?”',answer:'“Absolutely. Which part of your business needs support?”',flow:['Service category','Contact information','Team handoff']},
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
