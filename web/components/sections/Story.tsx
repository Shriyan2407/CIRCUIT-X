'use client';

import { components, HEALTHY, NODE_IDS, networkStatus, shortestPath, type NetState } from '@/lib/network';
import { useStore } from '@/lib/store';
import { scrollToChapter } from '@/lib/scroll';

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
export function Hero() {
  const booted = useStore((s) => s.booted);
  return (
    <section id="hero" data-chapter="hero" className={`chapter chapter-hero${booted ? ' is-booted' : ''}`}>
      <div className="hero-copy">
        <p className="kicker reveal">CIRCUIT-X / DSA NETWORK SIMULATION</p>
        <h1 className="display hero-title">
          <span className="line">CIRCUIT-X</span>
        </h1>
        <p className="hero-tagline reveal">NETWORKS THAT SURVIVE.</p>
        <p className="hero-sub reveal">A graph-based network reliability simulation built with Java.</p>
        <p className="hero-cta reveal">BREAK THE NETWORK.<br />FIND THE WAY THROUGH.</p>
        <button
          type="button"
          className="btn primary hero-demo reveal"
          onClick={() => {
            useStore.getState().startDemo();
            scrollToChapter('simulator');
          }}
        >
          ▶ RUN DEMONSTRATION
        </button>
      </div>
      <div className="scroll-cue" aria-hidden>
        <span />
        SCROLL TO ENTER
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 01 — The network
// ---------------------------------------------------------------------------
export function NetworkChapter() {
  return (
    <section id="network" data-chapter="network" className="chapter chapter-tall">
      <div className="stack-left">
        <p className="index">01 — THE NETWORK</p>
        <h2 className="display big">
          <span className="reveal block">EVERY SYSTEM</span>
          <span className="reveal block">HAS A PATH.</span>
        </h2>
        <h2 className="display big dim">
          <span className="reveal block">UNTIL SOMETHING BREAKS.</span>
        </h2>
        <p className="mono caption reveal">
          8 nodes · 12 weighted links · adjacency list
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 05 — Failure
// ---------------------------------------------------------------------------
export function FailureChapter() {
  const net = useStore((s) => s.net);
  const broken = net.failedEdges.includes('B-D');
  const status = networkStatus(net);
  return (
    <section id="failure" data-chapter="failure" className="chapter">
      <div className="stack-left">
        <p className="index">05 — FAILURE</p>
        <h2 className="display big">
          <span className="reveal block">LINK B — D</span>
          <span className={`reveal block ${broken ? 'is-fail' : 'dim'}`}>{broken ? 'OFFLINE.' : 'MONITORING...'}</span>
        </h2>
        <div className={`panel diag${broken ? ' is-live' : ''}`} role="status">
          <p className="diag-title">{broken ? 'FAILURE DETECTED' : 'DIAGNOSTICS'}</p>
          <dl>
            <div>
              <dt>COMPONENT</dt>
              <dd>B — D</dd>
            </div>
            <div>
              <dt>STATUS</dt>
              <dd className={broken ? 'is-bad' : 'is-ok'}>{broken ? 'OFFLINE' : 'ACTIVE'}</dd>
            </div>
            <div>
              <dt>NETWORK STATE</dt>
              <dd className={status === 'HEALTHY' ? 'is-ok' : 'is-warn'}>{broken ? 'DEGRADED' : 'HEALTHY'}</dd>
            </div>
          </dl>
          <p className="diag-note">Traversal and shortest-path code skip this link. The network reroutes around it.</p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 07 — Partition
// ---------------------------------------------------------------------------
function orderedComponents(net: NetState): string[][] {
  return components(net).map((c) => [...c].sort((a, b) => NODE_IDS.indexOf(a as never) - NODE_IDS.indexOf(b as never)));
}

export function PartitionChapter() {
  const net = useStore((s) => s.net);
  const status = networkStatus(net);
  const comps = orderedComponents(net);
  const partitioned = status === 'PARTITIONED';
  return (
    <section id="partition" data-chapter="partition" className="chapter">
      <div className="stack-left">
        <p className="index">07 — NETWORK PARTITION</p>
        <h2 className="display big">
          <span className="reveal block">THE NETWORK</span>
          <span className="reveal block dim">SPLITS.</span>
        </h2>
        <div className="panel">
          <p className="diag-title">NETWORK STATUS</p>
          <p className={`status-word ${partitioned ? 'is-bad' : status === 'DEGRADED' ? 'is-warn' : 'is-ok'}`}>
            {partitioned ? 'CRITICAL — PARTITIONED' : status === 'DEGRADED' ? 'DEGRADED' : 'HEALTHY'}
          </p>
          <div className="comp-list">
            {comps.map((c, i) => (
              <div key={c.join('')} className="comp">
                <span className="mono dim">COMPONENT {String(i + 1).padStart(2, '0')}</span>
                <span className="mono">{c.join('  ')}</span>
              </div>
            ))}
          </div>
          <p className="diag-note">Components are found with BFS over the active graph. Nodes in different components cannot reach each other.</p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 08 — Rerouting
// ---------------------------------------------------------------------------
export function RerouteChapter() {
  const run = useStore((s) => s.run);
  const chapter = useStore((s) => s.chapter);
  const primary = shortestPath(HEALTHY, 'A', 'H');
  const finished = !!run && run.index >= run.frames.length - 1;
  const last = run?.frames[run.frames.length - 1];
  const found = finished && last?.cost !== undefined && last.cost >= 0;
  const alt = found ? last?.path ?? [] : [];
  const altCost = found ? last?.cost ?? 0 : 0;

  return (
    <section id="reroute" data-chapter="reroute" className="chapter">
      <div className="stack-left">
        <p className="index">08 — REROUTING</p>
        {chapter === 'reroute' && (
          <>
            <div className="panel">
              <p className="diag-title">PRIMARY ROUTE</p>
              <p className="mono">
                {primary.path.join(' → ')} <span className="dim">· cost {primary.cost}</span>
              </p>
              <p className="mono is-bad">LINK C — F OFFLINE</p>
            </div>
            <h2 className="display big">
              {!finished ? (
                <span className="block is-warn">CALCULATING ALTERNATIVE ROUTE...</span>
              ) : found ? (
                <span className="block is-ok">ALTERNATIVE PATH FOUND</span>
              ) : (
                <span className="block is-bad">NO ROUTE EXISTS</span>
              )}
            </h2>
            {found && (
              <div className="panel is-live">
                <p className="mono route">{alt.join(' → ')}</p>
                <p className="mono">COST <span className="is-ok">{altCost}</span></p>
              </div>
            )}
            {found && (
              <p className="statement reveal">
                THE NETWORK DIDN&apos;T STOP.<br />IT FOUND ANOTHER WAY.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 09 — Recovery
// ---------------------------------------------------------------------------
export function RecoveryChapter() {
  const steps = useStore((s) => s.recovery);
  const net = useStore((s) => s.net);
  const done = steps.length > 0 && steps[steps.length - 1].text === 'RECOVERY COMPLETE';
  const healthy = networkStatus(net) === 'HEALTHY';
  return (
    <section id="recovery" data-chapter="recovery" className="chapter">
      <div className="stack-left">
        <p className="index">09 — RECOVERY</p>
        <ul className="recovery-log mono">
          {steps.map((step, i) => (
            <li key={`${step.text}-${i}`} className={step.done ? 'is-done' : 'is-live'}>
              <span>{step.done ? '✓' : '›'}</span> {step.text}
            </li>
          ))}
        </ul>
        {done && healthy && (
          <div className="panel is-live">
            <p className="status-word is-ok">RECOVERY COMPLETE</p>
            <p className="mono">NETWORK CONNECTED</p>
            <p className="mono is-ok">FULLY OPERATIONAL</p>
          </div>
        )}
      </div>
    </section>
  );
}
