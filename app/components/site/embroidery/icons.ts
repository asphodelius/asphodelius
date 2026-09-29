import { DUAL_ASCENT } from "./marks";
import { traceMark } from "./trace";
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

function bar(o: IconStitch[], a: Pt, b: Pt, width: number, key: string | string[]) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, n = Math.round(L / 1.05);
  for (let i = 0; i <= n; i++) {
    const c: Pt = [a[0] + (dx * i) / n, a[1] + (dy * i) / n];
    o.push(seg([c[0] - (nx * width) / 2, c[1] - (ny * width) / 2], [c[0] + (nx * width) / 2, c[1] + (ny * width) / 2], 1.35, typeof key === "string" ? key : key[i % key.length]));
  }
}

/** Satin stitches laid radially along an arc, angles in canvas convention (0 = right, positive = clockwise). */
function arcBar(o: IconStitch[], c: Pt, r: number, a0: number, a1: number, width: number, key: string | string[]) {
  const n = Math.round((Math.abs(a1 - a0) * r) / 1.05);
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n, ux = Math.cos(a), uy = Math.sin(a);
    o.push(seg([c[0] + ux * (r - width / 2), c[1] + uy * (r - width / 2)], [c[0] + ux * (r + width / 2), c[1] + uy * (r + width / 2)], 1.35, typeof key === "string" ? key : key[i % key.length]));
  }
}

/** A rounded square of tatami fill with a darker border, filling the 22 x 22 icon box. */
function patch(o: IconStitch[], ramp: string[], edge: string, radius: number) {
  const inset = (y: number) => { const d = Math.max(0, radius - Math.min(y, 22 - y)); return radius - Math.sqrt(Math.max(0, radius * radius - d * d)); };
  let row = 0;
  for (let y = 1.1; y <= 20.9; y += 1.15, row++) {
    const x0 = inset(y) + 0.6, x1 = 22 - inset(y) - 0.6, len = x1 - x0, cuts = Math.max(1, Math.round(len / 7)), off = (row % 3) / 3;
    for (let k = 0; k < cuts; k++) {
      const f0 = Math.max(0, (k - off * 0.6) / cuts), f1 = Math.min(1, (k + 1 - off * 0.6) / cuts);
      o.push(seg([x0 + len * f0, y], [x0 + len * f1, y], 1.4, ramp[(row * 2 + k * 3) % ramp.length]));
    }
  }
  const ring: Pt[] = [];
  for (const [cx, cy, a] of [[22 - radius, radius, -Math.PI / 2], [22 - radius, 22 - radius, 0], [radius, 22 - radius, Math.PI / 2], [radius, radius, Math.PI]] as const) {
    for (let i = 0; i <= 5; i++) ring.push([cx + Math.cos(a + (i * Math.PI) / 10) * (radius - 0.4), cy + Math.sin(a + (i * Math.PI) / 10) * (radius - 0.4)]);
  }
  ring.push(ring[0]);
  stemPts(o, ring, edge, 1.1, 1.7);
}

/**
 * Project logos live here, keyed by project slug: a stitched patch in the brand colour with the mark on top.
 * Draw the mark in its own SVG units and map it with `at`, so a new logo is a handful of bar/arcBar calls.
 */
export const ICONS: Record<string, () => IconStitch[]> = {
  "dual-ascent"() {
    const o: IconStitch[] = [];
    patch(o, ["bg1", "bg2", "bg1", "bg3"], "bg0", 4.6);
    o.push(...traceMark(DUAL_ASCENT, 15.5, 0.6, ["br1", "br1", "br2", "br0"]));
    return o;
  },
  "good-people"() {
    const o: IconStitch[] = [], s = 0.78, at = (x: number, y: number): Pt => [11 + (x - 25) * s, 11 + (y - 25) * s], white = ["wb3", "wb3", "wb2"];
    patch(o, ["og2", "og1", "og2", "og3", "og2"], "og0", 4.6);
    bar(o, at(22.3, 16.75), at(31.2, 16.75), 3.5 * s, white);
    bar(o, at(33.1, 15), at(33.1, 26.8), 3.8 * s, white);
    const c = at(22.3, 28.2);
    arcBar(o, c, 5.01 * s, -Math.PI / 2, Math.PI, 3.5 * s, white);
    return o;
  },
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
