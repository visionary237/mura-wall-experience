import Link from 'next/link';
import { HeroSequence } from '@/components/HeroSequence';
import { Transformation } from '@/components/home/Transformation';
import { Technology } from '@/components/home/Technology';
import { MakeItYours } from '@/components/home/MakeItYours';
import { BeforeAfter } from '@/components/BeforeAfter';
import { WallPreview } from '@/components/WallPreview';
import { artworks } from '@/lib/artworks';
import { sectors } from '@/data/sectors';
import { asset } from '@/config/site';
import { forSector, gsrc, gallery } from '@/data/gallery';

const grid = ['flux-solaire', 'arches-sable', 'seigaiha-indigo', 'foret-brume', 'bauhaus-primaire', 'botanique-nuit', 'houle'].map((s) => artworks.find((a) => a.slug === s)!);
const spans = ['md:col-span-7 md:row-span-2', 'md:col-span-5 md:row-span-3', 'md:col-span-4', 'md:col-span-3', 'md:col-span-5 md:row-span-2', 'md:col-span-4 md:row-span-2', 'md:col-span-3'];

export default function Home() {
  return (
    <>
      <HeroSequence />
      <Transformation />
      <Technology />

      {/* SCÈNE 4 — FIND YOUR INSPIRATION */}
      <section className="py-28 md:py-40" aria-labelledby="insp">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">04 — Find your inspiration</p>
              <h2 id="insp" className="mt-5 text-5xl md:text-8xl">La galerie<br />est ouverte.</h2>
            </div>
            <Link href="/oeuvres/" className="btn btn-ghost">Explorer {artworks.length} œuvres →</Link>
          </div>
          <div className="mt-16 grid auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[120px] md:grid-cols-12 md:gap-5">
            {grid.map((a, k) => (
              <Link key={a.id} href={`/oeuvres/?open=${a.id}`} className={`reveal group relative overflow-hidden bg-stone ${spans[k]} ${k === 1 ? 'row-span-2' : ''}`} style={{ transitionDelay: `${k * 60}ms` }}>
                <img src={asset(a.thumb)} alt={a.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-gallery)] group-hover:scale-105" />
                <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent p-4 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">{a.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MakeItYours />

      {/* SCÈNE 6 — EVERY SPACE TELLS A STORY */}
      <section className="bg-ink py-28 text-wall md:py-40" aria-labelledby="spaces">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="eyebrow text-flame">06 — Every space tells a story</p>
          <h2 id="spaces" className="mt-5 max-w-4xl text-5xl md:text-7xl">Chaque lieu a son histoire. Le mur la raconte.</h2>
          <ul className="mt-16 divide-y divide-wall/10 border-y border-wall/10">
            {[{ slug: 'particuliers', href: '/particuliers/', title: 'Particuliers', headline: 'Salon, chambre, salle de jeux : votre intérieur, signé.' }, ...sectors.map((s) => ({ ...s, href: `/secteurs/${s.slug}/` }))].map((s, k) => {
              const ph = forSector(s.slug)[0];
              return (
                <li key={s.href}>
                  <Link href={s.href} className="group grid items-center gap-2 py-6 md:grid-cols-12">
                    <span className="eyebrow text-wall/40 md:col-span-1">{String(k + 1).padStart(2, '0')}</span>
                    <span className="display text-4xl transition-all duration-500 group-hover:translate-x-3 group-hover:text-flame md:col-span-5 md:text-6xl">{s.title}</span>
                    <span className="text-wall/60 md:col-span-4">{s.headline}</span>
                    <span className="hidden justify-end md:col-span-2 md:flex" aria-hidden>
                      {ph ? <img src={asset(gsrc(ph))} alt="" loading="lazy" className="h-20 w-32 object-cover opacity-50 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0" /> : <span className="text-2xl transition group-hover:text-flame">→</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* SCÈNE 7 — BEFORE / AFTER */}
      <section className="py-28 md:py-40" aria-labelledby="ba">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="eyebrow">07 — Before / After</p>
          <h2 id="ba" className="mt-5 text-5xl md:text-7xl">Glissez. Comparez.</h2>
          <div className="mt-16 grid gap-12 md:grid-cols-2">
            <div className="md:col-span-2">
              <BeforeAfter label="Salon — fresque jungle" badge="Concept généré par IA"
                before={<img src={asset('/media/rooms/salon-blank.jpg')} alt="" className="block w-full" />}
                after={<img src={asset('/media/rooms/salon-final.jpg')} alt="Salon avec fresque jungle" className="block w-full" />} />
            </div>
            <BeforeAfter label="Salon — Seigaiha or & noir" badge="Simulation Studio" initial={40}
              before={<img src={asset('/media/rooms/salon-blank.jpg')} alt="" className="block w-full" />}
              after={<WallPreview artId="art-004" />} />
            <BeforeAfter label="Salon — Strates nocturne" badge="Simulation Studio" initial={60}
              before={<img src={asset('/media/rooms/salon-blank.jpg')} alt="" className="block w-full" />}
              after={<WallPreview artId="art-002" />} />
          </div>
          <div className="mt-20 flex items-end justify-between gap-6"><h3 className="text-4xl md:text-5xl">Nos murs, en situation</h3><Link href="/realisations/" className="btn btn-ghost shrink-0">Toutes les réalisations →</Link></div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {['9666b5d4', '933b3acc', 'c5e2c7e8', '19482859'].map((id) => { const g = gallery.find((x) => x.id === id)!; return (
              <Link key={id} href="/realisations/" className="reveal group block overflow-hidden"><img src={asset(gsrc(g))} alt={g.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-[1.2s] group-hover:scale-105" /></Link>); })}
          </div>
        </div>
      </section>

      {/* SCÈNE 8 — OUR CRAFT */}
      <section className="bg-stone/40 py-28 md:py-40" aria-labelledby="craft">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 md:grid-cols-12 md:px-10">
          <div className="md:col-span-5">
            <p className="eyebrow">08 — Our craft</p>
            <h2 id="craft" className="mt-5 text-5xl md:text-7xl">Un accompagnement, de l’idée au dernier passage.</h2>
          </div>
          <ol className="md:col-span-7 md:col-start-6">
            {[
              ['Inspiration', 'Vous explorez la bibliothèque ou nous confiez votre idée.'],
              ['Simulation', 'Vous visualisez l’œuvre sur la photo de votre mur.'],
              ['Visite technique', 'Nous vérifions le support, les accès et les dimensions.'],
              ['Préparation graphique', 'Recadrage, adaptation et contrôle de la résolution du fichier.'],
              ['Impression', 'La machine imprime directement sur le mur.'],
              ['Livraison', 'Contrôle final, conseils d’entretien, photos avant/après.'],
            ].map(([t, d], k) => (
              <li key={t} className="reveal grid grid-cols-[4rem_1fr] gap-4 border-t border-ink/15 py-7">
                <span className="display text-3xl text-flame">{k + 1}</span>
                <div><h3 className="text-3xl">{t}</h3><p className="mt-2 text-ink/70">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SCÈNE 9 — START YOUR PROJECT */}
      <section className="relative overflow-hidden bg-flame py-32 text-white md:py-48" aria-labelledby="start">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="eyebrow">09 — Start your project</p>
          <h2 id="start" className="mt-6 max-w-5xl text-6xl md:text-[9vw]">Et votre mur, il raconte quoi&nbsp;?</h2>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/studio/" className="btn bg-ink text-white">Créer ma simulation →</Link>
            <Link href="/contact/" className="btn btn-ghost">Demander un devis</Link>
            <Link href="/tarifs/" className="btn btn-ghost">Estimer mon projet</Link>
          </div>
        </div>
      </section>
    </>
  );
}
