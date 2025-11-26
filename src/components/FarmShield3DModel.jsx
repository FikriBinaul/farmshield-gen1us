"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader, Suspense, useMemo } from "react";
import * as THREE from "three";

// Loader fallback saat STL di-load
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-green-700 font-semibold">{progress.toFixed(0)}% Loading...</div>
    </Html>
  );
}

// STL Model component
function FarmShieldModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");

  // Hitung bounding box untuk skala dan posisi otomatis
  const { scale, position } = useMemo(() => {
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim; // Skala otomatis agar model terlihat

    const center = new THREE.Vector3();
    bbox.getCenter(center);

    return {
      scale,
      position: [-center.x * scale, -center.y * scale, -center.z * scale],
    };
  }, [geometry]);

  return (
    <mesh geometry={geometry} scale={scale} position={position} rotation={[0, Math.PI, 0]}>
      <meshStandardMaterial color="#4CAF50" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

// Main 3D component
export default function FarmShield3DModel() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        {/* Lampu */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* STL model dengan Suspense */}
        <Suspense fallback={<Loader />}>
          <FarmShieldModel />
        </Suspense>

        {/* OrbitControls */}
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
