"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { createEmbroidery, type Embroidery } from "./embroidery/engine";
import type { Mode, Tint } from "./embroidery/threads";
import styles from "./site.module.css";

const domMode = (): Mode => (document.documentElement.dataset.mode === "light" ? "light" : "dark");

function reveal() {
  try { sessionStorage.setItem("sewn", "1"); } catch {}
  document.documentElement.dataset.ready = "";
  return 0;
}

function firstVisit() {
  try { return !sessionStorage.getItem("sewn"); } catch { return true; }
}

function restoreRoot() {
  const root = document.documentElement;
  if (!root.dataset.mode) {
    let m: string | null = null;
    try { m = localStorage.getItem("mode"); } catch {}
    if (m !== "light" && m !== "dark") m = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.dataset.mode = m;
    root.dataset.ink = m;
  }
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
  highlight: Tint;
  unpickRef: RefObject<(() => void) | null>;
  onStitches: (count: number) => void;
};

export function Board({ panelRef, rootRef, mode, highlight, unpickRef, onStitches }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<Embroidery | null>(null);
  const stitchesRef = useRef(onStitches);

  useLayoutEffect(restoreRoot, []);
  useEffect(() => { stitchesRef.current = onStitches; }, [onStitches]);

  useEffect(() => {
    const canvas = canvasRef.current, panel = panelRef.current, root = rootRef.current;
    if (!canvas || !panel || !root) return;
    const api = createEmbroidery(canvas, { panel, root, mode: domMode(), onStitches: n => stitchesRef.current(n), onSwap: swapInk, onReady: reveal, sew: firstVisit() });
    apiRef.current = api;
    unpickRef.current = api.unpick;
    return () => { api.destroy(); apiRef.current = null; unpickRef.current = null; };
  }, [panelRef, rootRef, unpickRef]);

  useEffect(() => { if (mode === domMode()) apiRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { apiRef.current?.setHighlight(highlight); }, [highlight]);

  return <canvas ref={canvasRef} className={styles.board} aria-hidden="true" />;
}
