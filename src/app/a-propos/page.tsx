import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/PageHero';
import { brand } from '@/config/site';
export const metadata: Metadata = { title: 'À propos' };
export default function Page() {
  return (
    <>
      <PageHero eyebrow="À propos" title={<>Faire entrer l’art<br />dans tous les lieux.</>} intro={`${brand.name} associe une technologie d’impression murale verticale à un accompagnement artistique, pour les particuliers, les entreprises et les établissements publics.`} />
      <Section className="!pt-0">
        <div className="grid gap-10 md:grid-cols-3">{[['Notre histoire', 'Contenu à fournir par l’entreprise : fondateurs, date de création, motivations.'], ['Notre zone', `${brand.city} — à confirmer.`], ['Nos engagements', 'Transparence sur les droits des images, simulations clairement identifiées, pas d’usage de vos photos sans accord.']].map(([t, d]) => <div key={t} className="border-t border-ink/15 pt-6"><h2 className="text-3xl">{t}</h2><p className="mt-3 text-ink/70">{d}</p></div>)}</div>
      </Section>
    </>
  );
}
