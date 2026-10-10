'use client';

import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { Suspense } from 'react';
import { useStore } from '@/lib/store';
import { ARCH_Y, HEAP_Y } from '@/lib/story';
import { COLORS } from '@/lib/palette';
import { NetworkGraph } from './NetworkGraph';
import { HeapScene } from './HeapScene';
import { ArchitectureScene } from './ArchitectureScene';
import { CameraRig } from './CameraRig';

/**
 * The only WebGL surface on the page. It sits behind the DOM and never owns
 * text or layout. Three stacked worlds share one camera: the network at y=0,
 * the heap at HEAP_Y and the architecture at ARCH_Y. Scrolling dives between them.
 */
export function Scene() {
  const mobile = useStore((s) => s.mobile);
  const setWebgl = useStore((s) => s.setWebgl);

  return (
    <Canvas
      className="scene-canvas"
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0.6, 11.5], fov: 40, near: 0.1, far: 120 }}
      gl={{ antialias: !mobile, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(COLORS.black, 1);
        setWebgl(true);
      }}
    >
      <fog attach="fog" args={[COLORS.black, 9, 30]} />
      <ambientLight intensity={0.4} />

      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          <NetworkGraph packetCount={mobile ? 12 : 36} />
        </group>
        <group position={[0, HEAP_Y, 0]}>
          <HeapScene />
        </group>
        <group position={[0, ARCH_Y, 0]} scale={mobile ? 0.5 : 0.6}>
          <ArchitectureScene />
        </group>
        <Sparkles
          count={mobile ? 30 : 110}
          scale={[26, 60, 16]}
          position={[0, -12, 0]}
          size={1.2}
          speed={0.12}
          color={COLORS.grey}
          opacity={0.45}
        />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
