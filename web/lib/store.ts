'use client';

import { create } from 'zustand';
import { CHAPTERS, type ChapterId } from './story';
import {
  bfs,
  dfs,
  dijkstra,
  HEALTHY,
  NODE_IDS,
  edgeKey,
  shortestPath,
  type AlgoKind,
  type Frame,
  type NetState,
} from './network';
import { MinHeap, type HeapItem } from './minheap';

export interface Run {
  kind: AlgoKind;
  src: string;
  dst?: string;
  frames: Frame[];
  index: number;
  playing: boolean;
  label: string; // e.g. "BFS from A"
}

export interface HeapFrame {
  items: HeapItem[];
  label: string;
  note: string;
}

export interface RecoveryStep {
  text: string;
  done: boolean;
}

export type ArchNodeId = 'root' | 'graph' | 'node' | 'edge' | 'adj' | 'alg' | 'bfs' | 'dfs' | 'dij' | 'heap' | 'fail' | 'nodefail' | 'edgefail' | 'analysis' | 'conn' | 'comp' | 'recovery' | 'reroute';

export const ALGO_STEP_MS = 720;

export interface DemoState {
  active: boolean;
  step: number;
  total: number;
  caption: string;
}

interface SimConfig {
  src: string;
  dst: string;
  algo: AlgoKind;
}

interface State {
  chapter: ChapterId;
  booted: boolean;
  bootT: number; // 0..1 network construction progress
  net: NetState;
  run: Run | null;
  heapFrames: HeapFrame[];
  heapIndex: number;
  hovered: string | null;
  selected: string | null;
  menuOpen: boolean;
  webgl: boolean | null;
  mobile: boolean;
  mouse: { x: number; y: number };
  breakAt: Record<string, number>; // edge key -> time it broke (for the fracture animation)
  recovery: RecoveryStep[];
  archSelected: ArchNodeId;
  sim: SimConfig;
  diagnostic: string | null;
  demo: DemoState;
  log: string[];

  setBooted: () => void;
  startDemo: () => void;
  stopDemo: () => void;
  setBootT: (t: number) => void;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
  setMenuOpen: (open: boolean) => void;
  setWebgl: (ok: boolean) => void;
  setMobile: (m: boolean) => void;
  setMouse: (x: number, y: number) => void;
  setArchSelected: (id: ArchNodeId) => void;
  setSim: (patch: Partial<SimConfig>) => void;
  setNet: (net: NetState) => void;
  failNode: (id: string) => void;
  failEdge: (key: string) => void;
  recoverAll: () => void;
  startRun: (kind: AlgoKind, src: string, dst?: string) => void;
  stepRun: (delta: number) => void;
  togglePlay: () => void;
  restartRun: () => void;
  stopRun: () => void;
  stepHeap: (delta: number) => void;
  setRecovery: (steps: RecoveryStep[]) => void;
  setChapter: (id: ChapterId) => void;
}

// ---------------------------------------------------------------------------
// Demonstration: a scripted, captioned run of every operation. Each step acts on
// the same store actions a visitor uses, so the 3D scene shows the real logic.
// ---------------------------------------------------------------------------
let demoTimers: ReturnType<typeof setTimeout>[] = [];
const clearDemoTimers = (): void => {
  demoTimers.forEach(clearTimeout);
  demoTimers = [];
};

function note(msg: string): void {
  useStore.setState((s) => ({ log: [...s.log, msg].slice(-6) }));
}

function buildDemoSteps(): { caption: string; hold: number; act: () => void }[] {
  const frames = (n: number): number => n * ALGO_STEP_MS + 1400;
  const api = () => useStore.getState();
  const bfsLen = bfs(HEALTHY, "A").frames.length;
  const dfsLen = dfs(HEALTHY, "A").frames.length;
  const djLen = dijkstra(HEALTHY, "A", "H").frames.length;
  const degraded: NetState = { failedNodes: ["E"], failedEdges: ["B-D"] };
  const altLen = dijkstra(degraded, "A", "H").frames.length;
  const altPath = shortestPath(degraded, "A", "H");

  return [
    {
      caption: "RESET — healthy network: 8 nodes, 12 weighted links",
      hold: 1400,
      act: () => {
        api().recoverAll();
        api().setSim({ src: "A", dst: "H", algo: "bfs" });
        note("reset: network healthy");
      },
    },
    {
      caption: "BFS from A — the FIFO queue expands one layer at a time",
      hold: frames(bfsLen),
      act: () => {
        api().setSim({ algo: "bfs" });
        api().startRun("bfs", "A");
        note("BFS from A");
      },
    },
    {
      caption: "DFS from A — go deep along one branch, then backtrack",
      hold: frames(dfsLen),
      act: () => {
        api().setSim({ algo: "dfs" });
        api().startRun("dfs", "A");
        note("DFS from A");
      },
    },
    {
      caption: "DIJKSTRA A → H — settle the cheapest node, relax its edges",
      hold: frames(djLen),
      act: () => {
        api().setSim({ algo: "dijkstra", src: "A", dst: "H" });
        api().startRun("dijkstra", "A", "H");
        note("Dijkstra A → H: cost 12");
      },
    },
    {
      caption: "LINK B — D goes OFFLINE. Traversals skip it.",
      hold: 3200,
      act: () => {
        api().failEdge("B-D");
        note("link B—D failed");
      },
    },
    {
      caption: "NODE E goes OFFLINE. Every link into E becomes unusable.",
      hold: 3200,
      act: () => {
        api().failNode("E");
        note("node E failed");
      },
    },
    {
      caption: "FIND ALTERNATIVE — Dijkstra searches the surviving network",
      hold: frames(altLen),
      act: () => {
        api().setSim({ algo: "dijkstra", src: "A", dst: "H" });
        api().startRun("dijkstra", "A", "H");
        note(`alternative A → H: ${altPath.path.join(" → ")}, cost ${altPath.cost}`);
      },
    },
    {
      caption: "RECOVERY — restore every node and link",
      hold: 2600,
      act: () => {
        api().recoverAll();
        note("recovered: network healthy");
      },
    },
    { caption: "DEMO COMPLETE — the network found its way through", hold: 2600, act: () => {} },
  ];
}
