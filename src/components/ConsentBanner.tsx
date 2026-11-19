'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { consent } from '@/lib/store';

export function ConsentBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(!consent.get().decided), []);
  if (!show) return null;
  const decide = (v: boolean) => { consent.set(v); setShow(false); };
  return (
    <div role="dialog" aria-label="Préférences de mesure d'audience" className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl rounded-2xl bg-ink p-5 text-wall shadow-2xl md:left-auto md:right-6">
      <p className="text-sm text-wall/80">Nous aimerions mesurer l’audience pour améliorer le site. Aucun traceur publicitaire. <Link href="/confidentialite/" className="underline">En savoir plus</Link></p>
      <div className="mt-4 flex gap-3">
        <button className="btn btn-ghost !py-2 text-wall" onClick={() => decide(false)}>Refuser</button>
        <button className="btn btn-flame !py-2" onClick={() => decide(true)}>Accepter</button>
      </div>
    </div>
  );
}
