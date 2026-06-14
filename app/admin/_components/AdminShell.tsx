'use client';

import { usePathname } from 'next/navigation';
import { AdminThemeProvider } from '../_context/AdminThemeProvider';
import { AdminDataProvider } from '../_context/AdminDataProvider';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminShell({
  children,
  fontVars,
}: {
  children: React.ReactNode;
  fontVars: string;
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  // Login page renders bare (no shell, no data provider) — user isn't authed.
  if (isLogin) {
    return (
      <AdminThemeProvider>
        <div className={`admin-root ${fontVars}`}>{children}</div>
      </AdminThemeProvider>
    );
  }

  return (
    <AdminThemeProvider>
      <AdminDataProvider>
        <div
          className={`admin-root ${fontVars} flex h-screen w-screen overflow-hidden`}
          style={{ background: 'var(--adm-bg)' }}
        >
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 relative" style={{ background: 'var(--adm-bg)' }}>
            <Header />
            <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, var(--adm-border), #404040, var(--adm-border))' }} />
            <main className="flex-1 overflow-auto p-8 relative">{children}</main>
          </div>
        </div>
      </AdminDataProvider>
    </AdminThemeProvider>
  );
}
