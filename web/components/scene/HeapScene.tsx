'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import type { HeapItem } from '@/lib/minheap';
import { COLORS } from '@/lib/palette';
import { damp } from '@/lib/ease';

const MAX_ITEMS = 8;

/** Level-order slot for array index i in a binary tree laid out top-down. */
export function heapSlot(i: number): THREE.Vector3 {
  const level = Math.floor(Math.log2(i + 1));
  const k = i + 1 - Math.pow(2, level);
  const count = Math.pow(2, level);
  const spacing = level === 0 ? 0 : level === 1 ? 3.0 : 1.5;
  return new THREE.Vector3((k - (count - 1) / 2) * spacing, -level * 1.5, 0);
}

function HeapItemNode({
  item,
  index,
  current,
}: {
  item: HeapItem;
  index: number;
  current: React.RefObject<Map<number, THREE.Vector3>>;
}) {
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => heapSlot(index), [index]);
  const started = useRef(false);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (!started.current) {
      // First frame: appear at the slot instead of flying in from the origin.
      g.position.copy(target);
      started.current = true;
    } else {
      g.position.lerp(target, damp(dt, 6));
    }
    current.current?.set(item.id, g.position);
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshBasicMaterial color={COLORS.healthy} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial color={COLORS.healthy} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <Html center position={[0, 0.62, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div className="heap-label">{item.value}</div>
      </Html>
    </group>
  );
}

function HeapEdges({ items, current }: { items: HeapItem[]; current: React.RefObject<Map<number, THREE.Vector3>> }) {
  const lines = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_ITEMS * 2 * 3), 3));
    return g;
  }, []);

  useFrame(() => {
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    let k = 0;
    for (let i = 1; i < items.length; i++) {
      const parent = Math.floor((i - 1) / 2);
      const a = current.current?.get(items[i].id);
      const b = current.current?.get(items[parent].id);
      if (!a || !b) continue;
      arr.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6);
      k++;
    }
    attr.needsUpdate = true;
    geometry.setDrawRange(0, k * 2);
  });

  return (
    <lineSegments ref={lines} geometry={geometry}>
      <lineBasicMaterial color={COLORS.grey} transparent opacity={0.55} />
    </lineSegments>
  );
}

/** The heap as a 3D tree. Items keep identity across steps, so bubbling animates as movement. */
export function HeapScene() {
  const frame = useStore((s) => s.heapFrames[s.heapIndex]);
  const items = frame?.items ?? [];
  const current = useRef(new Map<number, THREE.Vector3>());

  return (
    <group>
      <HeapEdges items={items} current={current} />
      {items.map((item, i) => (
        <HeapItemNode key={item.id} item={item} index={i} current={current} />
      ))}
    </group>
  );
}
