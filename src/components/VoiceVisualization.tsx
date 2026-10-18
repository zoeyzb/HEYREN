import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, AudioLines, BrainCircuit, CircleDot, Mic2, Sparkles } from 'lucide-react';

type SignalMode = 'listening' | 'understanding' | 'responding';

type SignalModeMeta = {
  id: SignalMode;
  number: string;
  label: string;
  description: string;
  note: string;
  short: string;
  metric: string;
};

const MODES: SignalModeMeta[] = [
  { id: 'listening', number: '01', label: 'Listening', description: 'Every great response starts by hearing what matters.', note: 'VOICE INPUT / CAPTURE', short: 'INPUT', metric: 'SIGNAL DETECTED' },
  { id: 'understanding', number: '02', label: 'Understanding', description: 'Context and intent turn a question into a clear next step.', note: 'INTENT / CONTEXT', short: 'CONTEXT', metric: 'INTENT MAPPED' },
  { id: 'responding', number: '03', label: 'Responding', description: 'The right words, delivered at the right moment.', note: 'VOICE RESPONSE / FLOW', short: 'OUTPUT', metric: 'RESPONSE READY' },
];

const PI2 = Math.PI * 2;
const LIME = [185, 255, 50] as const;
const VIOLET = [161, 107, 255] as const;
const rgba = (color: readonly number[], alpha: number) => `rgba(${color.join(',')},${alpha})`;

