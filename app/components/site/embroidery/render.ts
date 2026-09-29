import { clamp, lerp, LIGHT, LX, LY, rgbStr, rng, threadColour, type Mode, type Pt, type Rgb } from "./threads";
import type { Stitch } from "./stitcher";

export type Box = { x: number; y: number; s: number };
export type Shadow = "under" | "over" | null;
type Field = { Lp: number; k: Float32Array; al: Float32Array; ha: Float32Array; hw: Float32Array };
type Sprite = { x: number; y: number; w: number; h: number };
type Atlas = { canvas: HTMLCanvasElement; map: Map<Rgb, Sprite[]>; shd: Sprite[] };

const ASPECTS = [1.15, 1.5, 1.95, 2.5, 3.2, 4.1, 5.3, 6.8, 8.8, 11.4, 14.8, 19, 25];
const LEVELS = [0.42, 0.7, 0.98];
const SHADOW: Record<Mode, string> = { light: "rgba(52,36,22,.4)", dark: "rgba(0,0,0,.72)" };
const BASE_THREAD = 0.0062;

function aspectIndex(A: number) {
  let b = 0, bd = Infinity;
  ASPECTS.forEach((a, i) => { const d = Math.abs(Math.log(A / a)); if (d < bd) { bd = d; b = i; } });
  return b;
}

export function prepare(list: Stitch[]) {
  prepareRange(list, 0, list.length);
}

export function* prepareSteps(list: Stitch[], chunk = 2500): Generator<void, void, void> {
  for (let from = 0; from < list.length; from += chunk) {
    prepareRange(list, from, Math.min(list.length, from + chunk));
    yield;
  }
}

function prepareRange(list: Stitch[], from: number, to: number) {
  for (let i = from; i < to; i++) {
    const s = list[i];
    const a = s.t === "knot" ? s.p : s.p0, b = s.t === "knot" ? s.p : s.p1;
    s.mx = (a[0] + b[0]) / 2; s.my = (a[1] + b[1]) / 2;
    if (s.t !== "q") continue;
    const dx = s.p1[0] - s.p0[0], dy = s.p1[1] - s.p0[1], L = Math.hypot(dx, dy) || 1e-9;
    s.ai = aspectIndex((L + s.w * 0.8) / s.w);
    const across = Math.abs((dx / L) * LY - (dy / L) * LX), lit = (0.42 + 0.58 * Math.pow(across, 1.4)) * (0.78 + (s.j - 0.93) * 4.4);
    s.lv = lit < 0.56 ? 0 : lit < 0.84 ? 1 : 2;
  }
}

export function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

const gecko = typeof navigator !== "undefined" && /Gecko\/\d/.test(navigator.userAgent) && !/like Gecko/.test(navigator.userAgent);

export function context(c: HTMLCanvasElement) {
  const g = c.getContext("2d", gecko ? { willReadFrequently: true } : undefined);
  if (!g) throw new Error("2d canvas is not available");
  return g;
}

export class Renderer {
  box: Box = { x: 0, y: 0, s: 1 };
  mode: Mode = "light";
  private spriteSize = 0;
  private fields = new Map<number, Field>();
  private atlases: Partial<Record<Mode, Atlas>> = {};
  private bases = new WeakMap<CanvasRenderingContext2D, [number, number, number]>();
  private scratch = new Map<string, HTMLCanvasElement>();
  private bb: number[] | null = null;
  private epoch = 0;

  constructor(private readonly sources: () => Stitch[][]) {}

  X(u: number) { return this.box.x + u * this.box.s; }
  Y(v: number) { return this.box.y + v * this.box.s; }

  setBase(g: CanvasRenderingContext2D, d: number, ox: number, oy: number) {
    g.setTransform(d, 0, 0, d, ox, oy);
    this.bases.set(g, [d, ox, oy]);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
  }
  base(g: CanvasRenderingContext2D) { return this.bases.get(g) ?? [1, 0, 0]; }

  withBox<T>(box: Box, fn: () => T): T {
    const keep = this.box;
    this.box = box;
    try { return fn(); } finally { this.box = keep; }
  }

