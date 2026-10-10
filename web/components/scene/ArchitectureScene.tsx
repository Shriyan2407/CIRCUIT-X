'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, type ArchNodeId } from '@/lib/store';
import { COLORS } from '@/lib/palette';
import { damp } from '@/lib/ease';

interface ArchNode {
  id: ArchNodeId;
  label: string;
  pos: [number, number, number];
  parent?: ArchNodeId;
}

/** Module tree from the brief, laid out top-down. */
export const ARCH_NODES: ArchNode[] = [
  { id: 'root', label: 'CIRCUIT-X', pos: [0, 2.6, 0] },
  { id: 'graph', label: 'GRAPH', pos: [-6.8, 0.9, 0], parent: 'root' },
  { id: 'node', label: 'NODE', pos: [-6.8, -0.5, 0], parent: 'graph' },
  { id: 'edge', label: 'EDGE', pos: [-6.8, -1.4, 0], parent: 'graph' },
  { id: 'adj', label: 'ADJACENCY LIST', pos: [-6.8, -2.3, 0], parent: 'graph' },
  { id: 'alg', label: 'ALGORITHMS', pos: [-3.4, 0.9, 0], parent: 'root' },
  { id: 'bfs', label: 'BFS', pos: [-3.4, -0.5, 0], parent: 'alg' },
  { id: 'dfs', label: 'DFS', pos: [-3.4, -1.4, 0], parent: 'alg' },
  { id: 'dij', label: 'DIJKSTRA', pos: [-3.4, -2.3, 0], parent: 'alg' },
  { id: 'heap', label: 'MIN HEAP', pos: [-1.1, -2.3, 0], parent: 'dij' },
  { id: 'fail', label: 'FAILURE', pos: [0, 0.9, 0], parent: 'root' },
  { id: 'nodefail', label: 'NODE FAILURE', pos: [0, -0.5, 0], parent: 'fail' },
  { id: 'edgefail', label: 'EDGE FAILURE', pos: [0, -1.4, 0], parent: 'fail' },
  { id: 'analysis', label: 'ANALYSIS', pos: [3.4, 0.9, 0], parent: 'root' },
  { id: 'conn', label: 'CONNECTIVITY', pos: [3.4, -0.5, 0], parent: 'analysis' },
  { id: 'comp', label: 'COMPONENTS', pos: [3.4, -1.4, 0], parent: 'analysis' },
  { id: 'recovery', label: 'RECOVERY', pos: [6.8, 0.9, 0], parent: 'root' },
  { id: 'reroute', label: 'REROUTING', pos: [6.8, -0.5, 0], parent: 'recovery' },
];

const byId = Object.fromEntries(ARCH_NODES.map((n) => [n.id, n])) as Record<ArchNodeId, ArchNode>;

