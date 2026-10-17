import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioLines, BrainCircuit, ArrowUpRight, CircleDot, Mic2 } from 'lucide-react';

type SignalMode = 'listening' | 'understanding' | 'responding';

const MODES: { id: SignalMode; number: string; label: string; description: string; note: string }[] = [
  { id: 'listening', number: '01', label: 'Listening', description: 'Every great response starts by hearing what matters.', note: 'VOICE INPUT / CAPTURE' },
  { id: 'understanding', number: '02', label: 'Understanding', description: 'Context and intent turn a question into a clear next step.', note: 'INTENT / CONTEXT' },
  { id: 'responding', number: '03', label: 'Responding', description: 'The right words, delivered at the right moment.', note: 'VOICE RESPONSE / FLOW' },
];

const PI2 = Math.PI * 2;
const LIMETONE = [185, 255, 50] as const;
const VIOLETTONE = [161, 107, 255] as const;

// 2D graphics replace the second WebGL canvas entirely. The signal runs only
// while visible, and paints a single still frame for reduced-motion users.
function SignalCanvas({ mode }: { mode: SignalMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const size = { width: 0, height: 0, scale: 1 };
    let frame = 0;
    let visible = true;
    let last = 0;
    let t = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      size.width = Math.max(1, rect.width);
      size.height = Math.max(1, rect.height);
      size.scale = Math.min(window.devicePixelRatio || 1, 1.65);
      canvas.width = Math.round(size.width * size.scale);
      canvas.height = Math.round(size.height * size.scale);
      ctx.setTransform(size.scale, 0, 0, size.scale, 0, 0);
      draw();
    };

    const draw = () => {
      const w = size.width;
      const h = size.height;
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * .49;
      const radius = Math.min(w * .36, h * .37, 174);
      const phase = modeRef.current;
      const intensity = phase === 'listening' ? 1.05 : phase === 'understanding' ? .69 : 1.28;
      const baseFrequency = phase === 'listening' ? .068 : phase === 'understanding' ? .093 : .052;
      const violet = phase === 'understanding';
      const main = violet ? VIOLETTONE : LIMETONE;
      const secondary = violet ? LIMETONE : VIOLETTONE;

      const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.75);
      aura.addColorStop(0, `rgba(${main.join(',')},.085)`);
      aura.addColorStop(.45, `rgba(${main.join(',')},.025)`);
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.ellipse(cx, cy, radius * 1.72, radius * 1.3, 0, 0, PI2); ctx.fill();

      // Precision rings and shifting radar ticks form the depth reference.
      for (let j = 0; j < 4; j++) {
        const rr = radius * (.55 + j * .2);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr * 1.28, rr * .74, -.14, 0, PI2);
        ctx.strokeStyle = `rgba(${secondary.join(',')},${.075 - j * .013})`;
        ctx.lineWidth = .8;
        ctx.stroke();
      }
      const spin = t * .11;
      for (let i = 0; i < 36; i++) {
        const angle = i * PI2 / 36 + spin;
        const rr = radius * 1.11;
        const x = cx + Math.cos(angle) * rr * 1.22;
        const y = cy + Math.sin(angle) * rr * .7;
        ctx.beginPath();ctx.moveTo(x,y);
        ctx.lineTo(cx + Math.cos(angle)*rr*1.23,cy + Math.sin(angle)*rr*.73);
        ctx.strokeStyle = `rgba(${main.join(',')},${i%3===0?.36:.13})`;
        ctx.lineWidth = .8;ctx.stroke();
      }

      // Fine flowing signal trails. Mode alters the wave's geometry rather
      // than faking quantitative accuracy statistics.
      const span = Math.min(w * .84, 780);
      for (let line = 0; line < 23; line++) {
        const depth = (line - 11) / 11;
        ctx.beginPath();
        for (let k = 0; k <= 150; k++) {
          const p = k / 150;
          const x = cx + (p - .5) * span;
          const env = Math.pow(Math.max(0, 1 - Math.pow((p - .5) * 1.9, 2)), 2.1);
          const warp = Math.sin(k*baseFrequency*5.2 + t * (phase==='understanding'?.9:1.9) + depth * 2.7);
          const envelope = phase === 'understanding'
            ? (Math.sin((p-.5)*Math.PI*4+t*.35)*.29 + .48)
            : (Math.cos((p-.5)*Math.PI*2)*.36+.56);
          const pulse = Math.sin((p * 26 + t * 1.5 + depth * 3.5))*Math.sin(p*6.4 + t*.35);
          const y = cy + depth * 6 + depth * env * 78 * envelope
            + (warp * 18 + pulse * 6) * env * intensity
            + Math.sin(p * 10 + depth * 2 + t *.38)*2;
          if (k === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        const isAccent = line === 10 || line === 11 || line === 12;
        const color = line % 7 === 0 ? secondary : main;
        ctx.strokeStyle = `rgba(${color.join(',')},${isAccent?.63:(.17 - Math.abs(depth)*.07)})`;
        ctx.lineWidth = isAccent?1.25:.65;
        ctx.stroke();
      }

      // Luminous centerline and nodes, not a giant opaque polygonal sphere.
      const centerGrad = ctx.createLinearGradient(cx-span*.5,cy,cx+span*.5,cy);
      centerGrad.addColorStop(0,`rgba(${main.join(',')},0)`);
      centerGrad.addColorStop(.28,`rgba(${main.join(',')},.14)`);
      centerGrad.addColorStop(.5,`rgba(${main.join(',')},.45)`);
      centerGrad.addColorStop(.72,`rgba(${main.join(',')},.14)`);
      centerGrad.addColorStop(1,`rgba(${main.join(',')},0)`);
      ctx.strokeStyle = centerGrad;
      ctx.lineWidth = .9;
      ctx.beginPath();ctx.moveTo(cx-span*.5,cy);ctx.lineTo(cx+span*.5,cy);ctx.stroke();
      for (let i=0;i<45;i++) {
        const seed = i*2.399963;
        const rx = (.36 + i%7*.102)*radius;
        const xx = cx + Math.sin(seed+t*.065*(i%2?1:-1))*rx*1.62;
        const yy = cy + Math.cos(seed*.89 +t*.052)*rx*.81;
        const f = (1+Math.sin(t*1.1 +i*1.2))/2;
        ctx.fillStyle = `rgba(${i%5===0?secondary.join(','):main.join(',')},${.12+f*.23})`;
        ctx.beginPath();ctx.arc(xx,yy,i%8===0?1.75:.8,0,PI2);ctx.fill();
      }
      ctx.beginPath();ctx.arc(cx,cy,3.4+Math.sin(t*1.5)*.7,0,PI2);
      ctx.fillStyle = `rgba(${main.join(',')},.96)`;
      ctx.shadowBlur = 23;ctx.shadowColor=`rgba(${main.join(',')},.8)`;
      ctx.fill();ctx.shadowBlur=0;
    };
    const animate = (now: number) => {
      if (!visible || prefersReduced) return;
      if (now - last >= 1000 / 30) {
        t += Math.min(.07,(now-last)/1000 || .033);
        last = now;
        draw();
      }
      frame = requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      if (visible && !prefersReduced) { last = performance.now(); frame=requestAnimationFrame(animate); }
      if (visible && prefersReduced) draw();
    }, { rootMargin: '100px' });
    const onVisibility = () => {
      visible = !document.hidden && canvas.getBoundingClientRect().bottom >= 0 && canvas.getBoundingClientRect().top < innerHeight;
      if (frame) {cancelAnimationFrame(frame);frame=0;}
      if (visible && !prefersReduced) {last=performance.now();frame=requestAnimationFrame(animate);}
    };
    observer.observe(canvas);
    document.addEventListener('visibilitychange',onVisibility);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => { observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);ro.disconnect();if(frame)cancelAnimationFrame(frame); };
  }, []);

  return <canvas ref={canvasRef} className="heyrin-signal-canvas" aria-hidden="true" />;
}

