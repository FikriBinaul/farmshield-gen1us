"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-green-400 font-semibold text-lg animate-pulse">
        {progress.toFixed(0)}% Loading...
      </div>
    </Html>
  );
}

function FloatingHologramModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Floating up down
    meshRef.current.position.y = -8 + Math.sin(time) * 0.6;

    // Slow rotation
    meshRef.current.rotation.z = Math.PI + Math.sin(time * 0.3) * 0.1;
    meshRef.current.rotation.y += 0.02;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={5}
      rotation={[Math.PI / 2, Math.PI, Math.PI]}
      position={[0, -8, 0]}
    >
      <meshStandardMaterial
        color="#00ffcc"
        emissive="#00ffcc"
        emissiveIntensity={1.8}
        metalness={0.9}
        roughness={0.15}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

export default function FarmShield3DHologram() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 70 }}>
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#00fff0" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#00aaff" />

        <Suspense fallback={<Loader />}>
          <FloatingHologramModel />
        </Suspense>

        {/* Bloom Glow Effect */}
        <EffectComposer>
          <Bloom
            intensity={2.5}
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>

        {/* Smooth floating camera control */}
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.4}
          enableZoom
          enablePan
          minDistance={2}
          maxDistance={15}
          minPolarAngle={Math.PI / 2.2}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}