  resize(threadPx: number) {
    const sh = clamp(Math.round(threadPx * 1.35), 8, 22);
    if (sh > this.spriteSize) { this.spriteSize = sh; this.fields.clear(); this.atlases = {}; this.epoch++; }
    if (this.scratch.size > 2) this.scratch.clear();
  }
  resetAtlases() { this.atlases = {}; this.epoch++; }
  hasAtlas(m: Mode) { return !!this.atlases[m]; }

  private field(ai: number, v: number): Field {
    const cached = this.fields.get(ai * 2 + v);
    if (cached) return cached;
    const SH = this.spriteSize, Lp = Math.max(SH, Math.round(SH * ASPECTS[ai])), n = Lp * SH;
    const k = new Float32Array(n), al = new Float32Array(n), ha = new Float32Array(n), hw = new Float32Array(n), capR = SH * 0.5, rr = rng(ai * 131 + v * 977);
    for (let yy = 0; yy < SH; yy++) for (let xx = 0; xx < Lp; xx++) {
      const i = yy * Lp + xx, v2 = ((yy + 0.5) / SH) * 2 - 1, e = Math.min(xx + 0.5, Lp - xx - 0.5);
      const wf = e >= capR ? 1 : Math.sqrt(Math.max(0, 1 - ((capR - e) / capR) ** 2));
      const a = clamp((wf - Math.abs(v2)) * SH * 0.5 + 0.5, 0, 1);
      if (a <= 0) continue;
      const vn = clamp(v2 / Math.max(wf, 0.08), -1, 1), nz = Math.sqrt(1 - vn * vn);
      const ph = ((xx + 0.5) / SH * 1.85 + vn * 0.7) * 6.2832 + v * 2.4, ridge = 0.5 + 0.5 * Math.cos(ph), fine = 0.5 + 0.5 * Math.cos(ph * 3.1 + 1.3);
      const ed0 = clamp(e / (SH * 0.8), 0, 1), ed = ed0 * ed0 * (3 - 2 * ed0);
      al[i] = a;
      k[i] = (0.6 + 0.4 * Math.pow(nz, 0.7)) * (0.87 + 0.13 * Math.pow(ridge, 0.8)) * (0.96 + 0.04 * fine) * (0.62 + 0.38 * ed) * (0.975 + rr() * 0.05);
      const hA = Math.exp(-(((vn + 0.42) / 0.27) ** 2)) * (0.5 + 0.5 * Math.pow(ridge, 1.5)) * ed * 0.85, hB = Math.pow(clamp((vn - 0.1) / 0.9, 0, 1), 1.2) * 0.42, t = hA + hB;
      if (t > 0.004) { hw[i] = hA / t; ha[i] = Math.min(1, t); }
    }
    const f = { Lp, k, al, ha, hw };
    this.fields.set(ai * 2 + v, f);
    return f;
  }

  private lengthOf(ai: number) { return Math.max(this.spriteSize, Math.round(this.spriteSize * ASPECTS[ai])); }

  atlas(m: Mode): Atlas {
    const g = this.atlasSteps(m);
    for (;;) {
      const r = g.next();
      if (r.done) return r.value;
    }
  }

