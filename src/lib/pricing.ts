import { pricingConfig } from '@/config/site';

export type Segment = 'particulier' | 'professionnel' | 'collectivite';

export interface EstimateInput {
  segment: Segment;
  surfaceM2: number;
  walls: number;
  distanceKm: number;
  surfaceState: 'bon' | 'moyen' | 'mauvais';
  graphic: 'none' | 'adaptation' | 'creation';
  difficultAccess: boolean;
}

export interface EstimateLine { label: string; amount: number }
export interface Estimate {
  mode: typeof pricingConfig.mode;
  lines: EstimateLine[];
  subtotal: number;
  total: number;
  low: number;
  high: number;
  minimumApplied: boolean;
  isDemo: boolean;
}

const r = (v: number) => Math.round(v);

export function estimate(input: EstimateInput, cfg = pricingConfig): Estimate | null {
  if (cfg.mode === 'manual') return null;
  if (!(input.surfaceM2 > 0)) throw new Error('Surface invalide');
  const lines: EstimateLine[] = [];
  const print = input.surfaceM2 * cfg.pricePerM2[input.segment];
  lines.push({ label: `Impression ${input.surfaceM2} m²`, amount: r(print) });
  const discount = [...cfg.volumeDiscounts].reverse().find((d) => input.surfaceM2 >= d.minM2);
  if (discount) lines.push({ label: `Remise volume −${discount.rate * 100} %`, amount: -r(print * discount.rate) });
  const prep = cfg.surfacePrep[input.surfaceState] * input.surfaceM2;
  if (prep) lines.push({ label: 'Préparation du support', amount: r(prep) });
  const graphic = cfg.graphicDesign[input.graphic];
  if (graphic) lines.push({ label: input.graphic === 'creation' ? 'Création graphique' : 'Adaptation graphique', amount: graphic });
  const km = Math.max(0, input.distanceKm - cfg.travel.includedKm);
  if (km) lines.push({ label: `Déplacement (${r(km)} km au-delà de ${cfg.travel.includedKm} km)`, amount: r(km * cfg.travel.perKm * 2) });
  let subtotal = lines.reduce((s, l) => s + l.amount, 0);
  if (input.difficultAccess) {
    const s = r(subtotal * cfg.difficultAccessSurcharge);
    lines.push({ label: 'Accès difficile', amount: s });
    subtotal += s;
  }
  const minimumApplied = subtotal < cfg.minimumFee;
  const total = Math.max(subtotal, cfg.minimumFee);
  return {
    mode: cfg.mode, lines, subtotal, total, minimumApplied,
    low: r(total * (1 - cfg.rangeSpread)), high: r(total * (1 + cfg.rangeSpread)),
    isDemo: cfg.mode === 'demo',
  };
}
