import { rng, type Pt } from "./threads";
import { PEONY, ROSE, Stitcher, type Stitch } from "./stitcher";

type PathPoint = { x: number; y: number; tx: number; ty: number; nx: number; ny: number };
type Path = { L: number; at: (s: number) => PathPoint; corners: number[] };

export const FRAME_BAND = 34;
export const isNarrow = (width: number) => width < 760;
export const frameScale = (width: number) => (isNarrow(width) ? 0.66 : 1);

export function framePad(width: number) {
  const k = frameScale(width);
  return Math.round(14 * k + FRAME_BAND * k + (isNarrow(width) ? 12 : 24));
}

function roundRect(W: number, H: number, d: number, rc: number): Path {
  const x0 = d, y0 = d, x1 = W - d, y1 = H - d, w = x1 - x0 - 2 * rc, h = y1 - y0 - 2 * rc, q = (Math.PI * rc) / 2;
  type Seg = { line: true; x: number; y: number; tx: number; ty: number; len: number } | { line: false; cx: number; cy: number; a0: number; len: number };
  const segs: Seg[] = [
    { line: true, x: x0 + rc, y: y0, tx: 1, ty: 0, len: w }, { line: false, cx: x1 - rc, cy: y0 + rc, a0: -Math.PI / 2, len: q },
    { line: true, x: x1, y: y0 + rc, tx: 0, ty: 1, len: h }, { line: false, cx: x1 - rc, cy: y1 - rc, a0: 0, len: q },
    { line: true, x: x1 - rc, y: y1, tx: -1, ty: 0, len: w }, { line: false, cx: x0 + rc, cy: y1 - rc, a0: Math.PI / 2, len: q },
    { line: true, x: x0, y: y1 - rc, tx: 0, ty: -1, len: h }, { line: false, cx: x0 + rc, cy: y0 + rc, a0: Math.PI, len: q },
  ];
  const L = 2 * w + 2 * h + 4 * q, corners: number[] = [];
  let acc = 0;
  for (const sg of segs) { if (!sg.line) corners.push(acc + q / 2); acc += sg.len; }
  const at = (s: number): PathPoint => {
    s = ((s % L) + L) % L;
    for (const sg of segs) {
      if (s <= sg.len) {
        if (sg.line) return { x: sg.x + sg.tx * s, y: sg.y + sg.ty * s, tx: sg.tx, ty: sg.ty, nx: sg.ty, ny: -sg.tx };
        const a = sg.a0 + s / rc, tx = -Math.sin(a), ty = Math.cos(a);
        return { x: sg.cx + Math.cos(a) * rc, y: sg.cy + Math.sin(a) * rc, tx, ty, nx: ty, ny: -tx };
      }
      s -= sg.len;
    }
    return at(0);
  };
  return { L, at, corners };
}

function line(x: number, y0: number, y1: number): Path {
  const L = y1 - y0;
  return { L, corners: [], at: s => ({ x, y: y0 + Math.max(0, Math.min(L, s)), tx: 0, ty: 1, nx: 1, ny: 0 }) };
}

const nearAny = (s: number, list: number[], L: number, r: number) => list.some(c => Math.abs((((s - c) % L) + L * 1.5) % L - L / 2) < r);

