import { describe, it, expect } from 'vitest';
import { homography, apply, invert, UNIT, printableSurface, isConvexQuad, polygonArea } from '@/lib/homography';
import { evaluateQuality } from '@/lib/quality';
import { estimate } from '@/lib/pricing';
import { validateLead, leadScore, LEAD_SCHEMA_VERSION, type LeadPayload } from '@/lib/lead';
import { filterArtworks, similarArtworks, colorDistance } from '@/lib/artworks';
import { pricingConfig } from '@/config/site';

const quad = [{ x: 202, y: 88 }, { x: 1112, y: 88 }, { x: 1112, y: 520 }, { x: 202, y: 520 }];
const skew = [{ x: 100, y: 50 }, { x: 900, y: 120 }, { x: 880, y: 600 }, { x: 120, y: 700 }];

describe('homographie', () => {
  it('envoie les 4 coins exactement', () => {
    const H = homography(UNIT, skew);
    UNIT.forEach((p, i) => {
      const q = apply(H, p);
      expect(q.x).toBeCloseTo(skew[i].x, 6);
      expect(q.y).toBeCloseTo(skew[i].y, 6);
    });
  });
  it("l'inverse ramène au point d'origine", () => {
    const H = homography(UNIT, skew);
    const back = apply(invert(H), apply(H, { x: 0.3, y: 0.7 }));
    expect(back.x).toBeCloseTo(0.3, 9);
    expect(back.y).toBeCloseTo(0.7, 9);
  });
  it('détecte un quadrilatère croisé', () => {
    expect(isConvexQuad(skew)).toBe(true);
    expect(isConvexQuad([skew[0], skew[2], skew[1], skew[3]])).toBe(false);
  });
  it("lève une erreur sur 3 points alignés", () => {
    expect(() => homography(UNIT, [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 0, y: 5 }])).toThrow();
  });
});

describe('surface imprimable', () => {
  it('soustrait un obstacle de 25 % du mur', () => {
    const W = quad[1].x - quad[0].x, Hh = quad[2].y - quad[1].y;
    const door = [{ x: 202, y: 88 }, { x: 202 + W / 2, y: 88 }, { x: 202 + W / 2, y: 88 + Hh / 2 }, { x: 202, y: 88 + Hh / 2 }];
    const s = printableSurface(quad, 4, 2.5, [door]);
    expect(s.gross).toBe(10);
    expect(s.excluded).toBeCloseTo(2.5, 2);
    expect(s.net).toBeCloseTo(7.5, 2);
  });
  it('aire polygone', () => expect(polygonArea(UNIT)).toBe(1));
});

describe('contrôle qualité', () => {
  it('6000 px sur 4 m vu à 2 m → optimal (≈38 dpi ≥ 30 pour distance intermédiaire ? non : seuil 60)', () => {
    const r = evaluateQuality({ pxWidth: 6000, pxHeight: 3000, targetWidthM: 4, targetHeightM: 2, viewingDistanceM: 2 });
    expect(r.effectiveDpi).toBe(38);
    expect(r.level).toBe('check');
  });
  it('image haute résolution → optimal', () => {
    const r = evaluateQuality({ pxWidth: 12000, pxHeight: 6000, targetWidthM: 4, targetHeightM: 2, viewingDistanceM: 2 });
    expect(r.level).toBe('optimal');
  });
  it('photo smartphone sur grand mur vu de près → insuffisant', () => {
    const r = evaluateQuality({ pxWidth: 1280, pxHeight: 720, targetWidthM: 5, targetHeightM: 2.8, viewingDistanceM: 0.8 });
    expect(r.level).toBe('insufficient');
  });
  it('signale un écart de ratio', () => {
    const r = evaluateQuality({ pxWidth: 2000, pxHeight: 2000, targetWidthM: 4, targetHeightM: 2, viewingDistanceM: 5 });
    expect(r.ratioDeltaPct).toBe(50);
    expect(r.messages.some((m) => m.includes('recadrage'))).toBe(true);
  });
  it('rejette un format non accepté', () => {
    const r = evaluateQuality({ pxWidth: 9000, pxHeight: 4500, targetWidthM: 3, targetHeightM: 1.5, viewingDistanceM: 3, mimeType: 'image/gif' });
    expect(r.formatOk).toBe(false);
  });
});

