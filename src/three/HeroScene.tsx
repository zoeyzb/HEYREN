import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { FloatingIndicators, ProcessingRings, SignalParticles, VoiceWaveform3D } from './Effects';
import { RobotCharacter } from './RobotCharacter';

interface HeroSceneProps { listening?: boolean; speaking?: boolean; activated?: boolean; }

function SceneContent({ listening, speaking, activated }: HeroSceneProps) {
  return (
    <>
      <color attach="background" args={['#050607']} />
      <fog attach="fog" args={['#050607', 5.5, 13]} />
      <ambientLight intensity={0.42} color="#71807d" />
      <hemisphereLight intensity={0.38} color="#d7e2dc" groundColor="#080a0c" />
      <directionalLight position={[0, 3, 5]} intensity={1.2} color="#dce9e6" />
      <spotLight position={[3.8, 5.2, 4.5]} angle={0.34} penumbra={0.8} intensity={2.1} color="#d6ff9a" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-4.5, 2.5, 2]} angle={0.44} penumbra={0.9} intensity={2.4} color="#8655ff" />
      <pointLight position={[0, 0.4, 5]} intensity={1.7} color="#b8c9c9" distance={10} />
      <pointLight position={[2.2, -1.8, 2.8]} intensity={1.6} color="#b9ff32" distance={7} />
      <pointLight position={[-2.5, 1.2, -2]} intensity={2.4} color="#7d43ff" distance={9} />
      <mesh position={[0, -0.2, -1.45]}>
        <circleGeometry args={[2.55, 64]} />
        <meshBasicMaterial color="#111a1d" transparent opacity={0.48} />
      </mesh>
      <mesh position={[0, -0.2, -1.42]}>
        <ringGeometry args={[2.28, 2.3, 64]} />
        <meshBasicMaterial color="#6d2cff" transparent opacity={0.22} toneMapped={false} />
      </mesh>
      <RobotCharacter listening={listening} speaking={speaking} activated={activated} />
      <ProcessingRings />
      <SignalParticles count={42} />
      <VoiceWaveform3D speaking={speaking} listening={listening} />
      <FloatingIndicators />
    </>
  );
}

export function HeroScene({ listening, speaking, activated }: HeroSceneProps) {
  return (
    <Canvas shadows dpr={[1, 1.35]} camera={{ position: [0, 0, 6.4], fov: 42 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', stencil: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }} style={{ background: 'transparent' }} frameloop="always">
      <Suspense fallback={null}>
        <SceneContent listening={listening} speaking={speaking} activated={activated} />
      </Suspense>
    </Canvas>
  );
}
