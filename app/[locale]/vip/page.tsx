'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const PERKS = [
  { key: 'products', icon: '◉' },
  { key: 'install', icon: '⚙' },
  { key: 'diagnostics', icon: '🔧' },
  { key: 'checkups', icon: '✓' },
  { key: 'priority', icon: '★' },
  { key: 'support', icon: '☎' },
  { key: 'deals', icon: '%' },
  { key: 'early', icon: '⚡' },
] as const;

export default function VipPage() {
  const t = useTranslations('vipPage');
  const { user } = useAuth();

  // Signed-in users go straight to the membership tab (join lives there);
  // guests are sent through signup first so the membership lands on an account.
  const ctaHref = user
    ? ('/account/membership' as const)
    : ('/account/signup' as const);

  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Hero */}
        <AnimateOnScroll animation="fade-up">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-[#E01020] shadow-[0_0_10px_#e60012]" />
              <span className="font-mono text-white/60 font-bold tracking-[0.4em] uppercase text-xs">
                {t('kicker')}
              </span>
              <div className="w-12 h-[2px] bg-[#E01020] shadow-[0_0_10px_#e60012]" />
            </div>
            <h1 className="font-display text-chrome uppercase leading-[0.9] tracking-tight text-[clamp(2.5rem,7vw,5.5rem)] mb-4">
              {t('heading')}
            </h1>
            <p className="font-oxanium text-xl md:text-2xl text-[#E01020] font-bold uppercase tracking-widest mb-6">
              {t('slogan')}
            </p>
            <div className="font-oxanium font-bold text-5xl text-white">
              $199<span className="text-white/40 text-xl font-mono"> {t('perYear')}</span>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Perks grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PERKS.map((perk, i) => (
            <AnimateOnScroll key={perk.key} animation="fade-up" delay={0.05 * i}>
              <div className="border border-[#E01020]/30 hover:border-[#E01020]/70 transition-colors p-6 h-full bg-white/[0.02]">
                <div className="text-[#E01020] text-2xl mb-3">{perk.icon}</div>
                <div className="font-oxanium font-bold text-white uppercase tracking-wide text-sm mb-2">
                  {t(`${perk.key}Title`)}
                </div>
                <div className="font-mono text-white/60 text-xs leading-relaxed">
                  {t(`${perk.key}Desc`)}
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Fine print */}
        <AnimateOnScroll animation="fade-in">
          <p className="text-white/30 font-mono text-[11px] leading-relaxed text-center max-w-3xl mx-auto mb-12">
            {t('finePrint')}
          </p>
        </AnimateOnScroll>

        {/* CTA */}
        <AnimateOnScroll animation="fade-up">
          <div className="text-center">
            <Link
              href={ctaHref}
              className="btn-glow inline-block px-12 py-5 text-base font-bold tracking-[0.2em] uppercase text-white font-oxanium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {t('cta')}
            </Link>
            <p className="text-white/40 font-mono text-xs mt-4">{t('ctaSub')}</p>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
