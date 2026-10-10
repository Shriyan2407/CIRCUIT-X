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
