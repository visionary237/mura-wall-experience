'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { artworks, getArtwork, isPrintable, filterArtworks } from '@/lib/artworks';
import { rooms } from '@/data/rooms';
import { asset, qualityConfig } from '@/config/site';
import { computeShading, defaultPlacement, loadImage, prepareArt, readUpload, render, type Placement } from '@/lib/warp';
import { isConvexQuad, printableSurface, type Pt } from '@/lib/homography';
import { evaluateQuality } from '@/lib/quality';
import { favorites, projects, type StudioProject } from '@/lib/store';
import { newId } from '@/lib/lead';
import { track } from '@/lib/analytics';

type ArtSel = { kind: 'library'; id: string } | { kind: 'upload'; dataUrl: string; width: number; height: number; originalWidth: number; originalHeight: number } | null;
type RoomSel = { kind: 'demo'; id: string } | { kind: 'upload'; dataUrl: string; width: number; height: number };

const STEPS = ['Image', 'Lieu', 'Surface', 'Réglages', 'Aperçu', 'Projet'];
type Img = HTMLImageElement;

function defaultWall(w: number, h: number): Pt[] {
  return [{ x: w * 0.18, y: h * 0.14 }, { x: w * 0.82, y: h * 0.14 }, { x: w * 0.82, y: h * 0.7 }, { x: w * 0.18, y: h * 0.7 }];
}

