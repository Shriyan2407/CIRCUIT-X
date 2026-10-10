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
