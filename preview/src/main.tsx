import { createRoot } from 'react-dom/client';
import { useEffect, useSyncExternalStore } from 'react';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/manrope';
import '@fontsource-variable/inter';
import './app.css';
import { parse } from '../shims/next-navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ConsentBanner } from '@/components/ConsentBanner';
import { RevealObserver } from '@/components/Reveal';
import Home from '@/app/page';
import Inspirations from '@/app/inspirations/page';
import Oeuvres from '@/app/oeuvres/page';
import Studio from '@/app/studio/page';
import Techno from '@/app/technologie/page';
import Comment from '@/app/comment-ca-marche/page';
import Realisations from '@/app/realisations/page';
import Particuliers from '@/app/particuliers/page';
import Pros from '@/app/professionnels/page';
import Tarifs from '@/app/tarifs/page';
import Faq from '@/app/faq/page';
import Apropos from '@/app/a-propos/page';
import Contact from '@/app/contact/page';
import Confid from '@/app/confidentialite/page';
import Admin from '@/app/admin/page';
import NotFound from '@/app/not-found';
import { SectorPage } from '@/components/SectorPage';
import { getSector } from '@/data/sectors';

const routes: Record<string, () => JSX.Element> = {
  '/': Home, '/inspirations/': Inspirations, '/oeuvres/': Oeuvres, '/studio/': Studio, '/technologie/': Techno,
  '/comment-ca-marche/': Comment, '/realisations/': Realisations, '/particuliers/': Particuliers, '/professionnels/': Pros,
  '/tarifs/': Tarifs, '/faq/': Faq, '/a-propos/': Apropos, '/contact/': Contact, '/confidentialite/': Confid, '/admin/': Admin,
};
const sub = (cb: () => void) => { addEventListener('hashchange', cb); return () => removeEventListener('hashchange', cb); };

function App() {
  const hash = useSyncExternalStore(sub, () => location.hash || '#/');
  const { path } = parse(hash);
  useEffect(() => { window.scrollTo(0, 0); }, [path]);
  let page: JSX.Element;
  const m = path.match(/^\/secteurs\/([^/]+)\/$/);
  if (m && getSector(m[1])) page = <SectorPage s={getSector(m[1])!} />;
  else { const C = routes[path] ?? NotFound; page = <C />; }
  return (
    <>
      <a href="#contenu" onClick={(e) => { e.preventDefault(); document.getElementById('contenu')?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] btn btn-primary">Aller au contenu</a>
      <Header />
      <main id="contenu" tabIndex={-1} key={path}>{page}</main>
      <Footer />
      <ConsentBanner />
      <RevealObserver />
    </>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
