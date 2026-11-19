import Link from 'next/link';
import { brand } from '@/config/site';
import { sectors } from '@/data/sectors';

export function Footer() {
  return (
    <footer className="bg-ink text-wall">
      <div className="mx-auto max-w-[1600px] px-5 pt-24 pb-10 md:px-10">
        <p className="display max-w-4xl text-5xl md:text-8xl">Un mur blanc est une <span className="text-flame">promesse</span>.</p>
        <div className="mt-20 grid gap-10 text-sm md:grid-cols-4">
          <div>
            <p className="eyebrow text-concrete">Découvrir</p>
            <ul className="mt-4 space-y-2">
              {[['/inspirations/', 'Inspirations'], ['/oeuvres/', "Bibliothèque d'œuvres"], ['/studio/', 'Wall Creative Studio'], ['/technologie/', 'Notre technologie'], ['/comment-ca-marche/', 'Comment ça marche'], ['/realisations/', 'Réalisations']].map(([h, l]) => <li key={h}><Link className="hover:text-flame" href={h}>{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-concrete">Secteurs</p>
            <ul className="mt-4 space-y-2">
              <li><Link className="hover:text-flame" href="/particuliers/">Particuliers</Link></li>
              <li><Link className="hover:text-flame" href="/professionnels/">Professionnels</Link></li>
              {sectors.map((s) => <li key={s.slug}><Link className="hover:text-flame" href={`/secteurs/${s.slug}/`}>{s.short}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-concrete">Entreprise</p>
            <ul className="mt-4 space-y-2">
              {[['/tarifs/', 'Tarifs et estimation'], ['/faq/', 'FAQ'], ['/a-propos/', 'À propos'], ['/contact/', 'Contact & devis'], ['/confidentialite/', 'Confidentialité']].map(([h, l]) => <li key={h}><Link className="hover:text-flame" href={h}>{l}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-concrete">{brand.name}</p>
            <p className="mt-4 text-wall/70">{brand.tagline} — {brand.city}</p>
            <p className="mt-2 text-wall/70">{brand.email}</p>
          </div>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-3 border-t border-wall/10 pt-6 text-xs text-wall/50 md:flex-row">
          <p>Les visuels marqués « Concept IA » sont des simulations, pas des réalisations. Prototype — contenus et tarifs à valider.</p>
          <p>Expérience conçue par <a className="text-wall hover:text-flame" href={brand.agency.url}>DOERZ</a></p>
        </div>
      </div>
    </footer>
  );
}