  *atlasSteps(m: Mode): Generator<void, Atlas, void> {
    const cached = this.atlases[m];
    if (cached) return cached;
    const epoch = this.epoch;
    const SH = this.spriteSize, need = new Map<Rgb, Set<number>>(), shadows = new Set<number>();
    const want = (rgb: Rgb, idx: number) => { let s = need.get(rgb); if (!s) { s = new Set(); need.set(rgb, s); } s.add(idx); };
    for (const list of this.sources()) for (const s of list) {
      if (s.t !== "q") continue;
      const idx = (s.ai * 2 + s.v) * 3 + s.lv;
      shadows.add(s.ai);
      want(threadColour(s.key, false, m), idx);
      if (s.asph) want(threadColour(s.key, true, m), idx);
    }
    const AW = 2048, RH = SH + 3, jobs: [boolean, Rgb | null, number, number, number, number, number][] = [];
    let x = 2, y = 2;
    const put = (body: boolean, rgb: Rgb | null, idx: number, ai: number, v: number) => {
      const Lp = this.lengthOf(ai);
      if (x + Lp + 2 > AW) { x = 2; y += RH; }
      jobs.push([body, rgb, idx, x, y, ai, v]);
      x += Lp + 3;
    };
    for (const [rgb, set] of need) for (const idx of set) { const q = (idx / 3) | 0; put(true, rgb, idx, q >> 1, q & 1); }
    for (const ai of shadows) put(false, null, ai, ai, 0);
    yield;
    if (epoch !== this.epoch) return yield* this.atlasSteps(m);
    const canvas = makeCanvas(AW, y + RH), g = context(canvas), img = g.createImageData(AW, y + RH), d = img.data;
    const map = new Map<Rgb, Sprite[]>(), shd: Sprite[] = [], dim = m === "dark" ? 0.8 : 1;
    let done = 0;
    for (const [body, rgb, idx, px, py, ai, fv] of jobs) {
      const known = this.fields.has(ai * 2 + fv), f = this.field(ai, fv);
      if (!known || ++done % 24 === 0) {
        yield;
        if (epoch !== this.epoch) return yield* this.atlasSteps(m);
      }
      const lv = body ? LEVELS[idx % 3] * dim : 0;
      for (let yy = 0; yy < SH; yy++) {
        let o = ((py + yy) * AW + px) * 4, i = yy * f.Lp;
        for (let xx = 0; xx < f.Lp; xx++, o += 4, i++) {
          const a = f.al[i];
          if (a <= 0) continue;
          if (body && rgb) {
            const k = f.k[i], A = f.ha[i] * lv, Wt = f.hw[i] * 255 * A, B = 1 - A;
            d[o] = rgb[0] * k * B + Wt; d[o + 1] = rgb[1] * k * B + Wt; d[o + 2] = rgb[2] * k * B + Wt; d[o + 3] = a * 255;
          } else d[o + 3] = a * 110;
        }
      }
      const sprite = { x: px, y: py, w: f.Lp, h: SH };
      if (body && rgb) { let mm = map.get(rgb); if (!mm) { mm = []; map.set(rgb, mm); } mm[idx] = sprite; }
      else shd[idx] = sprite;
    }
    g.putImageData(img, 0, 0);
    const atlas = { canvas, map, shd };
    this.atlases[m] = atlas;
    return atlas;
  }

  private grow(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
    const bb = this.bb;
    if (!bb) return;
    const b = this.base(g), px = x * b[0] + b[1], py = y * b[0] + b[2], pr = r * b[0] + 2;
    bb[0] = Math.min(bb[0], px - pr); bb[1] = Math.min(bb[1], py - pr); bb[2] = Math.max(bb[2], px + pr); bb[3] = Math.max(bb[3], py + pr);
  }

