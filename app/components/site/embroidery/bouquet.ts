import { clamp, rng, type Pt } from "./threads";
import { bez, mid, PEONY, pol, ROSE, Stitcher, type Stitch } from "./stitcher";

export const CENTRE: Pt = [0.5, 0.48];
const RX = 0.385, RY = 0.415;

type MainFlower = { kind: "asph" | "rose" | "peony" | "pansyP" | "pansyB"; c: Pt; r: number };

export function buildBouquet(seed = 20260928) {
  const st = new Stitcher(rng(seed));
  const R = st.rand;

  const main: MainFlower[] = ([
    ["asph", 0.5, 0.47, 0.128],
    ["rose", 0.28, 0.27, 0.138],
    ["rose", 0.72, 0.275, 0.132],
    ["peony", 0.5, 0.755, 0.14],
    ["pansyP", 0.225, 0.545, 0.096],
    ["pansyB", 0.775, 0.55, 0.093],
    ["asph", 0.265, 0.8, 0.066],
    ["asph", 0.735, 0.805, 0.064],
  ] as const).map(([kind, x, y, r]) => ({
    kind,
    c: [CENTRE[0] + (x - CENTRE[0]) * 0.92, CENTRE[1] + (y - CENTRE[1]) * 0.92],
    r: r * 0.93,
  }));

  main.forEach(({ kind, c, r }, i) => {
    st.claim(c[0], c[1], r * 1.02);
    if (kind === "asph") st.asphodel(c, r, R() * 1.2, 6 + i * 0.01);
    else if (kind === "rose") st.rose(c, r, ROSE, 5 + i * 0.01);
    else if (kind === "peony") st.rose(c, r, PEONY, 5 + i * 0.01);
    else if (kind === "pansyP") st.pansy(c, r, -0.12, ["pl1", "pl2", "pl3"], ["py1", "py2", "py3", "pl2"], 4 + i * 0.01);
    else st.pansy(c, r, 0.12, ["pb1", "pb2", "pb3"], ["py1", "py2", "py3", "pb2"], 4 + i * 0.01);
  });
  st.claim(0.5, 0.13, 0.042);
  st.rosebud([0.5, 0.165], 0.058, -Math.PI / 2, ROSE, 4.5);
  for (const [b, c, t] of [[[0.42, 0.325], [0.392, 0.37], [0.378, 0.425]], [[0.58, 0.33], [0.608, 0.375], [0.622, 0.43]]] as Pt[][]) {
    st.claim(c[0], c[1] + 0.012, 0.04);
    st.bells(b, c, t, 4.2);
  }

  const leafSpecs: [number, number, number, number, number][] = [
    [1, -2.45, 0.09, 0.038, 0.012], [1, Math.PI + 0.1, 0.075, 0.034, -0.01], [1, -1.75, 0.065, 0.03, 0.01],
    [2, -0.69, 0.09, 0.037, -0.012], [2, -0.1, 0.075, 0.033, 0.01], [2, -1.39, 0.065, 0.03, -0.01],
    [4, Math.PI - 0.3, 0.075, 0.032, 0.01], [4, 2.3, 0.06, 0.028, -0.008], [4, -2.5, 0.05, 0.026, 0.006],
    [5, 0.3, 0.075, 0.032, -0.01], [5, 0.84, 0.06, 0.028, 0.008], [5, -0.64, 0.05, 0.026, -0.006],
    [3, 2.1, 0.075, 0.034, 0.01], [3, 1.04, 0.075, 0.034, -0.01],
    [6, 2.55, 0.065, 0.03, -0.01], [7, 0.59, 0.065, 0.03, 0.01],
    [0, 2.5, 0.06, 0.026, 0.008], [0, 0.64, 0.06, 0.026, -0.008],
    [0, -2.15, 0.05, 0.024, -0.006], [0, -0.99, 0.05, 0.024, 0.006],
  ];
  leafSpecs.forEach(([fi, a, len, hw, bend], i) => {
    const { c, r } = main[fi], b = pol(c, a, r * 0.6), t = pol(c, a, r + len);
    st.leaf(b, pol(mid(b, t), a + Math.PI / 2, bend), t, hw, 2 + i * 0.001, i % 3 === 2 ? ["lg1", "lg2", "lg2", "lg3"] : ["lg0", "lg1", "lg2", "lg3"]);
  });

  const GN = 160, GC = 1 / GN, cov = new Uint8Array(GN * GN);
  const inCore = (x: number, y: number) => ((x - CENTRE[0]) / RX) ** 2 + ((y - CENTRE[1]) / RY) ** 2 < 1;
  let stamped = 0;
  const stampSeg = (ax: number, ay: number, bx: number, by: number, r: number) => {
    const x0 = Math.max(0, Math.floor((Math.min(ax, bx) - r) * GN)), x1 = Math.min(GN - 1, Math.floor((Math.max(ax, bx) + r) * GN));
    const y0 = Math.max(0, Math.floor((Math.min(ay, by) - r) * GN)), y1 = Math.min(GN - 1, Math.floor((Math.max(ay, by) + r) * GN));
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-12;
    for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
      const px = (i + 0.5) * GC, py = (j + 0.5) * GC;
      const t = clamp(((px - ax) * dx + (py - ay) * dy) / L2, 0, 1), qx = ax + dx * t - px, qy = ay + dy * t - py;
      if (qx * qx + qy * qy < r * r) cov[j * GN + i] = 1;
    }
  };
  const stampNew = () => {
    for (; stamped < st.out.length; stamped++) {
      const s = st.out[stamped];
      if (s.t === "knot") stampSeg(s.p[0], s.p[1], s.p[0], s.p[1], s.r);
      else if (s.t === "loop") stampSeg(s.p0[0], s.p0[1], s.p1[0], s.p1[1], s.hw * 1.1 + s.w * 0.5);
      else stampSeg(s.p0[0], s.p0[1], s.p1[0], s.p1[1], s.w * 0.55);
    }
  };
  const widestGap = (): [number, number, number] => {
    const D = new Float32Array(GN * GN), q = Math.SQRT2;
    for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) { const k = j * GN + i; D[k] = cov[k] || !inCore((i + 0.5) * GC, (j + 0.5) * GC) ? 0 : 1e9; }
    for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) {
      const k = j * GN + i; if (!D[k]) continue; let v = D[k];
      if (i > 0) v = Math.min(v, D[k - 1] + 1);
      if (j > 0) { v = Math.min(v, D[k - GN] + 1); if (i > 0) v = Math.min(v, D[k - GN - 1] + q); if (i < GN - 1) v = Math.min(v, D[k - GN + 1] + q); }
      D[k] = v;
    }
    let best = 0, bk = 0;
    for (let j = GN - 1; j >= 0; j--) for (let i = GN - 1; i >= 0; i--) {
      const k = j * GN + i; if (!D[k]) continue; let v = D[k];
      if (i < GN - 1) v = Math.min(v, D[k + 1] + 1);
      if (j < GN - 1) { v = Math.min(v, D[k + GN] + 1); if (i < GN - 1) v = Math.min(v, D[k + GN + 1] + q); if (i > 0) v = Math.min(v, D[k + GN - 1] + q); }
      D[k] = v; if (v > best) { best = v; bk = k; }
    }
    return [((bk % GN) + 0.5) * GC, (((bk / GN) | 0) + 0.5) * GC, best * GC];
  };
  const nearestHead = (x: number, y: number) => {
    let b = st.heads[0], bd = Infinity;
    for (const h of st.heads) { const d = Math.hypot(x - h.x, y - h.y) - h.r; if (d < bd) { bd = d; b = h; } }
    return b;
  };

  stampNew();
  const FILL = [["bl0", "bl1", "bl3", "ys2"], ["wb1", "wb2", "wb3", "ys1"], ["ys0", "ys1", "ys3", "orn"], ["bl0", "bl1", "bl3", "ys2"], ["pk2", "pk4", "pk5", "ys1"]];
  let fk = 0, lk = 0;
  for (let it = 0; it < 220; it++) {
    const [x, y, d] = widestGap();
    if (d < 0.011) break;
    if (d >= 0.03 && fk < 22) {
      const r = Math.min(d - 0.007, 0.046), f = FILL[fk++ % FILL.length];
      st.claim(x, y, r);
      if (r >= 0.038 && fk % 4 === 0) { const dir = Math.atan2(y - CENTRE[1], x - CENTRE[0]); st.rosebud(pol([x, y], dir + Math.PI, r * 0.45), r * 1.05, dir, fk % 8 === 0 ? ROSE : PEONY, 3.6); }
      else st.fivePetal([x, y], r, [f[0], f[1], f[2]], f[3], 3.5);
    } else if (d >= 0.019 && lk % 2 === 0) {
      lk++; st.el();
      const rot = R() * 6; st.claim(x, y, d);
      for (let m = 0; m < 3; m++) { const p = pol([x, y], rot + m * 2.094, Math.max(0, d - 0.017)); st.tiny(p, m % 2 ? "ys2" : "bl2", m % 2 ? "ys3" : "bl3", m % 2 ? "orn" : "ys2", 3.4); }
    } else {
      lk++;
      const h = nearestHead(x, y), a = Math.atan2(y - h.y, x - h.x), tip = pol([x, y], a, Math.min(0.05, d * 1.5));
      let base = pol([h.x, h.y], a, h.r * 0.6);
      if (Math.hypot(tip[0] - base[0], tip[1] - base[1]) > 0.13) base = pol(tip, a + Math.PI, 0.13);
      st.leaf(base, pol(mid(base, tip), a + Math.PI / 2, (lk % 2 ? 1 : -1) * 0.008), tip, Math.min(0.036, Math.max(0.014, d * 0.9)), 2.5 + it * 0.001, lk % 3 ? ["lg0", "lg1", "lg2", "lg3"] : ["lg1", "lg2", "lg2", "lg3"]);
    }
    stampNew();
  }

  const kinds = ["yellow", "ear", "blue", "yellow", "leafy", "yellow", "ear", "blue"];
  const bare = ([x, y]: Pt) => {
    const i = Math.floor(x * GN), j = Math.floor(y * GN);
    if (i < 1 || j < 1 || i >= GN - 1 || j >= GN - 1) return false;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (cov[(j + dj) * GN + i + di]) return false;
    return true;
  };
  let ki = 0;
  for (let i = 0; i < 40; i++) {
    const th = -Math.PI / 2 + i * (6.283 / 40) + (R() - 0.5) * 0.1, ex = Math.cos(th), ey = Math.sin(th);
    const base: Pt = [CENTRE[0] + ex * RX * 0.93, CENTRE[1] + ey * RY * 0.93], k = 1.12 + R() * 0.14;
    const tip: Pt = [clamp(CENTRE[0] + ex * RX * k, 0.035, 0.965), clamp(CENTRE[1] + ey * RY * k, 0.03, 0.97)];
    const ctrl = pol(mid(base, tip), th + (i % 2 ? 0.5 : -0.5), 0.012);
    if (![0.72, 0.86, 1].every(t => bare(bez(base, ctrl, tip, t)))) continue;
    st.sprig(base, ctrl, tip, kinds[ki++ % kinds.length], 1);
    stampNew();
  }

  const S = st.out, eMin: number[] = [];
  for (const s of S) if (eMin[s.e] === undefined || s.g < eMin[s.e]) eMin[s.e] = s.g;
  const order = new Map<Stitch, number>();
  S.forEach((s, i) => { order.set(s, i); s.rev = R() < 0.5; s.v = R() < 0.5 ? 0 : 1; });
  S.sort((a, b) => eMin[a.e] - eMin[b.e] || a.e - b.e || a.g - b.g || order.get(a)! - order.get(b)!);

  return { stitches: S, heads: st.heads, flowers: st.flowers, stitcher: st };
}
