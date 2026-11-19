import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StudioEntry } from './StudioEntry';

export const metadata: Metadata = { title: 'Wall Creative Studio', description: 'Visualisez une œuvre sur la photo de votre propre mur.' };

export default function Page() {
  return (
    <div className="pt-16">
      <Suspense fallback={<div className="grid h-[80vh] place-items-center bg-ink text-wall">Chargement du Studio…</div>}>
        <StudioEntry />
      </Suspense>
    </div>
  );
}