function SignalCanvas({ mode }: { mode: SignalMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
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
      size.scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(size.width * size.scale);
      canvas.height = Math.round(size.height * size.scale);
      ctx.setTransform(size.scale, 0, 0, size.scale, 0, 0);
      draw();
    };

    const drawDepthEllipses = (cx: number, cy: number, radius: number, color: readonly number[], count: number, tilt = -0.16) => {
      for (let i = 0; i < count; i += 1) {
        const depth = i / Math.max(1, count - 1);
        ctx.beginPath();
        ctx.ellipse(cx, cy + depth * 8, radius * (0.45 + depth * 0.78), radius * (0.16 + depth * 0.52), tilt, 0, PI2);
        ctx.strokeStyle = rgba(color, 0.17 - depth * 0.035);
        ctx.lineWidth = depth < 0.2 ? 1.1 : 0.65;
        ctx.stroke();
      }
    };

    const drawParticles = (cx: number, cy: number, radius: number, primary: readonly number[], secondary: readonly number[], count: number, speed: number) => {
      for (let i = 0; i < count; i += 1) {
        const seed = i * 2.399963;
        const orbit = radius * (0.42 + (i % 8) * 0.08);
        const angle = seed + t * speed * (i % 2 === 0 ? 1 : -1);
        const x = cx + Math.cos(angle) * orbit * (1.55 + Math.sin(seed) * 0.08);
        const y = cy + Math.sin(angle * 0.92) * orbit * 0.62;
        const flicker = 0.18 + ((Math.sin(t * 1.1 + i * 1.23) + 1) / 2) * 0.3;
        ctx.fillStyle = rgba(i % 5 === 0 ? secondary : primary, flicker);
        ctx.beginPath();
        ctx.arc(x, y, i % 9 === 0 ? 1.8 : 0.75, 0, PI2);
        ctx.fill();
      }
    };

    const draw = () => {
      const w = size.width;
      const h = size.height;
      if (!w || !h) return;
      const phase = modeRef.current;
      const pointer = pointerRef.current;
      const primary = phase === 'understanding' ? VIOLET : LIME;
      const secondary = phase === 'understanding' ? LIME : VIOLET;
      const cx = w / 2 + pointer.x * 15;
      const cy = h * 0.49 + pointer.y * 5;
      const radius = Math.min(w * 0.32, h * 0.38, 185);
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(pointer.x * 5, pointer.y * 2);

      const aura = ctx.createRadialGradient(cx, cy, 6, cx, cy, radius * 1.8);
      aura.addColorStop(0, rgba(primary, phase === 'responding' ? 0.14 : 0.08));
      aura.addColorStop(0.42, rgba(primary, 0.025));
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.ellipse(cx, cy, radius * 1.8, radius * 1.28, 0, 0, PI2); ctx.fill();

      drawDepthEllipses(cx, cy, radius, secondary, phase === 'understanding' ? 7 : 5, phase === 'responding' ? -0.28 : -0.16);
      drawParticles(cx, cy, radius, primary, secondary, phase === 'understanding' ? 58 : 42, phase === 'responding' ? 0.11 : 0.055);

      if (phase === 'listening') {
        for (let ring = 0; ring < 4; ring += 1) {
          const pulse = (Math.sin(t * 1.15 - ring * 0.8) + 1) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, radius * (0.12 + ring * 0.1 + pulse * 0.025), radius * (0.12 + ring * 0.07 + pulse * 0.018), -0.12, 0, PI2);
          ctx.strokeStyle = rgba(primary, 0.15 + pulse * 0.14);
          ctx.lineWidth = ring === 0 ? 1.2 : 0.7;
          ctx.stroke();
        }
        ctx.beginPath();
        for (let k = 0; k <= 160; k += 1) {
          const p = k / 160;
          const x = cx + (p - 0.5) * radius * 2.55;
          const envelope = Math.pow(Math.max(0, 1 - Math.abs(p - 0.5) * 1.8), 1.7);
          const y = cy + Math.sin(p * 34 + t * 3.4) * (10 + Math.sin(p * 11) * 5) * envelope;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(primary, 0.72); ctx.lineWidth = 1.2; ctx.stroke();
      }

      if (phase === 'understanding') {
        const nodes = Array.from({ length: 8 }, (_, i) => {
          const angle = i * PI2 / 8 + t * 0.12;
          const orbit = radius * (0.54 + (i % 2) * 0.12);
          return { x: cx + Math.cos(angle) * orbit * 1.5, y: cy + Math.sin(angle) * orbit * 0.62 };
        });
        nodes.forEach((node, i) => {
          const target = nodes[(i + 3) % nodes.length];
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = rgba(i % 2 ? secondary : primary, 0.23); ctx.lineWidth = 0.7; ctx.stroke();
          ctx.beginPath(); ctx.arc(node.x, node.y, i % 3 === 0 ? 3 : 1.8, 0, PI2);
          ctx.fillStyle = rgba(i % 2 ? secondary : primary, 0.8); ctx.shadowBlur = 12; ctx.shadowColor = rgba(primary, 0.45); ctx.fill(); ctx.shadowBlur = 0;
        });
        ctx.beginPath(); ctx.arc(cx, cy, radius * 0.2 + Math.sin(t * 1.4) * 2, 0, PI2);
        ctx.fillStyle = rgba(primary, 0.13); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, PI2); ctx.fillStyle = rgba(primary, 0.95); ctx.shadowBlur = 24; ctx.shadowColor = rgba(primary, 0.8); ctx.fill(); ctx.shadowBlur = 0;
      }

      if (phase === 'responding') {
        for (let i = 0; i < 8; i += 1) {
          const p = (i / 8 + (t * 0.12) % 1) % 1;
          const x = cx + (p - 0.5) * radius * 3.3;
          const y = cy + Math.sin(p * 18 + t * 2) * radius * 0.22;
          ctx.beginPath(); ctx.arc(x, y, 1.4 + (1 - p) * 2.6, 0, PI2);
          ctx.fillStyle = rgba(i % 3 === 0 ? secondary : primary, 0.16 + (1 - p) * 0.55); ctx.fill();
        }
        for (let ray = 0; ray < 13; ray += 1) {
          const angle = ray * PI2 / 13 + t * 0.08;
          const inner = radius * 0.18;
          const outer = radius * (0.85 + (ray % 3) * 0.16);
          ctx.beginPath(); ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner * 0.54); ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer * 0.54);
          ctx.strokeStyle = rgba(ray % 4 === 0 ? secondary : primary, 0.11 + (ray % 3) * 0.025); ctx.lineWidth = ray % 4 === 0 ? 1.05 : 0.55; ctx.stroke();
        }
        const pulse = radius * (0.16 + ((Math.sin(t * 1.7) + 1) / 2) * 0.12);
        ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, PI2); ctx.strokeStyle = rgba(primary, 0.72); ctx.lineWidth = 1.4; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, PI2); ctx.fillStyle = rgba(primary, 0.96); ctx.shadowBlur = 25; ctx.shadowColor = rgba(primary, 0.8); ctx.fill(); ctx.shadowBlur = 0;
      }
      ctx.restore();
    };

    const animate = (now: number) => {
      if (!visible || prefersReduced) return;
      if (now - last >= 1000 / 30) { t += Math.min(0.08, (now - last) / 1000 || 0.033); last = now; draw(); }
      frame = requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      if (visible && !prefersReduced) { last = performance.now(); frame = requestAnimationFrame(animate); }
      if (visible && prefersReduced) draw();
    }, { rootMargin: '120px' });
    const onVisibility = () => {
      visible = !document.hidden && canvas.getBoundingClientRect().bottom >= 0 && canvas.getBoundingClientRect().top < innerHeight;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      if (visible && !prefersReduced) { last = performance.now(); frame = requestAnimationFrame(animate); }
    };
    const onPointerMove = (event: PointerEvent) => { const rect = canvas.getBoundingClientRect(); pointerRef.current = { x: ((event.clientX - rect.left) / rect.width - 0.5) * 2, y: ((event.clientY - rect.top) / rect.height - 0.5) * 2, active: true }; };
    const onPointerLeave = () => { pointerRef.current = { x: 0, y: 0, active: false }; };
    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });
    observer.observe(canvas); document.addEventListener('visibilitychange', onVisibility);
    const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); canvas.removeEventListener('pointermove', onPointerMove); canvas.removeEventListener('pointerleave', onPointerLeave); ro.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return <canvas ref={canvasRef} className="heyrin-signal-canvas" aria-hidden="true" />;
}

