import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/PageHero';
export const metadata: Metadata = { title: 'FAQ' };
const faq: [string, [string, string][]][] = [
  ['Le projet', [['Sur quels murs peut-on imprimer ?', 'La plupart des murs intérieurs lisses ou légèrement texturés. La liste exacte des supports dépend de la machine et sera confirmée lors de la visite technique.'], ['Peut-on imprimer ma propre photo ?', 'Oui, si vous en détenez les droits. Le Studio indique si la résolution semble suffisante pour la surface choisie.'], ['La simulation est-elle fidèle ?', 'Elle est indicative : couleurs d’écran, éclairage et texture du mur peuvent différer du rendu final.']]],
  ['Droits et images', [['Toutes les images de la bibliothèque sont-elles imprimables ?', 'Non. Seules les œuvres aux droits validés peuvent être retenues pour impression ; les autres sont signalées.'], ['Une image trouvée sur internet est-elle utilisable ?', 'Pas par défaut : chaque image doit avoir une licence autorisant la reproduction commerciale.']]],
  ['Confidentialité', [['Que devient la photo de mon mur ?', 'Dans le Studio, elle reste dans votre navigateur. Elle n’est transmise que si vous envoyez une demande de devis et cochez l’option correspondante.'], ['Utilisez-vous mes photos pour l’IA ou le marketing ?', 'Non, jamais sans votre autorisation explicite.']]],
  ['Devis', [['Le prix affiché est-il définitif ?', 'Non : l’estimation est indicative. Le devis définitif suit la visite technique.'], ['Intervenez-vous partout ?', 'La zone d’intervention est indiquée sur la page À propos (à confirmer).']]],
];
export default function Page() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Questions fréquentes" />
      <Section className="!pt-0">
        {faq.map(([cat, qs]) => (
          <div key={cat} className="grid gap-6 border-t border-ink/15 py-10 md:grid-cols-12">
            <h2 className="text-3xl md:col-span-3">{cat}</h2>
            <div className="divide-y divide-ink/10 md:col-span-9">{qs.map(([q, a]) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none justify-between gap-6 text-xl font-[family-name:var(--font-display)]">{q}<span className="transition group-open:rotate-45" aria-hidden>+</span></summary><p className="mt-3 max-w-3xl text-ink/70">{a}</p></details>)}</div>
          </div>
        ))}
      </Section>
    </>
  );
}
