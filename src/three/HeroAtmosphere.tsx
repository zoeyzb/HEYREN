import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { FloatingIndicators, ProcessingRings, SignalParticles, VoiceWaveform3D } from './Effects';

interface HeroAtmosphereProps {
  listening?: boolean;
  speaking?: boolean;
  active?: boolean;
  /** Phones: 1x pixel ratio and fewer particles. */
  lite?: boolean;
  /** Fires once the render loop is actually running (first frame), not just when the canvas was created. */
  onCreated?: () => void;
}

function FirstFrame({ onFrame }: { onFrame?: () => void }) {
  const done = useRef(false);
  // Default priority (0) so R3F keeps rendering automatically. The caller waits two more animation frames
  // before swapping, so the first frame is on screen by then.
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onFrame?.();
  });
  return null;
}

export function HeroAtmosphere({ listening, speaking, active = true, lite = false, onCreated }: HeroAtmosphereProps) {
  return (
    <Canvas
      dpr={lite ? 1 : [1, 1.2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ alpha: true, antialias: false, powerPreference: lite ? 'default' : 'high-performance', stencil: false, depth: false }}
      style={{ background: 'transparent' }}
    >
      <ProcessingRings />
      <SignalParticles count={lite ? 20 : 42} />
      <VoiceWaveform3D speaking={speaking} listening={listening} />
      <FloatingIndicators />
      <FirstFrame onFrame={onCreated} />
    </Canvas>
  );
}
