import { forwardRef } from 'react';
type P = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean };
export const toHash = (href: string) => (href.startsWith('/') ? '#' + href : href);
const Link = forwardRef<HTMLAnchorElement, P>(function Link({ href, prefetch: _p, ...rest }, ref) {
  return <a ref={ref} href={toHash(href)} {...rest} />;
});
export default Link;
