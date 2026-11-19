'use client';
import { consent, eventLog } from './store';

/** Plan de tracking — noms d'événements stables (voir docs/04-data-analytics.md). */
export type EventName =
  | 'artwork_view' | 'library_search' | 'favorite_add' | 'artwork_select' | 'photo_upload'
  | 'simulation_start' | 'simulation_complete' | 'preview_download' | 'quote_start' | 'quote_submit'
  | 'estimate_view' | 'project_save';

export const FUNNEL: EventName[] = ['artwork_view', 'artwork_select', 'simulation_start', 'simulation_complete', 'quote_start', 'quote_submit'];

declare global { interface Window { dataLayer?: unknown[] } }

export function track(name: EventName, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  // Démo : journal local anonyme pour le tableau de bord admin (aucune donnée personnelle).
  eventLog.push({ name, at: new Date().toISOString(), props });
  // Outil d'analytics tiers uniquement après consentement explicite.
  if (consent.get().analytics) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...props });
  }
}
