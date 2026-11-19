'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { asset } from '@/config/site';
import { isPrintable, type Artwork } from '@/lib/artworks';
import { favorites } from '@/lib/store';
import { track } from '@/lib/analytics';

export function FavButton({ id, className = '' }: { id: string; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(favorites.has(id)); sync();
    addEventListener('mura:store', sync); return () => removeEventListener('mura:store', sync);
  }, [id]);
  return (
    <button aria-pressed={on} aria-label={on ? 'Retirer des favoris' : 'Ajouter aux favoris'} onClick={(e) => { e.preventDefault(); e.stopPropagation(); const v = favorites.toggle(id); if (v) track('favorite_add', { id }); }}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow transition hover:scale-110 ${className}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill={on ? '#F56B35' : 'none'} stroke={on ? '#F56B35' : 'currentColor'} strokeWidth="2"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.4 5 6.8 5c2 0 3.4 1.1 5.2 3 1.8-1.9 3.2-3 5.2-3 3.4 0 5.7 3.3 4.3 6.7C19.5 16.4 12 21 12 21z" /></svg>
    </button>
  );
}

export function ArtCard({ a, onOpen, selectable, selected, onSelect, priority }: { a: Artwork; onOpen?: () => void; selectable?: boolean; selected?: boolean; onSelect?: () => void; priority?: boolean }) {
  return (
    <article className="group relative">
      <button onClick={onOpen} className="block w-full overflow-hidden bg-stone text-left" aria-label={`Voir ${a.title}`}>
        <img src={asset(a.thumb)} alt="" loading={priority ? 'eager' : 'lazy'} width={a.width} height={a.height}
          className="h-auto w-full transition-transform duration-[1.2s] ease-[var(--ease-gallery)] group-hover:scale-[1.04]" />
      </button>
      <div className="absolute right-3 top-3 flex gap-2">
        {selectable && (
          <button aria-pressed={selected} onClick={onSelect} aria-label={selected ? 'Désélectionner pour comparaison' : 'Sélectionner pour comparaison'}
            className={`grid h-9 w-9 place-items-center rounded-full shadow text-sm ${selected ? 'bg-flame text-white' : 'bg-white/90'}`}>{selected ? '✓' : '+'}</button>
        )}
        <FavButton id={a.id} />
      </div>
      {a.aiGenerated && <span className="badge-ai absolute left-3 top-3">IA</span>}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg leading-tight">{a.title}</h3>
          <p className="text-xs text-concrete">{a.orientation} · {a.categories.slice(0, 2).join(' · ')}</p>
        </div>
        <div className="flex shrink-0 gap-1 pt-1" aria-hidden>
          {a.dominantColors.slice(0, 4).map((c) => <span key={c} className="h-3 w-3 rounded-full ring-1 ring-ink/10" style={{ background: c }} />)}
        </div>
      </div>
      {!isPrintable(a) && <p className="mt-1 text-xs text-flame">Droits en cours de validation — non sélectionnable pour impression</p>}
    </article>
  );
}

export function StudioLink({ a, className = 'btn btn-primary' }: { a: Artwork; className?: string }) {
  return <Link href={`/studio/?art=${a.id}`} className={className} onClick={() => track('artwork_select', { id: a.id })}>Visualiser sur mon mur</Link>;
}
