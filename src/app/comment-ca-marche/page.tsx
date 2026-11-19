import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, Section } from '@/components/PageHero';
export const metadata: Metadata = { title: 'Comment ça marche' };
const steps = [
  ['Choisissez', 'Une œuvre de la bibliothèque, votre propre image ou une création sur mesure.', '/oeuvres/'],
  ['Visualisez', 'Importez la photo de votre mur dans le Studio et ajustez l’œuvre.', '/studio/'],
  ['Estimez', 'Décrivez votre projet pour obtenir une première fourchette.', '/tarifs/'],
  ['Validez', 'Visite technique, contrôle du fichier, devis définitif.', '/contact/'],
  ['Admirez', 'Impression sur place, contrôle final, photos avant/après.', '/realisations/'],
];
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Comment ça marche" title={<>Cinq étapes,<br />aucune compétence technique.</>} />
      <Section className="!pt-0">
        <ol>{steps.map(([t, d, h], k) => (
          <li key={t} className="reveal grid items-baseline gap-4 border-t border-ink/15 py-10 md:grid-cols-12">
            <span className="display text-7xl text-flame md:col-span-2">{k + 1}</span>
            <h2 className="text-5xl md:col-span-4">{t}</h2>
            <p className="text-lg text-ink/70 md:col-span-4">{d}</p>
            <Link href={h} className="text-right underline underline-offset-4 md:col-span-2">Accéder →</Link>
          </li>))}
        </ol>
      </Section>
    </>
  );
}