export function Studio({ initialArt, initialProject }: { initialArt?: string | null; initialProject?: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [art, setArt] = useState<ArtSel>(initialArt && getArtwork(initialArt) ? { kind: 'library', id: getArtwork(initialArt)!.id } : null);
  const [room, setRoom] = useState<RoomSel>({ kind: 'demo', id: 'salon' });
  const demo = rooms[0];
  const [wall, setWall] = useState<Pt[]>(demo.wall!);
  const [obstacles, setObstacles] = useState<Pt[][]>([]);
  const [drawing, setDrawing] = useState<Pt[] | null>(null);
  const [dims, setDims] = useState({ w: demo.wallWidthM!, h: demo.wallHeightM!, dist: 2 });
  const [pl, setPl] = useState<Placement>(defaultPlacement);
  const [compare, setCompare] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>(() => newId('proj'));
  const [name, setName] = useState('Mon projet');
  const [saved, setSaved] = useState<StudioProject[]>([]);
  const [libQ, setLibQ] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const canvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<SVGSVGElement>(null);
  const imgs = useRef<{ photo?: Img; occ?: Img | null; art?: Img; shading?: HTMLCanvasElement; prepared?: HTMLCanvasElement; preparedKey?: string }>({});
  const [photoSize, setPhotoSize] = useState({ w: demo.width!, h: demo.height! });
  const [loaded, setLoaded] = useState(0);
  const started = useRef(false);

  useEffect(() => { setSaved(projects.list()); const s = () => setSaved(projects.list()); addEventListener('mura:store', s); return () => removeEventListener('mura:store', s); }, []);

  // Chargement d'un projet existant
  useEffect(() => {
    if (!initialProject) return;
    const p = projects.get(initialProject);
    if (p) loadProject(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProject]);

  // Photo d'environnement
  const roomKey = room.kind === 'demo' ? room.id : room.dataUrl.slice(-64);
  useEffect(() => {
    let alive = true;
    (async () => {
      const src = room.kind === 'demo' ? asset(rooms.find((r) => r.id === room.id)!.src!) : room.dataUrl;
      const photo = await loadImage(src);
      const r = room.kind === 'demo' ? rooms.find((x) => x.id === room.id)! : null;
      const occ = r?.occlusion ? await loadImage(asset(r.occlusion)) : null;
      if (!alive) return;
      imgs.current.photo = photo; imgs.current.occ = occ; imgs.current.shading = undefined;
      setPhotoSize({ w: photo.naturalWidth, h: photo.naturalHeight });
      setLoaded((n) => n + 1);
    })().catch((e) => setError(e.message));
    return () => { alive = false; };
  }, [roomKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Image de l'œuvre
  const artMeta = useMemo(() => {
    if (!art) return null;
    if (art.kind === 'library') { const a = getArtwork(art.id)!; return { src: asset(a.src), w: a.width, h: a.height, ow: a.width, oh: a.height, title: a.title, lib: a }; }
    return { src: art.dataUrl, w: art.width, h: art.height, ow: art.originalWidth, oh: art.originalHeight, title: 'Image importée', lib: null };
  }, [art]);
  useEffect(() => {
    if (!artMeta) { imgs.current.art = undefined; imgs.current.prepared = undefined; setLoaded((n) => n + 1); return; }
    let alive = true;
    loadImage(artMeta.src).then((im) => { if (alive) { imgs.current.art = im; imgs.current.prepared = undefined; setLoaded((n) => n + 1); } }).catch((e) => setError(e.message));
    return () => { alive = false; };
  }, [artMeta]);

  const wallValid = useMemo(() => isConvexQuad(wall), [wall]);
  const wallKey = JSON.stringify(wall);
  useEffect(() => { imgs.current.shading = undefined; }, [wallKey, roomKey]);

  // Rendu
  const raf = useRef(0);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const c = canvas.current, I = imgs.current;
      if (!c || !I.photo) return;
      c.width = photoSize.w; c.height = photoSize.h;
      const ctx = c.getContext('2d')!;
      if (!wallValid) { ctx.drawImage(I.photo, 0, 0, c.width, c.height); return; }
      if (!I.shading) I.shading = computeShading(I.photo, c.width, c.height, wall);
      const key = `${artMeta?.src.slice(-40)}|${pl.brightness}|${pl.contrast}`;
      if (I.art && artMeta && (!I.prepared || I.preparedKey !== key)) { I.prepared = prepareArt(I.art, artMeta.w, artMeta.h, pl); I.preparedKey = key; }
      try {
        render(ctx, {
          photo: I.photo, photoW: c.width, photoH: c.height, art: I.art ?? null, artW: artMeta?.w ?? 1, artH: artMeta?.h ?? 1,
          wall, wallAspect: dims.w / dims.h, obstacles, occlusion: room.kind === 'demo' && sameAsDemo(wall) ? I.occ : null, placement: pl, shading: I.shading,
        }, I.art ? I.prepared! : null, dragging ? 10 : 22);
      } catch (e) { setError((e as Error).message); }
    });
  }, [loaded, wallKey, obstacles, pl, dims.w, dims.h, photoSize, artMeta, dragging, room, wallValid]); // eslint-disable-line react-hooks/exhaustive-deps

  const sameAsDemo = (w: Pt[]) => w.every((p, i) => Math.abs(p.x - demo.wall![i].x) < 25 && Math.abs(p.y - demo.wall![i].y) < 25);

  useEffect(() => {
    if (art && step >= 1 && !started.current) { started.current = true; track('simulation_start', { art: art.kind === 'library' ? art.id : 'upload' }); }
    if (step === 4 && art) track('simulation_complete', { room: room.kind });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Interaction poignées ----------
  const toPhoto = useCallback((e: { clientX: number; clientY: number }): Pt => {
    const r = overlay.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * photoSize.w, y: ((e.clientY - r.top) / r.height) * photoSize.h };
  }, [photoSize]);
  const dragRef = useRef<{ kind: 'wall' | 'obs'; i: number; j: number } | null>(null);
  const onHandleDown = (kind: 'wall' | 'obs', i: number, j = 0) => (e: React.PointerEvent) => {
    e.stopPropagation(); (e.target as Element).setPointerCapture(e.pointerId); dragRef.current = { kind, i, j }; setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    const p = toPhoto(e); p.x = Math.max(0, Math.min(photoSize.w, p.x)); p.y = Math.max(0, Math.min(photoSize.h, p.y));
    if (d.kind === 'wall') setWall((w) => w.map((q, k) => (k === d.i ? p : q)));
    else setObstacles((o) => o.map((poly, k) => (k === d.i ? poly.map((q, m) => (m === d.j ? p : q)) : poly)));
  };
  const onUp = () => { dragRef.current = null; setDragging(false); };
  const onKeyHandle = (kind: 'wall' | 'obs', i: number, j = 0) => (e: React.KeyboardEvent) => {
    const s = e.shiftKey ? 10 : 2; const dx = e.key === 'ArrowLeft' ? -s : e.key === 'ArrowRight' ? s : 0; const dy = e.key === 'ArrowUp' ? -s : e.key === 'ArrowDown' ? s : 0;
    if (!dx && !dy) return; e.preventDefault();
    const mv = (q: Pt) => ({ x: q.x + dx, y: q.y + dy });
    if (kind === 'wall') setWall((w) => w.map((q, k) => (k === i ? mv(q) : q)));
    else setObstacles((o) => o.map((poly, k) => (k === i ? poly.map((q, m) => (m === j ? mv(q) : q)) : poly)));
  };
  const onOverlayClick = (e: React.MouseEvent) => { if (drawing) setDrawing([...drawing, toPhoto(e)]); };

  // ---------- Imports ----------
  const onUpload = async (f: File | undefined, target: 'art' | 'room') => {
    if (!f) return; setError(null);
    try {
      const r = await readUpload(f, { maxMB: qualityConfig.maxUploadMB, accepted: qualityConfig.acceptedFormats, maxSide: target === 'art' ? 2400 : 1800 });
      track('photo_upload', { target });
      if (target === 'art') { setArt({ kind: 'upload', ...r }); }
      else { setRoom({ kind: 'upload', dataUrl: r.dataUrl, width: r.width, height: r.height }); setWall(defaultWall(r.width, r.height)); setObstacles([]); setStep(2); }
    } catch (e) { setError((e as Error).message); }
  };

  // ---------- Qualité & surface ----------
  const surface = useMemo(() => { try { return wallValid ? printableSurface(wall, dims.w, dims.h, obstacles) : null; } catch { return null; } }, [wallKey, dims, obstacles, wallValid]); // eslint-disable-line react-hooks/exhaustive-deps
  const quality = useMemo(() => {
    if (!artMeta) return null;
    // L'œuvre occupe le mur × l'échelle choisie : la surface imprimée de l'image elle-même est plus grande.
    const k = pl.scale;
    return evaluateQuality({ pxWidth: artMeta.ow, pxHeight: artMeta.oh, targetWidthM: dims.w * k, targetHeightM: dims.h * k, viewingDistanceM: dims.dist });
  }, [artMeta, dims, pl.scale, pl.fit]);

  // ---------- Projets ----------
  const snapshot = (): StudioProject => ({
    id: projectId, name, updatedAt: new Date().toISOString(),
    artworkId: art?.kind === 'library' ? art.id : null, customArt: art?.kind === 'upload' ? { dataUrl: art.dataUrl, width: art.width, height: art.height, originalWidth: art.originalWidth, originalHeight: art.originalHeight } : null,
    roomId: room.kind === 'demo' ? room.id : null, customRoom: room.kind === 'upload' ? room : null,
    wall, obstacles, wallWidthM: dims.w, wallHeightM: dims.h, viewingDistanceM: dims.dist, placement: pl,
    previewDataUrl: thumb(),
  });
  const thumb = () => {
    const c = canvas.current; if (!c) return undefined;
    const t = document.createElement('canvas'); t.width = 480; t.height = Math.round((480 * c.height) / c.width);
    t.getContext('2d')!.drawImage(c, 0, 0, t.width, t.height); return t.toDataURL('image/jpeg', 0.72);
  };
  function loadProject(p: StudioProject) {
    setProjectId(p.id); setName(p.name);
    setArt(p.artworkId ? { kind: 'library', id: p.artworkId } : p.customArt ? { kind: 'upload', ...p.customArt } : null);
    setRoom(p.customRoom ? { kind: 'upload', ...p.customRoom } : { kind: 'demo', id: p.roomId ?? 'salon' });
    setWall(p.wall); setObstacles(p.obstacles); setDims({ w: p.wallWidthM, h: p.wallHeightM, dist: p.viewingDistanceM }); setPl(p.placement); setStep(4);
  }
  const save = (asNew = false) => {
    const snap = snapshot(); if (asNew) { snap.id = newId('proj'); snap.name = `${name} (variante)`; setProjectId(snap.id); setName(snap.name); }
    const ok = projects.save(snap); setToast(ok ? 'Projet enregistré sur cet appareil' : 'Espace de stockage du navigateur insuffisant'); track('project_save');
    setTimeout(() => setToast(null), 2600); return snap;
  };
  const download = () => {
    const c = canvas.current!; const o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
    const x = o.getContext('2d')!; x.drawImage(c, 0, 0);
    const fs = Math.max(12, Math.round(c.width / 70)); x.font = `500 ${fs}px Inter, sans-serif`; x.fillStyle = 'rgba(255,255,255,.9)'; x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 6;
    x.fillText('Simulation indicative — non contractuelle', fs, c.height - fs);
    o.toBlob((b) => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `simulation-${name.replace(/\W+/g, '-').toLowerCase()}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
    track('preview_download');
  };
  const transmit = () => { const s = save(); router.push(`/contact/?project=${s.id}`); };

  const set = <K extends keyof Placement>(k: K, v: Placement[K]) => setPl((p) => ({ ...p, [k]: v }));
  const libList = useMemo(() => {
    const l = filterArtworks({ q: libQ, categories: [], orientation: null, mood: null, color: null, printableOnly: false });
    return onlyFav ? l.filter((a) => favorites.has(a.id)) : l;
  }, [libQ, onlyFav]);

  const handleR = Math.max(8, photoSize.w / 90);
  const showHandles = step === 2 || step === 3;
  const libArt = artMeta?.lib ?? null;

  // ---------- UI ----------
  return (
    <div className="grid min-h-[calc(100svh-4rem)] bg-[#1b1b1a] text-wall lg:grid-cols-[380px_1fr]">
      <aside className="order-2 border-r border-white/5 bg-ink lg:order-1 lg:h-[calc(100svh-4rem)] lg:overflow-y-auto" aria-label="Panneau de configuration">
        <nav aria-label="Étapes" className="sticky top-0 z-10 grid grid-cols-6 border-b border-white/5 bg-ink">
          {STEPS.map((s, k) => (
            <button key={s} onClick={() => setStep(k)} aria-current={k === step ? 'step' : undefined} disabled={k > 0 && !art && k !== 1}
              className={`py-3 text-center text-[0.68rem] font-[family-name:var(--font-ui)] uppercase tracking-wider transition disabled:opacity-30 ${k === step ? 'bg-flame text-white' : 'text-wall/60 hover:text-wall'}`}>
              <span className="block text-base font-[family-name:var(--font-display)]">{k + 1}</span><span className="block truncate px-0.5 text-[0.6rem]">{s}</span>
            </button>
          ))}
        </nav>
        <div className="space-y-6 p-5">
          {error && <p role="alert" className="rounded bg-flame/15 p-3 text-sm text-flame">{error}</p>}

          {step === 0 && (
            <section aria-labelledby="s1">
              <h2 id="s1" className="text-3xl">Choisir son image</h2>
              <div className="mt-4 flex gap-2">
                <input aria-label="Rechercher une œuvre" className="field !text-sm" placeholder="Rechercher : vague, forêt, enfance…" value={libQ} onChange={(e) => setLibQ(e.target.value)} />
                <button aria-pressed={onlyFav} onClick={() => setOnlyFav(!onlyFav)} className="chip shrink-0">♥ Favoris</button>
              </div>
              <ul className="mt-4 grid grid-cols-3 gap-2">
                {libList.map((a) => (
                  <li key={a.id}>
                    <button onClick={() => { setArt({ kind: 'library', id: a.id }); track('artwork_select', { id: a.id }); }} aria-pressed={art?.kind === 'library' && art.id === a.id}
                      className={`relative block aspect-square w-full overflow-hidden rounded ring-2 ${art?.kind === 'library' && art.id === a.id ? 'ring-flame' : 'ring-transparent hover:ring-white/30'}`} title={a.title}>
                      <img src={asset(a.thumb)} alt={a.title} className="h-full w-full object-cover" loading="lazy" />
                      {!isPrintable(a) && <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1 text-[10px]">droits ?</span>}
                    </button>
                  </li>
                ))}
                {!libList.length && <li className="col-span-3 text-sm text-wall/50">Aucune œuvre{onlyFav ? ' en favori' : ''}.</li>}
              </ul>
              <label className="mt-5 block cursor-pointer rounded border border-dashed border-white/20 p-4 text-center text-sm hover:border-flame">
                <span className="block font-medium">Importer ma propre image</span>
                <span className="text-xs text-wall/50">JPEG, PNG, WebP ou TIFF — max {qualityConfig.maxUploadMB} Mo. Vous devez en détenir les droits.</span>
                <input type="file" accept={qualityConfig.acceptedFormats.join(',')} className="sr-only" onChange={(e) => onUpload(e.target.files?.[0], 'art')} />
              </label>
              <Link href="/contact/?need=creation" className="mt-3 block text-sm text-wall/60 underline underline-offset-4 hover:text-flame">Demander une création personnalisée →</Link>
              <Next disabled={!art} onClick={() => setStep(1)} />
            </section>
          )}

          {step === 1 && (
            <section aria-labelledby="s2">
              <h2 id="s2" className="text-3xl">Choisir son environnement</h2>
              <p className="label mt-5">A. Photo de démonstration</p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {rooms.map((r) => (
                  <li key={r.id}>
                    <button disabled={!r.available} onClick={() => { setRoom({ kind: 'demo', id: r.id }); setWall(r.wall!); setObstacles([]); setDims((d) => ({ ...d, w: r.wallWidthM!, h: r.wallHeightM! })); }}
                      aria-pressed={room.kind === 'demo' && room.id === r.id}
                      className={`w-full rounded border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-35 ${room.kind === 'demo' && room.id === r.id ? 'border-flame bg-flame/10' : 'border-white/10 hover:border-white/40'}`}>
                      {r.label}{!r.available && <span className="block text-[10px] uppercase tracking-wider">à venir</span>}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="label mt-6">B. Photo de mon mur</p>
              <label className="mt-3 block cursor-pointer rounded border border-dashed border-white/20 p-4 text-center text-sm hover:border-flame">
                <span className="block font-medium">Importer depuis l’ordinateur ou le smartphone</span>
                <span className="text-xs text-wall/50">Photographiez le mur de face, bien éclairé. La photo reste sur votre appareil ; les métadonnées (GPS…) sont supprimées.</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(e) => onUpload(e.target.files?.[0], 'room')} />
              </label>
              <Next onClick={() => setStep(2)} />
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="s3">
              <h2 id="s3" className="text-3xl">Définir la surface</h2>
              <p className="mt-3 text-sm text-wall/60">Faites glisser les 4 coins orange sur les angles du mur (ou utilisez les flèches du clavier après avoir sélectionné un coin).</p>
              {!wallValid && <p role="alert" className="mt-3 text-sm text-flame">Les coins se croisent : réordonnez-les (haut-gauche, haut-droit, bas-droit, bas-gauche).</p>}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <Num label="Largeur réelle (m)" value={dims.w} onChange={(v) => setDims({ ...dims, w: v })} />
                <Num label="Hauteur réelle (m)" value={dims.h} onChange={(v) => setDims({ ...dims, h: v })} />
              </div>
              <p className="label mt-6">Obstacles à exclure</p>
              <p className="mt-1 text-xs text-wall/50">Portes, fenêtres, prises, radiateurs : ces zones ne seront pas imprimées.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!drawing ? (
                  <>
                    <button className="chip" onClick={() => setDrawing([])}>+ Polygone (cliquer les points)</button>
                    <button className="chip" onClick={() => { const c = { x: (wall[0].x + wall[2].x) / 2, y: (wall[0].y + wall[2].y) / 2 }; const s = photoSize.w / 14; setObstacles([...obstacles, [{ x: c.x - s, y: c.y - s * 1.6 }, { x: c.x + s, y: c.y - s * 1.6 }, { x: c.x + s, y: c.y + s * 1.6 }, { x: c.x - s, y: c.y + s * 1.6 }]]); }}>+ Rectangle (porte, fenêtre)</button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-flame">Cliquez sur l’image ({drawing.length} pts)</span>
                    <button className="chip" disabled={drawing.length < 3} onClick={() => { setObstacles([...obstacles, drawing]); setDrawing(null); }}>Terminer</button>
                    <button className="chip" onClick={() => setDrawing(null)}>Annuler</button>
                  </>
                )}
              </div>
              {obstacles.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {obstacles.map((_, k) => <li key={k} className="flex justify-between">Obstacle {k + 1}<button className="text-wall/50 hover:text-flame" onClick={() => setObstacles(obstacles.filter((__, m) => m !== k))}>Supprimer</button></li>)}
                </ul>
              )}
              {surface && <p className="mt-5 rounded bg-white/5 p-3 text-sm">Surface brute <b>{surface.gross} m²</b> · exclue {surface.excluded} m² · <span className="text-flame">imprimable {surface.net} m²</span></p>}
              <button disabled className="chip mt-4 opacity-40" title="Phase 6">Détection automatique du mur (bientôt)</button>
              <Next disabled={!wallValid} onClick={() => setStep(3)} />
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="s4">
              <h2 id="s4" className="text-3xl">Personnaliser l’œuvre</h2>
              <div className="mt-4 flex gap-2">
                {(['cover', 'contain'] as const).map((f) => <button key={f} className="chip" aria-pressed={pl.fit === f} onClick={() => set('fit', f)}>{f === 'cover' ? 'Remplir le mur' : 'Œuvre entière'}</button>)}
              </div>
              <Slider label="Échelle & recadrage" min={0.4} max={3} step={0.01} value={pl.scale} onChange={(v) => set('scale', v)} fmt={(v) => `${Math.round(v * 100)} %`} />
              <Slider label="Position horizontale" min={-1.5} max={1.5} step={0.01} value={pl.offsetX} onChange={(v) => set('offsetX', v)} />
              <Slider label="Position verticale" min={-1.5} max={1.5} step={0.01} value={pl.offsetY} onChange={(v) => set('offsetY', v)} />
              <Slider label="Rotation" min={-180} max={180} step={1} value={pl.rotation} onChange={(v) => set('rotation', v)} fmt={(v) => `${v}°`} />
              <Slider label="Opacité" min={0.2} max={1} step={0.01} value={pl.opacity} onChange={(v) => set('opacity', v)} fmt={(v) => `${Math.round(v * 100)} %`} />
              <Slider label="Luminosité" min={0.6} max={1.4} step={0.01} value={pl.brightness} onChange={(v) => set('brightness', v)} />
              <Slider label="Contraste" min={0.6} max={1.4} step={0.01} value={pl.contrast} onChange={(v) => set('contrast', v)} />
              <Slider label="Intégration (ombres & lumière du mur)" min={0} max={1} step={0.01} value={pl.integration} onChange={(v) => set('integration', v)} fmt={(v) => `${Math.round(v * 100)} %`} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="chip" onClick={() => setPl((p) => ({ ...p, offsetX: 0, offsetY: 0 }))}>Centrer</button>
                <button className="chip" onClick={() => setPl((p) => ({ ...p, fit: 'cover', scale: 1, offsetX: 0, offsetY: 0, rotation: 0 }))}>Remplir la surface</button>
                <button className="chip" onClick={() => setPl(defaultPlacement)}>Réinitialiser</button>
              </div>
              <p className="mt-4 text-xs text-wall/50">Perspective : les coins du mur restent ajustables directement sur l’image.</p>
              <Next onClick={() => setStep(4)} />
            </section>
          )}

          {step === 4 && (
            <section aria-labelledby="s5">
              <h2 id="s5" className="text-3xl">Prévisualisation</h2>
              <Slider label="Comparateur avant / après" min={0} max={100} step={1} value={compare} onChange={setCompare} fmt={(v) => `${v} %`} />
              <div className="mt-5 rounded bg-white/5 p-4">
                <p className="label">Contrôle qualité préliminaire</p>
                <div className="mt-3"><Num label="Distance d’observation (m)" value={dims.dist} step={0.5} onChange={(v) => setDims({ ...dims, dist: v })} /></div>
                {quality && (
                  <>
                    {libArt?.printQualityStatus === 'vector_regenerable' ? (
                      <p className="mt-4 text-lg font-medium text-emerald-400">● Qualité potentiellement optimale<span className="block text-xs font-normal text-wall/60">Œuvre générative recalculée à la résolution d’impression. Le fichier d’aperçu ci-dessous n’est pas le fichier imprimé.</span></p>
                    ) : (
                      <p className={`mt-4 text-lg font-medium ${quality.level === 'optimal' ? 'text-emerald-400' : quality.level === 'check' ? 'text-amber-300' : 'text-flame'}`}>
                        {quality.level === 'optimal' ? '● Qualité potentiellement optimale' : quality.level === 'check' ? '● Qualité à vérifier' : '● Résolution potentiellement insuffisante'}
                      </p>
                    )}
                    <dl className="mt-2 grid grid-cols-2 gap-1 text-xs text-wall/70">
                      <dt>Fichier</dt><dd>{artMeta!.ow} × {artMeta!.oh} px</dd>
                      <dt>Résolution effective</dt><dd>{quality.effectiveDpi} dpi</dd>
                      <dt>Seuils (optimal / vérif.)</dt><dd>{quality.thresholds.optimal} / {quality.thresholds.check} dpi</dd>
                    </dl>
                    <ul className="mt-3 space-y-1 text-xs text-wall/60">{quality.messages.map((m) => <li key={m}>— {m}</li>)}</ul>
                    {qualityConfig.isPlaceholder && <p className="mt-2 text-[11px] text-wall/40">Seuils par défaut, à remplacer par ceux de la machine réelle.</p>}
                  </>
                )}
              </div>
              <div className="mt-4 rounded border border-white/10 p-4 text-sm text-wall/60">
                <p className="font-medium text-wall">Rendu photoréaliste IA</p>
                <p className="mt-1 text-xs">Option prévue en phase 6 (conserve l’architecture et l’œuvre à l’identique). Non activée : aucune photo n’est envoyée à un service externe.</p>
              </div>
              <Next label="Enregistrer le projet" onClick={() => setStep(5)} />
            </section>
          )}

          {step === 5 && (
            <section aria-labelledby="s6">
              <h2 id="s6" className="text-3xl">Enregistrer son projet</h2>
              <label className="mt-4 block"><span className="label">Nom du projet</span><input className="field" value={name} onChange={(e) => setName(e.target.value)} /></label>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="btn btn-ghost justify-center !px-3 text-sm" onClick={() => save()}>Enregistrer</button>
                <button className="btn btn-ghost justify-center !px-3 text-sm" onClick={() => save(true)}>Nouvelle variante</button>
                <button className="btn btn-ghost col-span-2 justify-center text-sm" onClick={download}>Télécharger l’aperçu (PNG)</button>
                <button className="btn btn-flame col-span-2 justify-center" onClick={transmit}>Transmettre mon projet →</button>
              </div>
              {libArt && !isPrintable(libArt) && <p className="mt-3 text-xs text-flame">Cette œuvre n’est pas encore validée pour impression (droits en attente). Vous pouvez la transmettre comme référence.</p>}
              {art?.kind === 'upload' && <p className="mt-3 text-xs text-wall/50">Image importée : sa reproduction suppose que vous en déteniez les droits.</p>}
              <p className="mt-3 text-xs text-wall/40">Sans compte : les projets sont conservés dans ce navigateur. Ils ne sont transmis qu’à votre demande.</p>
              {saved.length > 0 && (
                <div className="mt-6">
                  <p className="label">Mes variantes ({saved.length})</p>
                  <ul className="mt-3 grid grid-cols-2 gap-3">
                    {saved.map((p) => (
                      <li key={p.id} className={`rounded p-1 ${p.id === projectId ? 'ring-1 ring-flame' : ''}`}>
                        <button onClick={() => loadProject(p)} className="block w-full text-left">
                          {p.previewDataUrl ? <img src={p.previewDataUrl} alt="" className="aspect-video w-full rounded object-cover" /> : <div className="aspect-video rounded bg-white/5" />}
                          <span className="mt-1 block truncate text-xs">{p.name}</span>
                        </button>
                        <button className="text-[11px] text-wall/40 hover:text-flame" onClick={() => projects.remove(p.id)}>Supprimer</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      </aside>

      {/* Scène */}
      <div className="order-1 flex flex-col lg:order-2 lg:h-[calc(100svh-4rem)]">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-xs text-wall/60">
          <h1 className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.18em]">Wall Creative Studio</h1>
          <span>{artMeta ? artMeta.title : 'Aucune œuvre'} · {room.kind === 'demo' ? rooms.find((r) => r.id === room.id)?.label : 'Votre photo'}{surface ? ` · ${surface.net} m²` : ''}</span>
        </div>
        <div className="relative flex flex-1 items-center justify-center p-4 md:p-8">
          <div className="relative w-full max-w-[1400px]" style={{ aspectRatio: `${photoSize.w} / ${photoSize.h}`, maxHeight: '100%' }}>
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" role="img" aria-label="Simulation du mur" />
            {step === 4 && compare < 100 && imgs.current.photo && (
              <img src={imgs.current.photo.src} alt="" aria-hidden className="absolute inset-0 h-full w-full" style={{ clipPath: `inset(0 ${compare}% 0 0)` }} />
            )}
            <svg ref={overlay} viewBox={`0 0 ${photoSize.w} ${photoSize.h}`} className={`absolute inset-0 h-full w-full ${drawing ? 'cursor-crosshair' : ''}`}
              onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onClick={onOverlayClick} aria-hidden={!showHandles}>
              {showHandles && (
                <>
                  <polygon points={wall.map((p) => `${p.x},${p.y}`).join(' ')} fill={art ? 'none' : 'rgba(245,107,53,.12)'} stroke="#F56B35" strokeWidth={photoSize.w / 500} strokeDasharray={`${photoSize.w / 120} ${photoSize.w / 200}`} />
                  {obstacles.map((o, i) => (
                    <g key={i}>
                      <polygon points={o.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(21,21,21,.35)" stroke="#fff" strokeWidth={photoSize.w / 700} />
                      {o.map((p, j) => <circle key={j} cx={p.x} cy={p.y} r={handleR * 0.7} fill="#fff" tabIndex={0} role="slider" aria-label={`Obstacle ${i + 1}, point ${j + 1}`} aria-valuenow={Math.round(p.x)} onPointerDown={onHandleDown('obs', i, j)} onKeyDown={onKeyHandle('obs', i, j)} className="cursor-grab outline-none focus:stroke-flame" strokeWidth={3} />)}
                    </g>
                  ))}
                  {drawing && drawing.length > 0 && <polyline points={drawing.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(255,255,255,.2)" stroke="#fff" strokeWidth={2} />}
                  {wall.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={handleR} fill="#F56B35" stroke="#fff" strokeWidth={photoSize.w / 500} tabIndex={0} role="slider"
                      aria-label={`Coin ${['haut gauche', 'haut droit', 'bas droit', 'bas gauche'][i]} du mur`} aria-valuenow={Math.round(p.x)}
                      onPointerDown={onHandleDown('wall', i)} onKeyDown={onKeyHandle('wall', i)} className="cursor-grab outline-none focus:fill-white" />
                  ))}
                </>
              )}
            </svg>
            <span className="badge-ai absolute bottom-3 right-3">Simulation indicative</span>
          </div>
        </div>
        {toast && <p role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-wall px-5 py-2 text-sm text-ink shadow-xl">{toast}</p>}
      </div>
    </div>
  );
}

function Next({ onClick, disabled, label = 'Étape suivante' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return <button onClick={onClick} disabled={disabled} className="btn btn-flame mt-6 w-full justify-center disabled:opacity-30">{label} →</button>;
}
function Slider({ label, value, onChange, min, max, step, fmt }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; fmt?: (v: number) => string }) {
  return (
    <label className="mt-4 block">
      <span className="flex justify-between text-xs"><span className="label">{label}</span><span className="text-wall/60 tabular-nums">{fmt ? fmt(value) : value.toFixed(2)}</span></span>
      <input type="range" className="range mt-1" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}
function Num({ label, value, onChange, step = 0.1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block"><span className="label">{label}</span>
      <input type="number" inputMode="decimal" min={0.1} step={step} className="field" value={value} onChange={(e) => { const v = parseFloat(e.target.value); if (v > 0) onChange(v); }} />
    </label>
  );
}
