import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface RobotProps { listening?: boolean; speaking?: boolean; activated?: boolean; }

export function RobotCharacter({ listening = false, speaking = false, activated = true }: RobotProps) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftEye = useRef<THREE.MeshStandardMaterial>(null);
  const rightEye = useRef<THREE.MeshStandardMaterial>(null);
  const core = useRef<THREE.MeshStandardMaterial>(null);
  const { pointer } = useThree();

  const graphite = useMemo(() => new THREE.MeshStandardMaterial({ color: '#66767a', metalness: 0.42, roughness: 0.32 }), []);
  const titanium = useMemo(() => new THREE.MeshStandardMaterial({ color: '#aab6b8', metalness: 0.56, roughness: 0.27 }), []);
  const shadow = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2b393d', metalness: 0.5, roughness: 0.34 }), []);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10181b', metalness: 0.68, roughness: 0.12 }), []);
  const lime = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9ff32', emissive: '#b9ff32', emissiveIntensity: 1.7, roughness: 0.3, toneMapped: false }), []);
  const violet = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8860d8', emissive: '#5d2dba', emissiveIntensity: 0.65, roughness: 0.34, toneMapped: false }), []);

  useFrame((state, delta) => {
    if (!group.current || !head.current) return;
    const time = state.clock.elapsedTime;
    group.current.position.y = Math.sin(time * 0.65) * 0.035;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.12, 3.5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.025, 3.5, delta);
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, pointer.x * 0.16, 4, delta);
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -pointer.y * 0.08, 4, delta);
    const pulse = listening ? 1.1 + Math.sin(time * 5) * 0.32 : speaking ? 1.1 + Math.sin(time * 8) * 0.24 : 0.95 + Math.sin(time * 1.3) * 0.08;
    if (leftEye.current) leftEye.current.emissiveIntensity = activated ? pulse : 0.15;
    if (rightEye.current) rightEye.current.emissiveIntensity = activated ? pulse : 0.15;
    if (core.current) core.current.emissiveIntensity = speaking ? 0.8 + Math.sin(time * 7) * 0.18 : 0.65;
  });

  return (
    <group ref={group} position={[0, 0.02, 0]} scale={0.98}>
      <group ref={head} position={[0, 0.85, 0]}>
        <mesh scale={[0.84, 0.98, 0.8]} castShadow material={graphite}><sphereGeometry args={[0.82, 28, 20]} /></mesh>
        <mesh position={[0, -0.05, 0.66]} scale={[0.67, 0.27, 0.065]} material={glass}><sphereGeometry args={[1, 24, 12]} /></mesh>
        <mesh position={[-0.285, 0.01, 0.735]} rotation={[0, 0, -0.08]} scale={[0.18, 0.035, 0.018]}><sphereGeometry args={[1, 16, 8]} /><meshStandardMaterial ref={leftEye} color="#b9ff32" emissive="#b9ff32" emissiveIntensity={1.2} toneMapped={false} /></mesh>
        <mesh position={[0.285, 0.01, 0.735]} rotation={[0, 0, 0.08]} scale={[0.18, 0.035, 0.018]}><sphereGeometry args={[1, 16, 8]} /><meshStandardMaterial ref={rightEye} color="#b9ff32" emissive="#b9ff32" emissiveIntensity={1.2} toneMapped={false} /></mesh>
        <mesh position={[0, -0.22, 0.735]} scale={[0.13, 0.014, 0.012]} material={violet}><sphereGeometry args={[1, 12, 6]} /></mesh>
        <mesh position={[0, 0.72, 0]} scale={[0.11, 0.16, 0.11]} material={shadow}><sphereGeometry args={[1, 16, 10]} /></mesh>
        <mesh position={[0, 0.87, 0]} scale={0.045} material={lime}><sphereGeometry args={[1, 12, 8]} /></mesh>
      </group>

      <mesh position={[0, 0.12, 0]} material={shadow}><cylinderGeometry args={[0.16, 0.21, 0.24, 16]} /></mesh>
      <mesh position={[0, -0.68, 0]} scale={[0.9, 1.08, 0.55]} castShadow material={graphite}><sphereGeometry args={[1, 28, 18]} /></mesh>
      <mesh position={[0, -0.72, 0.52]} scale={[0.56, 0.47, 0.065]} material={glass}><sphereGeometry args={[1, 24, 12]} /></mesh>
      <mesh position={[0, -0.75, 0.59]} scale={0.12}><sphereGeometry args={[1, 18, 10]} /><meshStandardMaterial ref={core} color="#8060c5" emissive="#5d2dba" emissiveIntensity={0.65} toneMapped={false} /></mesh>
      <mesh position={[0, -0.75, 0.6]} rotation={[Math.PI / 2, 0, 0]} material={violet}><torusGeometry args={[0.18, 0.014, 8, 24]} /></mesh>
      <mesh position={[-0.74, -0.35, 0]} scale={[0.48, 0.38, 0.52]} rotation={[0, 0, -0.12]} material={titanium}><sphereGeometry args={[1, 20, 14]} /></mesh>
      <mesh position={[0.74, -0.35, 0]} scale={[0.48, 0.38, 0.52]} rotation={[0, 0, 0.12]} material={titanium}><sphereGeometry args={[1, 20, 14]} /></mesh>
      <mesh position={[-0.92, -0.9, 0]} scale={[0.2, 0.58, 0.22]} material={shadow}><sphereGeometry args={[1, 18, 12]} /></mesh>
      <mesh position={[0.92, -0.9, 0]} scale={[0.2, 0.58, 0.22]} material={shadow}><sphereGeometry args={[1, 18, 12]} /></mesh>
      <mesh position={[0, -1.4, 0.38]} scale={[0.35, 0.025, 0.018]} material={lime}><sphereGeometry args={[1, 12, 6]} /></mesh>
    </group>
  );
}
