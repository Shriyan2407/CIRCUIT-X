'use client';

import type Lenis from 'lenis';

// Module-level handle so menu buttons anywhere in the tree can scroll smoothly.
let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export function scrollToChapter(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { duration: 1.8, easing: easeOutQuart });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
