import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/PageHero';
import { asset } from '@/config/site';
import { Gallery } from '@/components/Gallery';
import { forSector } from '@/data/gallery';
export const metadata: Metadata = { title: 'Impression murale : notre technologie' };
const specs: [string, string, boolean][] = [['Constructeur', 'Baiketech', true], ['Modèle', 'Référence à préciser', false], ['Résolution d’impression', 'Selon le modèle', false], ['Hauteur maximale', 'Selon le modèle', false], ['Largeur', 'Sans limite : la machine se déplace le long du mur', true], ['Supports & encres', 'Selon le modèle', false]];
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Notre technologie" title={<>L’impression,<br />directement sur le mur.</>} intro="Une imprimante verticale se déplace le long du mur et dépose l’encre sur le support existant : pas de papier peint, pas de raccord, une œuvre continue." image={asset('/media/gallery/a209fced.webp')} cta={[{ href: '/comment-ca-marche/', label: 'Comment ça marche' }]} />
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div><h2 className="text-5xl">Ce qui change</h2>
            <ul className="mt-8 space-y-6">{[['Pas de pose', 'L’œuvre est imprimée sur le mur, sans lés ni joints.'], ['Sur mesure au centimètre', 'Le fichier est calé sur les dimensions réelles, obstacles compris.'], ['Petites et grandes surfaces', 'D’un pan de mur à plusieurs dizaines de mètres.'], ['Peu de nuisances', 'Une machine, un opérateur, une intervention courte.']].map(([t, d]) => <li key={t}><h3 className="text-2xl">{t}</h3><p className="text-ink/70">{d}</p></li>)}</ul>
          </div>
          <figure><img src={asset('/media/gallery/3584d42f.webp')} alt="Imprimante murale verticale Baiketech utilisée par MURA" className="w-full" /><figcaption className="mt-2 text-sm text-concrete">Notre imprimante verticale Baiketech.</figcaption></figure>
        </div>
      </Section>
      <section className="bg-ink py-24 text-wall"><div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <h2 className="text-5xl">Fiche technique</h2>
        <dl className="mt-10 grid gap-px bg-wall/10 sm:grid-cols-2 lg:grid-cols-3">{specs.map(([k, v, known]) => <div key={k} className="bg-ink p-6"><dt className="label !text-wall/50">{k}</dt><dd className={`display mt-2 text-2xl ${known ? 'text-wall' : 'text-wall/40'}`}>{v}</dd></div>)}</dl>
        <p className="mt-6 text-sm text-wall/50">Les caractéristiques Baiketech varient selon le modèle : elles seront complétées à partir de la référence exacte de la machine.</p>
      </div></section>
      <Section>
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="relative"><video className="w-full" src={asset('/media/printer-concept.mp4')} poster={asset('/media/printer-concept-poster.jpg')} autoPlay muted loop playsInline aria-label="Animation : impression d'une fresque florale par bandes verticales" /><span className="badge-ai absolute left-3 top-3">Animation</span></div>
          <div><h2 className="text-5xl">Bande après bande.</h2><p className="mt-4 text-ink/70">La tête d’impression parcourt le mur de haut en bas, puis la machine se décale sur son rail pour la bande suivante. Les raccords sont calés au millimètre.</p></div>
        </div>
      </Section>
      <Section className="border-t border-ink/10"><h2 className="text-5xl">La machine à l’œuvre</h2><div className="mt-10"><Gallery items={forSector('technologie')} columns="columns-1 sm:columns-2 lg:columns-4" /></div></Section>
    </>
  );
}
