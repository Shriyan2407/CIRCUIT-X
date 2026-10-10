// CIRCUIT-X network model. This is a TypeScript mirror of the Java project:
//   Graph.java (adjacency list, undirected edges, active-neighbour filtering)
//   PathFinder.java (BFS, DFS, Dijkstra with strict-less relaxation)
//   NetworkAnalyzer.java (connectivity and connected components)
// Edge order matches NetworkDemo.buildSampleNetwork(), so results match the Java run.

import { MinHeap } from './minheap';

export const NODE_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
export type NodeId = (typeof NODE_IDS)[number];

export interface EdgeDef {
  a: NodeId;
  b: NodeId;
  w: number;
}

export const EDGE_DEFS: EdgeDef[] = [
  { a: 'A', b: 'B', w: 4 },
  { a: 'A', b: 'C', w: 2 },
  { a: 'B', b: 'D', w: 5 },
  { a: 'B', b: 'E', w: 3 },
  { a: 'C', b: 'E', w: 6 },
  { a: 'C', b: 'F', w: 7 },
  { a: 'D', b: 'E', w: 1 },
  { a: 'D', b: 'G', w: 4 },
  { a: 'E', b: 'F', w: 2 },
  { a: 'E', b: 'H', w: 8 },
  { a: 'F', b: 'H', w: 3 },
  { a: 'G', b: 'H', w: 5 },
];

/** Positions in world space. Layout is a hand-placed sketch of the demo topology. */
export const NODE_POS: Record<NodeId, [number, number, number]> = {
  A: [-4.2, 0, 0],
  B: [-2.2, 1.7, -0.9],
  C: [-2.2, -1.7, 0.9],
  D: [0.3, 2.1, -0.4],
  E: [0.3, -0.5, 0.7],
  F: [2.5, -1.7, -0.6],
  G: [2.7, 1.7, 0.6],
  H: [4.6, 0, 0],
};

export const edgeKey = (a: string, b: string): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

export const ALL_EDGE_KEYS: string[] = EDGE_DEFS.map((e) => edgeKey(e.a, e.b));

/** Failure state. Arrays so it can live in a store and be serialised. */
export interface NetState {
  failedNodes: string[];
  failedEdges: string[]; // canonical keys from edgeKey()
}

export const HEALTHY: NetState = { failedNodes: [], failedEdges: [] };

export interface Neighbour {
  to: string;
  w: number;
  key: string;
}

/** Mirrors Graph.getActiveNeighbours(): skips failed links and failed destinations. */
export function activeNeighbours(state: NetState, u: string): Neighbour[] {
  const failedN = new Set(state.failedNodes);
  const failedE = new Set(state.failedEdges);
  const out: Neighbour[] = [];
  for (const e of EDGE_DEFS) {
    let to: string | null = null;
    if (e.a === u) to = e.b;
    else if (e.b === u) to = e.a;
    if (to === null) continue;
    const key = edgeKey(e.a, e.b);
    if (failedE.has(key) || failedN.has(to) || failedN.has(u)) continue;
    out.push({ to, w: e.w, key });
  }
  return out;
}

export function isNodeActive(state: NetState, id: string): boolean {
  return !state.failedNodes.includes(id);
}

export function isEdgeActive(state: NetState, a: string, b: string): boolean {
  const key = edgeKey(a, b);
  if (state.failedEdges.includes(key)) return false;
  return isNodeActive(state, a) && isNodeActive(state, b);
}

export function degree(id: string): number {
  return EDGE_DEFS.filter((e) => e.a === id || e.b === id).length;
}

// ---------------------------------------------------------------------------
// Frames: one snapshot per visible step. The 3D scene and HUD replay these.
// ---------------------------------------------------------------------------

export type AlgoKind = 'bfs' | 'dfs' | 'dijkstra';

export interface Frame {
  label: string;
  current: string | null;
  visited: string[];
  lit: string[]; // edge keys to illuminate this frame
  queue?: string[]; // BFS
  stack?: string[]; // DFS call stack
  level?: Record<string, number>; // BFS layer of each discovered node
  dist?: Record<string, number>; // Dijkstra tentative distances (Infinity shown as null)
  settled?: string[]; // Dijkstra settled nodes
  path?: string[]; // final path highlight
  cost?: number;
  note?: string; // short explanation shown in HUD
}

export interface TraversalResult {
  frames: Frame[];
  order: string[];
}

export function bfs(state: NetState, start: string): TraversalResult {
  const frames: Frame[] = [];
  const order: string[] = [];
  if (!isNodeActive(state, start)) return { frames, order };

  const queue: string[] = [start];
  const seen = new Set<string>([start]);
  const level: Record<string, number> = { [start]: 0 };

  frames.push({ label: `enqueue ${start}`, current: null, visited: [], lit: [], queue: [...queue], level: { ...level }, note: 'Start node goes into the FIFO queue.' });

  while (queue.length > 0) {
    const u = queue.shift() as string;
    order.push(u);
    const visited = [...order];
    frames.push({ label: `dequeue ${u}`, current: u, visited, lit: [], queue: [...queue], level: { ...level }, note: `Visit ${u} at level ${level[u]}.` });

    for (const nb of activeNeighbours(state, u)) {
      if (seen.has(nb.to)) continue;
      seen.add(nb.to);
      level[nb.to] = level[u] + 1;
      queue.push(nb.to);
      frames.push({ label: `enqueue ${nb.to}`, current: u, visited: [...order], lit: [nb.key], queue: [...queue], level: { ...level }, note: `${nb.to} discovered from ${u} at level ${level[nb.to]}.` });
    }
  }
  frames.push({ label: 'queue empty', current: null, visited: [...order], lit: [], queue: [], level: { ...level }, note: 'Every reachable node has been visited.' });
  return { frames, order };
}

export function dfs(state: NetState, start: string): TraversalResult {
  const frames: Frame[] = [];
  const order: string[] = [];
  if (!isNodeActive(state, start)) return { frames, order };

  const seen = new Set<string>();
  const callStack: string[] = [];
