import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section } from '@/components/PageHero';
import { artworks, COLLECTIONS, CATEGORIES } from '@/lib/artworks';
import { asset } from '@/config/site';
import { WallPreview } from '@/components/WallPreview';
import { Gallery } from '@/components/Gallery';
export const metadata: Metadata = { title: 'Inspirations' };
export default function Page() {
  const cats = CATEGORIES.filter((c) => artworks.some((a) => a.categories.includes(c.id)));
  return (
    <>
      <PageHero eyebrow="Inspirations" title={<>Trouver l’œuvre<br />qui vous ressemble.</>} intro="Des collections pensées par ambiance et par lieu, pour passer de l’envie à l’image en quelques clics." cta={[{ href: '/oeuvres/', label: 'Ouvrir la bibliothèque' }, { href: '/studio/', label: 'Essayer sur mon mur' }]} />
      <Section className="!pt-0"><p className="eyebrow">En situation</p><h2 className="mb-10 mt-4 text-5xl">Nos murs, vos idées</h2><Gallery filters items={undefined} /></Section>
      {COLLECTIONS.map((c, k) => {
        const list = artworks.filter((a) => a.mood.includes(c.mood)).slice(0, 3);
        if (!list.length) return null;
        return (
          <Section key={c.id} className="border-t border-ink/10">
            <div className={`grid items-center gap-10 md:grid-cols-12 ${k % 2 ? 'md:[direction:rtl]' : ''}`}>
              <div className="md:col-span-5 [direction:ltr]">
                <p className="eyebrow">Collection {String(k + 1).padStart(2, '0')}</p>
                <h2 className="mt-4 text-5xl md:text-6xl">{c.title}</h2>
                <p className="mt-4 text-ink/70">{c.desc}</p>
                <div className="mt-6 flex gap-3">{list.map((a) => <Link key={a.id} href={`/oeuvres/?open=${a.id}`} className="block w-24 overflow-hidden"><img src={asset(a.thumb)} alt={a.title} className="aspect-square w-full object-cover transition hover:scale-105" loading="lazy" /></Link>)}</div>
                <Link href={`/oeuvres/?mood=${encodeURIComponent(c.mood)}`} className="btn btn-ghost mt-8">Voir la collection →</Link>
              </div>
              <div className="reveal relative md:col-span-7 [direction:ltr]"><WallPreview artId={list[0].id} /><span className="badge-ai absolute left-3 top-3">Simulation</span></div>
            </div>
          </Section>
        );
      })}
      <Section className="border-t border-ink/10">
        <h2 className="text-5xl">Par thème</h2>
        <div className="mt-10 flex flex-wrap gap-3">{cats.map((c) => <Link key={c.id} href={`/oeuvres/?cat=${c.id}`} className="display rounded-full border border-ink/15 px-6 py-3 text-2xl transition hover:bg-ink hover:text-wall">{c.label}</Link>)}</div>
      </Section>
    </>
  );
}
