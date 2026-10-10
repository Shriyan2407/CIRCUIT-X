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

  const route = shortestPath(net, sim.src, sim.dst);
  const status = networkStatus(net);
  const sameNode = sim.src === sim.dst;
  const liveNodes = NODE_IDS.filter((id) => !net.failedNodes.includes(id));
  const liveEdges = ALL_EDGE_KEYS.filter((k) => !net.failedEdges.includes(k));
  const runAlgorithm = () => startRun(sim.algo, sim.src, sim.algo === 'dijkstra' ? sim.dst : undefined);

  return (
    <section id="simulator" data-chapter="simulator" className="chapter chapter-sim">
      <div className="sim">
        <p className="index">11 — LIVE SIMULATOR</p>
        <h2 className="display sim-title">
          <span className="block">BREAK IT.</span>
          <span className="block dim">ROUTE IT.</span>
        </h2>

        <div className="sim-grid">
          <fieldset className="panel">
            <legend className="diag-title">ROUTE</legend>
            <label>
              <span>SOURCE</span>
              <select value={sim.src} onChange={(e) => setSim({ src: e.target.value })}>
                {NODE_IDS.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </label>
            <label>
              <span>DESTINATION</span>
              <select value={sim.dst} onChange={(e) => setSim({ dst: e.target.value })}>
                {NODE_IDS.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </label>
            <label>
              <span>ALGORITHM</span>
              <select value={sim.algo} onChange={(e) => setSim({ algo: e.target.value as AlgoKind })}>
                {ALGOS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </label>
            <div className="btn-row">
              <button type="button" className="btn primary" onClick={runAlgorithm}>RUN</button>
              <button type="button" className="btn" onClick={() => startRun('dijkstra', sim.src, sim.dst)} disabled={sameNode}>
                FIND ALTERNATIVE
              </button>
            </div>
          </fieldset>
