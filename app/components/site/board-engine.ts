/**
 * The pixel board: one canvas behind the whole page.
 * A raceme of asphodel grows inside the panel element; the rest of the board is a quiet, shimmering field.
 * The cursor's movement becomes wind, a resting cursor calls fireflies, and when the panel moves
 * the picture re-assembles cell by cell instead of jumping.
 */

export type BoardMode = "dark" | "light";

type RGB = [number, number, number];
type Box = { x: number; y: number; w: number; h: number };
type Flower = { x: number; y: number; sx: number; sy: number; R: number; full: number; lb: number; rot: number };
type Geometry = { S: number; stem: [number, number][]; flowers: Flower[]; leaves: [number, number][][] };
type Petal = { x: number; y: number; vx: number; vy: number; age: number; life: number };
type Firefly = { x: number; y: number; vx: number; vy: number; ph: number; orb: number; spd: number; a: number; leave: boolean };
type Transition = { g0: Geometry; b0: Box; t0: number; hits0: Int8Array | null; dir: number };
type ModeWave = { from: BoardMode; t0: number; ox: number; oy: number; reach: number };

const PALETTES = {
  dark: {
    base: { ground: "#141614", ground2: "#1D211D", petal: "#EEE7E1", vein: "#A0473A", anther: "#E09A35", stem: "#6E8C57", leaf: "#4B6640", bud: "#C9B8B1" },
    highlight: { ground: "#131110", ground2: "#231914", petal: "#F39A3D", vein: "#6E3320", anther: "#FFE3BD", stem: "#8A6450", leaf: "#5A4034", bud: "#E08A45" },
  },
  light: {
    base: { ground: "#E4E8E1", ground2: "#DDE2D9", petal: "#FFFFFF", vein: "#9C3B2E", anther: "#D98A1E", stem: "#6C8A55", leaf: "#95AD83", bud: "#D6C0C3" },
    highlight: { ground: "#EDE6DF", ground2: "#E6DDD4", petal: "#F59A42", vein: "#7A3B22", anther: "#FFF3E2", stem: "#8A6450", leaf: "#BFA898", bud: "#F4B67C" },
  },
} as const;
type ColourKey = keyof typeof PALETTES.dark.base;
const KEYS = Object.keys(PALETTES.dark.base) as ColourKey[];
const HIT: ColourKey[] = ["petal", "vein", "anther", "stem", "leaf", "bud"];

// v along the stem (0 base, 1 tip), side, size. The raceme opens from the bottom up, like the real plant.
const FLOWERS: [number, number, number][] = [
  [0.4, -1, 1], [0.52, 1, 0.92], [0.63, -1, 0.82], [0.73, 1, 0.7],
  [0.815, -1, 0.58], [0.885, 1, 0.46], [0.94, -1, 0.36], [0.985, 1, 0.3],
];
const LEAVES: [number, number, number][] = [[-1, 0.62, 0.34], [1, 0.55, 0.3], [-1, 0.4, 0.22], [1, 0.38, 0.2]];

const REST_BLOOM = 0.42;
const FRAME_INTERVAL = 1 / 40; // a board does not need more than ~40 fps
const TRANSITION = 1.1;
const MODE_WAVE = 1.3; // seconds for the theme wave to cross the board

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const tint = (c: RGB, to: RGB, k: number): RGB => [c[0] + (to[0] - c[0]) * k, c[1] + (to[1] - c[1]) * k, c[2] + (to[2] - c[2]) * k];
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): [number, number] {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1;
  const k = clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1);
  return [Math.hypot(px - ax - k * dx, py - ay - k * dy), k];
}

export type Board = {
  /** Switch theme; with an origin, the new theme spreads from that point as a wave of pixels. */
  setMode: (mode: BoardMode, origin?: { x: number; y: number } | null) => void;
  setHighlight: (on: boolean) => void;
  relayout: () => void;
  destroy: () => void;
};

