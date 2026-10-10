'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { degree, NODE_IDS } from '@/lib/network';
import { CHAPTERS, MENU_ITEMS } from '@/lib/story';
import { useStore } from '@/lib/store';
import { scrollToChapter } from '@/lib/scroll';

/** Top bar: wordmark on the left, current chapter in the middle, MENU on the right. */
export function TopBar() {
  const chapter = useStore((s) => s.chapter);
  const menuOpen = useStore((s) => s.menuOpen);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const current = CHAPTERS.find((c) => c.id === chapter);

  return (
    <header className="topbar">
      <button type="button" className="wordmark" onClick={() => scrollToChapter('hero')}>
        CIRCUIT-X
      </button>
      <span className="topbar-chapter" aria-live="polite">
        {current && current.index !== '00' ? `${current.index} — ${current.title.toUpperCase()}` : ''}
      </span>
      <button type="button" className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
        {menuOpen ? 'CLOSE' : 'MENU'}
      </button>
    </header>
  );
}

/** Spatial overlay menu: full-screen, items reveal one by one. */
export function Menu() {
  const open = useStore((s) => s.menuOpen);
  const chapter = useStore((s) => s.chapter);
  const setMenuOpen = useStore((s) => s.setMenuOpen);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open || !list.current) return;
    gsap.fromTo(
      list.current.querySelectorAll('li'),
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out' },
    );
  }, [open]);
