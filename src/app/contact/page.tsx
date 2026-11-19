import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHero, Section } from '@/components/PageHero';
import { QuoteForm } from '@/components/QuoteForm';
export const metadata: Metadata = { title: 'Contact et demande de devis' };
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Contact & devis" title={<>Racontez-nous<br />votre mur.</>} intro="Trois étapes, environ deux minutes. Si vous avez créé une simulation, elle est jointe automatiquement." />
      <Section className="!pt-0"><Suspense><QuoteForm /></Suspense></Section>
    </>
  );
}
