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
    meshRef.current.position.y = Math.sin(t) * 0.5 - 8;

    // ROTASI HALUS
    meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
  });

  return (
     <mesh
        ref={meshRef}
        geometry={geometry}
        scale={8}
        rotation={[Math.PI / 2, Math.PI, Math.PI]}
        position={[0, -8, 0]}
      >
        <meshStandardMaterial
          color="#4CAF50"
          metalness={0.6}
          roughness={0.3}
          emissive="#3AFF3A"
          emissiveIntensity={1}
        />
      </mesh>
      <mesh
        geometry={geometry}
        scale={8.3}
        rotation={[Math.PI / 2, Math.PI, Math.PI]}
        position={[0, -8, 0]}
      >
        <meshBasicMaterial
          color="#66FF66"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}
