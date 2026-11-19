'use client';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { leads, eventLog } from '@/lib/store';
import { FUNNEL } from '@/lib/analytics';
import { artworks, isPrintable } from '@/lib/artworks';
import { pricingConfig, qualityConfig } from '@/config/site';

type Lead = ReturnType<typeof leads.list>[number];
const TABS = ['Demandes', 'Funnel', 'Œuvres & droits', 'Tarifs'] as const;

function toCSV(rows: Lead[]) {
  const cols: [string, (l: Lead) => unknown][] = [
    ['id', (l) => l.id], ['date', (l) => l.createdAt], ['segment', (l) => l.segment], ['etablissement', (l) => l.contact.organisation], ['type', (l) => l.establishmentType],
    ['prenom', (l) => l.contact.firstName], ['nom', (l) => l.contact.lastName], ['email', (l) => l.contact.email], ['telephone', (l) => l.contact.phone],
    ['cp', (l) => l.location.postalCode], ['surface_m2', (l) => l.project.surfaceM2], ['murs', (l) => l.project.walls], ['budget', (l) => l.project.budget], ['delai', (l) => l.project.timeline],
    ['oeuvre', (l) => l.artwork?.title], ['droits', (l) => l.artwork?.rightsStatus], ['simulation', (l) => !!l.simulation], ['score', (l) => l.score], ['consent_marketing', (l) => l.consents.marketing], ['source', (l) => l.acquisition.source],
  ];
  const esc = (v: unknown) => { const s = v == null ? '' : String(v); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.map((c) => c[0]).join(';'), ...rows.map((r) => cols.map((c) => esc(c[1](r))).join(';'))].join('\n');
}
function dl(name: string, content: string, type: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}

