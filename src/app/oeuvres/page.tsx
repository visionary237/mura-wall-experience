import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ArtExplorer } from '@/components/explorer/ArtExplorer';
export const metadata: Metadata = { title: "Bibliothèque d'œuvres", description: 'Explorez, filtrez et comparez des œuvres aux droits documentés.' };
export default function Page() { return <Suspense><ArtExplorer /></Suspense>; }
