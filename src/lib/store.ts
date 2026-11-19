'use client';
/**
 * Persistance locale (navigateur) — aucun compte requis.
 * En production (phase 5), les projets transmis sont copiés vers Supabase (stockage privé + URL signées).
 */
import type { Placement } from './warp';
import type { Pt } from './homography';
import type { LeadPayload } from './lead';

const KEYS = { fav: 'mura.favorites', projects: 'mura.projects', leads: 'mura.leads', events: 'mura.events', consent: 'mura.consent' };

function read<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write(k: string, v: unknown): boolean {
  try { localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('mura:store', { detail: k })); return true; } catch { return false; }
}

export const favorites = {
  list: () => read<string[]>(KEYS.fav, []),
  has: (id: string) => favorites.list().includes(id),
  toggle(id: string) { const l = favorites.list(); const n = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; write(KEYS.fav, n); return n.includes(id); },
};

export interface StudioProject {
  id: string; name: string; updatedAt: string;
  artworkId: string | null; customArt?: { dataUrl: string; width: number; height: number; originalWidth: number; originalHeight: number } | null;
  roomId: string | null; customRoom?: { dataUrl: string; width: number; height: number } | null;
  wall: Pt[]; obstacles: Pt[][]; wallWidthM: number; wallHeightM: number; viewingDistanceM: number;
  placement: Placement; previewDataUrl?: string;
}

export const projects = {
  list: () => read<StudioProject[]>(KEYS.projects, []),
  get: (id: string) => projects.list().find((p) => p.id === id),
  save(p: StudioProject): boolean {
    const l = projects.list().filter((x) => x.id !== p.id);
    // Les images importées peuvent dépasser le quota : on retente sans l'aperçu.
    return write(KEYS.projects, [p, ...l].slice(0, 12)) || write(KEYS.projects, [{ ...p, previewDataUrl: undefined }, ...l].slice(0, 12));
  },
  remove(id: string) { write(KEYS.projects, projects.list().filter((p) => p.id !== id)); },
};

export const leads = {
  list: () => read<(LeadPayload & { score: number; delivery: string })[]>(KEYS.leads, []),
  add(l: LeadPayload & { score: number; delivery: string }) { write(KEYS.leads, [l, ...leads.list()].slice(0, 50)); },
  clear() { write(KEYS.leads, []); },
};

export const consent = {
  get: () => read<{ analytics: boolean; decided: boolean }>(KEYS.consent, { analytics: false, decided: false }),
  set(analytics: boolean) { write(KEYS.consent, { analytics, decided: true }); },
};

export const eventLog = {
  list: () => read<{ name: string; at: string; props?: Record<string, unknown> }[]>(KEYS.events, []),
  push(e: { name: string; at: string; props?: Record<string, unknown> }) { write(KEYS.events, [...eventLog.list(), e].slice(-500)); },
};
