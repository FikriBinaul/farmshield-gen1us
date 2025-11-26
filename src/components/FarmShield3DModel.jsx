"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Suspense } from "react";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-green-700 font-semibold">
        {progress.toFixed(0)}% Loading...
      </div>
    </Html>
  );
}

function FarmShieldModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");

  return (
    <mesh geometry={geometry} scale={3}>
      <meshStandardMaterial color="#4CAF50" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

export default function FarmShield3DModel() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={<Loader />}>
          <FarmShieldModel />
        </Suspense>

        <OrbitControls
          target={[0, 0, 0]}
          enableZoom
          autoRotate
          autoRotateSpeed={0.15}
          minDistance={2}
          maxDistance={10}
          enablePan
          makeDefault
        />
      </Canvas>
    </div>
  );
}
