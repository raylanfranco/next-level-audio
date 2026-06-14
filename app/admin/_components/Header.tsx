'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { navItems } from '../_lib/constants';
import { useAdminData } from '../_context/AdminDataProvider';
import { useAdminTheme } from '../_context/AdminThemeProvider';

export function Header() {
  const pathname = usePathname();
  const { pendingBookings, pendingInquiries, pendingApplications, refresh, loading } = useAdminData();
  const { theme, toggleTheme } = useAdminTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const current =
    navItems.find((n) => (n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href))) ?? navItems[0];

  const totalPending = pendingBookings + pendingInquiries + pendingApplications;

  return (
    <header
      className="h-[80px] shrink-0 border-b flex items-center justify-between px-8"
      style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-bg)' }}
    >
      <div>
        <h1
          className="font-heading text-3xl font-bold uppercase tracking-tight m-0 leading-none"
          style={{ color: 'var(--adm-text)' }}
        >
          {current.label}
        </h1>
        <div
          className="font-body text-[10px] tracking-[0.15em] uppercase mt-2 flex items-center gap-2"
          style={{ color: 'var(--adm-text-muted)' }}
        >
          <span>System</span>
          <span style={{ color: 'var(--adm-border)' }}>{'//'}</span>
          <span>{current.key === 'overview' ? 'Overview' : current.label}</span>
          <span style={{ color: 'var(--adm-border)' }}>{'//'}</span>
          <span style={{ color: 'var(--adm-primary)' }}>Real-Time</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Refresh */}
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="adm-btn-ghost p-2 cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--adm-primary)]"
          aria-label="Refresh data"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="square" d="M4 4v5h5M20 20v-5h-5" />
            <path strokeLinecap="square" d="M20 9a8 8 0 0 0-14.9-3M4 15a8 8 0 0 0 14.9 3" />
          </svg>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((s) => !s)}
            className="adm-btn-ghost relative p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--adm-primary)]"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {totalPending > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2" style={{ background: 'var(--adm-primary)', border: '1px solid var(--adm-bg)' }} />
            )}
          </button>
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-72 instrument-panel z-50">
              <div className="px-4 py-3 border-b font-heading text-xs uppercase tracking-wider" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-text)' }}>
                Pending
              </div>
              <Link href="/admin/bookings" onClick={() => setShowNotifications(false)} className="block px-4 py-3 text-xs border-b hover:opacity-80" style={{ borderColor: 'var(--adm-border-soft)', color: 'var(--adm-text-muted)' }}>
                {pendingBookings} pending booking{pendingBookings === 1 ? '' : 's'}
              </Link>
              <Link href="/admin/requests" onClick={() => setShowNotifications(false)} className="block px-4 py-3 text-xs border-b hover:opacity-80" style={{ borderColor: 'var(--adm-border-soft)', color: 'var(--adm-text-muted)' }}>
                {pendingInquiries} pending request{pendingInquiries === 1 ? '' : 's'}
              </Link>
              <Link href="/admin/applications" onClick={() => setShowNotifications(false)} className="block px-4 py-3 text-xs hover:opacity-80" style={{ color: 'var(--adm-text-muted)' }}>
                {pendingApplications} pending application{pendingApplications === 1 ? '' : 's'}
              </Link>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="adm-btn-ghost p-2 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--adm-primary)]"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <circle cx="12" cy="12" r="4" /><path strokeLinecap="square" d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
