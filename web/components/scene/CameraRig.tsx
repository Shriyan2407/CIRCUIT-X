'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA } from '@/lib/story';
import { NODE_POS, type NodeId } from '@/lib/network';
import { useStore } from '@/lib/store';
import { damp } from '@/lib/ease';

/**
 * Owns the camera. Each chapter has a preset; scrolling moves between presets.
 * Layered on top: slow drift, inertial mouse parallax, and a dolly toward a
 * selected node. Nothing here is a React state update, so it runs per frame cheaply.
 */
export function CameraRig() {
  const { camera } = useThree();
  const wantPos = useRef(new THREE.Vector3());
  const wantLook = useRef(new THREE.Vector3());
  const curLook = useRef(new THREE.Vector3(0, 0, 0));
  const parallax = useRef(new THREE.Vector2());

  useFrame((state, dt) => {
    const s = useStore.getState();
    const preset = CAMERA[s.chapter];
    let [px, py, pz] = preset.pos;
    let [lx, ly, lz] = preset.look;

    if (s.selected) {
      const [nx, ny, nz] = NODE_POS[s.selected as NodeId];
      px = nx;
      py = ny + 0.6;
      pz = nz + 3.2;
      lx = nx;
      ly = ny;
      lz = nz;
    }

    // Phones: lift the network above the text column. Look lower, so the scene sits higher on screen.
    const textChapter = !["heap", "architecture", "simulator"].includes(s.chapter);
    if (s.mobile && textChapter && !s.selected) ly -= 1.4;

    // Slow drift keeps the scene breathing while the visitor reads.
    const t = state.clock.elapsedTime;
    const drift = s.chapter === 'hero' || s.chapter === 'network' ? 1 : 0.3;
    const dx = Math.sin(t * 0.13) * 0.35 * drift;
    const dy = Math.cos(t * 0.09) * 0.18 * drift;

    // Mouse parallax with inertia. Disabled on touch devices.
    const strength = s.mobile ? 0 : 0.7;
    parallax.current.x += (s.mouse.x * strength - parallax.current.x) * damp(dt, 2.2);
    parallax.current.y += (s.mouse.y * strength - parallax.current.y) * damp(dt, 2.2);

    wantPos.current.set(px + dx + parallax.current.x, py + dy + parallax.current.y, pz);
    wantLook.current.set(lx, ly, lz);

    const k = damp(dt, 2.4);
    camera.position.lerp(wantPos.current, k);
    curLook.current.lerp(wantLook.current, k);
    camera.lookAt(curLook.current);
  });

  return null;
}
