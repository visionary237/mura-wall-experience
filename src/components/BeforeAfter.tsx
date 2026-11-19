'use client';
import { useRef, useState } from 'react';

/** Comparateur avant/après accessible : glisser, clic, ou clavier (slider natif). */
export function BeforeAfter({ before, after, label, initial = 50, badge }: { before: React.ReactNode; after: React.ReactNode; label: string; initial?: number; badge?: string }) {
  const [v, setV] = useState(initial);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const fromEvent = (x: number) => {
    const r = box.current!.getBoundingClientRect();
    setV(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)));
  };
  return (
    <figure className="relative">
      <div
        ref={box}
        className="relative select-none overflow-hidden rounded-[2px] touch-pan-y"
        onPointerDown={(e) => { drag.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); fromEvent(e.clientX); }}
        onPointerMove={(e) => drag.current && fromEvent(e.clientX)}
        onPointerUp={() => (drag.current = false)}
      >
        <div>{after}</div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }} aria-hidden>{before}</div>
        <div className="pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,.08)]" style={{ left: `${v}%` }}>
          <div className="absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg text-xs">⟷</div>
        </div>
        <span className="eyebrow pointer-events-none absolute top-3 left-3 rounded bg-white/85 px-2 py-1">Avant</span>
        <span className="eyebrow pointer-events-none absolute top-3 right-3 rounded bg-ink/80 px-2 py-1 text-white">Après</span>
        {badge && <span className="badge-ai pointer-events-none absolute bottom-3 left-3">{badge}</span>}
      </div>
      <label className="sr-only" htmlFor={`ba-${label}`}>{label} — position du comparateur</label>
      <input id={`ba-${label}`} type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} className="range mt-3" />
      <figcaption className="mt-1 text-sm text-concrete">{label}</figcaption>
    </figure>
  );
}
