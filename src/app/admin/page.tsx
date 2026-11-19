import type { Metadata } from 'next';
import { AdminDashboard } from './AdminDashboard';
export const metadata: Metadata = { title: 'Administration (démo)', robots: { index: false, follow: false } };
export default function Page() { return <AdminDashboard />; }
