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
