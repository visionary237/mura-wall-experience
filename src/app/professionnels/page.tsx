import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section } from '@/components/PageHero';
import { sectors } from '@/data/sectors';
import { getArtwork } from '@/lib/artworks';
import { asset } from '@/config/site';
import { forSector, gsrc } from '@/data/gallery';
export const metadata: Metadata = { title: 'Professionnels et collectivités' };
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Professionnels · Collectivités · Établissements publics" title={<>Des espaces qui<br />marquent les esprits.</>} intro="Hôtels, écoles, piscines, hôpitaux, EHPAD, bureaux, musées : un interlocuteur unique, de la simulation à la réception, y compris pour les projets multisites." cta={[{ href: '/contact/?segment=professionnel', label: 'Demander un devis' }, { href: '/contact/?segment=collectivite&multisite=1', label: 'Projet multisite' }]} />
      <Section className="!pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((s) => { const a = getArtwork(s.heroArt)!; const ph = forSector(s.slug)[0]; return (
            <Link key={s.slug} href={`/secteurs/${s.slug}/`} className="reveal group relative block aspect-[3/4] overflow-hidden text-white">
              <img src={asset(ph ? gsrc(ph) : a.thumb)} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-[1.2s] group-hover:scale-110" loading="lazy" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
              <span className="absolute bottom-5 left-5 right-5"><span className="display block text-3xl">{s.short}</span><span className="mt-2 block text-sm text-white/70">{s.segments.slice(0, 3).join(' · ')}</span></span>
            </Link>); })}
        </div>
      </Section>
      <section className="bg-ink py-24 text-wall"><div className="mx-auto grid max-w-[1600px] gap-10 px-5 md:grid-cols-3 md:px-10">
        {[['Commande publique', 'Devis détaillé, mémoire technique et calendrier adaptés à vos procédures.'], ['Multisite', 'Un dossier par site, un chiffrage global, un déploiement homogène.'], ['Continuité d’activité', 'Interventions hors horaires, par zones, ou pendant les fermetures.']].map(([t, d]) => <div key={t}><h2 className="text-4xl">{t}</h2><p className="mt-3 text-wall/70">{d}</p></div>)}
      </div></section>
    </>
  );
}
