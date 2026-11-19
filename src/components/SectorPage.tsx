import Link from 'next/link';
import { PageHero, Section } from '@/components/PageHero';
import { WallPreview } from '@/components/WallPreview';
import { BeforeAfter } from '@/components/BeforeAfter';
import { ArtGrid } from '@/components/ArtGrid';
import { asset } from '@/config/site';
import { artworks, getArtwork } from '@/lib/artworks';
import type { Sector } from '@/data/sectors';
import { forSector, gsrc } from '@/data/gallery';
import { Gallery } from '@/components/Gallery';

export function SectorPage({ s }: { s: Sector }) {
  const hero = getArtwork(s.heroArt)!;
  const insp = artworks.filter((a) => a.categories.some((c) => s.categories.includes(c))).slice(0, 6);
  const photos = forSector(s.slug);
  const cta = [{ href: `/contact/?segment=${s.segment}&sector=${encodeURIComponent(s.segments[0])}`, label: 'Demander un devis' }, { href: `/studio/?art=${hero.id}`, label: 'Simuler sur notre mur' }];
  return (
    <>
      {photos.length ? (
        <section className="mx-auto grid max-w-[1600px] items-end gap-10 px-5 pb-16 pt-32 md:grid-cols-12 md:px-10">
          <div className="md:col-span-6">
            <p className="eyebrow">{s.title}</p>
            <h1 className="mt-5 text-6xl md:text-[5.6vw]">{s.headline}</h1>
            <p className="mt-8 max-w-xl text-lg text-ink/70">{s.intro}</p>
            <div className="mt-10 flex flex-wrap gap-3">{cta.map((c, k) => <Link key={c.href} href={c.href} className={k ? 'btn btn-ghost' : 'btn btn-flame'}>{c.label}</Link>)}</div>
          </div>
          <div className="md:col-span-6"><img src={asset(gsrc(photos[0]))} alt={photos[0].alt} className="w-full" /></div>
        </section>
      ) : (
        <PageHero eyebrow={s.title} title={s.headline} intro={s.intro} image={asset(hero.src)} cta={cta} badge="Visuel d’illustration — œuvre de la bibliothèque" />
      )}
      <Section>
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4"><p className="eyebrow">Vos enjeux</p><h2 className="mt-4 text-5xl">Ce que nous entendons souvent</h2></div>
          <ul className="grid gap-6 sm:grid-cols-2 md:col-span-8">{s.problems.map((p, k) => <li key={p} className="reveal border-t border-ink/15 pt-5"><span className="eyebrow text-flame">0{k + 1}</span><p className="mt-3 text-2xl font-[family-name:var(--font-display)]">{p}</p></li>)}</ul>
        </div>
      </Section>
      <section className="bg-ink py-24 text-wall md:py-32">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="eyebrow text-flame">Applications</p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">{s.applications.map((a) => <div key={a.title} className="reveal"><h3 className="text-4xl">{a.title}</h3><p className="mt-4 text-wall/70">{a.text}</p></div>)}</div>
          <p className="mt-14 text-sm text-wall/50">Concerné : {s.segments.join(' · ')}</p>
        </div>
      </section>
      <Section>
        <p className="eyebrow">Avant / après</p>
        <h2 className="mt-4 text-5xl">Projetez-vous.</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <BeforeAfter label={`Simulation — ${hero.title}`} badge="Simulation Studio" before={<img src={asset('/media/rooms/salon-blank.jpg')} alt="" className="block w-full" />} after={<WallPreview artId={hero.id} />} />
          {photos[1] ? <figure><img src={asset(gsrc(photos[1]))} alt={photos[1].alt} className="w-full" loading="lazy" /><figcaption className="mt-2 text-sm text-concrete">{photos[1].title}</figcaption></figure>
            : <div className="flex flex-col justify-center bg-stone/40 p-10"><p className="display text-3xl">Votre établissement, demain.</p><p className="mt-3 text-ink/70">Envoyez une photo de vos murs : nous vous renvoyons une simulation.</p><Link href="/studio/" className="btn btn-primary mt-6 self-start">Ouvrir le Studio</Link></div>}
        </div>
      </Section>
      {photos.length > 2 && <Section className="border-t border-ink/10"><p className="eyebrow">En situation</p><h2 className="mb-10 mt-4 text-5xl">Nos murs {s.short.toLowerCase()}</h2><Gallery items={photos} /></Section>}
      <Section className="border-t border-ink/10"><div className="flex items-end justify-between"><h2 className="text-5xl">Inspirations adaptées</h2><Link href={`/oeuvres/?cat=${s.categories[0]}`} className="btn btn-ghost">Tout voir</Link></div><ArtGrid list={insp} /></Section>
      <Section className="border-t border-ink/10">
        <div className="grid gap-12 md:grid-cols-2">
          <div><p className="eyebrow">Processus</p><h2 className="mt-4 text-5xl">Notre intervention</h2>
            <ol className="mt-8 space-y-4">{['Échange et simulation sur photo', 'Visite technique et relevé', 'Proposition graphique et devis détaillé', 'Planification selon vos contraintes d’exploitation', 'Impression et réception'].map((t, k) => <li key={t} className="flex gap-4"><span className="display text-flame">{k + 1}</span>{t}</li>)}</ol>
          </div>
          <div><p className="eyebrow">Contraintes spécifiques</p><h2 className="mt-4 text-5xl">Points étudiés</h2>
            <ul className="mt-8 space-y-4">{s.constraints.map((c) => <li key={c} className="border-l-2 border-flame pl-4 text-ink/80">{c}</li>)}</ul>
          </div>
        </div>
      </Section>
      <Section className="border-t border-ink/10">
        <h2 className="text-5xl">Questions fréquentes</h2>
        <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">{s.faq.map((q) => <details key={q.q} className="group py-6"><summary className="flex cursor-pointer list-none justify-between text-xl font-[family-name:var(--font-display)]">{q.q}<span className="transition group-open:rotate-45" aria-hidden>+</span></summary><p className="mt-4 max-w-3xl text-ink/70">{q.a}</p></details>)}</div>
      </Section>
      <section className="bg-flame py-24 text-white"><div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-6 px-5 md:px-10"><h2 className="max-w-3xl text-5xl md:text-7xl">Parlons de vos murs.</h2>
        <div className="flex flex-wrap gap-3"><Link href={`/contact/?segment=${s.segment}&sector=${encodeURIComponent(s.segments[0])}`} className="btn bg-ink text-white">Demander un devis</Link><Link href={`/contact/?segment=${s.segment}&multisite=1`} className="btn btn-ghost">Projet multisite / grande surface</Link></div></div></section>
    </>
  );
}
