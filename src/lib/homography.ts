export type Pt = { x: number; y: number };
export type Mat3 = [number, number, number, number, number, number, number, number, number];

/** Résout Ax=b (8x8) par élimination de Gauss avec pivot partiel. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) throw new Error('Quadrilatère dégénéré');
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}

/** Homographie qui envoie src[i] -> dst[i] (4 points). */
export function homography(src: Pt[], dst: Pt[]): Mat3 {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const h = solve(A, b);
  const H: Mat3 = [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
  const det = H[0] * (H[4] * H[8] - H[5] * H[7]) - H[1] * (H[3] * H[8] - H[5] * H[6]) + H[2] * (H[3] * H[7] - H[4] * H[6]);
  if (!Number.isFinite(det) || Math.abs(det) < 1e-10) throw new Error('Quadrilatère dégénéré');
  return H;
}

export function apply(H: Mat3, p: Pt): Pt {
  const w = H[6] * p.x + H[7] * p.y + H[8];
  return { x: (H[0] * p.x + H[1] * p.y + H[2]) / w, y: (H[3] * p.x + H[4] * p.y + H[5]) / w };
}

export function invert(H: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = H;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) throw new Error('Matrice non inversible');
  const m: Mat3 = [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d];
  return m.map((v) => v / det) as Mat3;
}

export const UNIT: Pt[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];

/** Aire signée absolue d'un polygone (formule du lacet). */
export function polygonArea(pts: Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/** Quadrilatère convexe et orienté de façon cohérente ? (évite les nœuds papillon) */
export function isConvexQuad(q: Pt[]): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4], c = q[(i + 2) % 4];
    const z = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(z) < 1e-9) return false;
    const s = Math.sign(z);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}

/**
 * Surface réelle imprimable (m²) : mur de W×H m projeté par `wallQuad` (pixels image),
 * moins les obstacles (polygones en pixels image) ramenés dans l'espace du mur.
 */
export function printableSurface(wallQuad: Pt[], widthM: number, heightM: number, obstacles: Pt[][]): { gross: number; excluded: number; net: number } {
  const gross = widthM * heightM;
  const toWall = homography(wallQuad, UNIT);
  let excluded = 0;
  for (const poly of obstacles) {
    const uv = poly.map((p) => apply(toWall, p)).map((p) => ({ x: clamp01(p.x), y: clamp01(p.y) }));
    excluded += polygonArea(uv) * gross;
  }
  excluded = Math.min(excluded, gross);
  return { gross: round2(gross), excluded: round2(excluded), net: round2(gross - excluded) };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const round2 = (v: number) => Math.round(v * 100) / 100;
