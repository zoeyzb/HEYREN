import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function VoiceOrb() {
  const mesh = useRef<THREE.Mesh>(null);
  const innerMesh = useRef<THREE.Mesh>(null);
  const wireframe = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 200;
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 0.8;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.15;
      mesh.current.rotation.x = Math.sin(t * 0.2) * 0.2;
      const scale = 1 + Math.sin(t * 1.5) * 0.04;
      mesh.current.scale.setScalar(scale);
    }
    if (innerMesh.current) {
      innerMesh.current.rotation.y = -t * 0.25;
      innerMesh.current.rotation.z = t * 0.1;
    }
    if (wireframe.current) {
      wireframe.current.rotation.y = t * 0.1;
      wireframe.current.rotation.x = -t * 0.08;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.08;
      const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const baseR = 1.5 + Math.sin(t * 0.5 + i * 0.1) * 0.3;
        const theta = Math.atan2(arr[i * 3 + 2], arr[i * 3]);
        const phi = Math.acos(arr[i * 3 + 1] / Math.sqrt(arr[i*3]**2 + arr[i*3+1]**2 + arr[i*3+2]**2));
        arr[i * 3] = baseR * Math.sin(phi) * Math.cos(theta);
        arr[i * 3 + 2] = baseR * Math.sin(phi) * Math.sin(theta);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Outer luminous sphere */}
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.2, 4]} />
        <meshStandardMaterial
          color="#050607"
          emissive="#B9FF32"
          emissiveIntensity={0.15}
          metalness={0.7}
          roughness={0.3}
          wireframe={false}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh ref={innerMesh}>
        <icosahedronGeometry args={[0.65, 2]} />
        <meshBasicMaterial color="#B9FF32" transparent opacity={0.12} wireframe />
      </mesh>

      {/* Wireframe shell */}
      <mesh ref={wireframe}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color="#A16BFF" transparent opacity={0.15} wireframe />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} count={particleCount} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#B9FF32" transparent opacity={0.7} sizeAttenuation toneMapped={false} />
      </points>

      {/* Frequency rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.005, 8, 80]} />
        <meshBasicMaterial color="#B9FF32" transparent opacity={0.2} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[2.0, 0.003, 8, 80]} />
        <meshBasicMaterial color="#A16BFF" transparent opacity={0.15} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function VoiceOrbScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[2, 2, 2]} intensity={2} color="#B9FF32" />
        <pointLight position={[-2, -1, 1]} intensity={1.5} color="#A16BFF" />
        <VoiceOrb />
        <fog attach="fog" args={['#050607', 3, 8]} />
      </Suspense>
    </Canvas>
  );
}
