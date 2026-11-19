import Link from 'next/link';
export default function NotFound() {
  return <section className="mx-auto grid min-h-[80vh] max-w-[1600px] place-content-center px-5 text-center"><p className="eyebrow">404</p><h1 className="mt-4 text-7xl">Ce mur est encore vide.</h1><Link href="/" className="btn btn-primary mx-auto mt-8">Retour à l’accueil</Link></section>;
}
