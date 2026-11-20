"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";

const BUBBLES = Array.from({ length: 16 }, (_, i) => ({
  pos: [Math.sin(i * 2.4) * 4.5, ((i * 37) % 10) / 3 - 1, Math.cos(i * 1.7) * 3 - 1],
  size: 0.12 + ((i * 13) % 5) * 0.05,
}));

function Tree(props) {
  return (
    <group {...props}>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.08, 0.1, 0.6]} /><meshStandardMaterial color="#92400e" /></mesh>
      <mesh position={[0, 0.95, 0]}><coneGeometry args={[0.45, 1, 8]} /><meshStandardMaterial color="#16a34a" /></mesh>
    </group>
  );
}

function House({ progress }) {
  const g = useRef();
  useFrame((_, dt) => {
    const p = progress.current;
    const k = Math.min(1, dt * 3);
    g.current.rotation.y += (p * Math.PI * 3 - g.current.rotation.y) * k;
    g.current.position.x += (Math.sin(p * Math.PI * 2) * 2 - g.current.position.x) * k;
    g.current.position.y += (-0.3 + p * 0.6 - g.current.position.y) * k;
  });
  return (
    <group ref={g}>
      <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[3.2, 3.2, 0.1, 48]} /><meshStandardMaterial color="#bbf7d0" /></mesh>
      <mesh position={[0, 0.7, 0]}><boxGeometry args={[2, 1.4, 2]} /><meshStandardMaterial color="#fde68a" /></mesh>
      <mesh position={[0, 1.95, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.7, 1.1, 4]} /><meshStandardMaterial color="#059669" /></mesh>
      <mesh position={[0, 0.4, 1.01]}><boxGeometry args={[0.5, 0.8, 0.05]} /><meshStandardMaterial color="#92400e" /></mesh>
      <mesh position={[-0.65, 0.95, 1.01]}><boxGeometry args={[0.4, 0.4, 0.05]} /><meshStandardMaterial color="#93c5fd" /></mesh>
      <mesh position={[0.65, 0.95, 1.01]}><boxGeometry args={[0.4, 0.4, 0.05]} /><meshStandardMaterial color="#93c5fd" /></mesh>
      <Tree position={[2.1, 0, 0.6]} />
      <Tree position={[-2.2, 0, -0.4]} scale={0.8} />
    </group>
  );
}

function Rig({ progress }) {
  useFrame(({ camera }, dt) => {
    const p = progress.current;
    const k = Math.min(1, dt * 3);
    camera.position.z += (9 - p * 3.5 - camera.position.z) * k;
    camera.position.y += (1.5 + p * 1.5 - camera.position.y) * k;
    camera.lookAt(0, 0.6, 0);
  });
  return null;
}

export default function Scene3D({ progress }) {
  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-b from-emerald-50 via-sky-50 to-white">
      <Canvas camera={{ position: [0, 1.5, 9], fov: 45 }} dpr={[1, 1.5]}>
        <hemisphereLight args={["#ffffff", "#bbf7d0", 1.1]} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} />
        <Rig progress={progress} />
        <House progress={progress} />
        {BUBBLES.map((b, i) => (
          <Float key={i} speed={1.5} floatIntensity={1.2}>
            <mesh position={b.pos}>
              <sphereGeometry args={[b.size, 16, 16]} />
              <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
            </mesh>
          </Float>
        ))}
        <Sparkles count={40} scale={[10, 5, 6]} size={3} speed={0.4} color="#10b981" />
      </Canvas>
    </div>
  );
}