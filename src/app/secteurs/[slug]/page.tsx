import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sectors, getSector } from '@/data/sectors';
import { SectorPage } from '@/components/SectorPage';
export const dynamicParams = false;
export function generateStaticParams() { return sectors.map((s) => ({ slug: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const s = getSector((await params).slug); return { title: s?.title, description: s?.intro }; }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { const s = getSector((await params).slug); if (!s) notFound(); return <SectorPage s={s} />; }
