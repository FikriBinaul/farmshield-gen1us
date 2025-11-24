"use client";

<<<<<<< Updated upstream
import { Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
=======
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useMemo } from "react";
>>>>>>> Stashed changes

function FarmShieldModel() {
  const geometry = useLoader(STLLoader, "/models/farmshield.stl");
  const preparedGeometry = useMemo(() => {
    geometry.center(); // place model origin at the center to avoid clipping
    geometry.computeVertexNormals(); // ensure smooth shading on STL import
    return geometry;
  }, [geometry]);

  return (
    <mesh geometry={preparedGeometry} scale={0.02} rotation={[Math.PI / 2, Math.PI, 0]} castShadow receiveShadow>
      <meshStandardMaterial
        color="#4CAF50"
        metalness={0.4}
        roughness={0.25}
        emissive="#1b5e20"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

export default function FarmShield3DModel() {
  return (
    <div className="w-full h-full">
<<<<<<< Updated upstream
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
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
        </Suspense>
=======
      <Canvas
        shadows
        camera={{
          position: [0, 0.6, 2.5],
          fov: 50,
          near: 0.01,
          far: 50,
        }}
      >
        <color attach="background" args={["#f5f7f9"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 3]} intensity={0.9} castShadow />
        <Center>
          <FarmShieldModel />
        </Center>
        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={4}
          maxPolarAngle={Math.PI * 0.55}
          makeDefault
        />
>>>>>>> Stashed changes
      </Canvas>
    </div>
  );
}