export function buildFrame(W: number, H: number, seed = 7) {
  const k = frameScale(W), FS = Math.min(W, H) * 0.97, st = new Stitcher(rng(seed));
  st.thread = (3.3 * k) / FS;
  const U = (p: Pt): Pt => [p[0] / FS, p[1] / FS];
  const stitchPx = (p0: Pt, p1: Pt, w: number, key: string) =>
    st.add({ t: "q", p0: U(p0), c: U([(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]), p1: U(p1), w: w / FS, key, g: 1 });
  const dashes = (P: Path, len: number, period: number, key: string, w: number) => {
    const n = Math.floor(P.L / period), per = P.L / n;
    for (let i = 0; i < n; i++) {
      if (i % 24 === 0) st.el();
      const a = P.at(i * per), b = P.at(i * per + (len * per) / period);
      stitchPx([a.x, a.y], [b.x, b.y], w, key);
    }
  };
  const stemAlong = (fn: (s: number) => Pt, L: number, step: number, key: string, w: number) => {
    let c = 0;
    for (let s = 0; s < L; s += step) {
      if (c++ % 30 === 0) st.el();
      const a = fn(s), b = fn(Math.min(L, s + step * 1.6)), dx = b[0] - a[0], dy = b[1] - a[1];
      stitchPx([a[0] - dy * 0.12, a[1] + dx * 0.12], [b[0] + dy * 0.12, b[1] - dx * 0.12], w, key);
    }
  };

  const o = 14 * k, t = FRAME_BAND * k, RB = o + 46 * k, rc = (d: number) => Math.max(4 * k, RB - d);
  const narrow = isNarrow(W);
  const outer = narrow ? [line(o + 2.5 * k, 0, H), line(W - o - 2.5 * k, 0, H)] : [roundRect(W, H, o + 2.5 * k, rc(o + 2.5 * k))];
  const vines = narrow ? [line(o + t / 2, 0, H), line(W - o - t / 2, 0, H)] : [roundRect(W, H, o + t / 2, rc(o + t / 2))];
  for (const P of outer) dashes(P, 4.6 * k, 8 * k, "vein", 1.9 * k);

  const ramps = [["bl0", "bl1", "bl3", "ys2"], ["pk2", "pk4", "pk5", "ys1"], ["ys0", "ys1", "ys3", "orn"]];
  let fi = 0;
  for (const P of vines) {
    const L = P.L, n = Math.max(8, Math.round(L / (64 * k))), lam = L / n, A = 5.5 * k;
    const vp = (s: number): Pt => { const a = P.at(s), f = A * Math.sin((2 * Math.PI * s) / lam); return [a.x + a.nx * f, a.y + a.ny * f]; };
    stemAlong(vp, L, 4.6 * k, "lg1", 2.6 * k);
    for (let i = 0; i < 2 * n; i++) {
      const s = lam / 4 + (i * lam) / 2;
      if (nearAny(s, P.corners, L, 34 * k)) continue;
      const side = i % 2 ? -1 : 1, a = P.at(s), p = vp(s), nx = a.nx * side, ny = a.ny * side, fw = i % 4 < 2 ? 1 : -1;
      if (i % 3 === 1) {
        const f = ramps[fi++ % 3];
        st.fivePetal(U([p[0] + nx * 4.5 * k, p[1] + ny * 4.5 * k]), (8.5 * k) / FS, [f[0], f[1], f[2]], f[3], 2);
      } else {
        const tip: Pt = [p[0] + nx * 14.5 * k + a.tx * 5.5 * k * fw, p[1] + ny * 14.5 * k + a.ty * 5.5 * k * fw], base: Pt = [p[0] - nx * k, p[1] - ny * k];
        st.leaf(U(base), U([(base[0] + tip[0]) / 2 + a.tx * 2 * k * fw, (base[1] + tip[1]) / 2 + a.ty * 2 * k * fw]), U(tip), (5 * k) / FS, 2, i % 2 ? ["lg0", "lg1", "lg2", "lg3"] : ["lg1", "lg2", "lg2", "lg3"]);
        st.el();
        st.knot(U([p[0] - nx * 4 * k - a.tx * 6 * k * fw, p[1] - ny * 4 * k - a.ty * 6 * k * fw]), (1.7 * k) / FS, i % 2 ? "orn" : "ys1", 2.5);
      }
    }
    P.corners.forEach((cs, ci) => {
      const a = P.at(cs);
      for (const dir of [1, -1]) {
        const b = P.at(cs + dir * 14 * k), tip = P.at(cs + dir * 32 * k);
        st.leaf(U([b.x, b.y]), U([(b.x + tip.x) / 2 + b.nx * 3 * k * dir, (b.y + tip.y) / 2 + b.ny * 3 * k * dir]), U([tip.x + tip.nx * 2 * k, tip.y + tip.ny * 2 * k]), (5.2 * k) / FS, 2.2);
      }
      st.rose(U([a.x, a.y]), (16.5 * k) / FS, ci % 2 ? PEONY : ROSE, 3);
    });
  }

  const stitches: Stitch[] = st.out;
  for (const s of stitches) { s.rev = st.rand() < 0.5; s.v = st.rand() < 0.5 ? 0 : 1; }
  return { stitches, scale: FS };
}
