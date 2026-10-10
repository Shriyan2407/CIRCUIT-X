'use client';

import { NODE_IDS } from '@/lib/network';
import { useStore } from '@/lib/store';

/**
 * Playback HUD for BFS, DFS and Dijkstra. Shows the data structure the algorithm is using.
 * Fixed to the bottom-right on story chapters; rendered inline inside the simulator.
 */
export function AlgorithmHud({ inline = false }: { inline?: boolean }) {
  const run = useStore((s) => s.run);
  const chapter = useStore((s) => s.chapter);
  const togglePlay = useStore((s) => s.togglePlay);
  const stepRun = useStore((s) => s.stepRun);
  const restartRun = useStore((s) => s.restartRun);

  const inSim = chapter === 'simulator';
  if (!run || inSim !== inline) return null;
  const f = run.frames[run.index];
  const atEnd = run.index >= run.frames.length - 1;
  const structure = run.kind === 'bfs' ? 'QUEUE (FIFO)' : run.kind === 'dfs' ? 'CALL STACK' : 'MIN HEAP';

  return (
    <aside className={`hud${inline ? ' is-inline' : ''}`} aria-live="polite">
      <header className="hud-head">
        <span className="hud-kind">{run.kind.toUpperCase()}</span>
        <span className="hud-title">{run.label}</span>
        <span className="hud-step">
          {String(run.index + 1).padStart(2, '0')} / {String(run.frames.length).padStart(2, '0')}
        </span>
      </header>

      <p className="hud-label">{f.label}</p>
      <p className="hud-note">{f.note}</p>

      <dl className="hud-rows">
        {run.kind === 'bfs' && (
          <Row name={structure} value={f.queue?.length ? f.queue.join(' ') : 'empty'} />
        )}
        {run.kind === 'dfs' && (
          <Row name={structure} value={f.stack?.length ? f.stack.join(' › ') : 'empty'} />
        )}
        {run.kind === 'bfs' && f.level && (
          <Row name="LEVEL" value={NODE_IDS.filter((id) => f.level?.[id] !== undefined).map((id) => `${id}${f.level?.[id]}`).join(' ')} />
        )}
        <Row name="VISITED" value={f.visited.length ? f.visited.join(' → ') : '—'} />
        {run.kind === 'dijkstra' && f.dist && (
          <Row
            name="DIST"
            value={NODE_IDS.map((id) => `${id}=${Number.isFinite(f.dist?.[id] as number) ? f.dist?.[id] : '∞'}`).join('  ')}
          />
        )}
        {f.path && f.cost !== undefined && f.cost >= 0 && (
          <Row name="PATH" value={`${f.path.join(' → ')}  ·  COST ${f.cost}`} accent />
        )}
      </dl>

      <div className="hud-controls">
        <button type="button" onClick={restartRun} aria-label="Restart">↺</button>
        <button type="button" onClick={() => stepRun(-1)} aria-label="Previous step" disabled={run.index === 0}>‹</button>
        <button type="button" onClick={togglePlay} aria-label={run.playing ? 'Pause' : 'Play'}>
          {run.playing ? 'PAUSE' : atEnd ? 'REPLAY' : 'PLAY'}
        </button>
        <button type="button" onClick={() => stepRun(1)} aria-label="Next step" disabled={atEnd}>›</button>
      </div>
    </aside>
  );
}

function Row({ name, value, accent }: { name: string; value: string; accent?: boolean }) {
  return (
    <div className={`hud-row${accent ? ' is-accent' : ''}`}>
      <dt>{name}</dt>
      <dd>{value}</dd>
    </div>
  );
}
