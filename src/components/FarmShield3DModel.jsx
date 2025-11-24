"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader } from "@react-three/fiber";

function FarmShieldModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");

  return (
    <mesh
      geometry={geometry}
      scale={0.02}
      rotation={[0, Math.PI, 0]}
    >
      <meshBasicMaterial
        color="#4CAF50"
      />
    </mesh>
  );
}

export default function FarmShield3DModel() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 85 }}>
        <FarmShieldModel />
        <OrbitControls 
          enableZoom={true}
          autoRotate 
          autoRotateSpeed={0.15}
          minDistance={2}
          maxDistance={10}
          enablePan={true}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