export function AdminDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Demandes');
  const [list, setList] = useState<Lead[]>([]);
  const [events, setEvents] = useState<ReturnType<typeof eventLog.list>>([]);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { const s = () => { setList(leads.list()); setEvents(eventLog.list()); }; s(); addEventListener('mura:store', s); return () => removeEventListener('mura:store', s); }, []);
  const funnel = useMemo(() => FUNNEL.map((n) => ({ n, c: events.filter((e) => e.name === n).length })), [events]);
  const max = Math.max(1, ...funnel.map((f) => f.c));
  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-24 pt-28 md:px-10">
      <div className="rounded bg-flame/10 p-4 text-sm text-ink"><b>Back-office de démonstration.</b> Il lit les données de ce navigateur uniquement. En production : authentification, rôles et base Supabase (voir docs/03-data-model.md).</div>
      <h1 className="mt-8 text-6xl">Administration</h1>
      <div role="tablist" className="mt-8 flex gap-2">{TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className="chip" aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>

      {tab === 'Demandes' && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-concrete">{list.length} demande(s)</p>
            <button className="chip ml-auto" disabled={!list.length} onClick={() => dl('demandes.csv', '﻿' + toCSV(list), 'text/csv;charset=utf-8')}>Exporter CSV</button>
            <button className="chip" disabled={!list.length} onClick={() => dl('demandes.json', JSON.stringify(list, null, 2), 'application/json')}>Exporter JSON (payload CRM)</button>
            <button className="chip" disabled={!list.length} onClick={() => confirm('Supprimer toutes les demandes de démonstration ?') && leads.clear()}>Vider</button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-ink/15 text-concrete"><tr>{['Date', 'Contact', 'Segment', 'Surface', 'Œuvre', 'Score', 'Envoi', ''].map((h) => <th key={h} className="py-2 font-normal">{h}</th>)}</tr></thead>
              <tbody>
                {list.map((l) => (
                  <Fragment key={l.id}>
                    <tr className="border-b border-ink/5">
                      <td className="py-3">{new Date(l.createdAt).toLocaleString('fr-FR')}</td>
                      <td>{l.contact.firstName} {l.contact.lastName}<br /><span className="text-concrete">{l.contact.organisation ?? l.contact.email}</span></td>
                      <td>{l.segment}{l.project.multisite && ' · multisite'}</td>
                      <td>{l.project.surfaceM2 ?? '—'} m²</td>
                      <td>{l.artwork?.title ?? '—'}{l.artwork && l.artwork.rightsStatus !== 'validated' && <span className="block text-xs text-flame">droits à valider</span>}</td>
                      <td><span className={`rounded px-2 py-0.5 ${l.score >= 50 ? 'bg-flame text-white' : 'bg-stone'}`}>{l.score}</span></td>
                      <td>{l.delivery}</td>
                      <td><button className="underline" onClick={() => setOpen(open === l.id ? null : l.id)}>{open === l.id ? 'Fermer' : 'Dossier'}</button></td>
                    </tr>
                    {open === l.id && <tr><td colSpan={8}><pre className="max-h-96 overflow-auto bg-ink p-4 text-xs text-wall">{JSON.stringify(l, null, 2)}</pre></td></tr>}
                  </Fragment>
                ))}
                {!list.length && <tr><td colSpan={8} className="py-10 text-center text-concrete">Aucune demande. Testez le parcours depuis la page Contact.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'Funnel' && (
        <section className="mt-8 max-w-3xl">
          <p className="text-sm text-concrete">Événements anonymes enregistrés dans ce navigateur ({events.length}).</p>
          <ul className="mt-6 space-y-3">{funnel.map((f, k) => (
            <li key={f.n} className="grid grid-cols-[12rem_1fr_4rem] items-center gap-3 text-sm">
              <span>{f.n}</span>
              <span className="h-6 bg-stone/50"><span className="block h-full bg-flame" style={{ width: `${(f.c / max) * 100}%` }} /></span>
              <span className="tabular-nums">{f.c}{k > 0 && funnel[k - 1].c ? <span className="block text-[10px] text-concrete">{Math.round((f.c / funnel[k - 1].c) * 100)} %</span> : null}</span>
            </li>))}
          </ul>
        </section>
      )}

      {tab === 'Œuvres & droits' && (
        <section className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-ink/15 text-concrete"><tr>{['Œuvre', 'Source', 'Licence', 'Commercial', 'Droits', 'Qualité', 'Imprimable'].map((h) => <th key={h} className="py-2 font-normal">{h}</th>)}</tr></thead>
            <tbody>{artworks.map((a) => (
              <tr key={a.id} className="border-b border-ink/5"><td className="py-2">{a.title}</td><td>{a.source}</td><td className="max-w-xs">{a.license}</td><td>{a.commercialUse === true ? 'Oui' : a.commercialUse === false ? 'Non' : '?'}</td><td>{a.rightsStatus}</td><td>{a.printQualityStatus}</td><td>{isPrintable(a) ? '✓' : <span className="text-flame">bloqué</span>}</td></tr>
            ))}</tbody>
          </table>
          <p className="mt-4 text-xs text-concrete">Ajout, suppression et validation des œuvres : phase 5 (Supabase + stockage objet).</p>
        </section>
      )}

      {tab === 'Tarifs' && (
        <section className="mt-8 grid gap-8 md:grid-cols-2">
          <div><h2 className="text-3xl">Moteur tarifaire — mode « {pricingConfig.mode} »</h2><pre className="mt-4 overflow-auto bg-ink p-4 text-xs text-wall">{JSON.stringify(pricingConfig, null, 2)}</pre></div>
          <div><h2 className="text-3xl">Seuils qualité</h2><pre className="mt-4 overflow-auto bg-ink p-4 text-xs text-wall">{JSON.stringify(qualityConfig, (k, v) => (v === Infinity ? '∞' : v), 2)}</pre></div>
          <p className="text-xs text-concrete md:col-span-2">Valeurs fictives éditables dans <code>src/config/site.ts</code> ; en phase 5, elles seront administrables via la table <code>pricing_rules</code>.</p>
        </section>
      )}
    </div>
  );
}
