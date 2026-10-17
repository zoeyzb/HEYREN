import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { RobotCharacter } from './RobotCharacter';

interface HeroSceneProps {
  listening?: boolean;
  speaking?: boolean;
  activated?: boolean;
  active?: boolean;
  onReady?: () => void;
}

function SceneContent({ listening, speaking, activated }: HeroSceneProps) {
  return (
    <>
      <color attach="background" args={['#050607']} />
      <ambientLight intensity={0.58} color="#9aa7a4" />
      <hemisphereLight intensity={0.42} color="#d8e2df" groundColor="#0b0d0f" />
      <directionalLight position={[2.8, 4.5, 4]} intensity={1.35} color="#e3ece7" />
      <pointLight position={[0, 0.5, 4.6]} intensity={1.45} color="#c4d0cb" distance={9} />
      <pointLight position={[-2.6, 1.7, 2.8]} intensity={1.15} color="#7552b6" distance={7} />
      <pointLight position={[2.5, -1.4, 3.2]} intensity={0.85} color="#b9ff32" distance={6} />
      <mesh position={[0, -0.15, -1.4]}>
        <circleGeometry args={[2.35, 40]} />
        <meshBasicMaterial color="#0c1315" transparent opacity={0.54} />
      </mesh>
      <RobotCharacter listening={listening} speaking={speaking} activated={activated} />
    </>
  );
}

export function HeroScene({ listening, speaking, activated, active = true, onReady }: HeroSceneProps) {
  const maxDpr = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 1.2);
  return (
    <Canvas
      dpr={[1, maxDpr]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6.2], fov: 38 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance', stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onCreated={() => onReady?.()}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContent listening={listening} speaking={speaking} activated={activated} />
      </Suspense>
    </Canvas>
  );
}
