import { lazy, Suspense } from 'react';
import { useFadeUp } from '@/hooks/useReveal';

const VoiceOrbScene = lazy(() => import('@/three/VoiceOrbScene').then(m => ({ default: m.VoiceOrbScene })));

export function VoiceVisualization() {
  const { ref, visible } = useFadeUp<HTMLDivElement>();

  return (
    <section className="relative py-24 lg:py-36 bg-ink-base overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-15" />
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-lime/4 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet/4 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className={`relative max-w-[900px] mx-auto px-6 text-center fade-up ${visible ? 'visible' : ''}`}>
        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-6 h-px bg-violet/60" />
          <span className="text-xs font-mono tracking-[0.2em] text-violet/80 uppercase">Voice Intelligence Lab</span>
          <div className="w-6 h-px bg-violet/60" />
        </div>

        {/* Heading */}
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-soft tracking-tight mb-4">
          Intelligence you can hear.
        </h2>
        <p className="text-sm text-silver/70 max-w-md mx-auto mb-12">
          A luminous representation of voice processing — frequency, intent, and meaning flowing through the core.
        </p>

        {/* 3D Orb */}
        <div className="relative w-full h-[400px] lg:h-[480px] mb-12">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-lime/20 animate-pulse" />
              </div>
            }
          >
            <VoiceOrbScene />
          </Suspense>

          {/* Frequency bands overlay */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <span
                key={i}
                className="wave-bar"
                style={{
                  animationDelay: `${i * 0.04}s`,
                  animationDuration: `${1 + (i % 3) * 0.3}s`,
                  color: i % 5 === 0 ? '#A16BFF' : '#B9FF32',
                  opacity: 0.3,
                  height: '100%',
                }}
              />
            ))}
          </div>
        </div>

        {/* Technical readout */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { label: 'FREQUENCY', value: '140 Hz' },
            { label: 'INTENT', value: '97.3%' },
            { label: 'LATENCY', value: '0.4s' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-[9px] font-mono tracking-[0.15em] text-silver/40 uppercase mb-1">{item.label}</div>
              <div className="text-sm font-mono text-soft">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
