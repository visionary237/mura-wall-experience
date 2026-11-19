import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/PageHero';
import { Estimator } from '@/components/Estimator';
export const metadata: Metadata = { title: 'Tarifs et estimation' };
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Tarifs et estimation" title={<>Combien coûte<br />votre mur&nbsp;?</>} intro="Le prix dépend surtout de la surface, de l’état du support et du besoin graphique. Obtenez une première fourchette en quelques secondes." />
      <Section className="!pt-0"><Estimator /></Section>
    </>
  );
}
