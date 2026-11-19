'use client';
import { useState } from 'react';
import Link from 'next/link';
import { WallPreview } from '@/components/WallPreview';
import { artworks } from '@/lib/artworks';
import { asset } from '@/config/site';

const picks = artworks.filter((a) => ['seigaiha-or', 'botanique-clair', 'houle', 'bauhaus-primaire', 'strates-nuit'].includes(a.slug));

/** Scène 5 — MAKE IT YOURS : aperçu interactif du Wall Creative Studio. */
export function MakeItYours() {
  const [id, setId] = useState(picks[0].id);
  const [scale, setScale] = useState(1);
  const [integ, setInteg] = useState(0.7);
  return (
    <section className="bg-stone/50 py-28 md:py-40" aria-labelledby="miy">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <p className="eyebrow">05 — Make it yours</p>
          <h2 id="miy" className="mt-5 text-5xl md:text-7xl">Essayez avant de décider.</h2>
          <p className="mt-6 max-w-sm text-ink/70">Le Wall Creative Studio projette l’œuvre sur votre propre photo, en respectant la perspective, les ombres et les meubles.</p>
          <fieldset className="mt-10">
            <legend className="label">Œuvre</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {picks.map((a) => (
                <button key={a.id} aria-pressed={a.id === id} onClick={() => setId(a.id)} className={`h-14 w-14 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-wall transition ${a.id === id ? 'ring-flame' : 'ring-transparent'}`} aria-label={a.title}>
                  <img src={asset(a.thumb)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="mt-8 block"><span className="label">Échelle</span><input className="range mt-2" type="range" min={1} max={2.2} step={0.05} value={scale} onChange={(e) => setScale(+e.target.value)} /></label>
          <label className="mt-4 block"><span className="label">Intégration lumière</span><input className="range mt-2" type="range" min={0} max={1} step={0.05} value={integ} onChange={(e) => setInteg(+e.target.value)} /></label>
          <Link href={`/studio/?art=${id}`} className="btn btn-primary mt-10">Ouvrir le Studio complet →</Link>
        </div>
        <div className="md:col-span-8">
          <div className="relative overflow-hidden rounded-sm shadow-[0_40px_80px_-40px_rgba(0,0,0,.35)]">
            <WallPreview artId={id} placement={{ scale, integration: integ }} />
            <span className="badge-ai absolute left-3 top-3">Simulation indicative</span>
          </div>
        </div>
      </div>
    </section>
  );
}
