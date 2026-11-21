import { ArrowUpRight, MessageSquareText, SlidersHorizontal, Rocket } from 'lucide-react';
const steps=[
 {icon:MessageSquareText,step:'01',title:'Tell us how your business works.',detail:'Walk us through the calls you receive and the tools you use.'},
 {icon:SlidersHorizontal,step:'02',title:'Shape the conversation.',detail:'Choose the voice, answers and handoffs.'},
 {icon:Rocket,step:'03',title:'Test it. Refine it. Launch.',detail:'Try sample calls and approve the launch.'},
];
export function GetStarted(){
 return <section id="getting-started" className="rin-section rin-start">
   <div className="rin-container">
     <div className="rin-overline"><span>06 / GETTING STARTED</span><span>SIMPLE BY DESIGN</span></div>
     <div className="rin-start-layout"><div><h2>From idea<br/><em>to your agent.</em></h2><p className="rin-start-lead">Bring a typical call. We’ll build from there.</p><a href="#contact" className="rin-button rin-button-primary">Let's talk <ArrowUpRight size={18}/></a></div>
     <div className="rin-start-steps">{steps.map((s)=>{const Icon=s.icon;return <div key={s.step} className="rin-start-step"><span className="rin-start-number">{s.step}</span><div><h3>{s.title}</h3><p>{s.detail}</p></div><Icon size={22}/></div>})}</div></div>
   </div>
 </section>;
}
