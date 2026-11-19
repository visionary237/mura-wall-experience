import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/PageHero';
import { ArtGrid } from '@/components/ArtGrid';
import { BeforeAfter } from '@/components/BeforeAfter';
import { artworks } from '@/lib/artworks';
import { asset } from '@/config/site';
import { Gallery } from '@/components/Gallery';
import { forSector } from '@/data/gallery';
export const metadata: Metadata = { title: 'Particuliers' };
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Particuliers" title={<>Votre intérieur,<br />signé.</>} intro="Salon, chambre d’enfant, cuisine, salle de jeux : choisissez une œuvre ou votre propre photo, visualisez-la sur votre mur, puis recevez une estimation." image={asset('/media/rooms/salon-final.jpg')} badge="Concept généré par IA" cta={[{ href: '/studio/', label: 'Visualiser sur mon mur' }, { href: '/tarifs/', label: 'Estimer mon projet' }]} />
      <Section>
        <div className="grid gap-10 md:grid-cols-3">{[['Sans engagement', 'Le Studio est accessible sans compte. Vos photos restent sur votre appareil.'], ['Vos propres images', 'Photo de famille, voyage, dessin d’enfant : nous vérifions la résolution avant impression.'], ['Pièce par pièce', 'Chambre, salon, salle de jeux, cuisine, entrée, escalier.']].map(([t, d]) => <div key={t} className="reveal border-t border-ink/15 pt-6"><h2 className="text-3xl">{t}</h2><p className="mt-3 text-ink/70">{d}</p></div>)}</div>
      </Section>
      <Section className="!pt-0"><BeforeAfter label="Salon — fresque jungle" badge="Concept généré par IA" before={<img src={asset('/media/rooms/salon-blank.jpg')} alt="" className="block w-full" />} after={<img src={asset('/media/rooms/salon-final.jpg')} alt="Salon avec fresque" className="block w-full" />} /></Section>
      <Section className="border-t border-ink/10"><p className="eyebrow">En situation</p><h2 className="mb-10 mt-4 text-5xl">Des intérieurs signés MURA</h2><Gallery items={forSector('particuliers')} /></Section>
      <Section className="border-t border-ink/10"><h2 className="text-5xl">Idées pour la maison</h2><ArtGrid list={artworks.filter((a) => a.mood.some((m) => ['doux', 'apaisant', 'ludique', 'chaleureux'].includes(m))).slice(0, 6)} /></Section>
    </>
  );
}
