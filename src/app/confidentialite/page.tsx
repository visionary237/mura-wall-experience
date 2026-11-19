import type { Metadata } from 'next';
import { PageHero, Section } from '@/components/PageHero';
export const metadata: Metadata = { title: 'Confidentialité' };
export default function Page() {
  return (
    <>
      <PageHero eyebrow="Confidentialité" title="Vos images restent les vôtres." intro="Document de travail — la politique définitive doit être validée juridiquement par l’entreprise." />
      <Section className="!pt-0 max-w-3xl space-y-6 text-ink/80">
        <p><b>Studio :</b> les photos importées sont traitées localement dans votre navigateur. Elles sont ré-encodées, ce qui supprime les métadonnées (position GPS, appareil).</p>
        <p><b>Projets :</b> conservés dans le stockage local de votre navigateur, supprimables à tout moment depuis le Studio.</p>
        <p><b>Demande de devis :</b> les données sont utilisées uniquement pour traiter votre demande. En production, les fichiers sont stockés dans un espace privé accessible par URL signée, avec une durée de conservation définie.</p>
        <p><b>IA :</b> aucun service d’IA externe n’est utilisé à ce stade. Si un rendu IA est ajouté, il sera optionnel et signalé avant tout envoi.</p>
        <p><b>Mesure d’audience :</b> uniquement après votre consentement.</p>
        <p><b>Réutilisation :</b> vos photos ne sont jamais utilisées pour du marketing ou l’entraînement de modèles sans votre autorisation écrite.</p>
      </Section>
    </>
  );
}
