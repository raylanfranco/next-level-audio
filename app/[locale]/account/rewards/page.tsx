'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface RewardEntry {
  id: string;
  points: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AccountRewardsPage() {
  const t = useTranslations('account');
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<RewardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/account/rewards')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setBalance(data.balance || 0);
          setHistory(data.history || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function reasonLabel(reason: string) {
    switch (reason) {
      case 'purchase':
        return t('purchaseReason');
      case 'referral':
        return t('referralBonusReason');
      case 'redemption':
        return t('pointsRedeemedReason');
      case 'signup':
        return t('welcomeBonusReason');
      default:
        return reason;
    }
  }

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
        {t('rewardsTitle')}
      </h1>

      {/* Points Balance Card */}
      <div className="border-2 border-[#FFD700]/30 bg-[#FFD700]/5 p-6 mb-8 text-center">
        <p className="text-white/50 font-mono text-xs uppercase tracking-wider mb-2">{t('yourPointsBalance')}</p>
        <p
          className="text-5xl font-bold text-[#FFD700] neon-glow-soft"
          style={{ fontFamily: 'var(--font-oxanium)' }}
        >
          {balance.toLocaleString()}
        </p>
        <p className="text-white/40 font-mono text-xs mt-2">
          {t('earnPointsDesc')}
        </p>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '◈', title: t('shopTitle'), desc: t('shopStepDesc') },
          { icon: '◎', title: t('referTitle'), desc: t('referStepDesc') },
          { icon: '★', title: t('redeemTitle'), desc: t('redeemStepDesc') },
        ].map((step) => (
          <div key={step.title} className="border-2 border-[#E01020]/20 p-4 text-center">
            <span className="text-[#E01020] text-2xl">{step.icon}</span>
            <p
              className="text-white font-bold text-sm mt-2"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {step.title}
            </p>
            <p className="text-white/40 font-mono text-xs mt-1">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Points History */}
      <h2
        className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3 font-mono"
      >
        {t('pointsHistoryTitle')}
      </h2>

      {history.length === 0 ? (
        <div className="border-2 border-[#E01020]/20 p-8 text-center">
          <p className="text-white/40 font-mono text-sm">{t('noPoints')}</p>
          <p className="text-white/30 font-mono text-xs mt-1">
            {t('noPointsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="border border-[#E01020]/15 p-3 flex items-center justify-between">
              <div>
                <p className="text-white/70 font-mono text-sm">{reasonLabel(entry.reason)}</p>
                <p className="text-white/30 font-mono text-[10px]">{formatDate(entry.created_at)}</p>
              </div>
              <span
                className={`font-mono font-bold text-sm ${
                  entry.points > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {entry.points > 0 ? '+' : ''}{entry.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
