/**
 * Configuration centrale. Tout ce qui dépend de l'entreprise réelle est ici,
 * marqué `PLACEHOLDER` tant que le client ne l'a pas fourni.
 */
export const brand = {
  name: 'MURA', // PLACEHOLDER — nom réel de l'entreprise à fournir
  tagline: 'Impression murale verticale',
  baseline: 'Votre mur. Sans limites.',
  city: 'Le Havre & Normandie', // PLACEHOLDER — zone d'intervention réelle
  email: 'contact@example.com', // PLACEHOLDER
  phone: null as string | null, // PLACEHOLDER
  agency: { name: 'DOERZ', url: '#' },
};

/** Seuils du contrôle qualité — valeurs par défaut à remplacer par la fiche technique de l'imprimante. */
export const qualityConfig = {
  isPlaceholder: true,
  // DPI effectif minimal selon la distance d'observation (m) : [optimal, à vérifier]
  thresholds: [
    { maxDistanceM: 1, optimal: 100, check: 60 },
    { maxDistanceM: 3, optimal: 60, check: 30 },
    { maxDistanceM: Infinity, optimal: 30, check: 15 },
  ],
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
  maxUploadMB: 40,
};

/**
 * Moteur tarifaire. `mode`:
 *  - 'demo'   : calcule avec les valeurs FICTIVES ci-dessous et l'affiche clairement comme démonstration
 *  - 'manual' : aucune estimation chiffrée, demande d'estimation manuelle
 *  - 'live'   : valeurs réelles validées par l'entreprise
 */
export const pricingConfig = {
  mode: 'demo' as 'demo' | 'manual' | 'live',
  currency: 'EUR',
  pricePerM2: { particulier: 90, professionnel: 85, collectivite: 80 }, // FICTIF
  minimumFee: 450, // FICTIF
  travel: { includedKm: 30, perKm: 0.6 }, // FICTIF
  graphicDesign: { none: 0, adaptation: 150, creation: 600 }, // FICTIF
  surfacePrep: { bon: 0, moyen: 8, mauvais: 18 }, // € / m², FICTIF
  difficultAccessSurcharge: 0.15, // +15 %, FICTIF
  volumeDiscounts: [
    { minM2: 30, rate: 0.05 },
    { minM2: 80, rate: 0.1 },
  ], // FICTIF
  rangeSpread: 0.15, // affichage en fourchette ± 15 %
};

export const navigation = [
  { href: '/inspirations/', label: 'Inspirations' },
  { href: '/oeuvres/', label: 'Œuvres' },
  { href: '/studio/', label: 'Studio' },
  { href: '/technologie/', label: 'Technologie' },
  { href: '/professionnels/', label: 'Professionnels' },
  { href: '/tarifs/', label: 'Tarifs' },
];

export const asset = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${p}`;
