'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { navItems, type BadgeSource } from '../_lib/constants';
import { useAdminData } from '../_context/AdminDataProvider';
import { NavIcon } from './icons';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { pendingBookings, pendingInquiries, pendingApplications } = useAdminData();

  const badgeFor = (source?: BadgeSource): number | undefined => {
    if (source === 'bookings') return pendingBookings || undefined;
    if (source === 'inquiries') return pendingInquiries || undefined;
    if (source === 'applications') return pendingApplications || undefined;
    return undefined;
  };

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside
      className="w-[260px] flex-shrink-0 border-r flex flex-col z-20 relative"
      style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-bg)' }}
    >
      {/* Branding */}
      <div
        className="h-[80px] px-6 flex flex-col justify-center border-b relative"
        style={{ borderColor: 'var(--adm-border)' }}
      >
        <div className="font-heading font-bold text-2xl tracking-tighter" style={{ color: 'var(--adm-text)' }}>
          NLA<span style={{ color: 'var(--adm-primary)' }}>_</span>OPS
        </div>
        <div className="text-[10px] tracking-[0.2em] uppercase mt-1 font-heading" style={{ color: 'var(--adm-text-muted)' }}>
          Next Level Audio
        </div>
        <div className="absolute bottom-0 left-6 right-6 h-[1px] opacity-80" style={{ background: 'var(--adm-primary)' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const badge = badgeFor(item.badgeSource);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`group flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--adm-primary)] ${
                active
                  ? 'nav-item-active px-5 py-3'
                  : 'px-6 py-3 border-l-4 border-transparent hover:bg-white/5'
              }`}
              style={{ color: active ? 'var(--adm-text)' : 'var(--adm-text-muted)' }}
            >
              <span className="flex items-center">
                <NavIcon id={item.key} className={`w-5 h-5 mr-4 shrink-0 ${active ? '' : 'group-hover:opacity-100'}`} />
                <span className="font-body text-xs tracking-widest uppercase font-medium">{item.label}</span>
              </span>
              {badge !== undefined && (
                <span
                  className="text-[10px] font-heading px-1.5 py-0.5 border"
                  style={{ background: 'var(--adm-bg-elevated)', color: 'var(--adm-primary)', borderColor: 'var(--adm-border)' }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Operator footer */}
      <div className="p-5 border-t" style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-panel-bot)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'var(--adm-text-muted)' }}>Operator</span>
            <span className="font-heading text-sm" style={{ color: 'var(--adm-text)' }}>ADMIN</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] tracking-widest uppercase mb-1" style={{ color: 'var(--adm-text-muted)' }}>Status</span>
            <div className="flex items-center gap-2">
              <span className="font-heading text-[10px]" style={{ color: 'var(--adm-text)' }}>ONLINE</span>
              <div className="w-2 h-2" style={{ background: 'var(--adm-ok)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="adm-btn-ghost flex-1 text-center text-[10px] uppercase tracking-widest py-2 font-heading"
          >
            Site
          </Link>
          <button
            onClick={handleLogout}
            className="adm-btn-ghost flex-1 text-center text-[10px] uppercase tracking-widest py-2 font-heading cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
