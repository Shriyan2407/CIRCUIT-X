'use client';

import { useState } from 'react';
import { ALL_EDGE_KEYS, NODE_IDS, edgeKey, networkStatus, shortestPath, type AlgoKind } from '@/lib/network';
import { useStore } from '@/lib/store';
import { AlgorithmHud } from '@/components/ui/Hud';

const ALGOS: { value: AlgoKind; label: string }[] = [
  { value: 'dijkstra', label: 'Dijkstra' },
  { value: 'bfs', label: 'BFS' },
  { value: 'dfs', label: 'DFS' },
];

/** Scripted, captioned demonstration. Visitors can start it, watch it, or stop it. */
export function DemoBar() {
  const demo = useStore((s) => s.demo);
  const startDemo = useStore((s) => s.startDemo);
  const stopDemo = useStore((s) => s.stopDemo);
  const pct = demo.total > 0 ? (demo.step / demo.total) * 100 : 0;
  return (
    <div className={`panel demo-bar${demo.active ? ' is-live' : ''}`} role="status" aria-live="polite">
      <div className="demo-head">
        <p className="diag-title">
          {demo.active ? `DEMO · STEP ${String(demo.step).padStart(2, '0')} / ${String(demo.total).padStart(2, '0')}` : 'DEMONSTRATION'}
        </p>
        {demo.active ? (
          <button type="button" className="btn danger" onClick={stopDemo}>STOP</button>
        ) : (
          <button type="button" className="btn primary" onClick={startDemo}>▶ RUN DEMONSTRATION</button>
        )}
      </div>
      <p className="demo-caption">
        {demo.active ? demo.caption : 'Watch the simulator run BFS, DFS and Dijkstra, fail a link and a node, reroute, then recover. Fully automatic.'}
      </p>
      {demo.active && (
        <div className="demo-track" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

export function SimulatorChapter() {
  const [failNodeChoice, setFailNodeChoice] = useState('E');
  const [failEdgeChoice, setFailEdgeChoice] = useState(edgeKey('C', 'F'));
  const sim = useStore((s) => s.sim);
  const setSim = useStore((s) => s.setSim);
  const net = useStore((s) => s.net);
  const run = useStore((s) => s.run);
  const startRun = useStore((s) => s.startRun);
  const failNode = useStore((s) => s.failNode);
  const failEdge = useStore((s) => s.failEdge);
  const recoverAll = useStore((s) => s.recoverAll);
  const log = useStore((s) => s.log);
