import { RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface RobotProps { listening?: boolean; speaking?: boolean; activated?: boolean; }

export function RobotCharacter({ listening = false, speaking = false, activated = true }: RobotProps) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftEye = useRef<THREE.MeshStandardMaterial>(null);
  const rightEye = useRef<THREE.MeshStandardMaterial>(null);
  const chestCore = useRef<THREE.MeshStandardMaterial>(null);
  const coreRing = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  const graphite = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#4b5b60', metalness: 0.72, roughness: 0.3, clearcoat: 0.52, clearcoatRoughness: 0.2 }), []);
  const titanium = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#9ba8ac', metalness: 0.82, roughness: 0.25, clearcoat: 0.66, clearcoatRoughness: 0.16 }), []);
  const darkMetal = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#273337', metalness: 0.8, roughness: 0.27, clearcoat: 0.42, clearcoatRoughness: 0.18 }), []);
  const violet = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9b62ff', emissive: '#6d2cff', emissiveIntensity: 1.7, metalness: 0.42, roughness: 0.24, toneMapped: false }), []);
  const lime = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9ff32', emissive: '#b9ff32', emissiveIntensity: 2.2, metalness: 0.25, roughness: 0.25, toneMapped: false }), []);
  const visor = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#0b1112', metalness: 0.58, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.08, transmission: 0.08 }), []);

  useFrame((state, delta) => {
    if (!group.current || !head.current) return;
    const time = state.clock.elapsedTime;
    group.current.position.y = Math.sin(time * 0.82) * 0.08;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, Math.sin(time * 0.28) * 0.035 + pointer.x * 0.055, 4, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.025, 4, delta);
    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -pointer.y * 0.12, 5, delta);
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, pointer.x * 0.22, 5, delta);

    const statePulse = listening ? Math.sin(time * 6) * 0.45 + 0.65 : speaking ? Math.sin(time * 12) * 0.4 + 0.82 : Math.sin(time * 1.6) * 0.1 + 0.92;
    const glow = activated ? statePulse : 0.18;
    if (leftEye.current) leftEye.current.emissiveIntensity = glow * 2.7;
    if (rightEye.current) rightEye.current.emissiveIntensity = glow * 2.7;
    if (chestCore.current) chestCore.current.emissiveIntensity = 1.2 + glow * 1.8;
    if (coreRing.current) {
      coreRing.current.rotation.z = time * (speaking ? 1.15 : 0.42);
      coreRing.current.scale.setScalar(speaking ? 1 + Math.sin(time * 8) * 0.075 : 1 + Math.sin(time * 2) * 0.025);
    }
  });

  return (
    <group ref={group} position={[0.1, 0.08, 0]} scale={0.98}>
      <group ref={head} position={[0, 0.58, 0]}>
        <RoundedBox args={[1.62, 1.28, 1.3]} radius={0.3} smoothness={5} castShadow receiveShadow material={graphite} />
        <RoundedBox args={[1.34, 0.82, 0.12]} radius={0.14} smoothness={4} position={[0, -0.03, 0.67]} material={visor} />
        <mesh position={[0, 0.58, 0.02]} castShadow material={titanium}><cylinderGeometry args={[0.34, 0.42, 0.1, 32]} /></mesh>
        <mesh position={[0, 0.67, 0.02]} material={darkMetal}><cylinderGeometry args={[0.06, 0.09, 0.18, 16]} /></mesh>
        <mesh position={[0, 0.79, 0.02]} material={lime}><sphereGeometry args={[0.075, 18, 18]} /></mesh>

        <RoundedBox args={[0.43, 0.115, 0.045]} radius={0.05} smoothness={4} position={[-0.31, 0.02, 0.755]}><meshStandardMaterial ref={leftEye} color="#b9ff32" emissive="#b9ff32" emissiveIntensity={2.6} toneMapped={false} /></RoundedBox>
        <RoundedBox args={[0.43, 0.115, 0.045]} radius={0.05} smoothness={4} position={[0.31, 0.02, 0.755]}><meshStandardMaterial ref={rightEye} color="#b9ff32" emissive="#b9ff32" emissiveIntensity={2.6} toneMapped={false} /></RoundedBox>
        <mesh position={[-0.31, 0.02, 0.775]}><boxGeometry args={[0.21, 0.018, 0.01]} /><meshBasicMaterial color="#f4ffc7" toneMapped={false} /></mesh>
        <mesh position={[0.31, 0.02, 0.775]}><boxGeometry args={[0.21, 0.018, 0.01]} /><meshBasicMaterial color="#f4ffc7" toneMapped={false} /></mesh>

        <mesh position={[-0.88, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={darkMetal}><cylinderGeometry args={[0.27, 0.27, 0.25, 32]} /></mesh>
        <mesh position={[-0.89, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} material={violet}><torusGeometry args={[0.18, 0.025, 12, 32]} /></mesh>
        <mesh position={[0.88, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={darkMetal}><cylinderGeometry args={[0.27, 0.27, 0.25, 32]} /></mesh>
        <mesh position={[0.89, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} material={violet}><torusGeometry args={[0.18, 0.025, 12, 32]} /></mesh>
        <RoundedBox args={[0.88, 0.22, 0.48]} radius={0.09} smoothness={4} position={[0, -0.58, 0.19]} material={darkMetal} />
        <RoundedBox args={[0.42, 0.035, 0.025]} radius={0.012} smoothness={2} position={[0, -0.52, 0.45]} material={violet} />
        <mesh position={[0, -0.78, 0]} material={darkMetal}><cylinderGeometry args={[0.2, 0.25, 0.26, 24]} /></mesh>
      </group>

      <RoundedBox args={[2.42, 0.64, 1.12]} radius={0.26} smoothness={5} position={[0, -0.98, 0]} castShadow receiveShadow material={titanium} />
      <RoundedBox args={[1.92, 1.16, 0.98]} radius={0.28} smoothness={5} position={[0, -1.63, 0]} castShadow receiveShadow material={graphite} />
      <RoundedBox args={[1.44, 0.78, 0.09]} radius={0.13} smoothness={4} position={[0, -1.56, 0.53]} material={darkMetal} />
      <mesh position={[0, -1.56, 0.59]} ref={coreRing}><torusGeometry args={[0.27, 0.045, 14, 44]} /><meshStandardMaterial color="#b9ff32" emissive="#b9ff32" emissiveIntensity={1.8} toneMapped={false} /></mesh>
      <mesh position={[0, -1.56, 0.6]}><circleGeometry args={[0.19, 32]} /><meshPhysicalMaterial color="#101518" metalness={0.9} roughness={0.12} /></mesh>
      <mesh position={[0, -1.56, 0.615]}><circleGeometry args={[0.09, 24]} /><meshStandardMaterial ref={chestCore} color="#9b62ff" emissive="#6d2cff" emissiveIntensity={2} toneMapped={false} /></mesh>

      <mesh position={[-1.18, -1.04, 0]} rotation={[0, 0, -0.1]} castShadow material={darkMetal}><sphereGeometry args={[0.4, 24, 16]} /></mesh>
      <mesh position={[1.18, -1.04, 0]} rotation={[0, 0, 0.1]} castShadow material={darkMetal}><sphereGeometry args={[0.4, 24, 16]} /></mesh>
      <mesh position={[-1.18, -1.04, 0.32]} material={violet}><boxGeometry args={[0.22, 0.045, 0.025]} /></mesh>
      <mesh position={[1.18, -1.04, 0.32]} material={violet}><boxGeometry args={[0.22, 0.045, 0.025]} /></mesh>
      <mesh position={[0, -2.13, 0.43]} material={lime}><boxGeometry args={[0.52, 0.025, 0.025]} /></mesh>
      <mesh position={[-0.38, -2.21, 0.43]} material={violet}><boxGeometry args={[0.16, 0.025, 0.025]} /></mesh>
      <mesh position={[0.38, -2.21, 0.43]} material={violet}><boxGeometry args={[0.16, 0.025, 0.025]} /></mesh>
      <pointLight position={[0, 0.63, 0.9]} color="#b9ff32" intensity={1.6} distance={2.5} />
      <pointLight position={[0, -1.55, 0.7]} color="#9b62ff" intensity={1.2} distance={2.8} />
    </group>
  );
}
