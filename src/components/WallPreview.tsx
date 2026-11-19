'use client';
import { useEffect, useRef, useState } from 'react';
import { rooms } from '@/data/rooms';
import { getArtwork } from '@/lib/artworks';
import { asset } from '@/config/site';
import { computeShading, defaultPlacement, loadImage, prepareArt, render, type Placement } from '@/lib/warp';

const cache = new Map<string, Promise<HTMLImageElement>>();
const load = (src: string) => { if (!cache.has(src)) cache.set(src, loadImage(asset(src))); return cache.get(src)!; };

/** Rend une œuvre de la bibliothèque sur le salon de démonstration, avec le moteur du Studio. */
export function WallPreview({ artId, placement, className = '', label }: { artId: string | null; placement?: Partial<Placement>; className?: string; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const room = rooms[0];
  const pkey = JSON.stringify(placement ?? {});
  useEffect(() => {
    let alive = true;
    (async () => {
      const photo = await load(room.src!);
      const occ = await load(room.occlusion!);
      const art = artId ? getArtwork(artId) : null;
      const artImg = art ? await load(art.src) : null;
      if (!alive || !ref.current) return;
      const c = ref.current; c.width = room.width!; c.height = room.height!;
      const p = { ...defaultPlacement, ...(placement ?? {}) };
      const shading = computeShading(photo, c.width, c.height, room.wall!);
      render(c.getContext('2d')!, {
        photo, photoW: c.width, photoH: c.height, art: artImg, artW: art?.width ?? 1, artH: art?.height ?? 1,
        wall: room.wall!, wallAspect: room.wallWidthM! / room.wallHeightM!, obstacles: [], occlusion: occ, placement: p, shading,
      }, artImg ? prepareArt(artImg, art!.width, art!.height, p, 1400) : null, 16);
      setReady(true);
    })().catch(() => setReady(true));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artId, pkey]);
  return (
    <canvas ref={ref} role="img" aria-label={label ?? 'Simulation de mur imprimé'} className={`block h-auto w-full bg-stone transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'} ${className}`} />
  );
}
