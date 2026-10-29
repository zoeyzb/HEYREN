import { Canvas } from '@react-three/fiber';
import { FloatingIndicators, ProcessingRings, SignalParticles, VoiceWaveform3D } from './Effects';

interface HeroAtmosphereProps {
  listening?: boolean;
  speaking?: boolean;
  active?: boolean;
}

export function HeroAtmosphere({ listening, speaking, active = true }: HeroAtmosphereProps) {
  return (
    <Canvas
      dpr={[1, 1.2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance', stencil: false, depth: false }}
      style={{ background: 'transparent' }}
    >
      <ProcessingRings />
      <SignalParticles count={42} />
      <VoiceWaveform3D speaking={speaking} listening={listening} />
      <FloatingIndicators />
    </Canvas>
  );
}
