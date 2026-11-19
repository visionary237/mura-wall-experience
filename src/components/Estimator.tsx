'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { estimate, type EstimateInput } from '@/lib/pricing';
import { pricingConfig } from '@/config/site';
import { track } from '@/lib/analytics';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export function Estimator() {
  const [i, setI] = useState<EstimateInput>({ segment: 'particulier', surfaceM2: 8, walls: 1, distanceKm: 15, surfaceState: 'bon', graphic: 'none', difficultAccess: false });
  const e = useMemo(() => { try { return estimate(i); } catch { return null; } }, [i]);
  useEffect(() => { track('estimate_view'); }, []);
  const opt = <K extends keyof EstimateInput>(k: K, v: EstimateInput[K], label: string) => <button key={String(v)} className="chip" aria-pressed={i[k] === v} onClick={() => setI({ ...i, [k]: v })}>{label}</button>;
  const qs = new URLSearchParams({ segment: i.segment, surface: String(i.surfaceM2), walls: String(i.walls), state: i.surfaceState, graphic: i.graphic, access: i.difficultAccess ? '1' : '0' });
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7">
        <fieldset><legend className="label">Vous êtes</legend><div className="mt-3 flex flex-wrap gap-2">{opt('segment', 'particulier', 'Particulier')}{opt('segment', 'professionnel', 'Professionnel')}{opt('segment', 'collectivite', 'Collectivité')}</div></fieldset>
        <div className="grid gap-6 sm:grid-cols-3">
          <label className="block"><span className="label">Surface à imprimer (m²)</span><input type="number" min={0.5} step={0.5} className="field" value={i.surfaceM2} onChange={(ev) => setI({ ...i, surfaceM2: Math.max(0.5, +ev.target.value || 0.5) })} /></label>
          <label className="block"><span className="label">Nombre de murs</span><input type="number" min={1} className="field" value={i.walls} onChange={(ev) => setI({ ...i, walls: Math.max(1, +ev.target.value || 1) })} /></label>
          <label className="block"><span className="label">Distance (km)</span><input type="number" min={0} className="field" value={i.distanceKm} onChange={(ev) => setI({ ...i, distanceKm: Math.max(0, +ev.target.value || 0) })} /></label>
        </div>
        <fieldset><legend className="label">État du support</legend><div className="mt-3 flex flex-wrap gap-2">{opt('surfaceState', 'bon', 'Bon')}{opt('surfaceState', 'moyen', 'Moyen (fissures légères)')}{opt('surfaceState', 'mauvais', 'À reprendre')}</div></fieldset>
        <fieldset><legend className="label">Besoin graphique</legend><div className="mt-3 flex flex-wrap gap-2">{opt('graphic', 'none', 'Fichier prêt')}{opt('graphic', 'adaptation', 'Adaptation')}{opt('graphic', 'creation', 'Création sur mesure')}</div></fieldset>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={i.difficultAccess} onChange={(ev) => setI({ ...i, difficultAccess: ev.target.checked })} className="h-4 w-4 accent-[var(--color-flame)]" /> Accès difficile (hauteur, escaliers, horaires contraints)</label>
      </div>
      <aside className="lg:col-span-5" aria-live="polite">
        <div className="sticky top-24 bg-ink p-8 text-wall">
          {pricingConfig.mode === 'demo' && <p className="mb-5 rounded bg-flame px-3 py-2 text-xs font-medium uppercase tracking-wider">Mode démonstration — tarifs fictifs</p>}
          {e ? (
            <>
              <p className="label !text-wall/50">Fourchette indicative</p>
              <p className="display mt-2 text-5xl">{fmt(e.low)} – {fmt(e.high)}</p>
              <ul className="mt-6 space-y-2 border-t border-wall/10 pt-5 text-sm">
                {e.lines.map((l) => <li key={l.label} className="flex justify-between gap-4"><span className="text-wall/70">{l.label}</span><span className="tabular-nums">{fmt(l.amount)}</span></li>)}
                {e.minimumApplied && <li className="flex justify-between text-flame"><span>Minimum d’intervention appliqué</span><span>{fmt(pricingConfig.minimumFee)}</span></li>}
              </ul>
              <p className="mt-5 text-xs text-wall/50">Estimation non contractuelle. Le prix définitif est établi après visite technique.</p>
            </>
          ) : (
            <p className="text-wall/80">Chaque projet est chiffré sur mesure. Décrivez votre mur : nous revenons vers vous avec une estimation.</p>
          )}
          <Link href={`/contact/?${qs}`} className="btn btn-flame mt-8 w-full justify-center">Demander mon devis →</Link>
        </div>
      </aside>
    </div>
  );
}