describe('estimateur', () => {
  const base = { segment: 'particulier' as const, surfaceM2: 10, walls: 1, distanceKm: 10, surfaceState: 'bon' as const, graphic: 'none' as const, difficultAccess: false };
  it('applique le minimum d’intervention', () => {
    const e = estimate({ ...base, surfaceM2: 2 })!;
    expect(e.minimumApplied).toBe(true);
    expect(e.total).toBe(pricingConfig.minimumFee);
  });
  it('remise volume et déplacement', () => {
    const e = estimate({ ...base, segment: 'professionnel', surfaceM2: 40, distanceKm: 80 })!;
    expect(e.lines.find((l) => l.label.startsWith('Remise'))!.amount).toBe(-170);
    expect(e.lines.find((l) => l.label.startsWith('Déplacement'))!.amount).toBe(60);
    expect(e.total).toBe(3400 - 170 + 60);
    expect(e.isDemo).toBe(true);
  });
  it('mode manuel → aucune estimation chiffrée', () => {
    expect(estimate(base, { ...pricingConfig, mode: 'manual' })).toBeNull();
  });
});

const lead = (over: Partial<LeadPayload> = {}): LeadPayload => ({
  schemaVersion: LEAD_SCHEMA_VERSION, id: 'x', createdAt: '', segment: 'particulier',
  contact: { firstName: 'Ana', lastName: 'B', email: 'ana@exemple.fr' }, location: { postalCode: '76600' },
  project: {}, wallPhotoAttached: false, acquisition: {},
  consents: { processing: true, marketing: false, consentText: 't', timestamp: '' }, ...over,
});

describe('dossier de devis', () => {
  it('valide un dossier complet', () => expect(validateLead(lead())).toEqual({}));
  it('exige consentement, e-mail, CP et établissement pour les pros', () => {
    const e = validateLead(lead({ segment: 'collectivite', contact: { firstName: 'A', lastName: 'B', email: 'bad' }, location: { postalCode: '76' }, consents: { processing: false, marketing: false, consentText: '', timestamp: '' } }));
    expect(Object.keys(e).sort()).toEqual(['consent', 'email', 'organisation', 'postalCode']);
  });
  it('score plus élevé pour un projet pro multisite simulé', () => {
    const hi = leadScore(lead({ segment: 'collectivite', project: { surfaceM2: 60, multisite: true, timeline: '1-3-mois', budget: '5-15k' }, simulation: { projectId: 'p', config: {} } }));
    expect(hi).toBeGreaterThan(leadScore(lead()));
  });
});

describe('Art Explorer', () => {
  it('filtre par catégorie, orientation et texte', () => {
    const r = filterArtworks({ q: 'vague', categories: ['art-japonais'], orientation: null, mood: null, color: null, printableOnly: false });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((a) => a.categories.includes('art-japonais'))).toBe(true);
  });
  it("'imprimable seulement' exclut les droits en attente", () => {
    const r = filterArtworks({ q: '', categories: [], orientation: null, mood: null, color: null, printableOnly: true });
    expect(r.every((a) => a.rightsStatus === 'validated')).toBe(true);
  });
  it('recherche par couleur trie par proximité', () => {
    expect(colorDistance('#000000', '#000000')).toBe(0);
    const r = filterArtworks({ q: '', categories: [], orientation: null, mood: null, color: '#1F3A5F', printableOnly: false });
    expect(r[0].slug).toMatch(/seigaiha-indigo|strates-nuit/);
  });
  it('œuvres similaires excluent l’œuvre elle-même', () => {
    const s = similarArtworks('art-003', 3);
    expect(s).toHaveLength(3);
    expect(s.find((a) => a.id === 'art-003')).toBeUndefined();
  });
});
