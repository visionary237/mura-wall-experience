'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WallPreview } from '@/components/WallPreview';
import { getArtwork } from '@/lib/artworks';

const SEQ = ['botanique-nuit', 'seigaiha-indigo', 'strates-aube', 'flux-solaire', 'foret-brume'];

/** Scène 2 — FROM NOTHING TO ART : un même salon, plusieurs vies, rendues par le moteur du Studio. */
export function Transformation() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: root.current, start: 'top top', end: `+=${SEQ.length * 70}%`, pin: '.pin-t', scrub: true,
      onUpdate: (s) => setI(Math.min(SEQ.length - 1, Math.floor(s.progress * SEQ.length))),
    });
    return () => st.kill();
  }, []);
  const art = getArtwork(SEQ[i])!;
  return (
    <section ref={root} className="bg-ink text-wall" aria-label="Un mur, mille possibilités">
      <div className="pin-t flex min-h-[100svh] flex-col justify-center py-16">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-10 px-5 md:grid-cols-12 md:px-10">
          <div className="md:col-span-4">
            <p className="eyebrow text-flame">02 — From nothing to art</p>
            <h2 className="mt-5 text-5xl md:text-7xl">Un mur.<br />Mille vies.</h2>
            <p className="mt-6 max-w-sm text-wall/70">Même pièce, même lumière. Seule l’œuvre change : chaque rendu est calculé en direct par le moteur de simulation du Studio.</p>
            <ol className="mt-10 space-y-2" aria-label="Œuvres présentées">
              {SEQ.map((s, k) => (
                <li key={s}>
                  <button onClick={() => setI(k)} className={`display text-left text-2xl transition-colors ${k === i ? 'text-wall' : 'text-wall/25 hover:text-wall/60'}`}>{getArtwork(s)!.title}</button>
                </li>
              ))}
            </ol>
          </div>
          <div className="md:col-span-8">
            <div className="relative overflow-hidden">
              <WallPreview artId={art.id} label={`Simulation : ${art.title} dans un salon`} />
              <span className="badge-ai absolute left-3 top-3">Simulation indicative</span>
            </div>
            <p className="mt-3 text-sm text-wall/50">{art.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
