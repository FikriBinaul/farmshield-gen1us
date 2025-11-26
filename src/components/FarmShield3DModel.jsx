"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  useProgress,
  Html,
  Bounds
} from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Suspense } from "react";
import * as THREE from "three";

// ================= LOADER =================
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

// ================= MODEL =================
function FarmShieldModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");

  // Auto center pivot STL
  geometry.center();

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={1}
    >
      <meshStandardMaterial
        color="#4CAF50"
        metalness={0.4}
        roughness={0.5}
      />
    </mesh>
  );
}

// ================= SCENE =================
export default function FarmShield3DModel() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={<Loader />}>
          {/* AUTO FIT CAMERA KE MODEL */}
          <Bounds fit clip observe margin={1.15}>
            <FarmShieldModel />
          </Bounds>
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          autoRotate
          autoRotateSpeed={0.25}
        />
      </Canvas>
    </div>
  );
}
