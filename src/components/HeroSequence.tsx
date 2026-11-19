'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { asset } from '@/config/site';

const FRAMES = 36;
const frame = (i: number) => asset(`/media/hero-seq/f${String(i + 1).padStart(3, '0')}.webp`);

/**
 * Scène 1 — THE BLANK WALL.
 * Séquence d'images (issue de la vidéo fournie) pilotée par le scroll sur une section collante.
 * Reduced motion : image finale statique, aucun scrub.
 */
export function HeroSequence() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(rm);
    const c = canvas.current!, ctx = c.getContext('2d')!;
    let last = -1;
    const draw = (i: number) => {
      const im = imgs.current[i];
      if (!im?.complete || !im.naturalWidth) return false;
      const W = c.clientWidth * devicePixelRatio, H = c.clientHeight * devicePixelRatio;
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      // object-fit: cover, ancré à 50 % / 40 % pour garder le mur cadré sur mobile
      const k = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      const w = im.naturalWidth * k, h = im.naturalHeight * k;
      ctx.drawImage(im, (W - w) * 0.5, (H - h) * 0.4, w, h);
      last = i; return true;
    };
    // Chargement progressif : première et dernière frames d'abord.
    const order = [0, FRAMES - 1, ...Array.from({ length: FRAMES - 2 }, (_, i) => i + 1)];
    let target = rm ? FRAMES - 1 : 0;
    order.forEach((i) => {
      const im = new Image(); im.decoding = 'async';
      // dès qu'une frame arrive, on redessine si elle est plus proche de la cible que celle affichée
      im.onload = () => { if (i <= target && i > last) draw(i); };
      im.src = frame(i);
      imgs.current[i] = im;
    });
    if (rm) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const s = section.current!, r = s.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, -r.top / (s.offsetHeight - innerHeight)));
        setProgress(p);
        // la transformation se joue entre 12 % et 88 % du scroll de la section
        const t = Math.max(0, Math.min(1, (p - 0.12) / 0.76));
        const i = Math.round(t * (FRAMES - 1));
        target = i;
        if (i !== last) { let j = i; while (j >= 0 && !draw(j)) j--; }
      });
    };
    const onResize = () => { last = -1; onScroll(); };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onResize); cancelAnimationFrame(raf); };
  }, []);

  const p = reduced ? 1 : progress;
  const titleOut = Math.max(0, Math.min(1, (p - 0.08) / 0.2));
  const finalIn = Math.max(0, Math.min(1, (p - 0.82) / 0.12));

  return (
    <section ref={section} className={reduced ? 'relative' : 'relative h-[320vh]'} aria-label="Votre mur. Sans limites.">
      <div className={`${reduced ? 'relative' : 'sticky top-0'} h-[100svh] overflow-hidden bg-wall`}>
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-wall/30 via-transparent to-ink/20" aria-hidden />
        <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-[12vh] md:px-10" style={{ opacity: 1 - titleOut, transform: `translateY(${-titleOut * 40}px)` }}>
          <p className="eyebrow mb-6 text-ink/70">Impression murale verticale</p>
          <h1 className="display max-w-5xl text-[15vw] font-medium leading-[0.86] md:text-[9.5vw]">Votre mur.<br /><span className="text-flame">Sans limites.</span></h1>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/studio/" className="btn btn-primary">Visualiser mon projet <span aria-hidden>→</span></Link>
            <Link href="/inspirations/" className="btn btn-ghost bg-wall/60 backdrop-blur">Explorer les inspirations</Link>
          </div>
          {!reduced && <p className="eyebrow mt-12 text-ink/60" aria-hidden>Faites défiler pour transformer le mur ↓</p>}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-5 pb-10 md:px-10" style={{ opacity: finalIn }} aria-hidden={finalIn < 0.5}>
          <p className="display max-w-2xl text-4xl text-white drop-shadow-[0_2px_24px_rgba(0,0,0,.45)] md:text-6xl">Du mur blanc à l’œuvre, en une intervention.</p>
        </div>
        <span className="badge-ai absolute right-5 top-20 md:right-10">Concept généré par IA</span>
        {!reduced && <div className="absolute bottom-0 left-0 h-[3px] bg-flame" style={{ width: `${p * 100}%` }} aria-hidden />}
      </div>
    </section>
  );
}
