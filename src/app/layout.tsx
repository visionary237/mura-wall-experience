import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/manrope';
import '@fontsource-variable/inter';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ConsentBanner } from '@/components/ConsentBanner';
import { RevealObserver } from '@/components/Reveal';
import { brand } from '@/config/site';

export const metadata: Metadata = {
  title: { default: `${brand.name} — ${brand.baseline}`, template: `%s — ${brand.name}` },
  description: "Impression murale verticale : inspirez-vous, visualisez votre mur et demandez un devis qualifié en quelques minutes.",
};
export const viewport: Viewport = { themeColor: '#151515' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] btn btn-primary">Aller au contenu</a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
        <ConsentBanner />
        <RevealObserver />
      </body>
    </html>
  );
}
