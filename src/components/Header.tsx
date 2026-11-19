'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { brand, navigation } from '@/config/site';

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dark = path === '/' && !scrolled;
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  const isStudio = path.startsWith('/studio');
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${dark ? 'text-ink' : 'bg-wall/85 backdrop-blur-md text-ink border-b border-ink/5'}`}>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="display text-xl font-semibold tracking-tight" aria-label={`${brand.name} — accueil`}>
          {brand.name}<span className="text-flame">.</span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-7 lg:flex">
          {navigation.map((n) => (
            <Link key={n.href} href={n.href} className={`text-[0.88rem] font-[family-name:var(--font-ui)] transition-colors hover:text-flame ${path.startsWith(n.href.replace(/\/$/, '')) ? 'text-flame' : ''}`}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {!isStudio && <Link href="/studio/" className="btn btn-primary hidden !py-2.5 sm:inline-flex">Visualiser mon projet</Link>}
          <Link href="/contact/" className="hidden text-sm underline-offset-4 hover:underline md:inline">Devis</Link>
          <button className="lg:hidden p-2" aria-expanded={open} aria-controls="menu-mobile" onClick={() => setOpen(!open)}>
            <span className="sr-only">Menu</span>
            <span aria-hidden className="block h-px w-6 bg-current" /><span aria-hidden className="mt-1.5 block h-px w-6 bg-current" />
          </button>
        </div>
      </div>
      {open && (
        <nav id="menu-mobile" className="lg:hidden border-t border-ink/10 bg-wall px-5 py-6 text-ink">
          {[...navigation, { href: '/realisations/', label: 'Réalisations' }, { href: '/faq/', label: 'FAQ' }, { href: '/contact/', label: 'Demande de devis' }].map((n) => (
            <Link key={n.href} href={n.href} className="display block py-2 text-3xl">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
