'use client';

import { ARCH_COPY } from '@/components/scene/ArchitectureScene';
import { useStore } from '@/lib/store';

/** DOM panel that explains whichever module is selected in the 3D tree. */
export function ArchitectureChapter() {
  const selected = useStore((s) => s.archSelected);
  const copy = ARCH_COPY[selected];
  return (
    <section id="architecture" data-chapter="architecture" className="chapter chapter-arch">
      <div className="stack-left">
        <p className="index">10 — ARCHITECTURE</p>
        <h2 className="display big">
          <span className="reveal block">ONE GRAPH.</span>
          <span className="reveal block dim">FIVE MODULES.</span>
        </h2>
        <div className="panel arch-panel" aria-live="polite">
          <p className="diag-title">{copy.title}</p>
          <p className="arch-body">{copy.body}</p>
          <p className="mono dim">SOURCE · {copy.file}</p>
        </div>
        <p className="mono caption">Select any module in the tree.</p>
      </div>
    </section>
  );
}
