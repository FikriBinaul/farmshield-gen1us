import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { Suspense } from "react";
import * as THREE from "three";

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
  const meshRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // FLOATING EFFECT
    meshRef.current.position.y = -8 + Math.sin(t) * 0.6; // naik turun halus

    // ROTASI PELAN
    meshRef.current.rotation.z = Math.PI + Math.sin(t * 0.3) * 0.2;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={7}
      rotation={[Math.PI / 2, Math.PI, Math.PI]}
      position={[0, -8, 0]}
    >
      <meshStandardMaterial
        color="#4CAF50"
        metalness={0.5}
        roughness={0.5}
      />
    </mesh>
  );
}
