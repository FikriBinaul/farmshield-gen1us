"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader, Suspense } from "react";

// Loader fallback component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-green-700 font-semibold">{progress.toFixed(0)}% Loading...</div>
    </Html>
  );
}

// Component untuk STL Model
function FarmShieldModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");

  return (
    <mesh geometry={geometry} scale={0.1} rotation={[0, Math.PI, 0]}>
      <meshStandardMaterial color="#4CAF50" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

// Main 3D Model component
export default function FarmShield3DModel() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        {/* Cahaya */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Suspense untuk loader */}
        <Suspense fallback={<Loader />}>
          <FarmShieldModel />
        </Suspense>

        {/* Orbit controls */}
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
