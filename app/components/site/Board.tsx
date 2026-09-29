"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createEmbroidery, type Embroidery } from "./embroidery/engine";
import type { Mode } from "./embroidery/threads";
import styles from "./site.module.css";

const domMode = (): Mode => (document.documentElement.dataset.mode === "light" ? "light" : "dark");

function reveal() {
  const root = document.documentElement;
  window.setTimeout(() => { root.dataset.ready = ""; }, Math.max(0, 900 - performance.now()));
}

function swapInk(mode: Mode) {
  const root = document.documentElement;
  root.dataset.ink = mode;
  window.setTimeout(() => { delete root.dataset.switching; }, 700);
}

type BoardProps = {
  panelRef: RefObject<HTMLDivElement | null>;
  rootRef: RefObject<HTMLDivElement | null>;
  mode: Mode;
  highlight: boolean;
  unpickRef: RefObject<(() => void) | null>;
  onStitches: (count: number) => void;
};

export function Board({ panelRef, rootRef, mode, highlight, unpickRef, onStitches }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<Embroidery | null>(null);
  const stitchesRef = useRef(onStitches);

  useEffect(() => { stitchesRef.current = onStitches; }, [onStitches]);

  useEffect(() => {
    const canvas = canvasRef.current, panel = panelRef.current, root = rootRef.current;
    if (!canvas || !panel || !root) return;
    const api = createEmbroidery(canvas, { panel, root, mode: domMode(), onStitches: n => stitchesRef.current(n), onSwap: swapInk, onReady: reveal });
    apiRef.current = api;
    unpickRef.current = api.unpick;
    return () => { api.destroy(); apiRef.current = null; unpickRef.current = null; };
  }, [panelRef, rootRef, unpickRef]);

  useEffect(() => { if (mode === domMode()) apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setHighlight(highlight); }, [highlight]);

  return <canvas ref={canvasRef} className={styles.board} aria-hidden="true" />;
}
