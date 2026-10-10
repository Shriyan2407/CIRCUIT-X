'use client';

import { useEffect } from 'react';
import { ALGO_STEP_MS, useStore } from '@/lib/store';

const HEAP_STEP_MS = 1500;

/**
 * Drives time for algorithm runs and the heap demo. It owns no UI; it only
 * advances store indices, so the 3D scene and the HUD stay in sync.
 */
export function Player() {
  const playing = useStore((s) => !!s.run?.playing);
  const chapter = useStore((s) => s.chapter);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const s = useStore.getState();
      const r = s.run;
      if (!r) return;
      if (r.index >= r.frames.length - 1) {
        useStore.setState({ run: { ...r, playing: false } });
        return;
      }
      useStore.setState({ run: { ...r, index: r.index + 1 } });
    }, ALGO_STEP_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (chapter !== 'heap') return;
    const id = window.setInterval(() => {
      useStore.getState().stepHeap(1);
    }, HEAP_STEP_MS);
    return () => window.clearInterval(id);
  }, [chapter]);

  return null;
}
