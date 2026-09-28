import type { Pt } from "./threads";

export type IconStitch = { key: string; w: number; p0: Pt; p1: Pt; knot?: Pt; r: number };

const seg = (p0: Pt, p1: Pt, w: number, key: string): IconStitch => ({ key, w, p0, p1, r: 0 });
const knot = (p: Pt, r: number, key: string): IconStitch => ({ key, w: 0, p0: p, p1: p, knot: p, r });

function triFill(o: IconStitch[], A: Pt, B: Pt, C: Pt, key: string, w: number, n: number) {
  for (let k = 1; k <= n; k++) {
    const f = k / (n + 1);
    o.push(seg([A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f], [A[0] + (C[0] - A[0]) * f, A[1] + (C[1] - A[1]) * f], w, key));
  }
}

function stemPts(o: IconStitch[], pts: Pt[], key: string, w: number, step = 2.3) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step));
    for (let k = 0; k < n; k++) {
      const f0 = k / n, f1 = Math.min(1, (k + 1.6) / n);
      o.push(seg([a[0] + (b[0] - a[0]) * f0, a[1] + (b[1] - a[1]) * f0], [a[0] + (b[0] - a[0]) * f1, a[1] + (b[1] - a[1]) * f1], w, key));
    }
  }
}

function bar(o: IconStitch[], a: Pt, b: Pt, width: number, key: string) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, n = Math.round(L / 1.05);
  for (let i = 0; i <= n; i++) {
    const c: Pt = [a[0] + (dx * i) / n, a[1] + (dy * i) / n];
    o.push(seg([c[0] - (nx * width) / 2, c[1] - (ny * width) / 2], [c[0] + (nx * width) / 2, c[1] + (ny * width) / 2], 1.35, key));
  }
}

export const ICONS: Record<string, () => IconStitch[]> = {
  mail() {
    const o: IconStitch[] = [];
    for (let y = 6.3; y <= 15.2; y += 1.5) o.push(seg([2.3, y], [19.7, y], 1.75, "ys3"));
    triFill(o, [11, 11.4], [2.2, 5], [19.8, 5], "ys2", 1.7, 7);
    stemPts(o, [[1.5, 4.5], [20.5, 4.5], [20.5, 16], [1.5, 16], [1.5, 4.5]], "uiA", 1.3);
    stemPts(o, [[1.9, 4.9], [11, 11.4], [20.1, 4.9]], "uiA", 1.15);
    o.push(knot([11, 11.4], 2.4, "rs2"));
    return o;
  },
  plane() {
    const o: IconStitch[] = [], A: Pt = [20.5, 2.5], B: Pt = [1, 9], C: Pt = [9, 19.5], D: Pt = [9, 12];
    triFill(o, A, B, D, "bl3", 1.75, 9);
    triFill(o, A, D, C, "bl1", 1.75, 8);
    stemPts(o, [A, B, D, A], "bl0", 1.1);
    stemPts(o, [D, C, A], "bl0", 1.1);
    return o;
  },
  code() {
    const o: IconStitch[] = [];
    bar(o, [7, 5], [1.8, 11], 2.3, "lg1");
    bar(o, [1.8, 11], [7, 17], 2.3, "lg1");
    bar(o, [15, 5], [20.2, 11], 2.3, "lg1");
    bar(o, [20.2, 11], [15, 17], 2.3, "lg1");
    bar(o, [12.8, 3.2], [9.2, 18.8], 2.2, "rs3");
    o.push(knot([1.8, 11], 1.9, "lg2"), knot([20.2, 11], 1.9, "lg2"));
    return o;
  },
};
