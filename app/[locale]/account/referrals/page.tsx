'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';

interface Referral {
  id: string;
  referred_name: string;
  bonus_awarded: boolean;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AccountReferralsPage() {
  const t = useTranslations('account');
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/account/referrals')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.referrals) setReferrals(data.referrals);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const referralCode = profile?.referral_code || '';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/account/signup?ref=${referralCode}`
    : '';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-[#E01020]/30 border-t-[#E01020] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white mb-6 neon-glow"
        style={{ fontFamily: 'var(--font-oxanium)' }}
      >
        {t('referralsTitle')}
      </h1>

      {/* Referral Code Card */}
      <div className="border-2 border-[#E01020]/30 p-6 mb-8">
        <p className="text-white/50 font-mono text-xs uppercase tracking-wider mb-3">
          {t('referralCode')}
        </p>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-[#E01020]/5 border-2 border-[#E01020]/30 px-4 py-3">
            <p
              className="text-[#E01020] font-mono font-bold text-xl tracking-widest neon-glow-soft"
            >
              {referralCode}
            </p>
          </div>
          <button
            onClick={() => handleCopy(referralCode)}
            className="px-4 py-3 border-2 border-[#E01020] text-[#E01020] font-mono text-xs font-bold hover:bg-[#E01020]/10 transition-colors cursor-pointer"
          >
            {copied ? t('copied') : t('copy')}
          </button>
        </div>

        <div className="bg-[#E01020]/5 border border-[#E01020]/20 p-3">
          <p className="text-white/50 font-mono text-xs mb-1">{t('shareThisLink')}</p>
          <p className="text-white/70 font-mono text-xs break-all">{referralLink}</p>
          <button
            onClick={() => handleCopy(referralLink)}
            className="mt-2 text-[#E01020] font-mono text-xs hover:text-[#FF2A3A] transition-colors cursor-pointer"
          >
            {t('copyLink')}
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="border-2 border-[#E01020]/20 p-5 mb-8">
        <h2
          className="text-sm font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-oxanium)' }}
        >
          {t('howItWorksTitle')}
        </h2>
        <ol className="space-y-2 text-white/60 font-mono text-xs">
          <li className="flex gap-2">
            <span className="text-[#E01020] font-bold">1.</span>
            {t('step1')}
          </li>
          <li className="flex gap-2">
            <span className="text-[#E01020] font-bold">2.</span>
            {t('step2')}
          </li>
          <li className="flex gap-2">
            <span className="text-[#E01020] font-bold">3.</span>
            {t('step3')}
          </li>
        </ol>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-[#E01020]/20 p-4 text-center">
          <p className="text-2xl font-bold text-[#E01020] font-mono">{referrals.length}</p>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-1">
            {t('totalReferrals')}
          </p>
        </div>
        <div className="border-2 border-[#FFD700]/20 p-4 text-center">
          <p className="text-2xl font-bold text-[#FFD700] font-mono">
            {referrals.filter((r) => r.bonus_awarded).length * 100}
          </p>
          <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-1">
            {t('pointsEarned')}
          </p>
        </div>
      </div>

      {/* Referral List */}
      <h2
        className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3 font-mono"
      >
        {t('yourReferrals')}
      </h2>

      {referrals.length === 0 ? (
        <div className="border-2 border-[#E01020]/20 p-8 text-center">
          <p className="text-white/40 font-mono text-sm">{t('noReferrals')}</p>
          <p className="text-white/30 font-mono text-xs mt-1">
            {t('noReferralsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {referrals.map((ref) => (
            <div key={ref.id} className="border border-[#E01020]/15 p-3 flex items-center justify-between">
              <div>
                <p className="text-white/70 font-mono text-sm">{ref.referred_name}</p>
                <p className="text-white/30 font-mono text-[10px]">{formatDate(ref.created_at)}</p>
              </div>
              <span
                className={`px-2 py-0.5 border text-[10px] font-mono uppercase tracking-wider ${
                  ref.bonus_awarded
                    ? 'text-green-400 border-green-400/30 bg-green-400/5'
                    : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5'
                }`}
              >
                {ref.bonus_awarded ? t('plusPts') : t('pendingStatus')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
