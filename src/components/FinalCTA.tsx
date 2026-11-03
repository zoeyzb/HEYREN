import { ArrowUpRight, ArrowRight } from 'lucide-react';
const links=[['Home','#home'],['The experience','#experience'],['Capabilities','#capabilities'],['How it works','#how-it-works'],['Industries','#industries'],['Contact','#contact'],['FAQ','#faq']];
export function FinalCTA(){
 return <section className="rin-final-cta">
  <div className="rin-container"><div className="rin-final-overline"><span>YOUR NEXT CONVERSATION STARTS HERE</span><span>HEYRIN / 2026</span></div>
    <div className="rin-cta-orbit" aria-hidden="true"><span/><span/><span/></div>
    <h2>Your next caller<br/><em>is worth hearing.</em></h2>
    <div className="rin-cta-bottom"><p>Give your business a voice that can meet the moment.</p><a className="rin-button rin-button-primary" href="#contact">Build your AI agent <ArrowUpRight size={19}/></a></div>
  </div>
 </section>;
}
export function Footer(){
 return <footer className="rin-footer">
  <div className="rin-container"><div className="rin-footer-top"><div><a href="#home" className="rin-footer-logo" aria-label="HEYRIN home"><span className="rin-footer-logo-icon"/>HEYRIN</a><p>Voice intelligence for the conversations that matter.</p></div><nav aria-label="Footer navigation">{links.map(([label,href])=><a key={href} href={href}>{label}</a>)}</nav><div className="rin-footer-contact"><span className="rin-mini-label">START A CONVERSATION</span><a href="mailto:sierra@recoverrevenue.company">sierra@recoverrevenue.company <ArrowUpRight size={16}/></a></div></div>
   <div className="rin-footer-bottom"><span>© {new Date().getFullYear()} HEYRIN</span><span>Designed for better conversations.</span><a href="#home">Back to top <ArrowRight size={15}/></a></div>
  </div>
 </footer>;
}
