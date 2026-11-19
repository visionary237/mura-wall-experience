'use client';
import { homography, apply, UNIT, type Pt, type Mat3 } from './homography';

export interface Placement {
  fit: 'cover' | 'contain';
  scale: number; // 1 = remplit selon fit
  offsetX: number; // -1..1 (fraction de demi-largeur du mur)
  offsetY: number;
  rotation: number; // degrés
  opacity: number; // 0..1
  brightness: number; // 0.5..1.5
  contrast: number; // 0.5..1.5
  integration: number; // 0..1 — conservation des ombres et de la lumière du mur
}

export const defaultPlacement: Placement = { fit: 'cover', scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1, brightness: 1.04, contrast: 1, integration: 0.7 };

export interface Scene {
  photo: CanvasImageSource & { width: number; height: number };
  photoW: number;
  photoH: number;
  art: (CanvasImageSource & { width: number; height: number }) | null;
  artW: number;
  artH: number;
  wall: Pt[]; // 4 coins en pixels photo (HG, HD, BD, BG)
  wallAspect: number; // largeur réelle / hauteur réelle
  obstacles: Pt[][]; // zones exclues (portes, fenêtres) en pixels photo
  occlusion?: CanvasImageSource | null; // calque RGBA des objets devant le mur
  placement: Placement;
  shading?: HTMLCanvasElement | null;
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/** Applique luminosité/contraste une fois sur la source (et la réduit pour l'aperçu). */
export function prepareArt(img: CanvasImageSource & { width: number; height: number }, w: number, h: number, p: Placement, maxSide = 1800) {
  const k = Math.min(1, maxSide / Math.max(w, h));
  const c = makeCanvas(w * k, h * k);
  const ctx = c.getContext('2d')!;
  ctx.filter = `brightness(${p.brightness}) contrast(${p.contrast})`;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

/**
 * Carte d'ombrage : luminance du mur normalisée par son 95e centile.
 * Multipliée sur l'œuvre, elle restitue ombres portées et dégradés de lumière.
 */
export function computeShading(photo: CanvasImageSource, w: number, h: number, wall: Pt[]): HTMLCanvasElement {
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(photo, 0, 0, w, h);
  const xs = wall.map((p) => p.x), ys = wall.map((p) => p.y);
  const x0 = Math.max(0, Math.floor(Math.min(...xs))), y0 = Math.max(0, Math.floor(Math.min(...ys)));
  const x1 = Math.min(w, Math.ceil(Math.max(...xs))), y1 = Math.min(h, Math.ceil(Math.max(...ys)));
  const bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0);
  const img = ctx.getImageData(x0, y0, bw, bh);
  const d = img.data;
  const hist = new Uint32Array(256);
  const lum = new Uint8ClampedArray(bw * bh);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) | 0;
    lum[j] = l; hist[l]++;
  }
  let acc = 0, p95 = 255;
  const target = lum.length * 0.95;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= target) { p95 = Math.max(1, v); break; } }
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const v = Math.min(255, (lum[j] / p95) * 255);
    d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  }
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.putImageData(img, x0, y0);
  return c;
}

/** Fonction (s,t) ∈ [0,1]² de l'œuvre → pixel photo. */
export function artToPhoto(scene: Pick<Scene, 'wall' | 'wallAspect' | 'artW' | 'artH' | 'placement'>): (s: number, t: number) => Pt {
  const H: Mat3 = homography(UNIT, scene.wall);
  const A = scene.wallAspect, a = scene.artW / scene.artH, p = scene.placement;
  const cover = p.fit === 'cover';
  let w: number, h: number;
  if ((a > A) === cover) { h = 1; w = a; } else { w = A; h = A / a; }
  w *= p.scale; h *= p.scale;
  const cx = A / 2 + (p.offsetX * A) / 2, cy = 0.5 + p.offsetY / 2;
  const r = (p.rotation * Math.PI) / 180, cs = Math.cos(r), sn = Math.sin(r);
  return (s, t) => {
    const lx = (s - 0.5) * w, ly = (t - 0.5) * h;
    const X = cx + lx * cs - ly * sn, Y = cy + lx * sn + ly * cs;
    return apply(H, { x: X / A, y: Y });
  };
}

