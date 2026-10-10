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


// ---------------------------------------------------------------------------
// Heap demo: start from the brief's heap, insert 1 (bubble up), then extract min.
// Frames are captured from the real MinHeap events.
// ---------------------------------------------------------------------------
export function buildHeapFrames(): HeapFrame[] {
  const frames: HeapFrame[] = [];
  const heap = MinHeap.fromValues([2, 5, 7, 9, 8], (e, snap) => {
    let label = '';
    let note = '';
    if (e.type === 'swap') {
      label = e.label === 'bubble up' ? 'BUBBLE UP' : 'BUBBLE DOWN';
      note = e.label === 'bubble up'
        ? 'Child is smaller than its parent: swap them and continue upward.'
        : 'Root was replaced by the last element; push it down past smaller children.';
    } else if (e.type === 'insert') {
      label = `INSERT ${e.item.value}`;
      note = `Placed at the next free slot (index ${e.index}), then bubbles up.`;
    } else if (e.type === 'extract') {
      label = `EXTRACT MIN ${e.item.value}`;
      note = 'Root is removed and returned. The last element takes its place.';
    }
    frames.push({ items: snap, label, note });
  });
  frames.push({ items: heap.snapshot(), label: 'HEAP READY', note: 'Parent ≤ children at every level.' });
  heap.insert('n', 1);
  heap.extractMin();
  frames.push({ items: heap.snapshot(), label: 'HEAP RESTORED', note: 'Min-heap property holds again.' });
  return frames;
}

// ---------------------------------------------------------------------------
// Timed scripts. Each chapter enter cancels the previous script's timers.
// ---------------------------------------------------------------------------
let timers: ReturnType<typeof setTimeout>[] = [];
const later = (ms: number, fn: () => void): void => {
  timers.push(setTimeout(fn, ms));
};
const clearTimers = (): void => {
  timers.forEach(clearTimeout);
  timers = [];
};

function runFor(kind: AlgoKind, net: NetState, src: string, dst?: string): Run {
  let frames: Frame[];
  let label: string;
  if (kind === 'bfs') {
    frames = bfs(net, src).frames;
    label = `BFS from ${src}`;
  } else if (kind === 'dfs') {
    frames = dfs(net, src).frames;
    label = `DFS from ${src}`;
  } else {
    frames = dijkstra(net, src, dst ?? src).frames;
    label = `Dijkstra ${src} → ${dst ?? src}`;
  }
  return { kind, src, dst, frames, index: 0, playing: true, label };
}

export const useStore = create<State>((set, get) => ({
  chapter: 'hero',
  booted: false,
  bootT: 0,
  net: HEALTHY,
  run: null,
  heapFrames: [],
  heapIndex: 0,
  hovered: null,
  selected: null,
  menuOpen: false,
  webgl: null,
  mobile: false,
  mouse: { x: 0, y: 0 },
  breakAt: {},
  recovery: [],
  archSelected: 'root',
  sim: { src: 'A', dst: 'H', algo: 'dijkstra' },
  diagnostic: null,
  demo: { active: false, step: 0, total: 0, caption: '' },
  log: [],

  stopDemo: () => {
    clearDemoTimers();
    set({ demo: { active: false, step: 0, total: 0, caption: '' } });
  },

  startDemo: () => {
    if (get().demo.active) return;
    clearDemoTimers();
    get().setChapter('simulator');
    const steps = buildDemoSteps();
    set({ log: [], demo: { active: true, step: 0, total: steps.length, caption: 'Starting demonstration...' } });

    const play = (i: number): void => {
      const step = steps[i];
      set({ demo: { active: true, step: i + 1, total: steps.length, caption: step.caption } });
      step.act();
      if (i === steps.length - 1) {
        demoTimers.push(setTimeout(() => get().stopDemo(), step.hold));
        return;
      }
      demoTimers.push(setTimeout(() => play(i + 1), step.hold));
    };
    play(0);
  },

  setBooted: () => set({ booted: true }),
  setBootT: (t) => set({ bootT: t }),
  setHovered: (id) => set({ hovered: id }),
  setSelected: (id) => set({ selected: id }),
  setMenuOpen: (open) => set({ menuOpen: open }),
  setWebgl: (ok) => set({ webgl: ok }),
  setMobile: (m) => set({ mobile: m }),
  setMouse: (x, y) => set({ mouse: { x, y } }),
  setArchSelected: (id) => set({ archSelected: id }),
  setSim: (patch) => set((s) => ({ sim: { ...s.sim, ...patch } })),

  setNet: (net) => set({ net }),

  failNode: (id) => {
    const { net } = get();
    if (net.failedNodes.includes(id)) return;
    note(`manual: node ${id} failed`);
    set({ net: { ...net, failedNodes: [...net.failedNodes, id] }, selected: null, diagnostic: `NODE ${id} OFFLINE` });
  },

  failEdge: (key) => {
    const { net, breakAt } = get();
    if (net.failedEdges.includes(key)) return;
    note(`manual: link ${key} failed`);
    set({
      net: { ...net, failedEdges: [...net.failedEdges, key] },
      breakAt: { ...breakAt, [key]: performance.now() },
      diagnostic: `LINK ${key.replace('-', ' — ')} OFFLINE`,
    });
  },

  recoverAll: () => {
    note('manual: network recovered');
    set({ net: HEALTHY, run: null, diagnostic: null });
  },

  startRun: (kind, src, dst) => {
    note(`manual: ${kind} ${src}${dst ? ` → ${dst}` : ''}`);
    set({ run: runFor(kind, get().net, src, dst) });
  },

  stepRun: (delta) => {
    const { run } = get();
    if (!run) return;
    const index = Math.min(run.frames.length - 1, Math.max(0, run.index + delta));
    set({ run: { ...run, index, playing: false } });
  },

  togglePlay: () => {
    const { run } = get();
    if (!run) return;
    const atEnd = run.index >= run.frames.length - 1;
    set({ run: { ...run, playing: atEnd ? false : !run.playing, index: atEnd ? 0 : run.index } });
  },

  restartRun: () => {
    const { run } = get();
    if (!run) return;
    set({ run: { ...run, index: 0, playing: true } });
  },

  stopRun: () => set({ run: null }),

  stepHeap: (delta) => {
    const { heapFrames, heapIndex } = get();
    if (heapFrames.length === 0) return;
    const next = (heapIndex + delta + heapFrames.length) % heapFrames.length;
    set({ heapIndex: next });
  },

  setRecovery: (steps) => set({ recovery: steps }),

  setChapter: (id) => {
    clearTimers();
    // While the demonstration runs it owns the network and the run. A chapter change
    // (including the scroll that carries the visitor to the simulator) only moves the camera.
    if (get().demo.active) {
      if (get().chapter !== id) set({ chapter: id });
      return;
    }
    const s = get();
    if (s.chapter === id) return;
    set({ chapter: id, selected: null, menuOpen: false, diagnostic: null, run: null });

    const healthy = () => set({ net: HEALTHY });

    switch (id) {
      case 'network':
      case 'architecture':
        healthy();
        break;

      case 'bfs':
        healthy();
        set({ run: runFor('bfs', HEALTHY, 'A') });
        break;
