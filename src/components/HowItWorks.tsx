import { useEffect, useRef, useState } from 'react';
import { PhoneIncoming, Scan, MessageCircleMore, CalendarCheck2, ArrowUpRight } from 'lucide-react';
const stages=[
 {icon:PhoneIncoming,label:'The signal',title:'A call comes in.',text:'A customer reaches your number. Heyrin answers with your business context, ready to help.'},
 {icon:Scan,label:'The understanding',title:'Intent takes shape.',text:'The conversation identifies why they called and gathers relevant information.'},
 {icon:MessageCircleMore,label:'The conversation',title:'The right questions.',text:'Responses follow your business knowledge and the flow your team has approved.'},
 {icon:CalendarCheck2,label:'The action',title:'Something moves forward.',text:'A booking request, qualified lead, or human handoff can move into the connected workflow.'},
];
export function HowItWorks(){
 const ref=useRef<HTMLElement>(null);
 const [active,setActive]=useState(0);
 const progressRef = useRef<HTMLSpanElement>(null);
 useEffect(() => {
   const section = ref.current;
   const bar = progressRef.current;
   if (!section || !bar || typeof IntersectionObserver === 'undefined') return;

   const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
   let frame = 0;
   let lastStage = -1;
   const update = () => {
     frame = 0;
     const { top, bottom } = section.getBoundingClientRect();
     const height = window.innerHeight;
     const progress = Math.max(0, Math.min(1, (height * 0.6 - top) / (bottom - top + height * 0.15)));
     bar.style.setProperty('--journey-progress', String(progress));
     const nextStage = Math.min(3, Math.floor(progress * 4));
     if (nextStage !== lastStage) {
       lastStage = nextStage;
       setActive(nextStage);
     }
   };
   const schedule = () => {
     if (!frame) frame = window.requestAnimationFrame(update);
   };
   let visible = false;
   const sync = () => {
     window.removeEventListener('scroll', schedule);
     window.removeEventListener('resize', schedule);
     window.cancelAnimationFrame(frame);
     frame = 0;
     if (!visible || motion.matches) return;
     window.addEventListener('scroll', schedule, { passive: true });
     window.addEventListener('resize', schedule);
     schedule();
   };
   const observer = new IntersectionObserver(([entry]) => {
     visible = entry.isIntersecting;
     sync();
   });
   observer.observe(section);
   motion.addEventListener('change', sync);
   return () => {
     visible = false;
     sync();
     observer.disconnect();
     motion.removeEventListener('change', sync);
   };
 }, []);
 return <section ref={ref} id="how-it-works" className="rin-section rin-journey">
   <div className="rin-container">
     <div className="rin-overline"><span>01 / HOW IT WORKS</span><span>FROM RING TO RESULT</span></div>
     <div className="rin-heading-row"><h2>One call.<br/><em>Four quiet moves.</em></h2><p>What feels effortless on the caller’s side is a carefully designed sequence underneath.</p></div>
     <div className="rin-journey-track"><div className="rin-journey-line"><span ref={progressRef} className="rin-journey-progress"/></div>
       {stages.map((step,i)=>{const Icon=step.icon;return <button key={step.label} type="button" onClick={()=>setActive(i)} className={`rin-journey-stage ${active===i?'is-active':''}`} aria-pressed={active===i}>
         <div className="rin-journey-marker"><Icon size={22}/></div><span className="rin-mini-label">{String(i+1).padStart(2,'0')} / {step.label}</span><strong>{step.title}</strong><p>{step.text}</p>
       </button>;})}
     </div>
     <div className="rin-journey-bottom"><span className="rin-mono">DESIGNED FOR NATURAL HANDOFFS</span><a className="rin-text-link" href="#contact">See what this could look like for you <ArrowUpRight size={16}/></a></div>
   </div>
 </section>;
}
