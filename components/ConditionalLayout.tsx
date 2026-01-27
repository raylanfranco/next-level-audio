'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <div className="scanline"></div>}
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? '' : 'min-h-screen'}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
