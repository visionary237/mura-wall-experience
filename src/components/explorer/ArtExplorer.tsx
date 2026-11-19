'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { artworks, CATEGORIES, COLLECTIONS, MOODS, filterArtworks, getArtwork, isPrintable, similarArtworks, type Artwork, type ArtFilter } from '@/lib/artworks';
import { ArtCard, FavButton, StudioLink } from '@/components/ArtCard';
import { WallPreview } from '@/components/WallPreview';
import { favorites } from '@/lib/store';
import { track } from '@/lib/analytics';
import { asset } from '@/config/site';

const SWATCHES = ['#151515', '#F8F7F4', '#F56B35', '#C9A55A', '#2D5DA8', '#1F3A5F', '#3F5A47', '#86B386', '#E7B8A2', '#7CC6C2'];
const ORIENT: { id: Artwork['orientation']; label: string }[] = [{ id: 'portrait', label: 'Portrait' }, { id: 'paysage', label: 'Paysage' }, { id: 'panoramique', label: 'Panoramique' }, { id: 'carre', label: 'Carré' }];
const usedCats = new Set(artworks.flatMap((a) => a.categories));

export function ArtExplorer() {
  const sp = useSearchParams();
  const [f, setF] = useState<ArtFilter>({ q: '', categories: sp.get('cat') ? [sp.get('cat')!] : [], orientation: null, mood: sp.get('mood'), color: null, printableOnly: false });
  const [favOnly, setFavOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(sp.get('open'));
  const [sel, setSel] = useState<string[]>([]);
  const [compare, setCompare] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => { const s = () => setFavs(favorites.list()); s(); addEventListener('mura:store', s); return () => removeEventListener('mura:store', s); }, []);
  const results = useMemo(() => { const r = filterArtworks(f); return favOnly ? r.filter((a) => favs.includes(a.id)) : r; }, [f, favOnly, favs]);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => { if (!f.q) return; clearTimeout(t.current); t.current = setTimeout(() => track('library_search', { q: f.q, results: results.length }), 700); }, [f.q, results.length]);
  const toggleCat = (c: string) => setF((x) => ({ ...x, categories: x.categories.includes(c) ? x.categories.filter((y) => y !== c) : [...x.categories, c] }));
  const reset = () => { setF({ q: '', categories: [], orientation: null, mood: null, color: null, printableOnly: false }); setFavOnly(false); };
  const active = f.q || f.categories.length || f.orientation || f.mood || f.color || f.printableOnly || favOnly;

  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-32 pt-32 md:px-10">
      <header className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow">Art Explorer</p>
          <h1 className="mt-4 text-6xl md:text-8xl">Bibliothèque d’œuvres</h1>
        </div>
        <p className="self-end text-ink/70 md:col-span-4 md:col-start-9">Chaque œuvre est documentée : auteur, source, licence, dimensions. Seules les œuvres aux droits validés peuvent être retenues pour impression.</p>
      </header>

      <section aria-label="Collections" className="mt-14 grid gap-3 md:grid-cols-4">
        {COLLECTIONS.map((c) => {
          const cover = artworks.find((a) => a.mood.includes(c.mood));
          return (
            <button key={c.id} aria-pressed={f.mood === c.mood} onClick={() => setF((x) => ({ ...x, mood: x.mood === c.mood ? null : c.mood }))} className={`group relative h-40 overflow-hidden text-left text-white ring-2 transition ${f.mood === c.mood ? 'ring-flame' : 'ring-transparent'}`}>
              {cover && <img src={asset(cover.thumb)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
              <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/10" />
              <span className="absolute bottom-4 left-4 right-4"><span className="display block text-2xl">{c.title}</span><span className="text-xs text-white/75">{c.desc}</span></span>
            </button>
          );
        })}
      </section>

      <div className="sticky top-16 z-30 -mx-5 mt-10 border-y border-ink/10 bg-wall/95 px-5 py-4 backdrop-blur md:-mx-10 md:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <label className="min-w-[220px] flex-1"><span className="sr-only">Rechercher</span>
            <input type="search" className="field" placeholder="Rechercher une œuvre, une ambiance, un thème…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
          </label>
          <select aria-label="Orientation" className="chip bg-transparent" value={f.orientation ?? ''} onChange={(e) => setF({ ...f, orientation: (e.target.value || null) as ArtFilter['orientation'] })}>
            <option value="">Toutes orientations</option>{ORIENT.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <select aria-label="Ambiance" className="chip bg-transparent" value={f.mood ?? ''} onChange={(e) => setF({ ...f, mood: e.target.value || null })}>
            <option value="">Toutes ambiances</option>{MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <div role="group" aria-label="Couleur dominante" className="flex items-center gap-1">
            {SWATCHES.map((c) => <button key={c} aria-label={`Couleur ${c}`} aria-pressed={f.color === c} onClick={() => setF({ ...f, color: f.color === c ? null : c })} className={`h-6 w-6 rounded-full ring-1 ring-ink/15 transition ${f.color === c ? 'scale-125 ring-2 ring-flame' : ''}`} style={{ background: c }} />)}
          </div>
          <button className="chip" aria-pressed={favOnly} onClick={() => setFavOnly(!favOnly)}>♥ Favoris ({favs.length})</button>
          <button className="chip" aria-pressed={f.printableOnly} onClick={() => setF({ ...f, printableOnly: !f.printableOnly })}>Droits validés</button>
          {active ? <button className="text-sm underline underline-offset-4" onClick={reset}>Réinitialiser</button> : null}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Catégories">
          {CATEGORIES.map((c) => (
            <button key={c.id} className="chip shrink-0 disabled:opacity-30" aria-pressed={f.categories.includes(c.id)} disabled={!usedCats.has(c.id)} title={usedCats.has(c.id) ? undefined : 'Aucune œuvre validée pour le moment'} onClick={() => toggleCat(c.id)}>{c.label}</button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-concrete" aria-live="polite">{results.length} œuvre{results.length > 1 ? 's' : ''}</p>
      <div className="mt-6 columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-10 [&>*]:break-inside-avoid">
        {results.map((a, k) => (
          <ArtCard key={a.id} a={a} priority={k < 4} onOpen={() => { setOpen(a.id); track('artwork_view', { id: a.id }); }} selectable selected={sel.includes(a.id)} onSelect={() => setSel((s) => (s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id].slice(-3)))} />
        ))}
      </div>
      {!results.length && <p className="py-20 text-center text-ink/60">Aucune œuvre ne correspond. <button onClick={reset} className="underline">Réinitialiser les filtres</button> ou <Link href="/contact/?need=creation" className="underline">demander une création</Link>.</p>}

      <section className="mt-24 rounded-sm border border-ink/10 p-8">
        <p className="eyebrow">Sources externes (en étude)</p>
        <p className="mt-3 max-w-3xl text-sm text-ink/70">Unsplash, Pexels, Pixabay, Openverse et les collections de musées en accès ouvert pourront enrichir la bibliothèque. Chaque image importée passera par la validation : licence, usage commercial, droit de modification, attribution et résolution. Une image publique n’est jamais considérée comme imprimable par défaut.</p>
      </section>

      {sel.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ink text-wall">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-5 py-3 md:px-10">
            <span className="text-sm">{sel.length} sélectionnée{sel.length > 1 ? 's' : ''} (max 3)</span>
            <div className="flex gap-2">{sel.map((id) => <img key={id} src={asset(getArtwork(id)!.thumb)} alt="" className="h-10 w-14 rounded object-cover" />)}</div>
            <button className="btn btn-flame ml-auto !py-2" onClick={() => setCompare(true)}>Comparer dans un intérieur</button>
            <button className="text-sm text-wall/60" onClick={() => setSel([])}>Vider</button>
          </div>
        </div>
      )}

      {open && getArtwork(open) && <Lightbox a={getArtwork(open)!} onClose={() => setOpen(null)} onOpen={setOpen} />}
      {compare && (
        <Dialog onClose={() => setCompare(false)} label="Comparaison d’œuvres">
          <h2 className="text-4xl">Comparer dans le même salon</h2>
          <div className={`mt-6 grid gap-4 ${sel.length > 1 ? 'md:grid-cols-2' : ''} ${sel.length > 2 ? 'xl:grid-cols-3' : ''}`}>
            {sel.map((id) => (
              <figure key={id}><WallPreview artId={id} /><figcaption className="mt-2 flex items-center justify-between text-sm">{getArtwork(id)!.title}<StudioLink a={getArtwork(id)!} className="underline underline-offset-4" /></figcaption></figure>
            ))}
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Dialog({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; prev?.focus(); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-wall" role="dialog" aria-modal="true" aria-label={label} ref={ref} tabIndex={-1}>
      <button onClick={onClose} className="fixed right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-ink text-wall" aria-label="Fermer">✕</button>
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10">{children}</div>
    </div>
  );
}

function Lightbox({ a, onClose, onOpen }: { a: Artwork; onClose: () => void; onOpen: (id: string) => void }) {
  const [inRoom, setInRoom] = useState(false);
  const sim = similarArtworks(a.id, 4);
  return (
    <Dialog onClose={onClose} label={a.title}>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-3 flex gap-2">
            <button className="chip" aria-pressed={!inRoom} onClick={() => setInRoom(false)}>Œuvre</button>
            <button className="chip" aria-pressed={inRoom} onClick={() => setInRoom(true)}>Dans un intérieur</button>
          </div>
          {inRoom ? <WallPreview artId={a.id} /> : <img src={asset(a.src)} alt={a.title} className="max-h-[78vh] w-full bg-stone object-contain" />}
        </div>
        <div className="lg:col-span-4">
          <p className="eyebrow">{a.categories.join(' · ')}</p>
          <h2 className="mt-3 text-5xl">{a.title}</h2>
          <p className="mt-4 text-ink/70">{a.description}</p>
          <div className="mt-6 flex gap-2">{a.dominantColors.map((c) => <span key={c} title={c} className="h-8 w-8 rounded-full ring-1 ring-ink/10" style={{ background: c }} />)}</div>
          <dl className="mt-8 grid grid-cols-[9rem_1fr] gap-y-2 border-t border-ink/10 pt-6 text-sm">
            <dt className="text-concrete">Auteur</dt><dd>{a.author}</dd>
            <dt className="text-concrete">Source</dt><dd>{a.source === 'internal' ? 'Collection interne' : a.source}{a.sourceUrl && <> — <a className="underline" href={a.sourceUrl}>original</a></>}</dd>
            <dt className="text-concrete">Licence</dt><dd>{a.license}</dd>
            <dt className="text-concrete">Usage commercial</dt><dd>{a.commercialUse === true ? 'Autorisé' : a.commercialUse === false ? 'Non' : 'À vérifier'}</dd>
            <dt className="text-concrete">Modification</dt><dd>{a.modificationAllowed === true ? 'Autorisée' : a.modificationAllowed === false ? 'Non' : 'À vérifier'}</dd>
            {a.attribution && <><dt className="text-concrete">Attribution</dt><dd>{a.attribution}</dd></>}
            <dt className="text-concrete">Dimensions</dt><dd>{a.width} × {a.height} px · {a.orientation}</dd>
            <dt className="text-concrete">Droits</dt><dd className={isPrintable(a) ? 'text-emerald-700' : 'text-flame'}>{isPrintable(a) ? 'Validés' : 'En attente de validation'}</dd>
          </dl>
          {a.aiGenerated && <p className="mt-4 text-xs text-concrete">Image générée par IA : présentée comme concept.</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <StudioLink a={a} />
            <FavButton id={a.id} className="!h-12 !w-12" />
          </div>
          {!isPrintable(a) && <p className="mt-3 text-xs text-flame">Simulation possible ; la sélection pour impression sera ouverte après validation des droits.</p>}
        </div>
      </div>
      <section className="mt-20">
        <h3 className="text-3xl">Œuvres similaires</h3>
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
          {sim.map((s) => <ArtCard key={s.id} a={s} onOpen={() => { onOpen(s.id); track('artwork_view', { id: s.id }); }} />)}
        </div>
      </section>
    </Dialog>
  );
}
