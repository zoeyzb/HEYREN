import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function ProcessingRings() {
  const ring1 = useRef<THREE.Mesh>(null); const ring2 = useRef<THREE.Mesh>(null); const ring3 = useRef<THREE.Mesh>(null);
  useFrame((state) => { const time = state.clock.elapsedTime; if (ring1.current) ring1.current.rotation.z = time * 0.22; if (ring2.current) ring2.current.rotation.z = -time * 0.14; if (ring3.current) ring3.current.rotation.z = time * 0.09; });
  return <group position={[0, -0.3, -0.65]}>
    <mesh ref={ring1} rotation={[Math.PI / 2.45, 0, 0]}><torusGeometry args={[2.25, 0.009, 8, 96]} /><meshBasicMaterial color="#b9ff32" transparent opacity={0.2} toneMapped={false} /></mesh>
    <mesh ref={ring2} rotation={[Math.PI / 2.2, 0.3, 0]}><torusGeometry args={[2.72, 0.006, 8, 96]} /><meshBasicMaterial color="#a16bff" transparent opacity={0.19} toneMapped={false} /></mesh>
    <mesh ref={ring3} rotation={[Math.PI / 2.8, -0.2, 0]}><torusGeometry args={[3.18, 0.004, 8, 96]} /><meshBasicMaterial color="#929a96" transparent opacity={0.08} toneMapped={false} /></mesh>
  </group>;
}

export function SignalParticles({ count = 42 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => { const data = new Float32Array(count * 3); for (let i = 0; i < count; i += 1) { const angle = (i / count) * Math.PI * 2; const radius = 1.8 + ((i * 17) % 100) / 100 * 1.65; data[i * 3] = Math.cos(angle) * radius; data[i * 3 + 1] = ((i * 29) % 100) / 100 * 3 - 1.5; data[i * 3 + 2] = Math.sin(angle) * radius - 0.8; } return data; }, [count]);
  useFrame((state) => { if (!points.current) return; const time = state.clock.elapsedTime; const attribute = points.current.geometry.attributes.position as THREE.BufferAttribute; const data = attribute.array as Float32Array; for (let i = 0; i < count; i += 1) { const angle = time * 0.06 + (i / count) * Math.PI * 2; const radius = 2.1 + Math.sin(time * 0.35 + i * 0.7) * 0.35 + (i % 5) * 0.17; data[i * 3] = Math.cos(angle) * radius; data[i * 3 + 1] = Math.sin(time * 0.25 + i * 0.62) * 1.45; data[i * 3 + 2] = Math.sin(angle) * radius - 0.65; } attribute.needsUpdate = true; });
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} /></bufferGeometry><pointsMaterial size={0.035} color="#b9ff32" transparent opacity={0.58} sizeAttenuation toneMapped={false} /></points>;
}

export function VoiceWaveform3D({ speaking = false, listening = false }: { speaking?: boolean; listening?: boolean }) {
  const group = useRef<THREE.Group>(null); const bars = useRef<THREE.Mesh[]>([]); const barCount = 24;
  useFrame((state) => { if (!group.current) return; const time = state.clock.elapsedTime; const speed = speaking ? 7 : listening ? 3.5 : 1.2; const amplitude = speaking ? 0.72 : listening ? 0.42 : 0.11; bars.current.forEach((bar, index) => { if (!bar) return; const phase = (index / barCount) * Math.PI * 2; const height = amplitude * (Math.sin(time * speed + phase) * 0.5 + 0.5) + 0.08; bar.scale.y = height; (bar.material as THREE.MeshBasicMaterial).opacity = 0.22 + height * 0.4; }); });
  return <group ref={group} position={[0, -2.45, 0]}>{Array.from({ length: barCount }).map((_, index) => { const angle = (index / barCount) * Math.PI * 2; const radius = 1.62; return <mesh key={index} ref={(element) => { if (element) bars.current[index] = element; }} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]} rotation={[0, -angle, 0]}><boxGeometry args={[0.035, 0.28, 0.035]} /><meshBasicMaterial color={index % 4 === 0 ? '#a16bff' : '#b9ff32'} transparent opacity={0.42} toneMapped={false} /></mesh>; })}</group>;
}

export function FloatingIndicators() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => { if (!group.current) return; const time = state.clock.elapsedTime; group.current.children.forEach((child, index) => { child.position.y = Math.sin(time * 0.42 + index * 1.25) * 0.28 + 0.46; child.rotation.z = time * 0.08 + index; }); });
  return <group ref={group}>
    <mesh position={[-1.9, 0.5, 0.5]}><ringGeometry args={[0.08, 0.1, 16]} /><meshBasicMaterial color="#b9ff32" transparent opacity={0.38} toneMapped={false} /></mesh>
    <mesh position={[1.9, 0.28, 0.3]}><ringGeometry args={[0.06, 0.08, 16]} /><meshBasicMaterial color="#a16bff" transparent opacity={0.34} toneMapped={false} /></mesh>
    <mesh position={[-1.55, -0.8, 0.8]}><circleGeometry args={[0.04, 16]} /><meshBasicMaterial color="#b9ff32" transparent opacity={0.52} toneMapped={false} /></mesh>
    <mesh position={[1.62, -0.5, 0.6]}><circleGeometry args={[0.05, 16]} /><meshBasicMaterial color="#a16bff" transparent opacity={0.4} toneMapped={false} /></mesh>
  </group>;
}
