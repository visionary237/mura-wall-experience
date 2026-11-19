import data from '@/data/artworks.json';

export interface Artwork {
  id: string; slug: string; title: string; description: string; author: string; source: string; sourceUrl: string | null;
  license: string; commercialUse: boolean | null; modificationAllowed: boolean | null; attribution: string | null;
  width: number; height: number; orientation: 'portrait' | 'paysage' | 'panoramique' | 'carre'; dominantColors: string[];
  categories: string[]; mood: string[]; src: string; thumb: string;
  rightsStatus: 'validated' | 'pending' | 'refused'; printQualityStatus: string; aiGenerated: boolean;
}

export const artworks = data as Artwork[];
export const getArtwork = (id: string) => artworks.find((a) => a.id === id || a.slug === id);
/** Une œuvre n'est sélectionnable pour impression qu'après validation des droits. */
export const isPrintable = (a: Artwork) => a.rightsStatus === 'validated' && a.commercialUse === true;

export const CATEGORIES: { id: string; label: string }[] = [
  ['nature', 'Nature'], ['paysages', 'Paysages'], ['botanique', 'Botanique'], ['forets', 'Forêts'], ['oceans', 'Océans'],
  ['animaux', 'Animaux'], ['art-abstrait', 'Art abstrait'], ['street-art', 'Street art'], ['art-japonais', 'Art japonais'],
  ['art-classique', 'Art classique'], ['renaissance', 'Renaissance'], ['architecture', 'Architecture'], ['geometrie', 'Géométrie'],
  ['minimalisme', 'Minimalisme'], ['enfance', 'Enfance'], ['pedagogie', 'Pédagogie'], ['patrimoine-local', 'Patrimoine local'],
  ['art-contemporain', 'Art contemporain'],
].map(([id, label]) => ({ id, label }));

export const COLLECTIONS = [
  { id: 'apaisant', title: 'Espaces apaisants', desc: 'Pour chambres, EHPAD et établissements de santé.', mood: 'apaisant' },
  { id: 'energique', title: 'Énergie & couleur', desc: 'Pour salles de sport, commerces et lieux de passage.', mood: 'énergique' },
  { id: 'luxe', title: 'Hospitalité premium', desc: 'Pour hôtels, restaurants et lobbys.', mood: 'luxe' },
  { id: 'ludique', title: "Monde de l'enfance", desc: 'Pour crèches, écoles et salles de jeux.', mood: 'ludique' },
];

export const MOODS = Array.from(new Set(artworks.flatMap((a) => a.mood))).sort();

function rgb(h: string) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Distance couleur pondérée (approximation perceptuelle « redmean »). */
export function colorDistance(a: string, b: string) {
  const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b);
  const rm = (r1 + r2) / 2, dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}
const colorScore = (a: Artwork, c: string) => Math.min(...a.dominantColors.slice(0, 3).map((d) => colorDistance(d, c)));

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export interface ArtFilter { q: string; categories: string[]; orientation: Artwork['orientation'] | null; mood: string | null; color: string | null; printableOnly: boolean }

export function filterArtworks(f: ArtFilter, list = artworks): Artwork[] {
  const terms = norm(f.q).split(/\s+/).filter(Boolean).map((t) => t.replace(/s$/, ''));
  let r = list.filter((a) => {
    if (f.printableOnly && !isPrintable(a)) return false;
    if (f.categories.length && !f.categories.some((c) => a.categories.includes(c))) return false;
    if (f.orientation && a.orientation !== f.orientation) return false;
    if (f.mood && !a.mood.includes(f.mood)) return false;
    if (terms.length) {
      const hay = norm([a.title, a.description, ...a.categories, ...a.mood].join(' '));
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  if (f.color) {
    const c = f.color;
    r = r.filter((a) => colorScore(a, c) < 260).sort((x, y) => colorScore(x, c) - colorScore(y, c));
  }
  return r;
}

export function similarArtworks(id: string, n = 4): Artwork[] {
  const a = getArtwork(id);
  if (!a) return [];
  return artworks
    .filter((b) => b.id !== a.id)
    .map((b) => ({
      b,
      s: b.categories.filter((c) => a.categories.includes(c)).length * 3 + b.mood.filter((m) => a.mood.includes(m)).length * 2 - colorDistance(a.dominantColors[0], b.dominantColors[0]) / 200,
    }))
    .sort((x, y) => y.s - x.s)
    .slice(0, n)
    .map((x) => x.b);
}
