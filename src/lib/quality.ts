import { qualityConfig } from '@/config/site';

export type QualityLevel = 'optimal' | 'check' | 'insufficient';

export interface QualityInput {
  pxWidth: number;
  pxHeight: number;
  targetWidthM: number;
  targetHeightM: number;
  viewingDistanceM: number;
  mimeType?: string;
}

export interface QualityReport {
  level: QualityLevel;
  effectiveDpi: number;
  dpiX: number;
  dpiY: number;
  imageRatio: number;
  targetRatio: number;
  ratioDeltaPct: number; // écart de ratio → recadrage nécessaire
  thresholds: { optimal: number; check: number };
  formatOk: boolean;
  messages: string[];
}

export function evaluateQuality(input: QualityInput, cfg = qualityConfig): QualityReport {
  const { pxWidth, pxHeight, targetWidthM, targetHeightM, viewingDistanceM } = input;
  if (pxWidth <= 0 || pxHeight <= 0 || targetWidthM <= 0 || targetHeightM <= 0) throw new Error('Dimensions invalides');
  const imageRatio = pxWidth / pxHeight;
  const targetRatio = targetWidthM / targetHeightM;
  // En mode « remplir la surface », l'image est mise à l'échelle sur la dimension limitante.
  const scale = Math.max(targetWidthM / pxWidth, targetHeightM / pxHeight); // m par pixel
  const effectiveDpi = Math.round(0.0254 / scale);
  const dpiX = Math.round(pxWidth / (targetWidthM / 0.0254));
  const dpiY = Math.round(pxHeight / (targetHeightM / 0.0254));
  const t = cfg.thresholds.find((th) => viewingDistanceM <= th.maxDistanceM) ?? cfg.thresholds[cfg.thresholds.length - 1];
  const level: QualityLevel = effectiveDpi >= t.optimal ? 'optimal' : effectiveDpi >= t.check ? 'check' : 'insufficient';
  const ratioDeltaPct = Math.round((Math.abs(imageRatio - targetRatio) / targetRatio) * 100);
  const formatOk = !input.mimeType || cfg.acceptedFormats.includes(input.mimeType);
  const messages: string[] = [];
  if (level === 'optimal') messages.push('Qualité potentiellement optimale pour cette surface.');
  if (level === 'check') messages.push('Qualité à vérifier : un léger flou peut être visible de près.');
  if (level === 'insufficient') messages.push('Résolution potentiellement insuffisante : risque de pixellisation.');
  if (ratioDeltaPct > 5) messages.push(`Le format de l'image diffère de ${ratioDeltaPct} % de celui du mur : un recadrage sera nécessaire.`);
  if (!formatOk) messages.push('Format de fichier non pris en charge.');
  messages.push('Évaluation indicative : la faisabilité est confirmée par un professionnel avant impression.');
  return { level, effectiveDpi, dpiX, dpiY, imageRatio, targetRatio, ratioDeltaPct, thresholds: { optimal: t.optimal, check: t.check }, formatOk, messages };
}
