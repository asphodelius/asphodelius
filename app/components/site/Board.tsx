"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { createEmbroidery, type Embroidery } from "./embroidery/engine";
import type { Mode } from "./embroidery/threads";
import styles from "./site.module.css";

const domMode = (): Mode => (document.documentElement.dataset.mode === "light" ? "light" : "dark");

let revealed = false;

function hideLoader(fade: boolean) {
  document.documentElement.dataset.ready = "";
  const el = document.querySelector<HTMLElement>("[data-loader]");
  if (!el || el.style.display === "none") return;
  if (!fade) { el.style.display = "none"; return; }
  const start = performance.now();
  const step = (now: number) => {
    if (el.style.display === "none") return;
    const k = Math.min(1, Math.max(0, (now - start) / 600));
    el.style.opacity = String(1 - k * k * (3 - 2 * k));
    if (k < 1) requestAnimationFrame(step); else el.style.display = "none";
  };
  requestAnimationFrame(step);
  window.setTimeout(() => { el.style.display = "none"; }, 1200);
}

function reveal() {
  if (revealed) { hideLoader(false); return; }
  window.setTimeout(() => { revealed = true; hideLoader(true); }, Math.max(60, 500 - performance.now()));
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
  if (revealed) hideLoader(false);
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

  useLayoutEffect(restoreRoot, []);
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
