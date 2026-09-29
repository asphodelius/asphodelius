import { DUAL_ASCENT, EMAIL, GITHUB, TELEGRAM, type Mark } from "./marks";
import { outlineMark, traceMark } from "./trace";
import type { Pt } from "./threads";

export type IconStitch = { key: string; w: number; p0: Pt; p1: Pt; knot?: Pt; r: number };

const seg = (p0: Pt, p1: Pt, w: number, key: string): IconStitch => ({ key, w, p0, p1, r: 0 });

const knot = (p: Pt, r: number, key: string): IconStitch => ({ key, w: 0, p0: p, p1: p, knot: p, r });

/**
 * Stitches cast their shadow towards the bottom right, so a stitch laid after its neighbours darkens them when the run
 * heads up and left. Ordering a group by position makes every shadow fall on thread that is still to be sewn.
 */
function sewFromTopLeft(o: IconStitch[], from: number) {
  const at = (s: IconStitch) => s.p0[0] + s.p0[1] + s.p1[0] + s.p1[1];
  const tail = o.splice(from).sort((a, b) => at(a) - at(b));
  o.push(...tail);
}

/** Threads in runs of `run` stitches, like variegated floss: the colour drifts along the line instead of alternating. */
const variegated = (keys: string[], run = 5) => keys.flatMap(k => Array<string>(run).fill(k));

/** A stem-stitch outline on the edge of a mark, sewn over the fill. */
function outline(o: IconStitch[], mark: Mark, size: number, keys: string[]) {
  const from = o.length;
  for (const pts of outlineMark(mark, size, 1.4)) stemPts(o, pts, variegated(keys), 1.15, 1.7);
  sewFromTopLeft(o, from);
}

function triFill(o: IconStitch[], A: Pt, B: Pt, C: Pt, key: string, w: number, n: number) {
  for (let k = 1; k <= n; k++) {
    const f = k / (n + 1);
    o.push(seg([A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f], [A[0] + (C[0] - A[0]) * f, A[1] + (C[1] - A[1]) * f], w, key));
  }
}

function stemPts(o: IconStitch[], pts: Pt[], key: string | string[], w: number, step = 2.3) {
  let count = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step));
    for (let k = 0; k < n; k++) {
      const f0 = k / n, f1 = Math.min(1, (k + 1.6) / n);
      o.push(seg([a[0] + (b[0] - a[0]) * f0, a[1] + (b[1] - a[1]) * f0], [a[0] + (b[0] - a[0]) * f1, a[1] + (b[1] - a[1]) * f1], w, typeof key === "string" ? key : key[count++ % key.length]));
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
      const f0 = Math.max(0, (k - off * 0.6) / cuts), f1 = k === cuts - 1 ? 1 : (k + 1 - off * 0.6) / cuts;
      o.push(seg([x0 + len * f0, y], [x0 + len * f1, y], 1.4, ramp[(row * 2 + k * 3) % ramp.length]));
    }
  }
  const ring: Pt[] = [];
  for (const [cx, cy, a] of [[22 - radius, radius, -Math.PI / 2], [22 - radius, 22 - radius, 0], [radius, 22 - radius, Math.PI / 2], [radius, radius, Math.PI]] as const) {
    for (let i = 0; i <= 5; i++) ring.push([cx + Math.cos(a + (i * Math.PI) / 10) * (radius - 0.4), cy + Math.sin(a + (i * Math.PI) / 10) * (radius - 0.4)]);
  }
  ring.push(ring[0]);
  const from = o.length;
  stemPts(o, ring, edge, 1.1, 1.7);
  sewFromTopLeft(o, from);
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
    patch(o, ["og2", "og1", "og2", "og3", "og2"], "og1", 4.6);
    const from = o.length;
    bar(o, at(22.3, 16.75), at(31.2, 16.75), 3.5 * s, white);
    bar(o, at(33.1, 15), at(33.1, 26.8), 3.8 * s, white);
    const c = at(22.3, 28.2);
    arcBar(o, c, 5.01 * s, -Math.PI / 2, Math.PI, 3.5 * s, white);
    sewFromTopLeft(o, from);
    return o;
  },
  mail() {
    const o: IconStitch[] = [];
    o.push(...traceMark(EMAIL, 20.5, 0, ["ys2", "ys3", "ys2", "ys1"]));
    outline(o, EMAIL, 20.5, ["bl2", "pl3", "pk3", "bl3", "lg3"]);
    o.push(knot([11.00, 12.45], 1.8, "rs2"));
    return o;
  },
  github() {
    const o: IconStitch[] = [];
    o.push(...traceMark(GITHUB, 20, 0, ["gh1", "gh1", "gh2", "gh0"]));
    outline(o, GITHUB, 20, ["lg3", "ys2", "orn", "rs3", "pk3"]);
    return o;
  },
  telegram() {
    const o: IconStitch[] = [];
    o.push(...traceMark(TELEGRAM, 20.5, 0, ["bl1", "bl2", "bl1", "bl3"], 1.35, -0.55));
    triFill(o, [14.07, 9.63], [9.72, 14.42], [11.68, 16.64], "bl3", 1.3, 7);
    outline(o, TELEGRAM, 20.5, ["ys2", "orn", "pk3", "pl3", "bl3"]);
    return o;
  },
};
