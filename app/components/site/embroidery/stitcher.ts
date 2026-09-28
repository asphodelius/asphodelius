import { lerp, type Pt, type Rgb } from "./threads";

export type StitchKind = "q" | "loop" | "knot";

export interface Stitch {
  t: StitchKind;
  p0: Pt; c: Pt; p1: Pt;
  p: Pt; r: number;
  hw: number;
  w: number;
  key: string;
  g: number;
  e: number;
  j: number;
  asph: boolean;
  fl: number;
  rev: boolean; v: number; ai: number; lv: number;
  mx: number; my: number;
  c0: Rgb | null; c1: Rgb | null; t1: number;
}

export type Head = { x: number; y: number; r: number };
export type Flower = { c: Pt; r: number };

type StitchInit = Partial<Stitch> & { t: StitchKind; key: string; g: number };
type FanOptions = { w?: number; gap?: number; asph?: boolean; curl?: number };
export type Profile = (u: number) => number;

export const bez = (p0: Pt, c: Pt, p1: Pt, t: number): Pt => [
  lerp(lerp(p0[0], c[0], t), lerp(c[0], p1[0], t), t),
  lerp(lerp(p0[1], c[1], t), lerp(c[1], p1[1], t), t),
];
export const pol = (c: Pt, a: number, d: number): Pt => [c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d];
export const mid = (a: Pt, b: Pt, bulge: Pt = [0, 0]): Pt => [(a[0] + b[0]) / 2 + bulge[0], (a[1] + b[1]) / 2 + bulge[1]];
export const roundProf = (rin: number, rmax: number, flat = 0.45, pw = 0.5): Profile => u =>
  rin + (rmax - rin) * (flat + (1 - flat) * Math.pow(Math.sin(Math.PI * u), pw));

export const ROSE = ["rs0", "rs1", "rs2", "rs3", "rs4", "rs5"];
export const PEONY = ["pk0", "pk1", "pk2", "pk3", "pk4", "pk5"];

export class Stitcher {
  out: Stitch[] = [];
  heads: Head[] = [];
  flowers: Flower[] = [];
  thread = 0.0062;
  private element = 0;
  private flower = -1;

  constructor(readonly rand: () => number) {}

  el() { return ++this.element; }

  add(o: StitchInit): Stitch {
    const s: Stitch = {
      p0: [0, 0], c: [0, 0], p1: [0, 0], p: [0, 0], r: 0, hw: 0, w: this.thread, asph: false, fl: -1,
      rev: false, v: 0, ai: 0, lv: 0, mx: 0, my: 0, c0: null, c1: null, t1: 0,
      ...o, j: 0.93 + this.rand() * 0.1, e: this.element,
    };
    if (s.asph) s.fl = this.flower;
    this.out.push(s);
    return s;
  }

