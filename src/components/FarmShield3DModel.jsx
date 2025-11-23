"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader } from "@react-three/fiber";

function FarmShieldModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");

  return (
    <mesh
      geometry={geometry}
      scale={0.02}
      rotation={[0, Math.PI, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color="#4CAF50"        // 🌿 warna hijau fresh
        metalness={0.4}        // memberi kesan metal elegan
        roughness={0.25}       // permukaan lebih halus
        emissive="#1b5e20"     // sedikit glow hijau gelap
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

export default function FarmShield3DModel() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [4, 4, 4], fov: 40 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <spotLight position={[0, 10, 0]} intensity={1} angle={0.3} />
        <Stage environment="city" intensity={0.6}>
          <FarmShieldModel />
        </Stage>
        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.15}   // super smooth
        />
      </Canvas>
    </div>
  );
}

