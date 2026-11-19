'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Observe les éléments `.reveal` et ajoute `.is-in` à l'entrée dans le viewport. */
export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))), { rootMargin: '0px 0px -8% 0px' });
    const scan = () => document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);
  return null;
}
