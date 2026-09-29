import type { IconStitch } from "./icons";
import type { Mark } from "./marks";

const BOX = 22, PPU = 16, DIRS = 16, STEP = 0.06, GRID = 0.4, SPACING = 0.55, SHORT = 1.3, LONGEST = 6;

/**
 * Turns SVG path data into satin stitches inside the 22 x 22 icon box.
 * The mark is rasterised once; every stitch is then laid across the stroke where it is narrowest, which is how a satin
 * column runs, and strokes thinner than a thread become short stitches along the line instead.
 * `bold` thickens the shape (in icon units) so hairlines survive being stitched at icon size.
 * `angle` lays every stitch in one fixed direction instead, which suits big solid shapes.
 */
export function traceMark(mark: Mark, size: number, bold: number, keys: string[], w = 1.35, angle?: number): IconStitch[] {
  const px = BOX * PPU, canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const g = canvas.getContext("2d", { willReadFrequently: true });
  if (!g) return [];
  const k = size / Math.max(mark.size[0], mark.size[1]);
  g.setTransform(PPU * k, 0, 0, PPU * k, ((BOX - mark.size[0] * k) / 2) * PPU, ((BOX - mark.size[1] * k) / 2) * PPU);
  g.fillStyle = g.strokeStyle = "#000";
  g.lineJoin = "round";
  g.lineWidth = bold / k;
  for (const p of mark.paths) {
    const path = new Path2D(p.d);
    g.fill(path, p.evenodd ? "evenodd" : "nonzero");
    if (bold) g.stroke(path);
  }
  const alpha = g.getImageData(0, 0, px, px).data, covered = new Uint8Array(px * px);
  const inside = (x: number, y: number) => {
    const i = Math.floor(x * PPU), j = Math.floor(y * PPU);
    return i >= 0 && j >= 0 && i < px && j < px && alpha[(j * px + i) * 4 + 3] > 127;
  };
  const reach = (x: number, y: number, dx: number, dy: number, max: number) => {
    let t = 0;
    while (t < max && inside(x + dx * (t + STEP), y + dy * (t + STEP))) t += STEP;
    return t;
  };
  const cover = (x: number, y: number) => {
    const r = SPACING * PPU, cx = x * PPU, cy = y * PPU;
    for (let j = Math.max(0, Math.floor(cy - r)); j <= Math.min(px - 1, Math.ceil(cy + r)); j++)
      for (let i = Math.max(0, Math.floor(cx - r)); i <= Math.min(px - 1, Math.ceil(cx + r)); i++)
        if ((i - cx) ** 2 + (j - cy) ** 2 <= r * r) covered[j * px + i] = 1;
  };

  const out: IconStitch[] = [];
  for (let y = GRID / 2; y < BOX; y += GRID) {
    for (let x = GRID / 2; x < BOX; x += GRID) {
      if (!inside(x, y) || covered[Math.floor(y * PPU) * px + Math.floor(x * PPU)]) continue;
      let best = Infinity, ang = 0, back = 0, fwd = 0;
      if (angle !== undefined) { ang = angle; fwd = reach(x, y, Math.cos(angle), Math.sin(angle), 10); back = reach(x, y, -Math.cos(angle), -Math.sin(angle), 10); best = SHORT; }
      else for (let i = 0; i < DIRS; i++) {
        const a = (i * Math.PI) / DIRS, dx = Math.cos(a), dy = Math.sin(a), f = reach(x, y, dx, dy, 10), b = reach(x, y, -dx, -dy, 10);
        if (f + b < best) { best = f + b; ang = a; back = b; fwd = f; }
      }
      if (best < SHORT && angle === undefined) {
        ang += Math.PI / 2;
        const dx = Math.cos(ang), dy = Math.sin(ang);
        fwd = Math.min(SHORT, reach(x, y, dx, dy, SHORT));
        back = Math.min(SHORT, reach(x, y, -dx, -dy, SHORT));
      }
      const dx = Math.cos(ang), dy = Math.sin(ang), len = back + fwd, parts = Math.max(1, Math.ceil(len / LONGEST));
      for (let n = 0; n < parts; n++) {
        const t0 = -back + (len * n) / parts, t1 = -back + (len * (n + 1)) / parts;
        out.push({ key: keys[out.length % keys.length], w, p0: [x + dx * t0, y + dy * t0], p1: [x + dx * t1, y + dy * t1], r: 0 });
      }
      for (let t = -back; t <= fwd; t += 0.2) cover(x + dx * t, y + dy * t);
    }
  }
  return out;
}