export function createBoard(canvas: HTMLCanvasElement, panel: HTMLElement, initialMode: BoardMode): Board {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (a: number, b: number, k: number) => a + (b - a) * (reduced ? 1 : k);

  let mode: BoardMode = initialMode;
  let mix = 0, mixT = 0;                  // 0 natural palette, 1 highlighted project
  let bloom = REST_BLOOM, bloomT = REST_BLOOM;
  const col = {} as Record<ColourKey, RGB>;
  const colOld = {} as Record<ColourKey, RGB>;
  let wave: ModeWave | null = null;

  let W = 0, H = 0, cell = 14, cols = 0, rows = 0;
  let box: Box = { x: 0, y: 0, w: 0, h: 0 };
  let hits = new Int8Array(0);
  let painted = new Int32Array(0);        // last colour painted per cell, so unchanged cells are skipped
  let trans: Transition | null = null, lastG: Geometry | null = null;

  let t = 0, last = 0, acc = 0, lastDraw = 0, raf = 0;
  let mouse: { x: number; y: number } | null = null;
  let lastMove: { x: number; y: number; t: number } | null = null;
  let stillSince = performance.now(), pointerKind = "mouse";
  const mv = { x: 0, y: 0 };
  let sway = 0, swayV = 0;
  const leafDx = LEAVES.map(() => 0);
  const petals: Petal[] = [];
  const flies: Firefly[] = [];
  let flySpawn = 0;

  function fillPalette(target: Record<ColourKey, RGB>, m: BoardMode) {
    const a = PALETTES[m].base, b = PALETTES[m].highlight;
    for (const k of KEYS) { const x = hex(a[k]), y = hex(b[k]); target[k] = [0, 1, 2].map(i => x[i] + (y[i] - x[i]) * mix) as RGB; }
  }
  function palette() { fillPalette(col, mode); if (wave) fillPalette(colOld, wave.from); }

  // the colour of one cell under a given palette: the shimmering ground, or the part of the plant covering it
  function cellColour(C: Record<ColourKey, RGB>, h: number, c: number, r: number, n: number): RGB {
    if (h >= 0) { const tw = 1 + (hash(c, r) - 0.5) * 0.08 + 0.04 * Math.sin(t * 1.3 + c * 0.7 + r * 0.3), p = C[HIT[h]]; return [p[0] * tw, p[1] * tw, p[2] * tw]; }
    const g1 = C.ground, g2 = C.ground2;
    return [g1[0] + (g2[0] - g1[0]) * n, g1[1] + (g2[1] - g1[1]) * n, g1[2] + (g2[2] - g1[2]) * n];
  }

  function readBox(): Box { const r = panel.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const base = W < 760 ? 9 : Math.max(10, Math.round(Math.min(W, H) / 70));
    cell = Math.round(base * 1.5);
    cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
    hits = new Int8Array(cols * rows); painted = new Int32Array(cols * rows).fill(-1);
    trans = null; box = readBox();
  }

  // The panel moved inside the same board (a story opened or closed): rebuild the picture pixel by pixel.
  function relayout() {
    const nb = readBox();
    const moved = Math.abs(nb.x - box.x) > 1 || Math.abs(nb.w - box.w) > 1;
    if (moved && lastG && box.w > 0 && !reduced) {
      trans = { g0: lastG, b0: { ...box }, t0: performance.now(), hits0: null, dir: Math.sign(nb.x + nb.w / 2 - (box.x + box.w / 2)) || 1 };
    }
    box = nb;
  }

  function scene(): Geometry {
    const S = Math.min(box.w, box.h * 0.9), cx = box.x + box.w * 0.48, base = box.y + box.h * 1.02, top = box.y + box.h * 0.05;
    const lean = (reduced ? 0 : Math.sin(t * 0.55) * 0.015) + sway * 0.07;
    const stemAt = (v: number): [number, number] => [cx + lean * box.w * v * v + Math.sin(v * 3.2) * S * 0.012, base - (base - top) * v];
    const stem: [number, number][] = [];
    for (let i = 0; i <= 22; i++) stem.push(stemAt(i / 22));
    const flowers = FLOWERS.map(([v, side, size], k): Flower => {
      const [sx, sy] = stemAt(v), full = S * 0.12 * size;
      const flutter = Math.sin(t * 9 + k * 1.7) * Math.min(1, Math.abs(sway)) * S * 0.008;
      const lb = clamp(bloom * 2 - k * 0.2, 0, 1);
      return {
        x: sx + side * full * (0.55 + 0.5 * lb) + sway * S * 0.02 * v + flutter,
        y: sy - full * 0.25, sx, sy, R: full * (0.3 + 0.7 * lb), full, lb,
        rot: k * 0.8 + (reduced ? 0 : Math.sin(t * 0.7 + k) * 0.04) + sway * 0.35 + (flutter / S) * 6,
      };
    });
    const leaves = LEAVES.map(([side, len, spread], j) => {
      leafDx[j] = ease(leafDx[j], sway * S * 0.06, 0.08);
      const pts: [number, number][] = [];
      for (let i = 0; i <= 10; i++) { const s = i / 10; pts.push([cx + side * spread * S * Math.pow(s, 1.6) + lean * box.w * 0.2 * s + leafDx[j] * s * s, base - len * box.h * s]); }
      return pts;
    });
    return { S, stem, flowers, leaves };
  }

  // Which part of the plant covers a point: an index into HIT, or -1 for the empty board.
  function sample(px: number, py: number, g: Geometry): number {
    let best = -1, bestD = 0;
    for (const f of g.flowers) {
      const dx = px - f.x, dy = py - f.y, d = Math.hypot(dx, dy);
      if (d > f.R * 1.05) continue;
      if (f.lb < 0.25) { // a bud: an upright ellipse with a darker stripe
        const ex = dx / (f.R * 0.55 + 1), ey = dy / (f.R * 1.25 + 1);
        if (ex * ex + ey * ey < 1) return Math.abs(dx) < f.R * 0.14 ? 1 : 5;
        continue;
      }
      const th = Math.atan2(dy, dx) + f.rot, lim = f.R * (0.28 + 0.72 * Math.pow(Math.abs(Math.cos(3 * th)), 0.45));
      if (d >= lim) continue;
      const dn = 1 - d / lim; if (dn <= bestD) continue; bestD = dn;
      if (d < f.R * 0.13) best = 1;
      else if (f.lb > 0.6 && d < f.R * 0.42 && Math.abs(Math.sin(3 * th + Math.PI / 2)) < 0.18) best = 2;
      else if (f.lb > 0.4 && f.R > cell * 5 && (d * Math.abs(Math.sin(3 * th))) / 3 < cell * 0.28 && d < lim * 0.85) best = 1;
      else best = 0;
    }
    if (best >= 0) return best;
    const w = Math.max(cell * 0.55, g.S * 0.008);
    for (let i = 1; i < g.stem.length; i++) if (segDist(px, py, ...g.stem[i - 1], ...g.stem[i])[0] < w) return 3;
    for (const f of g.flowers) if (segDist(px, py, f.sx, f.sy, f.x, f.y)[0] < w * 0.7) return 3;
    for (const L of g.leaves) for (let i = 1; i < L.length; i++) {
      const [d, k] = segDist(px, py, ...L[i - 1], ...L[i]);
      if (d < Math.max(cell * 0.5, g.S * 0.018 * (1 - (i - 1 + k) / 10))) return 4;
    }
    return -1;
  }

  function step(el: number, g: Geometry) {
    mv.x *= Math.exp(-el * 5); mv.y *= Math.exp(-el * 5);

    // wind: the cursor's horizontal speed pushes a damped spring; strong gusts tear petals off
    const force = mouse && mouse.x > box.x - 40 ? clamp(mv.x / 1400, -1.4, 1.4) : 0;
    swayV += (-16 * sway - 2.6 * swayV + force * 26) * el; sway = clamp(sway + swayV * el, -1.4, 1.4);
    if (Math.abs(sway) > 0.45 && petals.length < 36 && Math.random() < el * Math.abs(sway) * 9) {
      const open = g.flowers.filter(f => f.lb > 0.6), f = open[(Math.random() * open.length) | 0];
      if (f) petals.push({ x: f.x + (Math.random() - 0.5) * f.R, y: f.y + (Math.random() - 0.5) * f.R, vx: Math.sign(sway) * (120 + Math.random() * 120), vy: -40 - Math.random() * 50, age: 0, life: 2.6 });
    }
    for (const p of petals) { p.age += el; p.vy += 70 * el; p.vx *= Math.exp(-el * 0.6); p.x += p.vx * el; p.y += p.vy * el; }
    for (let i = petals.length - 1; i >= 0; i--) if (petals[i].age >= petals[i].life || petals[i].y > H + 20 || petals[i].x > W + 20 || petals[i].x < -20) petals.splice(i, 1);

    // fireflies: after the pointer rests they rise from the plant and circle it; any move scatters them
    const resting = mouse && (performance.now() - stillSince) / 1000 > (pointerKind === "mouse" ? 1.5 : 0.6);
    if (resting) {
      flySpawn -= el;
      if (flies.filter(f => !f.leave).length < 7 && flySpawn <= 0) {
        flySpawn = 0.28;
        const src = Math.random() < 0.6 ? g.flowers[(Math.random() * g.flowers.length) | 0] : null;
        flies.push({
          x: src ? src.x : box.x + box.w * (0.3 + Math.random() * 0.4), y: src ? src.y : box.y + box.h * (0.85 + Math.random() * 0.12),
          vx: (Math.random() - 0.5) * 40, vy: -30 - Math.random() * 40, ph: Math.random() * 6.28,
          orb: cell * (2.2 + Math.random() * 2.6), spd: (0.5 + Math.random() * 0.7) * (Math.random() < 0.5 ? -1 : 1), a: 0, leave: false,
        });
      }
    }
    for (const f of flies) {
      if (!resting && !f.leave) {
        f.leave = true;
        const dx = f.x - (mouse ? mouse.x : f.x), dy = f.y - (mouse ? mouse.y : f.y), d = Math.hypot(dx, dy) || 1;
        f.vx += (dx / d) * 160; f.vy += (dy / d) * 160 - 60;
      }
      if (f.leave || !mouse) { f.a -= el * 0.8; f.vx *= Math.exp(-el * 1.2); f.vy += (-20 - f.vy * 0.8) * el; }
      else {
        f.a = Math.min(1, f.a + el * 1.2);
        const ang = f.ph + t * f.spd, tx = mouse.x + Math.cos(ang) * f.orb, ty = mouse.y + Math.sin(ang) * f.orb * 0.8;
        f.vx += ((tx - f.x) * 2.4 - f.vx * 1.6 + Math.sin(t * 3 + f.ph) * 30) * el;
        f.vy += ((ty - f.y) * 2.4 - f.vy * 1.6 + Math.cos(t * 2.6 + f.ph) * 30) * el;
      }
      f.x += f.vx * el; f.y += f.vy * el;
    }
    for (let i = flies.length - 1; i >= 0; i--) if (flies[i].a <= 0 && flies[i].leave) flies.splice(i, 1);
  }

  function draw() {
    const now = performance.now(), el = Math.min(0.1, (now - (lastDraw || now)) / 1000); lastDraw = now;
    palette();
    const g = scene(), light = mode === "light"; lastG = g;
    step(reduced ? 0 : el, g);
    const bx = box, inBox = (x: number, y: number) => x >= bx.x && x <= bx.x + bx.w && y >= bx.y && y <= bx.y + bx.h;

    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const px = (c + 0.5) * cell, py = (r + 0.5) * cell;
      hits[r * cols + c] = inBox(px, py) ? sample(px, py, g) : -1;
    }

    // during a transition every cell keeps the old picture until its own moment, then flips:
    // a sweep in the direction of travel with a little randomness
    const wv = wave, tw = wv ? (now - wv.t0) / 1000 : 0;
    if (wv && tw > MODE_WAVE + 0.3) wave = null;

    let tp = 0, x0 = 0, span = 1;
    const tr = trans;
    if (tr) {
      if (!tr.hits0) {
        const b = tr.b0; tr.hits0 = new Int8Array(cols * rows);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * cell, py = (r + 0.5) * cell;
          tr.hits0[r * cols + c] = px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h ? sample(px, py, tr.g0) : -1;
        }
      }
      tp = (now - tr.t0) / 1000; x0 = Math.min(tr.b0.x, box.x); span = Math.max(tr.b0.x + tr.b0.w, box.x + box.w) - x0 || 1;
      if (tp > TRANSITION + 0.15) trans = null;
    }

    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      let h = hits[i], flip = 0;
      if (tr && tr.hits0) {
        const h0 = tr.hits0[i];
        if (h0 !== h) {
          let u = clamp(((c + 0.5) * cell - x0) / span, 0, 1); if (tr.dir < 0) u = 1 - u;
          const sw = (u * 0.62 + hash(c * 3.1, r * 1.7) * 0.3) * TRANSITION;
          if (tp < sw) h = h0; else if (tp < sw + 0.12) flip = 1 - (tp - sw) / 0.12;
        }
      }
      // the quiet shimmer of the board
      const n = clamp(0.5 + 0.5 * Math.sin(c * 0.23 + t * 0.35) * Math.sin(r * 0.19 - t * 0.28) + 0.25 * Math.sin((c + r) * 0.09 + t * 0.5), 0, 1);
      let rgb = cellColour(col, h, c, r, n);
      // theme wave: cells keep the old theme until the front reaches them; the front itself glows
      if (wv) {
        const d = Math.hypot((c + 0.5) * cell - wv.ox, (r + 0.5) * cell - wv.oy) / wv.reach;
        const sw = (d * 0.85 + hash(c * 1.3, r * 2.1) * 0.15) * MODE_WAVE;
        if (tw < sw) rgb = cellColour(colOld, h, c, r, n);
        else if (tw < sw + 0.16) rgb = tint(rgb, col.anther, (1 - (tw - sw) / 0.16) * (light ? 0.5 : 0.65));
      }
      if (flip > 0) rgb = tint(rgb, light ? col.vein : col.petal, flip * (light ? 0.35 : 0.55));
      const packed = (clamp(rgb[0] | 0, 0, 255) << 16) | (clamp(rgb[1] | 0, 0, 255) << 8) | clamp(rgb[2] | 0, 0, 255);
      if (painted[i] === packed) continue;
      painted[i] = packed;
      ctx.fillStyle = `rgb(${packed >> 16},${(packed >> 8) & 255},${packed & 255})`;
      ctx.fillRect(c * cell, r * cell, cell, cell);
    }

    // loose petals and fireflies are drawn on top; the cells under them repaint next frame
    const overlay = (c: number, r: number) => { if (c >= 0 && r >= 0 && c < cols && r < rows) painted[r * cols + c] = -1; };
    for (const p of petals) {
      const c = Math.floor(p.x / cell), r = Math.floor(p.y / cell); if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
      ctx.globalAlpha = Math.min(1, (p.life - p.age) / 1.2) * 0.95; ctx.fillStyle = `rgb(${col.petal.map(v => v | 0).join(",")})`;
      ctx.fillRect(c * cell, r * cell, cell, cell); overlay(c, r);
    }
    const fly = light ? "rgb(170,120,20)" : "rgb(226,240,140)";
    for (const f of flies) {
      const c = Math.floor(f.x / cell), r = Math.floor(f.y / cell); if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
      const a = Math.max(0, f.a) * (0.45 + 0.55 * Math.pow(Math.sin(t * 2.2 + f.ph * 3), 2));
      ctx.fillStyle = fly;
      ctx.globalAlpha = a * 0.22; ctx.fillRect((c - 1) * cell, r * cell, cell * 3, cell); ctx.fillRect(c * cell, (r - 1) * cell, cell, cell * 3);
      ctx.globalAlpha = a; ctx.fillRect(c * cell, r * cell, cell, cell);
      for (const [dc, dr] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) overlay(c + dc, r + dr);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!reduced) t += dt;
    mix += (mixT - mix) * (reduced ? 1 : 0.06); bloom += (bloomT - bloom) * (reduced ? 1 : 0.04);
    acc += dt; if (acc < FRAME_INTERVAL && !reduced) return; acc = 0;
    draw();
  }
  function start() { if (!raf) { last = 0; lastDraw = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  /* ---------- input ---------- */
  const onMove = (e: PointerEvent) => {
    const now = performance.now();
    if (lastMove) { const dt = Math.max(8, now - lastMove.t) / 1000; mv.x = mv.x * 0.6 + ((e.clientX - lastMove.x) / dt) * 0.4; mv.y = mv.y * 0.6 + ((e.clientY - lastMove.y) / dt) * 0.4; }
    if (!lastMove || Math.hypot(e.clientX - lastMove.x, e.clientY - lastMove.y) > 2) stillSince = now;
    lastMove = { x: e.clientX, y: e.clientY, t: now }; mouse = { x: e.clientX, y: e.clientY };
  };
  // touch: a swipe is the wind, a finger held still calls the fireflies
  const onDown = (e: PointerEvent) => {
    pointerKind = e.pointerType;
    if (e.pointerType !== "mouse") { const now = performance.now(); mouse = { x: e.clientX, y: e.clientY }; lastMove = { x: e.clientX, y: e.clientY, t: now }; stillSince = now; }
  };
  const onLift = (e: PointerEvent) => { if (e.pointerType !== "mouse") { mouse = null; lastMove = null; } };
  const onLeave = () => { mouse = null; lastMove = null; };
  const onScroll = () => { box = readBox(); };
  const onVisibility = () => (document.hidden ? stop() : start());
  const onContext = (e: Event) => e.preventDefault();
  const ro = new ResizeObserver(relayout);

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onLift, { passive: true });
  window.addEventListener("pointercancel", onLift, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("resize", resize);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("contextmenu", onContext);
  ro.observe(panel);

  resize();
  start();

  return {
    setMode(m, origin) {
      if (m === mode) return;
      if (!reduced && lastG) {
        const ox = origin?.x ?? W / 2, oy = origin?.y ?? H / 2;
        const reach = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy));
        wave = { from: mode, t0: performance.now(), ox, oy, reach };
      }
      mode = m; painted.fill(-1);
    },
    setHighlight(on) { mixT = on ? 1 : 0; bloomT = on ? 1 : REST_BLOOM; },
    relayout,
    destroy() {
      stop(); ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onLift);
      window.removeEventListener("pointercancel", onLift);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("contextmenu", onContext);
    },
  };
}
