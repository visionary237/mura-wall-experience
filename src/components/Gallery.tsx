'use client';
import { useEffect, useRef, useState } from 'react';
import { asset } from '@/config/site';
import { gallery, gsrc, SECTOR_FILTERS, type GalleryItem } from '@/data/gallery';

/** Galerie masonry + visionneuse plein écran (clavier : ← → Échap). */
export function Gallery({ items, filters = false, columns = 'columns-1 sm:columns-2 lg:columns-3' }: { items?: GalleryItem[]; filters?: boolean; columns?: string }) {
  const [f, setF] = useState('tous');
  const base = items ?? gallery;
  const list = f === 'tous' ? base : base.filter((i) => i.sectors.includes(f));
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      {filters && (
        <div role="group" aria-label="Filtrer par univers" className="mb-8 flex flex-wrap gap-2">
          {SECTOR_FILTERS.map(([id, l]) => <button key={id} className="chip" aria-pressed={f === id} onClick={() => setF(id)}>{l}</button>)}
        </div>
      )}
      <div className={`${columns} gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid`}>
        {list.map((i, k) => (
          <figure key={i.id} className="reveal group">
            <button className="block w-full overflow-hidden bg-stone" onClick={() => setOpen(k)} aria-label={`Agrandir : ${i.title}`}>
              <img src={asset(gsrc(i))} alt={i.alt} width={i.width} height={i.height} loading="lazy" className="h-auto w-full transition-transform duration-[1.2s] ease-[var(--ease-gallery)] group-hover:scale-[1.03]" />
            </button>
            <figcaption className="mt-2 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-[family-name:var(--font-display)] text-base">{i.title}</span>
              {i.kind === 'realisation' && <span className="eyebrow text-flame">Réalisation</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {open !== null && list[open] && <Viewer list={list} i={open} setI={setOpen} />}
    </>
  );
}

function Viewer({ list, i, setI }: { list: GalleryItem[]; i: number; setI: (n: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null; ref.current?.focus(); document.body.style.overflow = 'hidden';
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setI(null);
      if (e.key === 'ArrowRight') setI((i + 1) % list.length);
      if (e.key === 'ArrowLeft') setI((i - 1 + list.length) % list.length);
    };
    addEventListener('keydown', k);
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; prev?.focus(); };
  }, [i, list.length, setI]);
  const it = list[i];
  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={it.title} className="fixed inset-0 z-[80] flex flex-col bg-ink/95 text-wall" onClick={() => setI(null)}>
      <div className="flex items-center justify-between px-5 py-4 text-sm">
        <span>{i + 1} / {list.length} — {it.title}</span>
        <button aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full bg-wall text-ink">✕</button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-14 pb-10" onClick={(e) => e.stopPropagation()}>
        <img src={asset(gsrc(it))} alt={it.alt} className="max-h-full max-w-full object-contain" />
        <button aria-label="Précédent" onClick={() => setI((i - 1 + list.length) % list.length)} className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-wall/10 hover:bg-wall/25">←</button>
        <button aria-label="Suivant" onClick={() => setI((i + 1) % list.length)} className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-wall/10 hover:bg-wall/25">→</button>
      </div>
    </div>
  );
}