  straight(g: CanvasRenderingContext2D, s: Stitch, rgb: Rgb, prog: number, shadow: Shadow) {
    const at = this.atlas(this.mode), ent = at.map.get(rgb)?.[(s.ai * 2 + s.v) * 3 + s.lv];
    if (!ent) return;
    const b = this.base(g), d = b[0], ax = this.X(s.p0[0]), ay = this.Y(s.p0[1]);
    let bx = this.X(s.p1[0]), by = this.Y(s.p1[1]);
    if (prog < 1) { bx = ax + (bx - ax) * prog; by = ay + (by - ay) * prog; }
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), ww = s.w * this.box.s;
    if (L + ww < 0.4) return;
    let tx = L > 1e-6 ? dx / L : 1, ty = L > 1e-6 ? dy / L : 0, sx = ax, sy = ay;
    if (s.rev) { tx = -tx; ty = -ty; sx = bx; sy = by; }
    const nx = -ty, ny = tx, f = nx * LX + ny * LY > 0 ? -1 : 1, len = L + ww * 0.8, Sw = ent.w, Sh = ent.h;
    const ox = sx - tx * ww * 0.4 - nx * f * ww * 0.5, oy = sy - ty * ww * 0.4 - ny * f * ww * 0.5;
    const m0 = (d * tx * len) / Sw, m1 = (d * ty * len) / Sw, m2 = (d * nx * f * ww) / Sh, m3 = (d * ny * f * ww) / Sh;
    if (shadow) {
      const e = at.shd[s.ai];
      g.setTransform(m0, m1, m2, m3, d * (ox + ww * 0.3) + b[1], d * (oy + ww * 0.48) + b[2]);
      if (shadow === "under") g.globalCompositeOperation = "destination-over";
      g.drawImage(at.canvas, e.x, e.y, Sw, Sh, 0, 0, Sw, Sh);
      g.globalCompositeOperation = "source-over";
    }
    g.setTransform(m0, m1, m2, m3, d * ox + b[1], d * oy + b[2]);
    g.drawImage(at.canvas, ent.x, ent.y, Sw, Sh, 0, 0, Sw, Sh);
    g.setTransform(d, 0, 0, d, b[1], b[2]);
    if (this.bb) this.grow(g, (ax + bx) / 2, (ay + by) / 2, L / 2 + ww);
  }

  curved(g: CanvasRenderingContext2D, p0: Pt, c: Pt, p1: Pt, w: number, rgb: Rgb, j: number, prog: number, shadow: Shadow) {
    let cc = c, e = p1;
    if (prog < 1) {
      const m: Pt = [lerp(p0[0], c[0], prog), lerp(p0[1], c[1], prog)], n: Pt = [lerp(c[0], p1[0], prog), lerp(c[1], p1[1], prog)];
      cc = m; e = [lerp(m[0], n[0], prog), lerp(m[1], n[1], prog)];
    }
    const ax = this.X(p0[0]), ay = this.Y(p0[1]), cx = this.X(cc[0]), cy = this.Y(cc[1]), bx = this.X(e[0]), by = this.Y(e[1]), ww = w * this.box.s;
    const across = Math.abs(Math.sin(Math.atan2(by - ay, bx - ax) - LIGHT)), ox = LX * ww * 0.2, oy = LY * ww * 0.2;
    const path = (u: number, v: number) => { g.beginPath(); g.moveTo(ax + u, ay + v); g.quadraticCurveTo(cx + u, cy + v, bx + u, by + v); };
    g.lineCap = "round";
    if (shadow) {
      if (shadow === "under") g.globalCompositeOperation = "destination-over";
      g.strokeStyle = "rgba(0,0,0,.42)"; g.lineWidth = ww; path(ww * 0.3, ww * 0.48); g.stroke();
      g.globalCompositeOperation = "source-over";
    }
    g.strokeStyle = rgbStr(rgb, 0.62 * j); g.lineWidth = ww; path(0, 0); g.stroke();
    g.strokeStyle = rgbStr(rgb, 0.95 * j); g.lineWidth = ww * 0.64; path(ox * 0.5, oy * 0.5); g.stroke();
    g.setLineDash([ww * 0.28, ww * 0.4]); g.strokeStyle = "rgba(0,0,0,.16)"; g.lineWidth = ww * 0.8; path(0, 0); g.stroke(); g.setLineDash([]);
    g.strokeStyle = `rgba(255,255,255,${(0.18 + 0.4 * across) * (this.mode === "dark" ? 0.8 : 1)})`; g.lineWidth = ww * 0.2; path(ox, oy); g.stroke();
    this.grow(g, ax, ay, ww); this.grow(g, cx, cy, ww); this.grow(g, bx, by, ww);
  }

  loop(g: CanvasRenderingContext2D, p0: Pt, p1: Pt, hw: number, w: number, rgb: Rgb, j: number, prog: number, shadow: Shadow) {
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * hw * 1.6, ny = (dx / L) * hw * 1.6;
    const m: Pt = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
    this.curved(g, p0, [m[0] + nx, m[1] + ny], p1, w, rgb, j, clamp(prog * 2, 0, 1), shadow);
    if (prog > 0.5) this.curved(g, p1, [m[0] - nx, m[1] - ny], p0, w, rgb, j, clamp(prog * 2 - 1, 0, 1), shadow);
    if (prog >= 1) this.curved(g, p1, [p1[0] + dx * 0.1, p1[1] + dy * 0.1], [p1[0] + (dx / L) * 0.004, p1[1] + (dy / L) * 0.004], w * 0.8, rgb, j, 1, null);
  }

  knot(g: CanvasRenderingContext2D, p: Pt, radius: number, j: number, rgb: Rgb, prog: number, shadow: Shadow) {
    const x = this.X(p[0]), y = this.Y(p[1]), r = radius * this.box.s * (0.4 + 0.6 * prog);
    if (shadow) {
      if (shadow === "under") g.globalCompositeOperation = "destination-over";
      g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.arc(x + r * 0.3, y + r * 0.45, r, 0, 6.283); g.fill();
      g.globalCompositeOperation = "source-over";
    }
    const gr = g.createRadialGradient(x + LX * r * 0.4, y + LY * r * 0.4, r * 0.05, x, y, r);
    gr.addColorStop(0, rgbStr(rgb, 1.12 * j)); gr.addColorStop(0.5, rgbStr(rgb, 0.95 * j)); gr.addColorStop(1, rgbStr(rgb, 0.55 * j));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    g.lineCap = "round";
    const o = j * 57;
    for (let k = 0; k < 3; k++) {
      const a0 = o + k * 2.1, rr = r * (0.42 + 0.14 * k);
      g.strokeStyle = "rgba(0,0,0,.24)"; g.lineWidth = r * 0.17; g.beginPath(); g.arc(x, y, rr, a0, a0 + 2); g.stroke();
      g.strokeStyle = "rgba(255,255,255,.2)"; g.lineWidth = r * 0.09; g.beginPath(); g.arc(x + LX * r * 0.08, y + LY * r * 0.08, rr, a0 + 0.3, a0 + 1.4); g.stroke();
    }
    this.grow(g, x, y, r * 1.4);
  }

  stitch(g: CanvasRenderingContext2D, s: Stitch, rgb: Rgb, prog: number, shadow: Shadow = null) {
    if (s.t === "knot") this.knot(g, s.p, s.r, s.j, rgb, prog, shadow);
    else if (s.t === "loop") this.loop(g, s.p0, s.p1, s.hw, s.w, rgb, s.j, prog, shadow);
    else this.straight(g, s, rgb, prog, shadow);
  }

  private scratchFor(c: HTMLCanvasElement) {
    const k = c.width + "x" + c.height;
    let s = this.scratch.get(k);
    if (!s) { s = makeCanvas(c.width, c.height); this.scratch.set(k, s); }
    return s;
  }

  composer(target: HTMLCanvasElement, list: Stitch[], colour: (s: Stitch) => Rgb | null) {
    const tg = context(target), sc = this.scratchFor(target), sg = context(sc), b = this.base(tg), ww = BASE_THREAD * this.box.s * b[0], box = this.box;
    let i = 0, cur = -1;
    const flush = () => {
      const bb = this.bb;
      if (!bb) return;
      this.bb = null;
      const x0 = Math.max(0, Math.floor(bb[0])), y0 = Math.max(0, Math.floor(bb[1])), x1 = Math.min(sc.width, Math.ceil(bb[2])), y1 = Math.min(sc.height, Math.ceil(bb[3]));
      if (x1 <= x0 || y1 <= y0) return;
      tg.save(); tg.setTransform(1, 0, 0, 1, 0, 0);
      tg.shadowColor = SHADOW[this.mode]; tg.shadowBlur = ww * 0.8; tg.shadowOffsetX = ww * 0.28; tg.shadowOffsetY = ww * 0.45;
      tg.drawImage(sc, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0);
      tg.restore();
      sg.save(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(x0, y0, x1 - x0, y1 - y0); sg.restore();
    };
    return (deadline: number) => this.withBox(box, () => {
      this.setBase(sg, b[0], b[1], b[2]);
      for (; i < list.length; i++) {
        const s = list[i], c = colour(s);
        if (!c) continue;
        if (s.e !== cur) {
          flush();
          if (performance.now() > deadline) return false;
          cur = s.e; this.bb = [Infinity, Infinity, -Infinity, -Infinity];
        }
        this.stitch(sg, s, c, 1, null);
      }
      flush();
      return true;
    });
  }

  compose(target: HTMLCanvasElement, list: Stitch[], colour: (s: Stitch) => Rgb | null) {
    this.composer(target, list, colour)(Infinity);
  }
}
