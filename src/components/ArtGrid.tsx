import Link from 'next/link';
import { asset } from '@/config/site';
import type { Artwork } from '@/lib/artworks';
export function ArtGrid({ list }: { list: Artwork[] }) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3">
      {list.map((a) => (
        <Link key={a.id} href={`/oeuvres/?open=${a.id}`} className="reveal group block">
          <div className="overflow-hidden bg-stone"><img src={asset(a.thumb)} alt={a.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" /></div>
          <p className="mt-2 font-[family-name:var(--font-display)]">{a.title}</p>
        </Link>
      ))}
    </div>
  );
}
