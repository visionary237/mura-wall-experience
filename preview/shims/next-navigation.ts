import { useSyncExternalStore } from 'react';
const sub = (cb: () => void) => { addEventListener('hashchange', cb); return () => removeEventListener('hashchange', cb); };
const getHash = () => location.hash || '#/';
export function parse(h: string) {
  const raw = h.replace(/^#/, '') || '/';
  const [p, q = ''] = raw.split('?');
  const path = p.endsWith('/') ? p : p + '/';
  return { path, query: q };
}
export function usePathname() { return parse(useSyncExternalStore(sub, getHash, () => '#/')).path.replace(/(.)\/$/, '$1') + (parse(getHash()).path === '/' ? '' : '/'); }
export function useSearchParams() { const h = useSyncExternalStore(sub, getHash, () => '#/'); return new URLSearchParams(parse(h).query); }
export function useRouter() { return { push: (href: string) => { location.hash = href; }, replace: (href: string) => { location.replace('#' + href); }, back: () => history.back() }; }
export function notFound(): never { throw new Error('not found'); }