export function VoiceVisualization() {
  const [activeMode, setActiveMode] = useState<SignalMode>('listening');
  const mode = MODES.find((m) => m.id === activeMode) ?? MODES[0];
  const onSelect = useCallback((next: SignalMode) => setActiveMode(next), []);

  return <section id="voice-intelligence" className="heyrin-signal relative overflow-hidden bg-ink-base" aria-labelledby="signal-heading">
    <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none" />
    <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
      <div className="heyrin-section-kicker"><span className="heyrin-kicker-rule" />VOICE INTELLIGENCE <span className="heyrin-index">03 / THE SIGNAL</span></div>
      <div className="heyrin-signal-heading">
        <div><h2 id="signal-heading" className="font-display text-soft">Intelligence<br/><span>you can hear.</span></h2>
        <p>From the first sound to a meaningful answer. Explore the three moments behind a great conversation.</p></div>
        <div className="heyrin-signal-id"><AudioLines size={19}/><span>SIGNAL / HEYRIN 001</span></div>
      </div>

      <div className="heyrin-signal-stage">
        <div className="heyrin-signal-corner top-left">VOICE SYSTEM / VISUAL STUDY</div>
        <div className="heyrin-signal-corner top-right">LIME + VIOLET / AUDIO FLOW</div>
        <SignalCanvas mode={activeMode} />
        <div className="heyrin-signal-stage-center" aria-hidden="true"><span className="heyrin-signal-cross">+</span><span>H / R</span></div>
        <div className="heyrin-signal-stage-bottom"><span className="heyrin-signal-number">{mode.number} / 03</span><span>CONVERSATION FLOW</span><span className="heyrin-signal-track">◦ ◦ ◦</span></div>
      </div>

      <div className="heyrin-signal-modes" role="group" aria-label="Choose a signal state">
        {MODES.map((item) => {
          const active = item.id === activeMode;
          const Icon = item.id === 'listening' ? Mic2 : item.id === 'understanding' ? BrainCircuit : CircleDot;
          return <button key={item.id} type="button" onClick={() => onSelect(item.id)} aria-pressed={active} className={`heyrin-signal-mode ${active ? 'active' : ''}`}>
            <span className="heyrin-signal-mode-number">{item.number} / 03</span>
            <div className="heyrin-signal-mode-label"><Icon size={17}/><strong>{item.label}</strong><ArrowUpRight size={14} /></div>
            <p>{item.description}</p>
          </button>;
        })}
      </div>
      <div className="heyrin-signal-note"><span className="heyrin-live-dot" />{mode.note}<span>INTERACTIVE VISUALIZATION / NOT LIVE AUDIO ANALYSIS</span></div>
    </div>
  </section>;
}
