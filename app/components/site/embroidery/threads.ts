export type Pt = [number, number];
export type Rgb = readonly [number, number, number];
export type Mode = "light" | "dark";

export const LINEN: Record<Mode, { base: Rgb; variance: number }> = {
  light: { base: [235, 234, 230], variance: 6 },
  dark: { base: [29, 29, 31], variance: 5 },
};

export const THREADS: Record<string, string> = {
  petal: "#F7F3EC", petal2: "#EDE6DA", petalIn: "#DCCDB6", vein: "#9E4A36", filament: "#C9A15A", anther: "#E08A1E", ovary: "#8F9A5E",
  rs0: "#4E0F16", rs1: "#7E1A22", rs2: "#A92A2C", rs3: "#CF4841", rs4: "#DD5A4C", rs5: "#EE8A74",
  pk0: "#5E1238", pk1: "#8C2150", pk2: "#B8386E", pk3: "#D96592", pk4: "#EC97B6", pk5: "#F7C7D6",
  pl1: "#3E2464", pl2: "#5F3F8E", pl3: "#8E70BA", pb1: "#4E1428", pb2: "#7E2642", pb3: "#A8465F",
  py1: "#D99A12", py2: "#EDBE33", py3: "#F6DA73", pray: "#2A1838",
  lg0: "#1C3A22", lg1: "#2C5A2F", lg2: "#44803F", lg3: "#6EA650", lgV: "#A7CB6E",
  bl0: "#24497F", bl1: "#35649F", bl2: "#5A8CCB", bl3: "#93B9E6",
  ys0: "#B98E24", ys1: "#E0A51E", ys2: "#F3CB42", ys3: "#F8E08A", orn: "#E0711E", tendril: "#7E9A3A",
  wb1: "#BDB8AE", wb2: "#E6E2DA", wb3: "#FBFAF7",
  uiA: "#8A6A52", uiB: "#B3261E", disc2: "#5C3E27",
};

export const GOLD: Record<string, string> = {
  petal: "#EDB23C", petal2: "#E09A28", petalIn: "#C47A18", vein: "#7A3A18", filament: "#7A4A1E", anther: "#3B2412", ovary: "#5A2E14",
};

export const DARK_ADJUST: Record<string, string> = {
  uiA: "#A8927C", uiB: "#E2A12E", lg0: "#24462A", rs0: "#6A1820", pk0: "#761A46", pl1: "#4E3078", pb1: "#661B34", bl0: "#2E5793", pray: "#1E1028",
};

const hexCache = new Map<string, Rgb>();
export function hex(h: string): Rgb {
  let c = hexCache.get(h);
  if (!c) { c = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; hexCache.set(h, c); }
  return c;
}

export function threadColour(key: string, gold: boolean, mode: Mode): Rgb {
  if (gold && GOLD[key]) return hex(GOLD[key]);
  if (mode === "dark" && DARK_ADJUST[key]) return hex(DARK_ADJUST[key]);
  return hex(THREADS[key]);
}

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rgbStr = (c: Rgb, k: number) => `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`;

export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const LIGHT = Math.atan2(-1, -1.2), LX = Math.cos(LIGHT), LY = Math.sin(LIGHT);
