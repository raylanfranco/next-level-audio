'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  rewardPoints: number;
  referralCount: number;
}

export default function AccountDashboardPage() {
  const t = useTranslations('account');
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    rewardPoints: 0,
    referralCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersRes, rewardsRes, referralsRes] = await Promise.all([
          fetch('/api/account/orders'),
          fetch('/api/account/rewards'),
          fetch('/api/account/referrals'),
        ]);

        const ordersData = ordersRes.ok ? await ordersRes.json() : null;
        const rewardsData = rewardsRes.ok ? await rewardsRes.json() : null;
        const referralsData = referralsRes.ok ? await referralsRes.json() : null;

        setStats({
          totalOrders: ordersData?.orders?.length || 0,
          totalSpent: ordersData?.orders?.reduce((sum: number, o: { total_cents: number }) => sum + o.total_cents, 0) || 0,
          rewardPoints: rewardsData?.balance || 0,
          referralCount: referralsData?.referrals?.length || 0,
        });
      } catch {
        // Stats will remain at defaults
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const quickLinks = [
    { href: '/account/orders', label: t('viewOrders'), icon: '◈', desc: t('viewOrdersDesc') },
    { href: '/account/appointments', label: t('appointmentsLink'), icon: '◇', desc: t('appointmentsDesc') },
    { href: '/account/rewards', label: t('rewardsLink'), icon: '★', desc: t('rewardsDesc') },
    { href: '/account/referrals', label: t('referralsLink'), icon: '◎', desc: t('referralsDesc') },
    { href: '/products', label: t('shopProducts'), icon: '▸', desc: t('shopProductsDesc') },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="border-2 border-[#E01020]/30 p-6 mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold text-white mb-2 neon-glow"
          style={{ fontFamily: 'var(--font-oxanium)' }}
        >
          {t('welcomeBanner')}{profile?.full_name ? `, ${profile.full_name.split(' ')[0].toUpperCase()}` : ''}
        </h1>
        <p className="text-white/50 font-mono text-sm">
          {t('manageAccount')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('ordersLabel'), value: loading ? '...' : stats.totalOrders.toString(), color: 'text-[#E01020]' },
          { label: t('totalSpentLabel'), value: loading ? '...' : `$${(stats.totalSpent / 100).toFixed(0)}`, color: 'text-[#E01020]' },
          { label: t('rewardPointsLabel'), value: loading ? '...' : stats.rewardPoints.toLocaleString(), color: 'text-[#FFD700]' },
          { label: t('referralsLabel'), value: loading ? '...' : stats.referralCount.toString(), color: 'text-[#E01020]' },
        ].map((stat) => (
          <div key={stat.label} className="border-2 border-[#E01020]/20 p-4 text-center">
            <p className={`text-2xl md:text-3xl font-bold font-mono ${stat.color} neon-glow-soft`}>
              {stat.value}
            </p>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2
        className="text-lg font-bold text-white mb-4"
        style={{ fontFamily: 'var(--font-oxanium)' }}
      >
        {t('quickLinksTitle')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border-2 border-[#E01020]/20 p-4 hover:border-[#E01020]/50 hover:bg-[#E01020]/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-[#E01020] text-lg">{link.icon}</span>
              <div>
                <p
                  className="text-white font-semibold text-sm group-hover:text-[#E01020] transition-colors"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  {link.label}
                </p>
                <p className="text-white/40 text-xs font-mono">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
