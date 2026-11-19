'use client';
import { useSearchParams } from 'next/navigation';
import { Studio } from '@/components/studio/Studio';

export function StudioEntry() {
  const sp = useSearchParams();
  return <Studio initialArt={sp.get('art')} initialProject={sp.get('project')} />;
}
