import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './admin.css';
import { AdminShell } from './_components/AdminShell';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Next Level Audio',
  description: 'Admin panel for managing bookings and products',
};

// Admin-scoped fonts (ops-console identity, distinct from the site's Teko/Rajdhani).
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-adm-heading',
  weight: ['400', '500', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-adm-body',
  display: 'swap',
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell fontVars={`${jetbrainsMono.variable} ${inter.variable}`}>{children}</AdminShell>;
}
