"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-cyan-400 font-semibold animate-pulse">
        {progress.toFixed(0)}% Loading...
      </div>
    </Html>
  );
}

function FarmShieldModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Floating animation
    if (meshRef.current) {
      meshRef.current.position.y = -6 + Math.sin(t) * 0.6;
      meshRef.current.rotation.y += 0.003;
    }

    // Glow pulse effect
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.4 + Math.sin(t * 3) * 0.2;
    }
  });

  return (
    <group>
      {/* Main Hologram Model */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        scale={8}
        rotation={[Math.PI / 2, Math.PI, Math.PI]}
      >
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.85}
          metalness={0.3}
          roughness={0.1}
        />
      </mesh>

      {/* Glow Aura (tanpa postprocessing) */}
      <mesh
        ref={glowRef}
        geometry={geometry}
        scale={8.4}
        rotation={[Math.PI / 2, Math.PI, Math.PI]}
      >
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default function FarmShield3DModel() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} color="#00ffff" intensity={2} />
        <pointLight position={[-5, -5, -5]} color="#00ffff" intensity={1} />

        <Suspense fallback={<Loader />}>
          <FarmShieldModel />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.7}
          enablePan={false}
        />
              {/* ================= OPTIONAL BLOOM GLOW (POSTPROCESSING) ================= */}
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>


      </Canvas>
    </div>
  );
}
