'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  ALL_EDGE_KEYS,
  EDGE_DEFS,
  NODE_IDS,
  NODE_POS,
  degree,
  edgeKey,
  isEdgeActive,
  isNodeActive,
  type NodeId,
} from '@/lib/network';
import { useStore } from '@/lib/store';
import { COLORS } from '@/lib/palette';
import { clamp01, easeOutCubic } from '@/lib/ease';

const UP = new THREE.Vector3(0, 1, 0);
const COL = {
  healthy: new THREE.Color(COLORS.healthy),
  failure: new THREE.Color(COLORS.failure),
  warning: new THREE.Color(COLORS.warning),
  white: new THREE.Color(COLORS.white),
  grey: new THREE.Color(COLORS.grey),
  line: new THREE.Color(COLORS.line),
};

/** Node positions as shared vectors. Callers must clone before mutating. */
const NODE_V: Record<NodeId, THREE.Vector3> = Object.fromEntries(
  NODE_IDS.map((id) => [id, new THREE.Vector3(...NODE_POS[id])]),
) as Record<NodeId, THREE.Vector3>;
const pos = (id: NodeId): THREE.Vector3 => NODE_V[id];

/** Places a unit-height cylinder so it spans p0 → p1. */
function placeSegment(mesh: THREE.Mesh, p0: THREE.Vector3, p1: THREE.Vector3, grow = 1): void {
  const dir = new THREE.Vector3().subVectors(p1, p0);
  const len = dir.length();
  mesh.visible = len > 1e-4 && grow > 0.001;
  if (!mesh.visible) return;
  mesh.position.copy(p0).add(p1).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  mesh.scale.set(1, len * grow, 1);
}

// ---------------------------------------------------------------------------
// Nodes: hardware block with a state-coloured outline and a status LED.
// ---------------------------------------------------------------------------

type Tone = 'failed' | 'current' | 'path' | 'visited' | 'queued' | 'focus' | 'idle';

function nodeTone(id: string): Tone {
  const s = useStore.getState();
  if (!isNodeActive(s.net, id)) return 'failed';
  const f = s.run ? s.run.frames[s.run.index] : null;
  if (f?.current === id) return 'current';
  if (f?.path?.includes(id)) return 'path';
  if (f?.settled?.includes(id) || f?.visited?.includes(id)) return 'visited';
  if (f?.queue?.includes(id) || f?.stack?.includes(id)) return 'queued';
  if (s.hovered === id || s.selected === id) return 'focus';
  return 'idle';
}

const TONE_COLOR: Record<Tone, THREE.Color> = {
  failed: COL.failure,
  current: COL.white,
  path: COL.healthy,
  visited: COL.healthy,
  queued: COL.warning,
  focus: COL.white,
  idle: COL.grey,
};

function NetNode({ id, index }: { id: NodeId; index: number }) {
  const group = useRef<THREE.Group>(null);
  const outline = useRef<THREE.LineBasicMaterial>(null);
  const led = useRef<THREE.MeshBasicMaterial>(null);
  const label = useRef<HTMLDivElement>(null);
  const edgesGeom = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.46, 0.46, 0.46)), []);
  const setHovered = useStore((s) => s.setHovered);
  const setSelected = useStore((s) => s.setSelected);

  useFrame((state, dt) => {
    const s = useStore.getState();
    const g = group.current;
    if (!g) return;

    // Boot: each node eases in, staggered by index.
    const boot = easeOutCubic(clamp01((s.bootT - index * 0.07) / 0.22));
    const tone = nodeTone(id);
    const failed = tone === 'failed';
    const pulse = failed ? 0 : 0.035 * Math.sin(state.clock.elapsedTime * 2.4 + index * 0.9);
    const size = (failed ? 0.72 : 1 + pulse) * boot;
    g.scale.setScalar(Math.max(size, 0.0001));
    g.visible = boot > 0.001;

    if (outline.current) {
      outline.current.color.lerp(TONE_COLOR[tone], 1 - Math.exp(-dt * 8));
      outline.current.opacity = failed ? 0.35 : 1;
    }
    if (led.current) {
      led.current.color.lerp(TONE_COLOR[tone], 1 - Math.exp(-dt * 8));
      led.current.opacity = failed ? 0.25 : 1;
    }
    if (label.current) {
      const showLabel = boot > 0.6;
      label.current.style.opacity = showLabel ? '1' : '0';
      label.current.dataset.tone = tone;
    }
  });

  return (
    <group position={NODE_POS[id]}>
      <group ref={group}>
        {/* Body: near-black block so the outline and LED carry the colour. */}
        <mesh>
          <boxGeometry args={[0.44, 0.44, 0.44]} />
          <meshBasicMaterial color={COLORS.surface} />
        </mesh>
        <lineSegments geometry={edgesGeom}>
          <lineBasicMaterial ref={outline} color={COLORS.grey} transparent />
        </lineSegments>
        {/* Status LED on the top face. */}
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial ref={led} color={COLORS.grey} transparent />
        </mesh>
        {/* Invisible hit target, larger than the block for easy hovering. */}
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(null);
            document.body.style.cursor = '';
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelected(useStore.getState().selected === id ? null : id);
          }}
        >
          <sphereGeometry args={[0.55, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <Html position={[0, 0.62, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={label} className="node-label" data-tone="idle">
          {id}
          <span className="node-deg">{String(degree(id)).padStart(2, '0')}</span>
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Links: thin cables. A failed link splits into two halves that pull apart.
// ---------------------------------------------------------------------------
