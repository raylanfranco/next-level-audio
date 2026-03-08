'use client';

import { usePathname, Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, signOut, isLoading } = useAuth();
  const t = useTranslations('account');
  const tc = useTranslations('common');

  const accountNav = [
    { href: '/account' as const, label: t('dashboard'), icon: '◆' },
    { href: '/account/orders' as const, label: t('orders'), icon: '◈' },
    { href: '/account/appointments' as const, label: t('appointments'), icon: '◇' },
    { href: '/account/rewards' as const, label: t('rewards'), icon: '★' },
    { href: '/account/referrals' as const, label: t('referrals'), icon: '◎' },
  ];

  // Don't show sidebar on login/signup pages
  if (pathname.startsWith('/account/login') || pathname.startsWith('/account/signup')) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-[#E01020]/30 border-t-[#E01020] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            {/* User card */}
            <div className="border-2 border-[#E01020]/30 p-5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#E01020]/20 border border-[#E01020]/50 flex items-center justify-center text-[#E01020] font-bold text-lg font-oxanium">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm font-oxanium">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-white/40 font-mono text-xs">{profile?.email}</p>
                </div>
              </div>
              {profile?.referral_code && (
                <div className="bg-[#E01020]/5 border border-[#E01020]/20 px-3 py-2">
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mb-1">{t('referralCode')}</p>
                  <p className="text-[#E01020] font-mono font-bold text-sm">{profile.referral_code}</p>
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {accountNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 font-mono text-sm transition-colors ${
                      isActive
                        ? 'bg-[#E01020]/10 text-[#E01020] border-l-2 border-[#E01020]'
                        : 'text-white/60 hover:text-[#E01020] hover:bg-[#E01020]/5'
                    }`}
                  >
                    <span className="text-xs">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div className="mt-6 pt-6 border-t border-[#E01020]/20">
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2.5 text-white/40 hover:text-red-400 font-mono text-sm transition-colors cursor-pointer"
              >
                {tc('signOut')}
              </button>
            </div>
          </aside>

          {/* Mobile nav */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black border-t-2 border-[#E01020]/30 flex">
            {accountNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 py-3 text-center font-mono text-[10px] transition-colors ${
                    isActive ? 'text-[#E01020] bg-[#E01020]/10' : 'text-white/40'
                  }`}
                >
                  <div className="text-base mb-0.5">{item.icon}</div>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