  stem(p0: Pt, c: Pt, p1: Pt, key: string, w = this.thread, g = 0) {
    const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), n = Math.max(3, Math.round(len / 0.008));
    for (let i = 0; i < n; i++) {
      const a = bez(p0, c, p1, i / n), b = bez(p0, c, p1, Math.min(1, (i + 1.6) / n)), dx = b[0] - a[0], dy = b[1] - a[1];
      this.add({ t: "q", p0: [a[0] - dy * 0.12, a[1] + dx * 0.12], c: mid(a, b), p1: [b[0] + dy * 0.12, b[1] - dx * 0.12], w, key, g });
    }
  }
  knot(p: Pt, r: number, key: string, g: number, asph = false) { this.add({ t: "knot", p, r, key, g, asph }); }
  lazy(p0: Pt, p1: Pt, hw: number, key: string, g: number, w = this.thread * 0.9, asph = false) {
    this.add({ t: "loop", p0, p1, hw, w, key, g, asph });
  }

  free(x: number, y: number, r: number, pad = 0.005) {
    if (x - r < 0.03 || x + r > 0.97 || y - r < 0.03 || y + r > 0.97) return false;
    return this.heads.every(h => Math.hypot(x - h.x, y - h.y) >= r + h.r + pad);
  }
  claim(x: number, y: number, r: number) { this.heads.push({ x, y, r }); }

    fanPetal(c: Pt, a: number, span: number, rIn: number, prof: Profile, ramp: string[], g: number, o: FanOptions = {}) {
    const w = o.w ?? this.thread * 1.05, rMax = prof(0.5), rows = ramp.length;
    const n = Math.max(3, Math.ceil((span * rMax) / (w * (o.gap ?? 0.9))));
    for (let i = 0; i <= n; i++) {
      const u = i / n, ang = a + span * (u - 0.5), r1 = prof(u);
      if (r1 <= rIn + 0.002) continue;
      const jit = (this.rand() - 0.5) * 0.3, alt = (i % 2) * 0.3;
      for (let k = 0; k < rows; k++) {
        const f0 = k === 0 ? 0 : Math.max(0, (k - 0.45 + jit + alt) / rows), f1 = k === rows - 1 ? 1 : Math.min(1, (k + 1 + jit + alt) / rows);
        const ra = lerp(rIn, r1, f0), rb = lerp(rIn, r1, f1), p0 = pol(c, ang, ra), p1 = pol(c, ang + (o.curl ?? 0) * (rb / rMax), rb);
        this.add({ t: "q", p0, c: mid(p0, p1), p1, w, key: ramp[k], g: g + k * 0.002, asph: o.asph });
      }
    }
  }

    leaf(base: Pt, ctrl: Pt, tip: Pt, hw: number, g: number, pal = ["lg0", "lg1", "lg2", "lg3"], vein = "lgV") {
    this.el();
    const T = this.thread, pt = (t: number) => bez(base, ctrl, tip, t);
    const len = Math.hypot(tip[0] - base[0], tip[1] - base[1]), n = Math.max(8, Math.ceil(len / (T * 1.02)));
    for (const s of [1, -1]) {
      const inner = s > 0 ? pal[0] : pal[2], outer = s > 0 ? pal[1] : pal[3];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n, a = pt(t), b = pt(Math.min(1, t + 0.01)), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
        const wv = hw * Math.pow(Math.sin(Math.PI * Math.min(0.999, t)), 0.75) * (1 - 0.2 * t);
        if (wv < 0.002) continue;
        const edge: Pt = [a[0] - (dy / L) * wv * s, a[1] + (dx / L) * wv * s], m = pt(Math.min(1, t + 0.07)), j = (this.rand() - 0.5) * 0.14 + (i % 2) * 0.1;
        this.add({ t: "q", p0: edge, c: mid(edge, m), p1: [lerp(edge[0], m[0], 0.6 + j), lerp(edge[1], m[1], 0.6 + j)], w: T * 1.18, key: outer, g });
        this.add({ t: "q", p0: [lerp(edge[0], m[0], 0.45 + j), lerp(edge[1], m[1], 0.45 + j)], c: mid(edge, m), p1: m, w: T * 1.18, key: inner, g: g + 0.002 });
      }
    }
    this.stem(pt(0.02), pt(0.45), pt(0.86), vein, T * 0.5, g + 0.004);
  }

  rose(c: Pt, Rr: number, P: string[], g: number) {
    const T = this.thread, rot = this.rand() * 6.283;
    this.el();
    for (let k = 0; k < 5; k++) this.fanPetal(c, rot + k * 1.2566 + (this.rand() - 0.5) * 0.15, 1.62, Rr * 0.3, roundProf(Rr * 0.3, Rr * (0.94 + this.rand() * 0.08)), [P[1], P[2], P[3], P[4]], g, { w: T * 1.25, gap: 1.12 });
    this.el();
    for (let k = 0; k < 4; k++) this.fanPetal(c, rot + 0.63 + k * 1.5708, 1.95, Rr * 0.12, roundProf(Rr * 0.12, Rr * 0.72), [P[0], P[1], P[2], P[5]], g + 0.02, { w: T * 1.15, gap: 1.1 });
    this.el();
    for (let k = 0; k < 3; k++) this.fanPetal(c, rot + 0.2 + k * 2.094, 2.4, Rr * 0.02, roundProf(Rr * 0.02, Rr * 0.46, 0.5), [P[0], P[0], P[1], P[3]], g + 0.04, { w: T * 0.95 });
    this.el();
    this.fanPetal(c, -Math.PI / 2, 2.2, Rr * 0.02, roundProf(Rr * 0.02, Rr * 0.26, 0.55), [P[0], P[1], P[2]], g + 0.05, { w: T * 0.9 });
    this.el();
    this.fanPetal(c, Math.PI / 2, 2.5, Rr * 0.06, roundProf(Rr * 0.06, Rr * 0.4, 0.3, 0.7), [P[1], P[2], P[4], P[5]], g + 0.06, { w: T * 0.95 });
  }

  pansy(c: Pt, Rr: number, rot: number, back: string[], face: string[], g: number) {
    const T = this.thread, pr = (a: number, b: number) => roundProf(a, b, 0.4, 0.45);
    this.el();
    this.fanPetal(c, rot - Math.PI / 2 - 0.45, 1.45, Rr * 0.08, pr(Rr * 0.08, Rr), back, g);
    this.fanPetal(c, rot - Math.PI / 2 + 0.45, 1.45, Rr * 0.08, pr(Rr * 0.08, Rr * 0.96), back, g + 0.01);
    this.el();
    this.fanPetal(c, rot + Math.PI + 0.32, 1.3, Rr * 0.06, pr(Rr * 0.06, Rr * 0.82), face, g + 0.02);
    this.fanPetal(c, rot - 0.32, 1.3, Rr * 0.06, pr(Rr * 0.06, Rr * 0.82), face, g + 0.02);
    this.el();
    this.fanPetal(c, rot + Math.PI / 2, 1.75, Rr * 0.05, pr(Rr * 0.05, Rr * 0.9), face, g + 0.03);
    this.el();
    for (const [pa, m] of [[rot + Math.PI + 0.32, 3], [rot - 0.32, 3], [rot + Math.PI / 2, 5]]) {
      for (let j = 0; j < m; j++) {
        const a = pa + (j - (m - 1) / 2) * 0.19, l = Rr * (0.3 + 0.14 * (j % 2) + (j === (m - 1) / 2 ? 0.1 : 0));
        this.add({ t: "q", p0: pol(c, a, Rr * 0.1), c: pol(c, a, l * 0.6), p1: pol(c, a, l), w: T * 0.55, key: "pray", g: g + 0.04 });
      }
    }
    this.lazy(pol(c, rot - Math.PI / 2, Rr * 0.02), pol(c, rot - Math.PI / 2, Rr * 0.16), Rr * 0.05, "wb3", g + 0.05, T * 0.7);
    this.knot(c, T * 1.05, "ys1", g + 0.06);
  }

  asphodel(c: Pt, Rr: number, rot: number, g: number) {
    const T = this.thread;
    this.flowers[++this.flower] = { c, r: Rr };
    this.el();
    const tp = (a: number, b: number): Profile => u => a + (b - a) * Math.pow(Math.sin(Math.PI * u), 0.6);
    for (let k = 0; k < 6; k++) {
      const a = rot + (k * Math.PI) / 3 + (this.rand() - 0.5) * 0.08;
      this.fanPetal(c, a, 0.78, Rr * 0.1, tp(Rr * 0.1, Rr * (0.95 + this.rand() * 0.07)), ["petalIn", "petal2", "petal"], g, { asph: true, w: T * (Rr > 0.07 ? 1.05 : 0.9) });
      this.add({ t: "q", p0: pol(c, a, Rr * 0.14), c: pol(c, a + 0.01, Rr * 0.5), p1: pol(c, a, Rr * 0.8), w: T * 0.55, key: "vein", g: g + 0.5, asph: true });
    }
    this.el();
    for (let k = 0; k < 6; k++) {
      const a = rot + (k * Math.PI) / 3 + Math.PI / 6 + (this.rand() - 0.5) * 0.25, e = pol(c, a, Rr * (0.4 + this.rand() * 0.07));
      this.add({ t: "q", p0: pol(c, a, Rr * 0.05), c: pol(c, a + 0.1, Rr * 0.24), p1: e, w: T * 0.45, key: "filament", g: g + 0.6, asph: true });
      this.knot(e, T * (Rr > 0.07 ? 0.95 : 0.78), "anther", g + 0.7, true);
    }
    this.knot(c, T * 1.05, "ovary", g + 0.7, true);
  }

  fivePetal(c: Pt, Rr: number, ramp: string[], eye: string, g: number) {
    const rot = this.rand() * 6.283;
    this.el();
    for (let k = 0; k < 5; k++) this.fanPetal(c, rot + k * 1.2566, 1.22, Rr * 0.14, roundProf(Rr * 0.14, Rr, 0.35, 0.5), ramp, g, { w: this.thread * 0.8, gap: 1 });
    this.knot(c, this.thread * 0.9, eye, g + 0.01);
  }

  rosebud(c: Pt, Rr: number, dir: number, P: string[], g: number) {
    const T = this.thread;
    this.el();
    this.lazy(c, pol(c, dir - 1.05, Rr * 0.85), Rr * 0.16, "lg2", g - 0.01, T * 0.9);
    this.lazy(c, pol(c, dir + 1.05, Rr * 0.85), Rr * 0.16, "lg1", g - 0.01, T * 0.9);
    const bp = (m: number): Profile => u => Rr * 0.05 + Rr * m * (0.35 + 0.65 * Math.pow(Math.sin(Math.PI * u), 0.6));
    this.el();
    this.fanPetal(c, dir - 0.3, 0.75, Rr * 0.05, bp(1), [P[1], P[2], P[3]], g, { w: T * 0.95 });
    this.fanPetal(c, dir + 0.3, 0.75, Rr * 0.05, bp(0.97), [P[1], P[2], P[3]], g + 0.01, { w: T * 0.95 });
    this.el();
    this.fanPetal(c, dir, 0.8, Rr * 0.05, bp(0.72), [P[2], P[4], P[5]], g + 0.02, { w: T * 0.95 });
    this.lazy(c, pol(c, dir, Rr * 0.55), Rr * 0.1, "lg2", g + 0.03, T * 0.8);
    this.stem(c, pol(c, dir + Math.PI + 0.2, Rr * 0.35), pol(c, dir + Math.PI + 0.35, Rr * 0.7), "lg1", T * 0.9, g - 0.02);
  }

  bells(base: Pt, ctrl: Pt, tip: Pt, g: number) {
    const T = this.thread;
    this.el();
    this.stem(base, ctrl, tip, "lg2", T * 0.55, g - 0.02);
    for (const t of [0.3, 0.5, 0.7, 0.88]) {
      const p = bez(base, ctrl, tip, t), q: Pt = [p[0], p[1] + 0.012];
      this.add({ t: "q", p0: p, c: mid(p, q), p1: q, w: T * 0.45, key: "lg2", g: g - 0.01 });
      for (let i = 0; i <= 6; i++) {
        const x = -1 + i / 3, rim: Pt = [q[0] + x * 0.0105, q[1] + 0.021 - 0.003 * x * x], top: Pt = [q[0] + x * 0.0035, q[1]];
        this.add({ t: "q", p0: top, c: [lerp(top[0], rim[0], 0.5) + x * 0.0025, lerp(top[1], rim[1], 0.5)], p1: [lerp(top[0], rim[0], 0.6), lerp(top[1], rim[1], 0.6)], w: T * 0.85, key: "wb1", g });
        this.add({ t: "q", p0: [lerp(top[0], rim[0], 0.45), lerp(top[1], rim[1], 0.45)], c: [lerp(top[0], rim[0], 0.75) + x * 0.0015, lerp(top[1], rim[1], 0.75)], p1: rim, w: T * 0.85, key: i % 2 ? "wb2" : "wb3", g: g + 0.002 });
      }
    }
  }

  sprig(base: Pt, ctrl: Pt, tip: Pt, kind: string, g: number) {
    const T = this.thread;
    this.el();
    this.stem(base, ctrl, tip, kind === "ear" ? "ys0" : "tendril", T * 0.5, g);
    const at = (t: number) => bez(base, ctrl, tip, t);
    const dirAt = (t: number) => { const a = at(t), b = at(Math.min(1, t + 0.02)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
    if (kind === "ear") {
      let i = 0;
      for (let t = 0.5; t <= 1.001; t += 0.07, i++) {
        const p = at(t), d = dirAt(Math.min(t, 0.98)), L = 0.016 * (1 - (0.35 * (t - 0.5)) / 0.5);
        for (const sd of [-1, 1]) this.lazy(p, pol(p, d + sd * 0.45, L), L * 0.34, (i + (sd > 0 ? 1 : 0)) % 2 ? "ys1" : "ys2", g + 0.1, T * 0.8);
      }
      this.lazy(tip, pol(tip, dirAt(0.98), 0.013), 0.004, "ys2", g + 0.1, T * 0.8);
      return;
    }
    let side = 1;
    for (const t of [0.42, 0.62, 0.8]) {
      const p = at(t), d = dirAt(t), e = pol(p, d + side * 0.8, 0.022);
      this.add({ t: "q", p0: p, c: mid(p, e), p1: e, w: T * 0.45, key: "tendril", g });
      if (kind === "leafy") this.lazy(e, pol(e, d + side * 0.8, 0.014), 0.0045, side > 0 ? "lg2" : "lg3", g + 0.1, T * 0.8);
      else if (kind === "blue") this.tiny(e, "bl2", "bl3", "ys2", g + 0.1);
      else this.tiny(e, "ys2", "ys3", "orn", g + 0.1);
      side = -side;
    }
    if (kind === "blue") this.tiny(tip, "bl2", "bl3", "ys2", g + 0.1);
    else this.tiny(tip, "ys2", "ys3", "orn", g + 0.1);
  }

  tiny(c: Pt, k1: string, k2: string, eye: string, g: number) {
    const rot = this.rand() * 6;
    for (let m = 0; m < 5; m++) { const a = rot + m * 1.2566; this.lazy(pol(c, a, 0.002), pol(c, a, 0.0105), 0.0036, m % 2 ? k1 : k2, g, this.thread * 0.75); }
    this.knot(c, this.thread * 0.75, eye, g + 0.01);
  }
}
