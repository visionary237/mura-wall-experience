/**
 * Dossier de demande de devis — format unique transmis au CRM (webhook n8n → HubSpot / Brevo).
 * Version du schéma incrémentée à chaque changement incompatible.
 */
export const LEAD_SCHEMA_VERSION = '1.0';

export interface LeadPayload {
  schemaVersion: string;
  id: string;
  createdAt: string;
  contact: { firstName: string; lastName: string; email: string; phone?: string; organisation?: string };
  segment: 'particulier' | 'professionnel' | 'collectivite';
  establishmentType?: string;
  location: { postalCode: string; city?: string };
  project: {
    wallWidthM?: number; wallHeightM?: number; surfaceM2?: number; walls?: number;
    support?: string; supportState?: 'bon' | 'moyen' | 'mauvais'; graphicNeed?: 'none' | 'adaptation' | 'creation';
    difficultAccess?: boolean; timeline?: string; budget?: string; message?: string; multisite?: boolean;
  };
  artwork?: { id: string; title: string; license: string; rightsStatus: string; source: string } | null;
  simulation?: { projectId: string; previewDataUrl?: string; config: unknown } | null;
  wallPhotoAttached: boolean;
  estimate?: { low: number; high: number; isDemo: boolean } | null;
  acquisition: { source?: string; medium?: string; campaign?: string; referrer?: string; landingPage?: string };
  consents: { processing: boolean; marketing: boolean; consentText: string; timestamp: string };
}

export type LeadErrors = Partial<Record<string, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTAL_FR = /^\d{5}$/;

export function validateLead(p: LeadPayload): LeadErrors {
  const e: LeadErrors = {};
  if (!p.contact.firstName.trim()) e.firstName = 'Prénom requis';
  if (!p.contact.lastName.trim()) e.lastName = 'Nom requis';
  if (!EMAIL.test(p.contact.email)) e.email = 'Adresse e-mail invalide';
  if (p.contact.phone && !/^[+\d][\d\s.-]{7,}$/.test(p.contact.phone)) e.phone = 'Téléphone invalide';
  if (!POSTAL_FR.test(p.location.postalCode)) e.postalCode = 'Code postal à 5 chiffres';
  if (p.segment !== 'particulier' && !p.contact.organisation?.trim()) e.organisation = "Nom de l'établissement requis";
  if (!p.consents.processing) e.consent = 'Le consentement au traitement de la demande est requis';
  return e;
}

export function newId(prefix = 'lead') {
  const rnd = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rnd}`;
}

/** Score de qualification simple, utilisé pour la priorisation commerciale côté CRM. */
export function leadScore(p: LeadPayload): number {
  let s = 0;
  if (p.segment !== 'particulier') s += 20;
  if ((p.project.surfaceM2 ?? 0) >= 20) s += 20;
  if ((p.project.walls ?? 1) > 1 || p.project.multisite) s += 15;
  if (p.simulation) s += 15;
  if (p.artwork) s += 10;
  if (p.project.timeline === 'moins-1-mois' || p.project.timeline === '1-3-mois') s += 10;
  if (p.project.budget && p.project.budget !== 'inconnu') s += 10;
  return Math.min(100, s);
}

/**
 * Envoie le dossier. Sans webhook configuré (NEXT_PUBLIC_LEAD_WEBHOOK_URL), mode « dry-run » :
 * stockage local uniquement, aucune communication réelle n'est émise.
 */
export async function submitLead(p: LeadPayload): Promise<{ mode: 'webhook' | 'dry-run'; ok: boolean }> {
  const url = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL;
  const body = { ...p, score: leadScore(p) };
  if (!url) return { mode: 'dry-run', ok: true };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { mode: 'webhook', ok: res.ok };
}
