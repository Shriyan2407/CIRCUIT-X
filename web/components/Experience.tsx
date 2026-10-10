'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/lib/store';
import { CHAPTERS, type ChapterId } from '@/lib/story';
import { setLenis } from '@/lib/scroll';
import { Boot } from './ui/Boot';
import { AlgorithmHud } from './ui/Hud';
import { Inspector, Menu, TopBar } from './ui/Chrome';
import { Fallback } from './ui/Fallback';
import { Player } from './ui/Player';
import { Hero, NetworkChapter, FailureChapter, PartitionChapter, RerouteChapter, RecoveryChapter } from './sections/Story';
import { BfsChapter, DfsChapter, DijkstraChapter, HeapChapter } from './sections/Algorithms';
import { ArchitectureChapter } from './sections/Architecture';
import { SimulatorChapter } from './sections/Simulator';

// The WebGL scene is heavy and needs a browser; load it only on the client.
const Scene = dynamic(() => import('./scene/Scene').then((m) => m.Scene), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Root of the experience. It wires the systems together: smooth scroll, chapter
 * detection, reveal animations, device checks and input. The 3D scene and the DOM
 * sections only meet through the store.
 */
export function Experience() {
  const webgl = useStore((s) => s.webgl);
  const setWebgl = useStore((s) => s.setWebgl);
  const setMobile = useStore((s) => s.setMobile);
  const setMouse = useStore((s) => s.setMouse);
  const setChapter = useStore((s) => s.setChapter);

  // Capability and device detection.
  useEffect(() => {
    setWebgl(hasWebGL());
    const coarse = window.matchMedia('(max-width: 820px), (pointer: coarse)');
    const applyMobile = () => setMobile(coarse.matches);
    applyMobile();
    coarse.addEventListener('change', applyMobile);
    return () => coarse.removeEventListener('change', applyMobile);
  }, [setWebgl, setMobile]);

  // Smooth scroll, driven by GSAP's ticker so both share one frame loop.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      touchMultiplier: 1.2,
    });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Chapter detection: whichever section crosses the middle band becomes the chapter.
  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setChapter(entry.target.id as ChapterId);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [setChapter]);

  // Text reveals: each .reveal line rises and sharpens as it enters the viewport.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  // Mouse drives camera parallax on desktop only.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      setMouse((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [setMouse]);

  return (
    <>
      <div className="scene-wrap" aria-hidden>
        {webgl === true && <Scene />}
        {webgl === false && <Fallback />}
      </div>

      <Boot />
      <TopBar />
      <Menu />
      <AlgorithmHud />
      <Inspector />
      <Player />

      <main className="content">
        <Hero />
        <NetworkChapter />
        <BfsChapter />
        <DfsChapter />
        <DijkstraChapter />
        <FailureChapter />
        <HeapChapter />
        <PartitionChapter />
        <RerouteChapter />
        <RecoveryChapter />
        <ArchitectureChapter />
        <SimulatorChapter />
        <footer className="foot mono">
          CIRCUIT-X · A graph-based network reliability simulation and DSA demonstration. Java core, simulated visually.
        </footer>
      </main>
    </>
  );
}