/** Explanations shown in the DOM panel when a module is selected. */
export const ARCH_COPY: Record<ArchNodeId, { title: string; body: string; file: string }> = {
  root: { title: 'CIRCUIT-X', body: 'A weighted, undirected network simulated in memory. Every module below is a part of the Java project.', file: 'Main.java' },
  graph: { title: 'Graph', body: 'Nodes and undirected edges. Each link is stored in both directions so traversal code can walk outward from any node.', file: 'Graph.java' },
  node: { title: 'Node', body: 'A router or host with an ACTIVE or FAILED state. Failed nodes are skipped by every algorithm.', file: 'Node.java' },
  edge: { title: 'Edge', body: 'A weighted link with its own ACTIVE or FAILED state. The weight is the cost Dijkstra adds up.', file: 'Edge.java' },
  adj: { title: 'Adjacency List', body: 'Each node maps to its list of outgoing edges. Space is O(V + E), which suits sparse networks.', file: 'Graph.java' },
  alg: { title: 'Algorithms', body: 'Three traversals and searches over the same graph: BFS for layers, DFS for depth, Dijkstra for cost.', file: 'PathFinder.java' },
  bfs: { title: 'BFS', body: 'Breadth-first search with a FIFO queue. It finds every reachable node layer by layer. O(V + E).', file: 'PathFinder.java' },
  dfs: { title: 'DFS', body: 'Depth-first search by recursion. The call stack holds the path so far; it backtracks when a branch ends. O(V + E).', file: 'PathFinder.java' },
  dij: { title: 'Dijkstra', body: 'Settles the closest unsettled node each step and relaxes its edges. Correct for non-negative weights. O((V + E) log V).', file: 'PathFinder.java' },
  heap: { title: 'Min Heap', body: 'Binary heap in an array. It gives the next closest node in O(log n) and is the priority queue Dijkstra uses.', file: 'MinHeap.java' },
  fail: { title: 'Failure', body: 'Failures flip a flag on a node or edge. Nothing is deleted, so the network can be recovered later.', file: 'FailureManager.java' },
  nodefail: { title: 'Node Failure', body: 'Marks a node offline. Every link to it is treated as unusable until recovery.', file: 'FailureManager.java' },
  edgefail: { title: 'Edge Failure', body: 'Marks one link offline. The rest of the network stays up and routes can change around it.', file: 'FailureManager.java' },
  analysis: { title: 'Analysis', body: 'Measures the active network: is it still one piece, and if not, which nodes sit in each piece.', file: 'NetworkAnalyzer.java' },
  conn: { title: 'Connectivity', body: 'One BFS from an active node. If every active node is reached, the network is connected.', file: 'NetworkAnalyzer.java' },
  comp: { title: 'Connected Components', body: 'Repeated BFS over the active graph. Each run finds one separated piece of the network.', file: 'NetworkAnalyzer.java' },
  recovery: { title: 'Recovery', body: 'Restores failed nodes and links, then checks connectivity and reports the result.', file: 'RecoveryEngine.java' },
  reroute: { title: 'Rerouting', body: 'Asks Dijkstra for the cheapest path on the current active network. Failed parts are skipped automatically.', file: 'RecoveryEngine.java' },
};

function ArchNodeMesh({ node }: { node: ArchNode }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.MeshBasicMaterial>(null);
  const label = useRef<HTMLButtonElement>(null);
  const selected = useStore((s) => s.archSelected === node.id);
  const setArchSelected = useStore((s) => s.setArchSelected);
  const isRoot = node.id === 'root';
  const isLeaf = !ARCH_NODES.some((n) => n.parent === node.id);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const active = useStore.getState().archSelected === node.id;
    const target = active ? 1.25 : 1;
    const pulse = active ? 1 + 0.03 * Math.sin(state.clock.elapsedTime * 3) : 1;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target * pulse, damp(dt, 8)));
    if (body.current) {
      const want = new THREE.Color(active ? COLORS.healthy : isRoot ? COLORS.white : COLORS.grey);
      body.current.color.lerp(want, damp(dt, 8));
    }
  });

  return (
    <group ref={group} position={node.pos}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          setArchSelected(node.id);
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <boxGeometry args={[isLeaf ? 0.3 : 0.4, isLeaf ? 0.3 : 0.4, 0.3]} />
        <meshBasicMaterial ref={body} color={COLORS.grey} />
      </mesh>
      <Html center position={[0, isLeaf ? 0.42 : 0.5, 0]} zIndexRange={[10, 0]}>
        <button
          ref={label}
          type="button"
          className={`arch-label${selected ? ' is-active' : ''}${isRoot ? ' is-root' : ''}`}
          onClick={() => setArchSelected(node.id)}
        >
          {node.label}
        </button>
      </Html>
    </group>
  );
}

function ArchEdges() {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (const n of ARCH_NODES) {
      if (!n.parent) continue;
      const p = byId[n.parent];
      pts.push(...p.pos, ...n.pos);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={COLORS.line} transparent opacity={0.8} />
    </lineSegments>
  );
}

export function ArchitectureScene() {
  return (
    <group>
      <ArchEdges />
      {ARCH_NODES.map((n) => (
        <ArchNodeMesh key={n.id} node={n} />
      ))}
    </group>
  );
}
