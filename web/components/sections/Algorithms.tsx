'use client';

import { useStore } from '@/lib/store';

export function BfsChapter() {
  return (
    <section id="bfs" data-chapter="bfs" className="chapter">
      <div className="stack-left">
        <p className="index">02 — BFS</p>
        <h2 className="display big">
          <span className="reveal block">BREADTH</span>
          <span className="reveal block">FIRST SEARCH</span>
        </h2>
        <p className="statement reveal">EXPLORE OUTWARD.<br />LAYER BY LAYER.</p>
        <p className="mono caption reveal">O(V + E) · queue (FIFO) · visits by hop distance from A</p>
      </div>
    </section>
  );
}

export function DfsChapter() {
  return (
    <section id="dfs" data-chapter="dfs" className="chapter">
      <div className="stack-left">
        <p className="index">03 — DFS</p>
        <h2 className="display big">
          <span className="reveal block">DEPTH</span>
          <span className="reveal block">FIRST SEARCH</span>
        </h2>
        <p className="statement reveal">GO DEEPER.<br />THEN BACKTRACK.</p>
        <p className="mono caption reveal">O(V + E) · recursion · the call stack holds the current branch</p>
      </div>
    </section>
  );
}

export function DijkstraChapter() {
  const run = useStore((s) => s.run);
  const chapter = useStore((s) => s.chapter);
  const finished = !!run && run.index >= run.frames.length - 1;
  const last = run?.frames[run.frames.length - 1];
  const found = finished && last?.cost !== undefined && last.cost >= 0;
  return (
    <section id="dijkstra" data-chapter="dijkstra" className="chapter">
      <div className="stack-left">
        <p className="index">04 — DIJKSTRA</p>
        <h2 className="display big">
          <span className="reveal block">WHAT IS THE</span>
          <span className="reveal block">CHEAPEST WAY THROUGH?</span>
        </h2>
        {chapter === 'dijkstra' && (
          <div className="panel">
            <p className="mono">A → C = 2 · C → F = 7 · F → H = 3 · A → B = 4</p>
            <p className="mono dim">Settle the closest node. Relax its edges. Repeat.</p>
            {found && (
              <div className="found reveal">
                <p className="diag-title is-ok">SHORTEST PATH FOUND</p>
                <p className="mono route">{last?.path?.join(' → ')}</p>
                <p className="mono">COST <span className="is-ok">{last?.cost}</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function HeapChapter() {
  const frames = useStore((s) => s.heapFrames);
  const index = useStore((s) => s.heapIndex);
  const frame = frames[index];
  return (
    <section id="heap" data-chapter="heap" className="chapter">
      <div className="stack-left">
        <p className="index">06 — CUSTOM MIN HEAP</p>
        <h2 className="display big">
          <span className="reveal block">THE NEXT CLOSEST</span>
          <span className="reveal block dim">IS ALWAYS AT THE TOP.</span>
        </h2>
        <div className="panel">
          <p className="diag-title">{frame?.label ?? 'HEAP'}</p>
          <p className="mono hud-note">{frame?.note}</p>
          <dl className="ops">
            <div>
              <dt>INSERT</dt>
              <dd>O(log n) · bubble up</dd>
            </div>
            <div>
              <dt>EXTRACT MIN</dt>
              <dd>O(log n) · bubble down</dd>
            </div>
            <div>
              <dt>PEEK</dt>
              <dd>O(1) · root</dd>
            </div>
          </dl>
          <p className="diag-note">
            Dijkstra keeps its frontier in this heap. Each step pops the cheapest candidate in O(log n) instead of scanning every node.
          </p>
        </div>
      </div>
    </section>
  );
}
