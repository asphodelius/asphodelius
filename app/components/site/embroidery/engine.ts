import { buildBouquet } from "./bouquet";
import { buildFrame, framePad } from "./frame";
import { context, makeCanvas, prepare, Renderer, type Box } from "./render";
import type { Flower, Stitch } from "./stitcher";
import { clamp, LINEN, LX, LY, rgbStr, rng, threadColour, type Mode, type Pt, type Rgb } from "./threads";
import { ICONS, type IconStitch } from "./icons";

export type EmbroideryOptions = {
  panel: HTMLElement;
  root: HTMLElement;
  mode: Mode;
  onStitches?: (count: number) => void;
};

export type Embroidery = {
  setMode: (mode: Mode) => void;
  setHighlight: (on: boolean) => void;
  unpick: () => void;
  measure: () => void;
  destroy: () => void;
};

type CacheBox = Box & { W: number; H: number };
type Run = Flower & { list: Stitch[]; start: number; end: number; done: boolean; sprite: HTMLCanvasElement; sx: number; sy: number; sz: number };
type RopePoint = { x: number; y: number; px: number; py: number };
type Sewn = { knot: boolean; x0: number; y0: number; x1: number; y1: number; bx: number; by: number; c: string; t: number; baked: boolean };
type Line = { el: Element; x0: number; x1: number; y: number; t: number };
type Rect = { left: number; top: number; width: number; height: number };
type Hover = { on: boolean; t: number };

const SEW_TIME = 6, DUR = 0.16, RN = 22;
const THREAD_COL = ["rs2", "bl1", "lg2", "ys1", "pk2", "pl2", "orn"];
const BF_WING = [["bl0", "bl1", "bl2", "bl3", "pray"], ["pl1", "pl2", "pl3", "pl3", "pray"]];