function drawTriangle(ctx: CanvasRenderingContext2D, img: CanvasImageSource, s: Pt[], d: Pt[]) {
  // Élargit légèrement le triangle de destination pour masquer les joints d'anticrénelage.
  const cx = (d[0].x + d[1].x + d[2].x) / 3, cy = (d[0].y + d[1].y + d[2].y) / 3;
  const e = d.map((p) => {
    const dx = p.x - cx, dy = p.y - cy, L = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / L) * 0.7, y: p.y + (dy / L) * 0.7 };
  });
  const [s0, s1, s2] = s, [d0, d1, d2] = d;
  const den = (s1.x - s0.x) * (s2.y - s0.y) - (s2.x - s0.x) * (s1.y - s0.y);
  if (Math.abs(den) < 1e-9) return;
  const a = ((d1.x - d0.x) * (s2.y - s0.y) - (d2.x - d0.x) * (s1.y - s0.y)) / den;
  const b = ((d1.y - d0.y) * (s2.y - s0.y) - (d2.y - d0.y) * (s1.y - s0.y)) / den;
  const c = ((d2.x - d0.x) * (s1.x - s0.x) - (d1.x - d0.x) * (s2.x - s0.x)) / den;
  const dd = ((d2.y - d0.y) * (s1.x - s0.x) - (d1.y - d0.y) * (s2.x - s0.x)) / den;
  const e0 = d0.x - a * s0.x - c * s0.y, f0 = d0.y - b * s0.x - dd * s0.y;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(e[0].x, e[0].y); ctx.lineTo(e[1].x, e[1].y); ctx.lineTo(e[2].x, e[2].y); ctx.closePath(); ctx.clip();
  ctx.transform(a, b, c, dd, e0, f0);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function wallClip(ctx: CanvasRenderingContext2D, wall: Pt[], obstacles: Pt[][]) {
  ctx.beginPath();
  wall.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  for (const o of obstacles) {
    if (o.length < 3) continue;
    o.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
  }
  ctx.clip('evenodd');
}

/** Compose la scène complète sur `ctx` (dimensions = photo). */
export function render(ctx: CanvasRenderingContext2D, scene: Scene, preparedArt: HTMLCanvasElement | null, grid = 22) {
  const { photo, photoW, photoH, wall, obstacles, placement } = scene;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, photoW, photoH);
  ctx.drawImage(photo, 0, 0, photoW, photoH);
  if (!preparedArt) return;
  const map = artToPhoto(scene);
  const sw = preparedArt.width, sh = preparedArt.height;
  const pts: Pt[][] = [];
  for (let j = 0; j <= grid; j++) { pts[j] = []; for (let i = 0; i <= grid; i++) pts[j][i] = map(i / grid, j / grid); }
  ctx.save();
  wallClip(ctx, wall, obstacles);
  // couche œuvre
  const layer = makeCanvas(photoW, photoH);
  const lctx = layer.getContext('2d')!;
  for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) {
    const S = (x: number, y: number): Pt => ({ x: (x / grid) * sw, y: (y / grid) * sh });
    const p00 = pts[j][i], p10 = pts[j][i + 1], p01 = pts[j + 1][i], p11 = pts[j + 1][i + 1];
    drawTriangle(lctx, preparedArt, [S(i, j), S(i + 1, j), S(i, j + 1)], [p00, p10, p01]);
    drawTriangle(lctx, preparedArt, [S(i + 1, j), S(i + 1, j + 1), S(i, j + 1)], [p10, p11, p01]);
  }
  if (scene.shading && placement.integration > 0) {
    lctx.globalCompositeOperation = 'multiply';
    lctx.globalAlpha = placement.integration;
    lctx.drawImage(scene.shading, 0, 0);
    lctx.globalCompositeOperation = 'destination-in';
    lctx.globalAlpha = 1;
    // conserve uniquement les pixels de l'œuvre (masque alpha recalculé)
    const mask = makeCanvas(photoW, photoH);
    const mctx = mask.getContext('2d')!;
    for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) {
      const q = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]];
      mctx.beginPath(); q.forEach((p, k) => (k ? mctx.lineTo(p.x, p.y) : mctx.moveTo(p.x, p.y))); mctx.closePath();
      mctx.fill(); mctx.lineWidth = 1.2; mctx.stroke();
    }
    lctx.drawImage(mask, 0, 0);
  }
  ctx.globalAlpha = placement.opacity;
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
  if (scene.occlusion) { ctx.globalAlpha = 1; ctx.drawImage(scene.occlusion, 0, 0, photoW, photoH); }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => res(im);
    im.onerror = () => rej(new Error(`Image introuvable : ${src}`));
    im.src = src;
  });
}

/** Lit un fichier image importé : validation, réduction, suppression des métadonnées (ré-encodage). */
export async function readUpload(file: File, opts: { maxMB: number; accepted: string[]; maxSide?: number }): Promise<{ dataUrl: string; width: number; height: number; originalWidth: number; originalHeight: number; type: string }> {
  if (!opts.accepted.includes(file.type)) throw new Error('Format non pris en charge (JPEG, PNG, WebP, TIFF).');
  if (file.size > opts.maxMB * 1024 * 1024) throw new Error(`Fichier trop lourd (max ${opts.maxMB} Mo).`);
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const ow = img.naturalWidth, oh = img.naturalHeight;
    const k = Math.min(1, (opts.maxSide ?? 2000) / Math.max(ow, oh));
    const c = makeCanvas(ow * k, oh * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    // Ré-encodage canvas → les métadonnées EXIF (GPS, appareil) ne sont pas conservées.
    return { dataUrl: c.toDataURL('image/jpeg', 0.88), width: c.width, height: c.height, originalWidth: ow, originalHeight: oh, type: file.type };
  } finally {
    URL.revokeObjectURL(url);
  }
}
