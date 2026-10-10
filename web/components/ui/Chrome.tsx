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

  return (
    <nav className={`menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <ul ref={list}>
        {MENU_ITEMS.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              className={chapter === item.id ? 'is-current' : ''}
              onClick={() => {
                setMenuOpen(false);
                scrollToChapter(item.id);
              }}
            >
              <span className="menu-index">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Appears when a node is clicked in the 3D scene. Clicking the node again releases it. */
export function Inspector() {
  const selected = useStore((s) => s.selected);
  const net = useStore((s) => s.net);
  const failNode = useStore((s) => s.failNode);
  const setSelected = useStore((s) => s.setSelected);

  if (!selected || !NODE_IDS.includes(selected as (typeof NODE_IDS)[number])) return null;
  const online = !net.failedNodes.includes(selected);

  return (
    <aside className="inspector" aria-live="polite">
      <p className="inspector-title">NODE {selected}</p>
      <dl>
        <div>
          <dt>STATUS</dt>
          <dd className={online ? 'is-ok' : 'is-bad'}>{online ? 'ACTIVE' : 'FAILED'}</dd>
        </div>
        <div>
          <dt>CONNECTIONS</dt>
          <dd>{String(degree(selected)).padStart(2, '0')}</dd>
        </div>
      </dl>
      <div className="inspector-actions">
        {online && (
          <button type="button" onClick={() => failNode(selected)}>
            TAKE OFFLINE
          </button>
        )}
        <button type="button" onClick={() => setSelected(null)}>
          RELEASE
        </button>
      </div>
    </aside>
  );
}
