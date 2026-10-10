'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { useStore } from '@/lib/store';
import { BOOT_LINES, BOOT_STATS } from '@/lib/story';

const LINE_MS = 620;
const START_MS = 500;

/**
 * Cinematic boot: technical text on black, then the network is assembled behind
 * the overlay. Reduced-motion visitors get a short fade with no typing delay.
 */
export function Boot() {
  const booted = useStore((s) => s.booted);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = reduced ? 0 : LINE_MS;
    const timers: number[] = [];
    const progress = { t: 0 };

    BOOT_LINES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setShown(i + 1), reduced ? 0 : START_MS + i * step));
    });

    const assembleAt = reduced ? 0 : START_MS + BOOT_LINES.length * step + 500;
    timers.push(
      window.setTimeout(() => {
        useStore.getState().setBooted();
        gsap.to(progress, {
          t: 1,
          duration: reduced ? 0.4 : 5.2,
          ease: 'power2.inOut',
          onUpdate: () => useStore.getState().setBootT(progress.t),
          onComplete: () => useStore.getState().setBootT(1),
        });
      }, assembleAt),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      gsap.killTweensOf(progress);
    };
  }, []);

  return (
    <div className={`boot${booted ? ' is-done' : ''}`} aria-hidden={booted}>
      <div className="boot-inner">
        <p className="boot-kicker">CIRCUIT-X</p>
        <p className="boot-sub">NETWORK RELIABILITY SIMULATION</p>
        <ul className="boot-log">
          {BOOT_LINES.map((line, i) => (
            <li key={line} className={i < shown ? 'is-shown' : ''}>
              <span className="boot-tick">{i < shown ? '✓' : '·'}</span>
              {line}
            </li>
          ))}
        </ul>
        <div className={`boot-stats${shown >= BOOT_LINES.length ? ' is-shown' : ''}`}>
          {BOOT_STATS.map((stat) => (
            <span key={stat}>{stat}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
