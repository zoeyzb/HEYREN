import { useEffect, useRef, useState } from 'react';
import { PhoneIncoming, Scan, MessageCircleMore, CalendarCheck2, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const stages=[
 {icon:PhoneIncoming,label:'The signal',title:'A call comes in.',text:'A customer reaches your number. Heyrin answers with your business context, ready to help.'},
 {icon:Scan,label:'The understanding',title:'Intent takes shape.',text:'The conversation identifies why they called and gathers relevant information.'},
 {icon:MessageCircleMore,label:'The conversation',title:'The right questions.',text:'Responses follow your business knowledge and the flow your team has approved.'},
 {icon:CalendarCheck2,label:'The action',title:'Something moves forward.',text:'A booking request, qualified lead, or human handoff can move into the connected workflow.'},
];
export function HowItWorks(){
 const ref=useRef<HTMLElement>(null);
 const [active,setActive]=useState(0);
 useEffect(()=>{
   const section=ref.current;
   if(!section) return;
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
   const ctx=gsap.context(()=>{
      gsap.fromTo('.rin-journey-marker',{scale:.82,opacity:.55},{scale:1,opacity:1,stagger:.16,duration:.55,ease:'power2.out',scrollTrigger:{trigger:section,start:'top 70%',once:true}});
      ScrollTrigger.create({trigger:section,start:'top 60%',end:'bottom 45%',onUpdate:self=>setActive(Math.min(3,Math.floor(self.progress*4)))});
      const mobile = window.matchMedia('(max-width: 650px)').matches;
      gsap.fromTo('.rin-journey-progress',mobile?{scaleY:0}:{scaleX:0},mobile?{scaleY:1,ease:'none',scrollTrigger:{trigger:section,start:'top 60%',end:'bottom 45%',scrub:true}}:{scaleX:1,ease:'none',scrollTrigger:{trigger:section,start:'top 60%',end:'bottom 45%',scrub:true}});
   },section);
   return()=>ctx.revert();
 },[]);
 return <section ref={ref} id="how-it-works" className="rin-section rin-journey">
   <div className="rin-container">
     <div className="rin-overline"><span>01 / HOW IT WORKS</span><span>FROM RING TO RESULT</span></div>
     <div className="rin-heading-row"><h2>One call.<br/><em>Four quiet moves.</em></h2><p>What feels effortless on the caller’s side is a carefully designed sequence underneath.</p></div>
     <div className="rin-journey-track"><div className="rin-journey-line"><span className="rin-journey-progress"/></div>
       {stages.map((step,i)=>{const Icon=step.icon;return <button key={step.label} type="button" onClick={()=>setActive(i)} className={`rin-journey-stage ${active===i?'is-active':''}`} aria-pressed={active===i}>
         <div className="rin-journey-marker"><Icon size={22}/></div><span className="rin-mini-label">{String(i+1).padStart(2,'0')} / {step.label}</span><strong>{step.title}</strong><p>{step.text}</p>
       </button>;})}
     </div>
     <div className="rin-journey-bottom"><span className="rin-mono">DESIGNED FOR NATURAL HANDOFFS</span><a className="rin-text-link" href="#contact">See what this could look like for you <ArrowUpRight size={16}/></a></div>
   </div>
 </section>;
}
