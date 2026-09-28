"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createBoard, type Board as BoardApi, type BoardMode } from "./board-engine";
import styles from "./site.module.css";

type BoardProps = {
  panelRef: RefObject<HTMLDivElement | null>;
  mode: BoardMode;
  highlight: boolean;
};

export function Board({ panelRef, mode, highlight }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<BoardApi | null>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    const canvas = canvasRef.current, panel = panelRef.current;
    if (!canvas || !panel) return;
    const board = createBoard(canvas, panel, modeRef.current);
    boardRef.current = board;
    return () => { board.destroy(); boardRef.current = null; };
  }, [panelRef]);

  useEffect(() => { modeRef.current = mode; boardRef.current?.setMode(mode); }, [mode]);
  useEffect(() => { boardRef.current?.setHighlight(highlight); }, [highlight]);

  return <canvas ref={canvasRef} className={styles.board} aria-hidden="true" />;
}
