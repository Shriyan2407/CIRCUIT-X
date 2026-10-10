// Chapter script: the order of the website, its copy, and what the 3D network
// should show in each chapter. Scroll position picks the chapter; the chapter
// decides the network state and which algorithm plays.

export const CHAPTERS = [
  { id: 'hero', index: '00', title: 'CIRCUIT-X', nav: null },
  { id: 'network', index: '01', title: 'The Network', nav: 'NETWORK' },
  { id: 'bfs', index: '02', title: 'Breadth First Search', nav: 'BFS' },
  { id: 'dfs', index: '03', title: 'Depth First Search', nav: 'DFS' },
  { id: 'dijkstra', index: '04', title: 'Dijkstra', nav: 'DIJKSTRA' },
  { id: 'failure', index: '05', title: 'Failure', nav: 'FAILURE' },
  { id: 'heap', index: '06', title: 'Custom Min Heap', nav: 'MIN HEAP' },
  { id: 'partition', index: '07', title: 'Network Partition', nav: 'PARTITION' },
  { id: 'reroute', index: '08', title: 'Rerouting', nav: 'REROUTING' },
  { id: 'recovery', index: '09', title: 'Recovery', nav: 'RECOVERY' },
  { id: 'architecture', index: '10', title: 'Architecture', nav: 'ARCHITECTURE' },
  { id: 'simulator', index: '11', title: 'Live Simulator', nav: 'SIMULATOR' },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]['id'];

export const MENU_ITEMS: { id: ChapterId; label: string }[] = [
  { id: 'network', label: 'NETWORK' },
  { id: 'bfs', label: 'BFS' },
  { id: 'dfs', label: 'DFS' },
  { id: 'dijkstra', label: 'DIJKSTRA' },
  { id: 'failure', label: 'FAILURE' },
  { id: 'recovery', label: 'RECOVERY' },
  { id: 'simulator', label: 'SIMULATOR' },
  { id: 'architecture', label: 'ARCHITECTURE' },
];

/** Camera targets. Vertical stacks: the heap lives 14 units below the network, architecture 28 below. */
export interface CameraPreset {
  pos: [number, number, number];
  look: [number, number, number];
}

export const CAMERA: Record<ChapterId, CameraPreset> = {
  hero: { pos: [0, 0.6, 11.5], look: [-2.5, 0, 0] },
  network: { pos: [0.5, 0.3, 10.5], look: [-1.9, 0, 0] },
  bfs: { pos: [-1.2, 0.4, 10], look: [-1.9, 0, 0] },
  dfs: { pos: [1.4, 0.3, 10], look: [-1.9, 0, 0] },
  dijkstra: { pos: [0, 0.2, 12.5], look: [-1.9, 0, 0] },
  failure: { pos: [1.4, 1.1, 7.2], look: [1.2, 1.5, -0.6] },
  heap: { pos: [0, -15.2, 12], look: [0, -15.5, 0] },
  partition: { pos: [0, 0, 13], look: [-1.9, 0, 0] },
  reroute: { pos: [0, 0, 11.5], look: [-1.9, 0, 0] },
  recovery: { pos: [0, 0, 11], look: [-1.9, 0, 0] },
  architecture: { pos: [-3.6, -28, 15.5], look: [-3.6, -28, 0] },
  simulator: { pos: [0, 0.2, 11.5], look: [0, 0, 0] },
};

export const HEAP_Y = -14;
export const ARCH_Y = -28;

export const BOOT_LINES = [
  'INITIALIZING GRAPH...',
  'LOADING NODES...',
  'ESTABLISHING LINKS...',
  'ALGORITHMS READY',
];

export const BOOT_STATS = ['08 NODES', '12 EDGES', '03 ALGORITHMS'];
