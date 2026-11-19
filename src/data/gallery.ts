/**
 * Visuels MURA (fournis par l'entreprise, droits détenus).
 * `kind` : 'realisation' = intervention réelle · 'visuel' = visuel de présentation (rendu, mise en scène).
 * Tant que l'entreprise n'a pas précisé, tout est en 'visuel' : rien n'est présenté comme une réalisation client.
 */
export type GalleryKind = 'realisation' | 'visuel';
export interface GalleryItem {
  id: string; title: string; alt: string; sectors: string[]; width: number; height: number;
  kind: GalleryKind; showsMachine?: boolean;
}

const g = (id: string, title: string, alt: string, sectors: string[], width: number, height: number, extra: Partial<GalleryItem> = {}): GalleryItem =>
  ({ id, title, alt, sectors, width, height, kind: 'visuel', ...extra });

export const gallery: GalleryItem[] = [
  g('3584d42f', 'Paysage hollandais au coucher du soleil', 'Imprimante murale Baiketech à côté d’un paysage de moulin imprimé dans un bureau', ['technologie', 'bureaux-commerces'], 787, 779, { showsMachine: true }),
  g('a209fced', 'Forêt brumeuse en cours d’impression', 'Opérateur pilotant l’imprimante verticale devant une fresque de forêt tropicale brumeuse', ['technologie', 'particuliers'], 766, 768, { showsMachine: true }),
  g('402d5daa', 'Aquarium en trompe-l’œil', 'Imprimante devant une fresque aquarium effet mur brisé', ['technologie', 'ecoles-creches', 'piscines'], 787, 787, { showsMachine: true }),
  g('96175514', 'Œuvre abstraite, hall d’hôtel', 'Opérateur avec télécommande devant une œuvre abstraite aux couleurs vives dans un hall', ['hotels-restaurants', 'technologie'], 790, 593, { showsMachine: true }),
  g('9666b5d4', 'Jungle nocturne, salle de restaurant', 'Restaurant avec banquette verte et fresque tropicale sur fond vert sombre', ['hotels-restaurants'], 788, 591),
  g('a87a61dd', 'Botanique rose, banquettes bleues', 'Restaurant avec lustres en cristal et fresque botanique sur fond rose', ['hotels-restaurants'], 793, 526),
  g('3bb48845', 'Bouquet nocturne', 'Restaurant avec sol en damier et fresque florale sombre éclairée', ['hotels-restaurants'], 787, 728),
  g('932f76bd', 'Jardin exotique fuchsia', 'Café avec banquette bleue et fresque botanique fuchsia', ['hotels-restaurants'], 790, 721),
  g('6365be25', 'Jardin au paon', 'Restaurant lumineux avec chaises roses et fresque botanique avec paon', ['hotels-restaurants'], 700, 463),
  g('bb1757cc', 'Forêt rosée', 'Restaurant intimiste avec fresque d’arbres rosés sur fond noir', ['hotels-restaurants'], 781, 807),
  g('933b3acc', 'Regards — salle de réunion', 'Salle de réunion avec fresque panoramique : aigle, visage et perroquet', ['bureaux-commerces'], 789, 577),
  g('f45fdb7e', 'Arche du désert', 'Bureau avec fresque panoramique d’une arche rocheuse', ['bureaux-commerces'], 545, 446),
  g('d4953493', 'La Vague, salon', 'Salon avec fresque inspirée de la Grande Vague de Kanagawa', ['particuliers'], 777, 444),
  g('19482859', 'Vagues noir et or', 'Salon avec fresque de vagues japonaises noir et or', ['particuliers'], 775, 679),
  g('c5e2c7e8', 'Notre monde et ses continents', 'Couloir d’école avec fresque pédagogique sur les continents', ['ecoles-creches', 'collectivites'], 785, 518),
  g('f382a0a2', 'Le fleuve et l’espace', 'Couloir d’école avec fresque colorée : bateau à aubes, pont et planètes', ['ecoles-creches', 'collectivites'], 771, 468),
  g('9c0cd8af', 'Fonds marins, bassin', 'Piscine avec fresque marine : dauphins, tortue et récif', ['piscines'], 746, 289),
  g('6372fade', 'Dauphins et récif', 'Piscine avec grande fresque marine au-dessus du bassin', ['piscines', 'collectivites'], 773, 505),
];

export const forSector = (slug: string) => gallery.filter((i) => i.sectors.includes(slug));
export const gsrc = (i: GalleryItem) => `/media/gallery/${i.id}.webp`;
export const SECTOR_FILTERS = [
  ['tous', 'Tous'], ['particuliers', 'Particuliers'], ['hotels-restaurants', 'Hôtels & restaurants'], ['bureaux-commerces', 'Bureaux'],
  ['ecoles-creches', 'Écoles'], ['piscines', 'Piscines'], ['technologie', 'La machine'],
] as const;
