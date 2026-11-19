import Link from 'next/link';

export function PageHero({ eyebrow, title, intro, cta, image, badge }: { eyebrow: string; title: React.ReactNode; intro?: string; cta?: { href: string; label: string }[]; image?: string; badge?: string }) {
  return (
    <section className={`relative overflow-hidden ${image ? 'min-h-[88svh] text-white' : ''}`}>
      {image && (<><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" /></>)}
      <div className={`relative mx-auto flex max-w-[1600px] flex-col px-5 pb-20 md:px-10 ${image ? 'min-h-[88svh] justify-end pt-32' : 'pt-36'}`}>
        <p className={`eyebrow ${image ? 'text-white/80' : ''}`}>{eyebrow}</p>
        <h1 className="mt-5 max-w-6xl text-6xl md:text-[7.5vw]">{title}</h1>
        {intro && <p className={`mt-8 max-w-2xl text-lg ${image ? 'text-white/80' : 'text-ink/70'}`}>{intro}</p>}
        {cta && <div className="mt-10 flex flex-wrap gap-3">{cta.map((c, k) => <Link key={c.href} href={c.href} className={k === 0 ? 'btn btn-flame' : `btn btn-ghost ${image ? 'text-white' : ''}`}>{c.label}</Link>)}</div>}
        {badge && <span className="badge-ai absolute right-5 top-24 md:right-10">{badge}</span>}
      </div>
    </section>
  );
}

export function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32 ${className}`}>{children}</section>;
}
