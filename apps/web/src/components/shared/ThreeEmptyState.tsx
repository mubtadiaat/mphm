"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Float, Html } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function FloatingCard({ title }: { title: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Interaktivitas rotasi mikrometer berdasar mouse (disederhanakan untuk performa)
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        (state.pointer.x * Math.PI) / 10,
        0.1
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        -(state.pointer.y * Math.PI) / 10,
        0.1
      );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshPhysicalMaterial 
          transmission={0.9} 
          opacity={1} 
          metalness={0.1} 
          roughness={0.2} 
          ior={1.5}
          thickness={0.5}
          color="#ffffff"
        />
        <Center position={[0, 0, 0.1]}>
           {/* Future dynamic 3D asset goes here */}
           <Html transform distanceFactor={1.5} position={[0, 0, 0.1]}>
             <div className="bg-transparent text-zinc-800 dark:text-white/90 font-semibold text-base select-none text-center px-4 max-w-[250px] leading-snug">
               {title}
             </div>
           </Html>
        </Center>
      </mesh>
    </Float>
  );
}

export default function ThreeEmptyState({ message = "Data Tidak Ditemukan" }: { message?: string }) {
  return (
    <div className="w-full h-[400px] flex items-center justify-center relative bg-transparent rounded-2xl">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <FloatingCard title={message} />
      </Canvas>
    </div>
  );
}
