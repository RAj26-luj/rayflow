'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCommerceGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.25;
      meshRef.current.rotation.y += delta * 0.35;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z -= delta * 0.2;
      ring1Ref.current.rotation.x += delta * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * 0.25;
      ring2Ref.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1}>
      <group>
        {/* Core 3D Diamond / Octahedron Geometry */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.5, 0]} />
          <MeshWobbleMaterial
            color="#8b5cf6"
            factor={0.15}
            speed={1.5}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* Primary Outer Orbit Ring (Electric Violet) */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.5, 0.04, 16, 100]} />
          <meshStandardMaterial
            color="#a78bfa"
            roughness={0.1}
            metalness={0.9}
            wireframe={false}
          />
        </mesh>

        {/* Secondary Cross Ring (Magenta/Pink Accent) */}
        <mesh ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
          <torusGeometry args={[3.0, 0.03, 16, 100]} />
          <meshStandardMaterial
            color="#ec4899"
            roughness={0.1}
            metalness={0.95}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function ProductScene() {
  return (
    <div className="w-full h-[320px] sm:h-[420px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 shadow-2xl backdrop-blur">
      <div className="absolute inset-0 bg-glow-purple pointer-events-none" />
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.8} color="#ede9fe" />
        <pointLight position={[-10, -10, -5]} intensity={1.2} color="#ec4899" />
        <pointLight position={[0, 5, 0]} intensity={1.0} color="#7c3aed" />
        <FloatingCommerceGeometry />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