export function createEmbroidery(canvas: HTMLCanvasElement, opts: EmbroideryOptions): Embroidery {
  const { panel, root } = opts;
  const ctx = context(canvas);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bouquet = buildBouquet();
  const S = bouquet.stitches, heads = bouquet.heads;
  prepare(S);
  const NON = S.filter(s => !s.asph), ASP = S.filter(s => s.asph);
  let F: Stitch[] = [], FS = 1, frameKey = "";
  const R = new Renderer(() => [S, F]);
  let mode: Mode = opts.mode;
  R.mode = mode;
  const colour = (key: string, gold = false) => threadColour(key, gold, mode);

  const runs: Run[] = bouquet.flowers.map(f => ({ ...f, list: [], start: 0, end: 0, done: false, sprite: makeCanvas(1, 1), sx: 0, sy: 0, sz: 0 }));
  for (const s of ASP) runs[s.fl].list.push(s);

  let W = 0, H = 0, DH = 0, DPR = 1;
  const sy = () => scrollY;
  let linen: CanvasPattern | null = null;
  let bg = makeCanvas(1, 1), frameC: HTMLCanvasElement | null = null, low: HTMLCanvasElement | null = null, full: HTMLCanvasElement | null = null;
  const cacheBox = new WeakMap<HTMLCanvasElement, CacheBox>();
  let gp = false, sewing = false, pending = 0, settle = false, rethreading = false;
  let snapshot: HTMLCanvasElement | null = null, snapT = 0, holdSnap = false;
  let recomposeAt = 0, job: ((deadline: number) => boolean) | null = null;
  let raf = 0, lastDraw = 0, lowPower = false, destroyed = false;

  const X = (u: number) => R.X(u), Y = (v: number) => R.Y(v);
  const inPx = <T,>(fn: () => T) => R.withBox({ x: 0, y: 0, s: 1 }, fn);
  const threadPx = () => Math.max(2.6, 0.0062 * R.box.s * 0.78);

  function makeLinen() {
    const L = LINEN[mode], n = 160, t = makeCanvas(n, n), x = context(t), img = x.createImageData(n, n), d = img.data, r = rng(7);
    const rowV = Array.from({ length: n }, () => (r() - 0.5) * L.variance), colV = Array.from({ length: n }, () => (r() - 0.5) * L.variance);
    for (let y = 0; y < n; y++) for (let xx = 0; xx < n; xx++) {
      const i = (y * n + xx) * 4, v = rowV[y] * 0.6 + colV[xx] * 0.6 + ((xx + y) & 1 ? 1.5 : -1.5) + (r() - 0.5) * 3;
      d[i] = L.base[0] + v; d[i + 1] = L.base[1] + v; d[i + 2] = L.base[2] + v * 0.9; d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return ctx.createPattern(t, "repeat");
  }
  function makeCache() {
    const c = makeCanvas(canvas.width, canvas.height);
    R.setBase(context(c), DPR, 0, 0);
    cacheBox.set(c, { ...R.box, W, H });
    return c;
  }
  const fresh = (c: HTMLCanvasElement | null) => {
    const b = c && cacheBox.get(c);
    return !!b && b.s === R.box.s && b.x === R.box.x && b.y === R.box.y && b.W === W && b.H === H;
  };
  function blit(c: HTMLCanvasElement | null) {
    const b = c && cacheBox.get(c);
    if (!c || !b) return;
    const k = R.box.s / b.s;
    ctx.drawImage(c, R.box.x - b.x * k, R.box.y - b.y * k, b.W * k, b.H * k);
  }
  function paintBg() {
    bg = makeCache();
    const g = context(bg);
    if (linen) { g.fillStyle = linen; g.fillRect(0, 0, W, H); }
  }

  function composeFrame() {
    if (!F.length) { frameC = null; return; }
    frameC = makeCache();
    const c = frameC;
    R.withBox({ x: 0, y: 0, s: FS }, () => R.compose(c, F, s => colour(s.key)));
  }
  function rebuildFrame() {
    const fr = buildFrame(W, H);
    F = fr.stitches; FS = fr.scale; frameKey = `${W}x${H}`;
    prepare(F);
    R.resetAtlases();
    R.atlas(mode);
    composeFrame();
  }

  function rebuildLow() { low = makeCache(); R.compose(low, NON, s => s.c0); }
  function rebuildFull(): void {
    if (!low || !fresh(low)) {
      const b = low && cacheBox.get(low);
      if (!low || !b || b.W !== W || b.H !== H) return rebuild();
      R.withBox({ x: b.x, y: b.y, s: b.s }, () => rebuildFull());
      recomposeAt = recomposeAt || performance.now();
      return;
    }
    full = makeCache();
    const gf = context(full);
    gf.save(); gf.setTransform(1, 0, 0, 1, 0, 0); gf.drawImage(low, 0, 0); gf.restore();
    R.compose(full, ASP, s => s.c0);
  }
  function rebuild() { rebuildLow(); rebuildFull(); }

  function startJob(withFrame = false) {
    const nl = makeCache();
    let step = R.composer(nl, NON, s => s.c0), phase = 0, nf: HTMLCanvasElement | null = null;
    let fstep: ((d: number) => boolean) | null = null, fr: HTMLCanvasElement | null = null;
    if (withFrame && F.length) {
      const target = makeCache();
      fr = target;
      fstep = R.withBox({ x: 0, y: 0, s: FS }, () => R.composer(target, F, s => colour(s.key)));
    }
    job = deadline => {
      if (fstep) { if (!fstep(deadline)) return false; fstep = null; frameC = fr; }
      if (!phase) {
        if (!step(deadline)) return false;
        phase = 1; nf = makeCache();
        const g = context(nf);
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(nl, 0, 0); g.restore();
        step = R.composer(nf, ASP, s => s.c0);
      }
      if (!step(deadline)) return false;
      low = nl; full = nf;
      return true;
    };
  }

  function layout() {
    DPR = Math.min(2, devicePixelRatio || 1); W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    R.setBase(ctx, DPR, 0, 0);
    root.style.setProperty("--pad", framePad(W) + "px");
    const r = panel.getBoundingClientRect(), s = Math.min(r.width, r.height) * 0.97;
    R.box = { x: r.left + scrollX + (r.width - s) / 2, y: r.top + sy() + (r.height - s) / 2, s };
    R.resize(0.0062 * s * DPR);
    if (frameKey !== `${W}x${H}` || !R.hasAtlas(mode)) rebuildFrame();
    linen = makeLinen(); paintBg();
    const hurry = holdSnap;
    if (holdSnap) { holdSnap = false; snapT = performance.now(); }
    job = null;
    if (hurry) composeFrame();
    if (sewing || !full || hurry) rebuild();
    else recomposeAt = performance.now() + 250;
    if (rethreading) runs.forEach(paintRun);
    measure();
    kick();
  }

  function sewAll() {
    const now = performance.now() / 1000;
    S.forEach((s, i) => { s.c0 = null; s.c1 = colour(s.key, gp && s.asph); s.t1 = now + (reduced ? -1 : (i / S.length) * SEW_TIME); });
    sewing = true; pending = S.length; job = null; recomposeAt = 0;
    low = makeCache(); full = makeCache();
    kick();
  }

  function paintRun(f: Run) {
    const pad = 10, x0 = Math.floor(X(f.c[0] - f.r * 1.3) - pad), y0 = Math.floor(Y(f.c[1] - f.r * 1.3) - pad), sz = Math.ceil(f.r * 2.6 * R.box.s + pad * 2);
    f.sprite.width = f.sprite.height = Math.ceil(sz * DPR);
    R.setBase(context(f.sprite), DPR, -x0 * DPR, -y0 * DPR);
    R.compose(f.sprite, f.list, s => s.c0);
    f.sx = x0; f.sy = y0; f.sz = sz;
  }

  function rethread(on: boolean) {
    uiDirty = true;
    gp = on;
    if (sewing) {
      for (const s of ASP) if (s.c1) s.c1 = colour(s.key, on);
      return;
    }
    const now = performance.now() / 1000;
    if (job) {
      if (holdSnap) { job(Infinity); holdSnap = false; snapT = performance.now(); }
      else recomposeAt = performance.now();
      job = null;
    }
    const ys = runs.map(f => f.c[1]), y0 = Math.min(...ys), span = Math.max(...ys) - y0 || 1;
    for (const f of runs) {
      f.start = now + (reduced ? -1 : ((f.c[1] - y0) / span) * 0.75 + Math.random() * 0.15);
      const n = f.list.length;
      f.list.forEach((s, k) => {
        const done = s.c1 && now >= s.t1 + DUR;
        s.c0 = done ? s.c1 : s.c0 || s.c1;
        s.c1 = colour(s.key, on);
        s.t1 = f.start + (reduced ? 0 : (k / n) * 0.3);
      });
      f.end = f.start + (reduced ? 0 : 0.3) + DUR; f.done = false;
      paintRun(f);
    }
    rethreading = true;
    kick();
  }

  function recolour() {
    uiDirty = true; sewnDirty = true; recomposeAt = 0;
    paintBg(); R.atlas(mode);
    if (sewing) { sewing = false; pending = 0; }
    for (const s of S) { s.c0 = colour(s.key, gp && s.asph); s.c1 = null; }
    rethreading = false;
    if (snapshot) { holdSnap = true; startJob(true); } else { composeFrame(); rebuild(); }
  }

  function snap() {
    if (reduced) return;
    snapshot = makeCanvas(canvas.width, canvas.height);
    context(snapshot).drawImage(canvas, 0, 0);
    snapT = performance.now();
  }

  function idleAtlas() {
    const other: Mode = mode === "dark" ? "light" : "dark";
    const run = () => { if (!destroyed && !R.hasAtlas(other)) R.atlas(other); };
    if ("requestIdleCallback" in window) window.requestIdleCallback(run); else setTimeout(run, 200);
  }

  function draw(now: number) {
    const t = now / 1000;
    let busy = false;
    if (settle) { settle = false; snap(); if (snapshot) { holdSnap = true; startJob(); } else rebuild(); idleAtlas(); }
    if (recomposeAt && !rethreading && !snapshot && !sewing && now >= recomposeAt) { recomposeAt = 0; startJob(); }
    if (job && !rethreading) {
      if (job(performance.now() + (holdSnap ? 12 : 6))) { job = null; if (holdSnap) { holdSnap = false; snapT = now; } }
      busy = true;
    }
    const doc = () => R.setBase(ctx, DPR, 0, -sy() * DPR), screen = () => R.setBase(ctx, DPR, 0, 0);
    screen();
    ctx.drawImage(bg, 0, 0, W, H);
    if (frameC) ctx.drawImage(frameC, 0, 0, W, H);
    doc();
    if (rethreading) {
      blit(low);
      for (const f of runs) {
        if (t < f.start) { busy = true; ctx.drawImage(f.sprite, f.sx, f.sy, f.sz, f.sz); }
        else if (t >= f.end) {
          if (!f.done) { for (const s of f.list) if (s.c1) { s.c0 = s.c1; s.c1 = null; } paintRun(f); f.done = true; }
          ctx.drawImage(f.sprite, f.sx, f.sy, f.sz, f.sz);
        } else {
          busy = true;
          for (const s of f.list) {
            const p = s.c1 ? clamp((t - s.t1) / DUR, 0, 1) : 0;
            if (s.c0 && p < 1) R.stitch(ctx, s, s.c0, 1);
            if (p > 0 && s.c1) R.stitch(ctx, s, s.c1, p);
          }
        }
      }
      if (!busy) { rethreading = false; rebuildFull(); }
    } else {
      if (pending && low && full) {
        const gl = context(low), gf = context(full);
        for (const s of S) {
          if (!s.c1 || t < s.t1 + DUR) continue;
          s.c0 = s.c1; s.c1 = null; pending--;
          if (!s.asph) R.stitch(gl, s, s.c0, 1, "under");
          R.stitch(gf, s, s.c0, 1, "under");
        }
      }
      blit(full);
      if (pending) {
        busy = true;
        for (const s of S) { if (!s.c1) continue; const p = clamp((t - s.t1) / DUR, 0, 1); if (p > 0) R.stitch(ctx, s, s.c1, p, "over"); }
      } else if (sewing) { sewing = false; settle = true; busy = true; }
    }
    screen();
    if (snapshot) {
      const k = holdSnap ? 1 : 1 - clamp((now - snapT) / (reduced ? 1 : 600), 0, 1);
      if (k > 0) { ctx.globalAlpha = k; ctx.drawImage(snapshot, 0, 0, W, H); ctx.globalAlpha = 1; busy = true; } else snapshot = null;
    }
    doc();
    if (paintUi(now)) busy = true;
    const pre = busy || !!recomposeAt || !!job;
    if (drawEffects(now)) busy = true;
    screen();
    if (pre) lowPower = false;
    return busy || !!recomposeAt || !!job;
  }

  function kick() { if (!raf && !destroyed) raf = requestAnimationFrame(loop); }
  function loop(now: number) {
    raf = 0;
    if (lowPower && now - lastDraw < 32) { kick(); return; }
    lowPower = false; lastDraw = now;
    if (draw(now)) kick();
  }

  const ptr = { x: -1, y: -1, vx: 0, vy: 0, t: 0, in: false, onCloth: false, down: false, touch: false };
  let rope: RopePoint[] | null = null, ropeT = 0, needleA = -2.3, holeAt: { x: number; y: number } | null = null, sewCol = 0, dip = -1e9;
  const sewn: Sewn[] = [];
  let sewnC: HTMLCanvasElement | null = null, sewnDirty = true, unpicking = 0;
  let pressTimer = 0, pressAt: { x: number; y: number } | null = null, touchUntil = 0;

  const report = () => opts.onStitches?.(sewn.length);

  function pierce(now: number) {
    const p = { x: ptr.x, y: ptr.y + sy() };
    dip = now;
    if (holeAt && Math.hypot(p.x - holeAt.x, p.y - holeAt.y) < 5) return;
    if (!holeAt || Math.hypot(p.x - holeAt.x, p.y - holeAt.y) > 150) {
      if (holeAt) sewCol = (sewCol + 1) % THREAD_COL.length;
      sewn.push({ knot: true, x0: p.x, y0: p.y, x1: p.x, y1: p.y, bx: 0, by: 0, c: THREAD_COL[sewCol], t: now, baked: false });
      rope = null;
    } else {
      let bx = 0, by = 0;
      if (rope) { const m = rope[RN >> 1]; bx = clamp(m.x - (holeAt.x + p.x) / 2, -18, 18); by = clamp(m.y - (holeAt.y + p.y) / 2, -18, 18); }
      sewn.push({ knot: false, x0: holeAt.x, y0: holeAt.y, x1: p.x, y1: p.y, bx, by, c: THREAD_COL[sewCol], t: now, baked: false });
    }
    holeAt = p;
    if (sewn.length > 600) sewn.shift();
    unpicking = 0;
    if (rope) { rope[0].x = rope[0].px = p.x; rope[0].y = rope[0].py = p.y; }
    report();
  }

  function ropeStep(now: number, head: Pt, anchor: { x: number; y: number } | null) {
    const d = anchor ? Math.hypot(head[0] - anchor.x, head[1] - anchor.y) : 0, L = anchor ? Math.max(d * 1.1, 70) / (RN - 1) : 6.5;
    if (!rope) {
      const a = anchor ?? { x: head[0], y: head[1] };
      rope = Array.from({ length: RN }, (_, i) => {
        const f = i / (RN - 1), x = a.x + (head[0] - a.x) * f, y = a.y + (head[1] - a.y) * f + (anchor ? 0 : i * L);
        return { x, y, px: x, py: y };
      });
    }
    const r = rope, steps = clamp(Math.round((now - (ropeT || now - 16)) / 16.7), 1, 4);
    ropeT = now;
    let energy = 0;
    const pin = () => {
      const e = r[RN - 1]; e.x = e.px = head[0]; e.y = e.py = head[1];
      if (anchor) { r[0].x = r[0].px = anchor.x; r[0].y = r[0].py = anchor.y; }
    };
    for (let n = 0; n < steps; n++) {
      for (let i = anchor ? 1 : 0; i < RN - 1; i++) {
        const p = r[i], vx = (p.x - p.px) * 0.97, vy = (p.y - p.py) * 0.97;
        p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + 0.34; energy += vx * vx + vy * vy;
      }
      pin();
      for (let k = 0; k < 12; k++) {
        for (let i = 0; i < RN - 1; i++) {
          const a = r[i], b = r[i + 1], dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy) || 1e-6, df = (dd - L) / dd;
          a.x += dx * df * 0.5; a.y += dy * df * 0.5; b.x -= dx * df * 0.5; b.y -= dy * df * 0.5;
        }
        pin();
      }
    }
    return energy / steps > 0.004;
  }

  function strokeThread(g: CanvasRenderingContext2D, path: (ox: number, oy: number) => void, c: Rgb, w: number, lifted = true) {
    g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = mode === "dark" ? "rgba(0,0,0,.45)" : "rgba(40,28,18,.16)"; g.lineWidth = w; path(lifted ? w * 1.4 : w * 0.35, lifted ? w * 2.3 : w * 0.6); g.stroke();
    g.strokeStyle = rgbStr(c, 0.62); g.lineWidth = w; path(0, 0); g.stroke();
    g.strokeStyle = rgbStr(c, 0.97); g.lineWidth = w * 0.62; path(LX * w * 0.1, LY * w * 0.1); g.stroke();
    g.setLineDash([w * 0.8, w * 0.62]); g.strokeStyle = "rgba(0,0,0,.17)"; g.lineWidth = w * 0.8; path(0, 0); g.stroke(); g.setLineDash([]);
    g.strokeStyle = "rgba(255,255,255,.38)"; g.lineWidth = w * 0.22; path(LX * w * 0.22, LY * w * 0.22); g.stroke();
  }

  function drawSewnStitch(g: CanvasRenderingContext2D, s: Sewn, now: number) {
    const w = threadPx() * 1.05, c = colour(s.c);
    if (s.knot) { inPx(() => R.knot(g, [s.x0, s.y0], w * 1.15, 1, c, clamp((now - s.t) / 150, 0, 1), "over")); return; }
    const k = 1 - clamp((now - s.t) / 260, 0, 1), e = k * k, mx = (s.x0 + s.x1) / 2 + s.bx * e, my = (s.y0 + s.y1) / 2 + s.by * e;
    g.fillStyle = "rgba(0,0,0,.3)";
    for (const [x, y] of [[s.x0, s.y0], [s.x1, s.y1]]) { g.beginPath(); g.arc(x + 0.3, y + 0.5, w * 0.45, 0, 6.2832); g.fill(); }
    const L = Math.hypot(s.x1 - s.x0, s.y1 - s.y0) || 1, sh = Math.min(w * 0.55, L * 0.2), ux = ((s.x1 - s.x0) / L) * sh, uy = ((s.y1 - s.y0) / L) * sh;
    strokeThread(g, (ox, oy) => { g.beginPath(); g.moveTo(s.x0 + ux + ox, s.y0 + uy + oy); g.quadraticCurveTo(mx + ox, my + oy, s.x1 - ux + ox, s.y1 - uy + oy); }, c, w, false);
  }

  function drawSewn(now: number) {
    if (unpicking) {
      const n = Math.max(1, Math.ceil(sewn.length * 0.12));
      sewn.splice(-n, n); sewnDirty = true;
      if (!sewn.length) { unpicking = 0; holeAt = null; rope = null; report(); }
    }
    let young = false;
    const sh = Math.round(DH * DPR);
    if (!sewnC || sewnC.width !== canvas.width || sewnC.height !== sh) { sewnC = makeCanvas(canvas.width, sh); sewnDirty = true; }
    if (sewnDirty) {
      const g = context(sewnC);
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, sewnC.width, sewnC.height); R.setBase(g, DPR, 0, 0);
      for (const s of sewn) { if (now - s.t < 260) continue; s.baked = true; drawSewnStitch(g, s, now); }
      sewnDirty = false;
    }
    if (sewn.length) ctx.drawImage(sewnC, 0, 0, W, DH);
    for (const s of sewn) {
      if (s.baked) continue;
      if (now - s.t < 260) { young = true; drawSewnStitch(ctx, s, now); } else sewnDirty = true;
    }
    return young || sewnDirty || !!unpicking;
  }

  function drawNeedle(now: number) {
    let busy = false;
    if (Math.hypot(ptr.vx, ptr.vy) > 40) {
      const want = Math.atan2(ptr.vy, ptr.vx) + Math.PI * 0.1;
      let d = want - needleA; d = Math.atan2(Math.sin(d), Math.cos(d)); needleA += d * 0.08; busy = true;
    }
    ptr.vx *= 0.85; ptr.vy *= 0.85;
    const kd = clamp((now - dip) / 240, 0, 1), sink = Math.sin(Math.PI * kd) * 14;
    if (kd < 1) busy = true;
    const tip: Pt = [ptr.x, ptr.y + sy()], ux = Math.cos(needleA), uy = Math.sin(needleA), vis = 54 - sink, back: Pt = [tip[0] - ux * vis, tip[1] - uy * vis], nx = -uy, ny = ux;
    const eyeP: Pt = [tip[0] - ux * (vis - 4), tip[1] - uy * (vis - 4)];
    if (ropeStep(now, eyeP, holeAt)) busy = true;
    const r = rope;
    if (r) strokeThread(ctx, (ox, oy) => {
      ctx.beginPath(); ctx.moveTo(r[0].x + ox, r[0].y + oy);
      for (let i = 1; i < RN - 1; i++) { const a = r[i], b = r[i + 1]; ctx.quadraticCurveTo(a.x + ox, a.y + oy, (a.x + b.x) / 2 + ox, (a.y + b.y) / 2 + oy); }
      ctx.lineTo(r[RN - 1].x + ox, r[RN - 1].y + oy);
    }, colour(THREAD_COL[sewCol]), threadPx());
    ctx.lineCap = "round"; ctx.strokeStyle = "rgba(30,22,14,.2)"; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(tip[0] + 5 - sink * 0.3, tip[1] + 9 - sink * 0.5); ctx.lineTo(back[0] + 9, back[1] + 14); ctx.stroke();
    const steel = ctx.createLinearGradient(tip[0] + nx * 2, tip[1] + ny * 2, tip[0] - nx * 2, tip[1] - ny * 2);
    steel.addColorStop(0, "#F6F7F8"); steel.addColorStop(0.45, "#AEB3B8"); steel.addColorStop(1, "#5E646A");
    const tl = Math.max(2, 16 - sink);
    ctx.fillStyle = steel; ctx.beginPath(); ctx.moveTo(tip[0], tip[1]);
    ctx.lineTo(tip[0] - ux * tl + nx * 1.5, tip[1] - uy * tl + ny * 1.5); ctx.lineTo(back[0] + nx * 1.8, back[1] + ny * 1.8);
    ctx.arc(back[0], back[1], 1.8, needleA + Math.PI / 2, needleA + Math.PI * 1.5);
    ctx.lineTo(tip[0] - ux * tl - nx * 1.5, tip[1] - uy * tl - ny * 1.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(40,44,48,.55)"; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.fillStyle = "rgba(20,20,20,.75)"; ctx.beginPath(); ctx.ellipse(eyeP[0], eyeP[1], 3.4, 0.7, needleA, 0, 6.2832); ctx.fill();
    if (sink > 1) { ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(tip[0], tip[1], 2.6, 1.3, needleA, 0, 6.2832); ctx.fill(); }
    return busy;
  }

  const bf = { x: 0, y: 0, a: 0, phase: 0, vx: 0, vy: 0, sit: 0, pollenT: 0, state: "wait" as "wait" | "fly" | "sit", tgt: null as { x: number; y: number; a: number } | null };
  const pollen: { x: number; y: number; vx: number; vy: number; t: number; r: number }[] = [];
  const bfSprites = new Map<string, HTMLCanvasElement>();

  function paintButterfly(g: CanvasRenderingContext2D, open: number, w: number) {
    const P = (x: number, y: number): Pt => [x * 1.7, y * 1.7];
    for (const side of [-1, 1]) for (const [wi, len, a0, span] of [[0, 25, -0.85, 1.25], [1, 17, 0.5, 1.05]]) {
      const ramp = BF_WING[wi].map(k => colour(k)), n = 20;
      for (let i = 0; i <= n; i++) {
        const u = i / n, ang = a0 + span * (u - 0.5), prof = len * (0.55 + 0.45 * Math.pow(Math.sin(Math.PI * u), 0.6));
        const ex = Math.cos(ang) * prof * open * side, ey = Math.sin(ang) * prof;
        for (let r = 0; r < ramp.length; r++) {
          if (r === 4 && i % 2) continue;
          const f0 = r === 4 ? 0.9 : r / 4, f1 = Math.min(1, r === 4 ? 1 : (r + 1.2) / 4);
          const p0 = P(side * 1.2 + ex * f0, ey * f0), p1 = P(side * 1.2 + ex * f1, ey * f1);
          R.curved(g, p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1, w, ramp[r], 1, 1, null);
        }
      }
      R.knot(g, P(side * (len * 0.45 * open + 1), wi ? 8 : -10), w * 0.8, 1, colour(wi ? "ys2" : "wb3"), 1, null);
    }
    const body = colour("disc2");
    for (let i = 0; i < 5; i++) { const y0 = -9 + i * 4.2; R.curved(g, P(0, y0), P(0, y0 + 2), P(0, y0 + 4.6), w * 1.2, body, 1, 1, null); }
    for (const side of [-1, 1]) { const a = P(0, -10), b = P(side * 6, -19); R.curved(g, a, P(side * 2, -16), b, w * 0.3, body, 1, 1, null); R.knot(g, b, w * 0.45, 1, body, 1, null); }
  }

  function pickFlower() {
    const b = R.box, spots = heads.filter(h => h.r >= 0.02).map(h => ({ x: b.x + h.x * b.s, y: b.y + h.y * b.s, r: h.r * b.s }));
    if (!spots.length) return null;
    const near = spots.filter(s => { const d = Math.hypot(s.x - bf.x, s.y - bf.y); return d > 40 && d < b.s * 0.45; });
    const pool = near.length ? near : spots, s = pool[(Math.random() * pool.length) | 0];
    return { x: s.x + (Math.random() - 0.5) * s.r * 0.5, y: s.y + (Math.random() - 0.5) * s.r * 0.5, a: (Math.random() - 0.5) * 1.2 };
  }
  const inZone = () => { const b = R.box; const y = ptr.y + sy(); return ptr.in && !ptr.touch && ptr.x >= b.x && ptr.x <= b.x + b.s && y >= b.y && y <= b.y + b.s; };

  function drawButterfly(now: number, dt: number) {
    if (sewing) return false;
    const b = R.box;
    if (bf.state === "wait") { bf.x = b.x + b.s * 1.05; bf.y = b.y + b.s * 0.12; bf.state = "fly"; bf.tgt = pickFlower(); }
    const follow = inZone() && !reduced;
    let tx = bf.x, ty = bf.y;
    if (follow) { tx = ptr.x + 34; ty = ptr.y + sy() - 30; bf.state = "fly"; }
    else { if (!bf.tgt) bf.tgt = pickFlower(); if (bf.tgt) { tx = bf.tgt.x; ty = bf.tgt.y; } }
    const dx = tx - bf.x, dy = ty - bf.y, d = Math.hypot(dx, dy);
    if (bf.state === "fly") {
      const sp = follow ? Math.min(420, d * 4) : Math.min(150, 40 + d * 1.2), wx = d > 1 ? (dx / d) * sp : 0, wy = d > 1 ? (dy / d) * sp : 0;
      bf.vx += (wx - bf.vx) * Math.min(1, dt * 3); bf.vy += (wy - bf.vy) * Math.min(1, dt * 3);
      bf.x += bf.vx * dt + Math.cos(now / 210) * 0.35; bf.y += bf.vy * dt + Math.sin(now / 150) * 0.5;
      if (!follow && d < 5) { bf.state = "sit"; bf.sit = 2.5 + Math.random() * 3.5; bf.vx = bf.vy = 0; }
      if (Math.hypot(bf.vx, bf.vy) > 12) {
        let da = Math.atan2(bf.vy, bf.vx) + Math.PI / 2 - bf.a; da = Math.atan2(Math.sin(da), Math.cos(da)); bf.a += da * Math.min(1, dt * 5);
      }
    } else {
      bf.sit -= dt;
      let da = (bf.tgt ? bf.tgt.a : 0) - bf.a; da = Math.atan2(Math.sin(da), Math.cos(da)); bf.a += da * Math.min(1, dt * 2);
      bf.pollenT -= dt;
      if (bf.pollenT <= 0) {
        bf.pollenT = 0.3 + Math.random() * 0.3;
        pollen.push({ x: bf.x + (Math.random() - 0.5) * 14, y: bf.y + (Math.random() - 0.5) * 10, vy: -6 - Math.random() * 8, vx: (Math.random() - 0.5) * 8, t: now, r: 1 + Math.random() * 0.9 });
      }
      if (bf.sit <= 0 && !reduced) { bf.state = "fly"; bf.tgt = pickFlower(); }
    }
    const flying = bf.state === "fly";
    bf.phase += dt * (flying ? 22 : 1.8);
    const open = flying ? 0.2 + 0.8 * Math.abs(Math.cos(bf.phase)) : 0.6 + 0.4 * Math.abs(Math.cos(bf.phase));
    const w = threadPx() * 1.3, lift = flying ? 1 : 0.25, lvl = Math.round(open * 11), K = 0.78;
    while (pollen.length && now - pollen[0].t > 1600) pollen.shift();
    for (const p of pollen) {
      const age = (now - p.t) / 1000;
      ctx.globalAlpha = clamp(1 - age / 1.6, 0, 1);
      ctx.fillStyle = "#F3CB42"; ctx.beginPath(); ctx.arc(p.x + p.vx * age, p.y + p.vy * age, p.r, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "rgba(255,255,240,.8)"; ctx.beginPath(); ctx.arc(p.x + p.vx * age - p.r * 0.3, p.y + p.vy * age - p.r * 0.3, p.r * 0.4, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = mode === "dark" ? "rgba(0,0,0,.35)" : "rgba(40,28,18,.12)";
    ctx.beginPath(); ctx.ellipse(bf.x + 14 * lift * K, bf.y + 26 * lift * K, (16 * open + 4) * 1.7 * K, 15 * K, bf.a, 0, 6.2832); ctx.fill();
    const key = `${mode}|${lvl}|${w}`;
    let spr = bfSprites.get(key);
    if (!spr) {
      const size = 150, sprite = makeCanvas(Math.ceil(size * DPR), Math.ceil(size * DPR)), g = context(sprite);
      R.setBase(g, DPR, (size / 2) * DPR, (size / 2) * DPR);
      inPx(() => paintButterfly(g, lvl / 11, w));
      bfSprites.set(key, sprite);
      spr = sprite;
    }
    ctx.save(); ctx.translate(bf.x, bf.y); ctx.rotate(bf.a); ctx.scale(K, K); ctx.drawImage(spr, -75, -75, 150, 150); ctx.restore();
    lowPower = !flying && !pollen.length;
    return flying || pollen.length > 0;
  }

  let fxT = 0;
  function drawEffects(now: number) {
    const dt = clamp((now - (fxT || now)) / 1000, 0, 0.05);
    fxT = now;
    let busy = drawSewn(now);
    if (ptr.touch && now > touchUntil && !ptr.down) ptr.in = false;
    if (ptr.in && ptr.onCloth) busy = drawNeedle(now) || busy;
    drawButterfly(now, dt);
    if (busy) lowPower = false;
    return busy || !sewing;
  }

  let lines: Line[] = [], uiC: HTMLCanvasElement | null = null, uiDirty = true, uiAnim = false;
  let fiRect: { cx: number; base: number; xTop: number; fs: number } | null = null, logoRect: Rect | null = null;
  const hovers = new WeakMap<Element, Hover>();
  const iconStitches: Record<string, IconStitch[]> = Object.fromEntries(Object.entries(ICONS).map(([k, f]) => [k, f()]));
  const hoverOf = (el: Element) => hovers.get(el) ?? { on: false, t: -1e9 };

  function measure() {
    uiDirty = true;
    const oy = sy();
    DH = Math.min(8000, Math.max(H, Math.ceil(document.documentElement.scrollHeight)));
    const fi = root.querySelector("[data-fi]");
    fiRect = null;
    if (fi) {
      const rg = document.createRange(); rg.selectNodeContents(fi);
      const q = rg.getBoundingClientRect(), fs = parseFloat(getComputedStyle(fi).fontSize);
      if (q.width) { const base = q.bottom + oy - fs * 0.24; fiRect = { cx: q.left + q.width / 2, base, xTop: base - fs * 0.58, fs }; }
    }
    const logo = root.querySelector("[data-logo]");
    const lr = logo?.getBoundingClientRect();
    logoRect = lr ? { left: lr.left, top: lr.top + oy, width: lr.width, height: lr.height } : null;
    lines = [];
    for (const el of root.querySelectorAll("[data-stitch]")) {
      const tgt = el.querySelector("[data-stitch-text]") ?? el;
      if (!tgt.getClientRects().length) continue;
      const rg = document.createRange(); rg.selectNodeContents(tgt);
      for (const q of rg.getClientRects()) if (q.width > 2) lines.push({ el, x0: q.left, x1: q.right, y: q.bottom + oy + 3, t: q.top + oy });
    }
    kick();
  }

  function drawLines(g: CanvasRenderingContext2D, now: number) {
    let busy = false;
    const base = colour("uiA"), acc = colour("uiB"), w = Math.max(1.7, threadPx() * 0.6);
    for (const L of lines) {
      const hv = hoverOf(L.el), k = clamp((now - hv.t) / 420, 0, 1), h = hv.on ? k : 1 - k;
      if (k < 1) busy = true;
      const hoverOnly = L.el.getAttribute("data-stitch") === "hover";
      if (hoverOnly && h <= 0) continue;
      const span = L.x1 - L.x0, lit = (x: number) => (x - L.x0) / span < h;
      for (let x = L.x0; x < L.x1 - 3; x += 7) {
        if (hoverOnly && !lit(x)) continue;
        R.loop(g, [x, L.y], [Math.min(L.x1, x + 8.5), L.y], 1.9, w * 0.9, lit(x) ? acc : base, 1, 1, "over");
      }
    }
    return busy;
  }

  function drawIcons(g: CanvasRenderingContext2D) {
    const seen = new Set<Element>();
    for (const L of lines) {
      const kind = L.el.getAttribute("data-icon");
      if (!kind || seen.has(L.el) || !iconStitches[kind]) continue;
      seen.add(L.el);
      const Z = 1.2, ox = L.x0 - 33, oy = (L.t + L.y - 3) / 2 - 11 * Z;
      for (const s of iconStitches[kind]) {
        const c = colour(s.key);
        if (s.knot) R.knot(g, [ox + s.knot[0] * Z, oy + s.knot[1] * Z], s.r * 0.9 * Z, 1, c, 1, "over");
        else R.curved(g, [ox + s.p0[0] * Z, oy + s.p0[1] * Z], [ox + ((s.p0[0] + s.p1[0]) / 2) * Z, oy + ((s.p0[1] + s.p1[1]) / 2) * Z], [ox + s.p1[0] * Z, oy + s.p1[1] * Z], s.w * Z, c, 1, 1, "over");
      }
    }
  }

  function smallAsphodel(g: CanvasRenderingContext2D, cx: number, cy: number, Rr: number, w: number) {
    const rot = -Math.PI / 2 + 0.25;
    for (let k = 0; k < 6; k++) {
      const a = rot + (k * Math.PI) / 3;
      for (const [o, key] of [[-0.26, "petalIn"], [0.26, "petalIn"], [0, "petal"]] as const) {
        const ax = a + o * 0.5, p0: Pt = [cx + Math.cos(a) * Rr * 0.18, cy + Math.sin(a) * Rr * 0.18], p1: Pt = [cx + Math.cos(ax) * Rr * (o ? 0.86 : 1), cy + Math.sin(ax) * Rr * (o ? 0.86 : 1)];
        R.curved(g, p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1, w * 0.8, colour(key, gp), 1, 1, "over");
      }
      R.curved(g, [cx + Math.cos(a) * Rr * 0.2, cy + Math.sin(a) * Rr * 0.2], [cx + Math.cos(a) * Rr * 0.45, cy + Math.sin(a) * Rr * 0.45], [cx + Math.cos(a) * Rr * 0.72, cy + Math.sin(a) * Rr * 0.72], w * 0.34, colour("vein", gp), 1, 1, null);
    }
    R.knot(g, [cx, cy], w * 0.62, 1, colour("anther", gp), 1, "over");
  }

  function drawName(g: CanvasRenderingContext2D) {
    if (logoRect && logoRect.width) smallAsphodel(g, logoRect.left + logoRect.width / 2, logoRect.top + logoRect.height / 2, logoRect.width * 0.48, Math.max(2.4, logoRect.width * 0.14));
    if (!fiRect) return;
    const { cx, base, xTop, fs } = fiRect, w = Math.max(2.2, fs * 0.19), stem = colour("lg1");
    const bend = (y: number) => Math.sin(((y - xTop) / (base - xTop)) * Math.PI) * 0.6;
    for (let y = base; y > xTop + 0.5; y -= 2.2) {
      const y1 = Math.max(xTop, y - 3.6);
      R.curved(g, [cx + bend(y) - 0.35, y], [cx + bend((y + y1) / 2), (y + y1) / 2], [cx + bend(y1) + 0.35, y1], w, stem, 1, 1, "over");
    }
    R.loop(g, [cx + 0.6, base - fs * 0.2], [cx + fs * 0.3, base - fs * 0.38], fs * 0.06, w * 0.7, colour("lg2"), 1, 1, "over");
    smallAsphodel(g, cx, xTop - fs * 0.42, fs * 0.42, w);
  }

  function paintUi(now: number) {
    const uh = Math.round(DH * DPR);
    if (!uiC || uiC.width !== canvas.width || uiC.height !== uh) { uiC = makeCanvas(canvas.width, uh); uiDirty = true; }
    if (uiDirty || uiAnim) {
      const g = context(uiC);
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, uiC.width, uiC.height); R.setBase(g, DPR, 0, 0);
      inPx(() => { uiAnim = drawLines(g, now); drawIcons(g); drawName(g); });
      uiDirty = false;
    }
    ctx.drawImage(uiC, 0, 0, W, DH);
    return uiAnim;
  }

  function setHover(target: EventTarget | null, on: boolean, related: EventTarget | null) {
    const el = target instanceof Element ? target.closest("[data-stitch]") : null;
    if (!el || (related instanceof Node && el.contains(related))) return;
    if (hoverOf(el).on === on) return;
    hovers.set(el, { on, t: performance.now() });
    uiAnim = true;
    kick();
  }

  const onPointerMove = (e: PointerEvent) => {
    const now = performance.now();
    if (e.pointerType === "touch") {
      if (pressAt && Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y) > 10) { clearTimeout(pressTimer); pressAt = null; }
      return;
    }
    const dt = Math.max(8, now - ptr.t);
    if (ptr.in) { ptr.vx = ptr.vx * 0.6 + ((e.clientX - ptr.x) / dt) * 400; ptr.vy = ptr.vy * 0.6 + ((e.clientY - ptr.y) / dt) * 400; } else rope = null;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = now; ptr.in = true; ptr.touch = false; ptr.onCloth = e.target === canvas;
    canvas.style.cursor = ptr.onCloth ? "none" : "";
    lowPower = false;
    if (ptr.down && ptr.onCloth && holeAt && Math.hypot(ptr.x - holeAt.x, ptr.y + sy() - holeAt.y) >= 18) pierce(now);
    kick();
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") {
      pressAt = { x: e.clientX, y: e.clientY };
      clearTimeout(pressTimer);
      pressTimer = window.setTimeout(() => {
        if (!pressAt) return;
        ptr.x = pressAt.x; ptr.y = pressAt.y; ptr.in = true; ptr.onCloth = true; ptr.touch = true;
        touchUntil = performance.now() + 1600;
        pierce(performance.now()); kick();
      }, 380);
      return;
    }
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.down = true;
    pierce(performance.now()); kick();
  };
  const onPointerUp = () => { ptr.down = false; clearTimeout(pressTimer); pressAt = null; };
  const onMouseOut = (e: MouseEvent) => { if (!e.relatedTarget) { ptr.in = false; kick(); } };
  const onOver = (e: PointerEvent) => setHover(e.target, true, e.relatedTarget);
  const onOut = (e: PointerEvent) => setHover(e.target, false, e.relatedTarget);
  const onFocusIn = (e: FocusEvent) => setHover(e.target, true, null);
  const onFocusOut = (e: FocusEvent) => setHover(e.target, false, null);
  const onScroll = (e: Event) => { lowPower = false; if (e.target === document) kick(); else measure(); };
  let resizeTimer = 0;
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => (canvas.clientWidth === W && canvas.clientHeight === H ? measure() : layout()), 100); };
  let relayoutFrame = 0;
  const schedule = () => { cancelAnimationFrame(relayoutFrame); relayoutFrame = requestAnimationFrame(() => { snap(); layout(); }); };
  const panelObserver = new ResizeObserver(() => { if (W) schedule(); });
  const domObserver = new MutationObserver(() => measure());
  const onFonts = () => measure();

  addEventListener("pointermove", onPointerMove, { passive: true });
  addEventListener("pointerup", onPointerUp);
  addEventListener("pointercancel", onPointerUp);
  addEventListener("resize", onResize);
  document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  document.addEventListener("mouseout", onMouseOut);
  canvas.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerover", onOver);
  root.addEventListener("pointerout", onOut);
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  panelObserver.observe(panel);
  domObserver.observe(root, { childList: true, subtree: true });
  document.fonts?.addEventListener("loadingdone", onFonts);
  document.fonts?.ready.then(() => { if (!destroyed) measure(); });

  layout();
  sewAll();

  return {
    setMode(m) {
      if (m === mode) return;
      snap();
      mode = m; R.mode = m;
      linen = makeLinen();
      recolour();
      kick();
    },
    setHighlight(on) { if (on !== gp) rethread(on); },
    unpick() { if (sewn.length) { unpicking = performance.now(); kick(); } },
    measure,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf); cancelAnimationFrame(relayoutFrame);
      clearTimeout(resizeTimer); clearTimeout(pressTimer);
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("pointerup", onPointerUp);
      removeEventListener("pointercancel", onPointerUp);
      removeEventListener("resize", onResize);
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("mouseout", onMouseOut);
      canvas.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerout", onOut);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      panelObserver.disconnect();
      domObserver.disconnect();
      document.fonts?.removeEventListener("loadingdone", onFonts);
    },
  };
}
