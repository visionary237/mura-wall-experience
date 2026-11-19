'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { asset } from '@/config/site';

/** Scène 3 — THE TECHNOLOGY. Révélations cinématographiques (clip-path) au scroll. */
export function Technology() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo('.tech-media', { clipPath: 'inset(18% 30% 18% 30% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.tech-media', start: 'top 85%', end: 'top 15%', scrub: true } });
      gsap.utils.toArray<HTMLElement>('.tech-step').forEach((el, k) => gsap.from(el, { y: 50, opacity: 0, duration: 1, delay: k * 0.08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} className="bg-wall py-28 md:py-40" aria-labelledby="tech-title">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          <p className="eyebrow md:col-span-3">03 — The technology</p>
          <h2 id="tech-title" className="text-5xl md:col-span-9 md:text-[6.5vw]">Une imprimante qui travaille <span className="text-flame">directement sur le mur</span>.</h2>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-12">
          <div className="tech-media relative overflow-hidden bg-stone md:col-span-8">
            <video className="aspect-video h-full w-full object-cover" src={asset('/media/printer-concept.mp4')} poster={asset('/media/printer-concept-poster.jpg')} autoPlay muted loop playsInline preload="none" aria-label="Animation : imprimante murale sur rail imprimant une fresque florale" />
            <span className="badge-ai absolute left-4 top-4">Animation</span>
          </div>
          <figure className="md:col-span-4">
            <img src={asset('/media/gallery/3584d42f.webp')} alt="Imprimante murale verticale Baiketech utilisée par MURA" loading="lazy" className="aspect-[4/5] w-full object-cover" />
            <figcaption className="mt-2 text-sm text-concrete">Notre machine : imprimante verticale Baiketech.</figcaption>
          </figure>
        </div>
        <div className="mt-16 grid gap-10 md:grid-cols-4">
          {[
            ['01', 'Relevé', 'Le mur est mesuré et la machine positionnée sur son rail, à quelques centimètres de la surface.'],
            ['02', 'Calibrage', 'Le fichier est découpé en bandes verticales calées au millimètre sur les repères du mur.'],
            ['03', 'Impression', 'La tête parcourt le mur verticalement et dépose l’encre directement sur le support.'],
            ['04', 'Finition', 'Contrôle visuel, retouches éventuelles et protection selon l’usage du lieu.'],
          ].map(([n, t, d]) => (
            <div key={n} className="tech-step border-t border-ink/15 pt-6">
              <p className="eyebrow text-flame">{n}</p>
              <h3 className="mt-3 text-3xl">{t}</h3>
              <p className="mt-3 text-ink/70">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
