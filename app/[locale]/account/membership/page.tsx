'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';

interface VipStatus {
  membership: {
    status: 'active' | 'past_due' | 'canceled';
    memberNumber: string;
    currentPeriodEnd: string | null;
  } | null;
  benefits?: Record<'diagnostic' | 'checkup', { used: number; total: number }>;
  joinable: boolean;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function MembershipPage() {
  const t = useTranslations('vip');
  const { profile } = useAuth();
  const [status, setStatus] = useState<VipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/vip/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setStatus(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const redirectTo = async (endpoint: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Something went wrong');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-[#E01020]/30 border-t-[#E01020] animate-spin" />
      </div>
    );
  }

  const membership = status?.membership;
  const active = membership?.status === 'active';

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6 neon-glow font-oxanium">{t('accountTitle')}</h1>

      {error && (
        <div className="border border-[#E01020] text-[#E01020] font-mono text-sm px-4 py-3 mb-6">{error}</div>
      )}

      {membership ? (
        <>
          {/* Digital membership card */}
          <div
            className="relative overflow-hidden border-2 border-[#E01020]/60 p-6 md:p-8 mb-8 max-w-xl"
            style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0508 55%, #0a0a0a 100%)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E01020] to-transparent" />
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="font-oxanium font-bold text-xl text-white tracking-tight">
                  NEXT LEVEL <span className="text-[#E01020]">AUDIO</span>
                </div>
                <div className="text-white/40 font-mono text-[10px] tracking-[0.3em] uppercase mt-1">
                  {t('cardTagline')}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-oxanium font-bold text-3xl leading-none"
                  style={{
                    background: 'linear-gradient(180deg, #f5d576 0%, #b8860b 50%, #f5d576 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  VIP
                </div>
                <div className="text-white/60 font-mono text-[10px] tracking-[0.2em] uppercase">
                  {t('cardMembership')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="text-white/40 font-mono text-[10px] uppercase tracking-wider mb-1">{t('cardMemberName')}</div>
                <div className="text-chrome-100 font-oxanium font-bold text-lg tracking-widest uppercase">
                  {profile?.full_name || '—'}
                </div>
              </div>
              <div>
                <div className="text-white/40 font-mono text-[10px] uppercase tracking-wider mb-1">{t('cardMemberNumber')}</div>
                <div className="text-white font-mono font-bold tracking-[0.2em]">{membership.memberNumber}</div>
              </div>
              <div>
                <div className="text-white/40 font-mono text-[10px] uppercase tracking-wider mb-1">{t('cardValidThru')}</div>
                <div className="text-white font-mono font-bold tracking-[0.2em]">
                  {formatDate(membership.currentPeriodEnd)}
                </div>
              </div>
            </div>

            {!active && (
              <div className="mt-5 border border-amber-500/50 text-amber-400 font-mono text-xs px-3 py-2">
                {membership.status === 'past_due' ? t('pastDueNotice') : t('canceledNotice')}
              </div>
            )}
          </div>

          {/* Benefits */}
          {status?.benefits && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mb-8">
              {(['diagnostic', 'checkup'] as const).map((key) => {
                const b = status.benefits![key];
                const remaining = Math.max(b.total - b.used, 0);
                return (
                  <div key={key} className="border border-[#E01020]/30 p-5">
                    <div className="text-white/50 font-mono text-[10px] uppercase tracking-wider mb-2">
                      {key === 'diagnostic' ? t('benefitDiagnostic') : t('benefitCheckup')}
                    </div>
                    <div className="text-white font-oxanium font-bold text-2xl">
                      {remaining}
                      <span className="text-white/40 text-base"> / {b.total}</span>
                    </div>
                    <div className="text-white/40 font-mono text-xs mt-1">{t('remainingThisYear')}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {!active && status?.joinable && (
              <button
                onClick={() => redirectTo('/api/vip/checkout')}
                disabled={busy}
                className="cyber-button bg-[#E01020] text-white font-oxanium font-bold uppercase tracking-widest text-sm px-8 py-3 cursor-pointer disabled:opacity-50"
              >
                {t('rejoinCta')}
              </button>
            )}
            <button
              onClick={() => redirectTo('/api/vip/portal')}
              disabled={busy}
              className="border border-white/30 text-white/80 hover:text-white hover:border-white font-mono uppercase tracking-widest text-xs px-6 py-3 cursor-pointer transition-colors disabled:opacity-50"
            >
              {t('manageBilling')}
            </button>
          </div>
        </>
      ) : (
        /* Not a member yet — join panel */
        <div className="border-2 border-[#E01020]/40 p-6 md:p-10 max-w-2xl">
          <div className="font-oxanium font-bold text-3xl text-white mb-1">
            {t('joinHeading')} <span className="text-[#E01020]">VIP</span>
          </div>
          <p className="text-white/60 font-mono text-sm mb-6">{t('joinSubheading')}</p>

          <div className="font-oxanium font-bold text-4xl text-white mb-6">
            $199<span className="text-white/40 text-lg font-mono"> {t('perYear')}</span>
          </div>

          <ul className="space-y-2 mb-8">
            {(['perk10Products', 'perk10Install', 'perkDiagnostics', 'perkCheckups', 'perkPriority', 'perkDeals'] as const).map((key) => (
              <li key={key} className="flex items-start gap-3 text-white/80 font-mono text-sm">
                <span className="text-[#E01020] mt-0.5">▸</span>
                {t(key)}
              </li>
            ))}
          </ul>

          {status?.joinable ? (
            <button
              onClick={() => redirectTo('/api/vip/checkout')}
              disabled={busy}
              className="cyber-button bg-[#E01020] text-white font-oxanium font-bold uppercase tracking-widest text-sm px-10 py-4 cursor-pointer disabled:opacity-50"
            >
              {busy ? '…' : t('joinCta')}
            </button>
          ) : (
            <p className="text-white/40 font-mono text-sm">{t('comingSoon')}</p>
          )}
        </div>
      )}
    </div>
  );
}
