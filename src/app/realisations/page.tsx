import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section } from '@/components/PageHero';
import { Gallery } from '@/components/Gallery';
export const metadata: Metadata = { title: 'Nos réalisations' };
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Nos réalisations" title={<>Des murs qui<br />changent un lieu.</>} intro="Restaurants, hôtels, bureaux, écoles, piscines, intérieurs privés : une sélection de murs MURA, et la machine à l’œuvre." />
      <Section className="!pt-0">
        <Gallery filters />
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 pt-10">
          <p className="display max-w-xl text-4xl">Le prochain mur pourrait être le vôtre.</p>
          <div className="flex gap-3"><Link href="/studio/" className="btn btn-primary">Simuler mon mur</Link><Link href="/contact/" className="btn btn-ghost">Demander un devis</Link></div>
        </div>
      </Section>
    </>
  );
}