export function VoiceVisualization() {
  const [activeMode, setActiveMode] = useState<SignalMode>('listening');
  const mode = MODES.find((item) => item.id === activeMode) ?? MODES[0];
  const onSelect = useCallback((next: SignalMode) => setActiveMode(next), []);

  return <section id="voice-intelligence" className={`heyrin-signal relative overflow-hidden bg-ink-base mode-${activeMode}`} aria-labelledby="signal-heading">
    <div className="absolute inset-0 tech-grid opacity-10 pointer-events-none" />
    <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10">
      <div className="heyrin-section-kicker"><span className="heyrin-kicker-rule" />VOICE INTELLIGENCE <span className="heyrin-index">03 / THE SIGNAL</span></div>
      <div className="heyrin-signal-heading">
        <div><h2 id="signal-heading" className="font-display text-soft">Intelligence<br/><span>you can hear.</span></h2><p>Three quiet decisions sit between a voice and a useful answer. Move through the signal to see the system change its shape.</p></div>
        <div className="heyrin-signal-id"><AudioLines size={19}/><span>SIGNAL / HEYRIN 001</span></div>
      </div>
      <div className="heyrin-signal-stage" data-mode={activeMode}>
        <div className="heyrin-signal-corner top-left">VOICE SYSTEM / VISUAL STUDY</div><div className="heyrin-signal-corner top-right">LIME + VIOLET / AUDIO FLOW</div>
        <SignalCanvas mode={activeMode} />
        <div className="heyrin-signal-stage-center" aria-hidden="true"><span className="heyrin-signal-cross">+</span><Sparkles size={13} /><span>{mode.short}</span><small>{mode.metric}</small></div>
        <div className="heyrin-signal-stage-bottom"><span className="heyrin-signal-number">{mode.number} / 03</span><span>CONVERSATION FLOW</span><span className="heyrin-signal-track">◦ ◦ ◦</span></div>
      </div>
      <div className="heyrin-signal-modes" role="group" aria-label="Choose a signal state">
        {MODES.map((item) => {
          const active = item.id === activeMode;
          const Icon = item.id === 'listening' ? Mic2 : item.id === 'understanding' ? BrainCircuit : CircleDot;
          return <button key={item.id} type="button" onClick={() => onSelect(item.id)} aria-pressed={active} className={`heyrin-signal-mode ${active ? 'active' : ''}`}><span className="heyrin-signal-mode-number">{item.number} / 03</span><div className="heyrin-signal-mode-label"><Icon size={17}/><strong>{item.label}</strong><ArrowUpRight size={14} /></div><p>{item.description}</p><span className="heyrin-signal-mode-note">{item.note}</span></button>;
        })}
      </div>
      <div className="heyrin-signal-note"><span className="heyrin-live-dot" />{mode.note}<span>INTERACTIVE VISUALIZATION / NOT LIVE AUDIO ANALYSIS</span></div>
    </div>
  </section>;
}
