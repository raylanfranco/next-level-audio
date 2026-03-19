'use client';

import { usePathname } from 'next/navigation';
import TopBanner from '@/components/layout/TopBanner';
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
      {!isAdminRoute && <TopBanner />}
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? '' : 'min-h-screen'}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
