import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function MobileInterlockBanner() {
  const t = useTranslations('mobileInterlock');

  return (
    <section
      id="mobile-interlock"
      aria-labelledby="mobile-interlock-heading"
      className="scroll-mt-36 border-y border-white/10 bg-[#0d1014]"
    >
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 lg:grid-cols-[180px_minmax(0,1fr)_260px] lg:items-center lg:px-12">
        <div className="flex flex-wrap items-center gap-5 lg:flex-col lg:items-start">
          <Image
            src="/images/brands/intoxalock-logo.svg"
            alt="Intoxalock"
            width={207}
            height={59}
            className="h-auto w-44"
          />
          <span className="border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-ui text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            {t('comingSoon')}
          </span>
        </div>

        <div>
          <h2 id="mobile-interlock-heading" className="mb-2 font-display text-3xl uppercase leading-tight text-white md:text-4xl">
            {t('heading')}
          </h2>
          <p className="font-ui text-lg leading-relaxed text-chrome-100">{t('description')}</p>
          <p className="mt-2 font-ui text-base leading-relaxed text-chrome-300">{t('serviceArea')}</p>
        </div>

        <div>
          {/* Keep payments unavailable until the service and its payment link are approved. */}
          <button
            type="button"
            disabled
            aria-describedby="mobile-interlock-status"
            className="w-full cursor-not-allowed border border-white/20 bg-white/5 px-5 py-3 font-ui text-sm font-bold uppercase tracking-wider text-white/60"
          >
            {t('paymentCta')}
          </button>
          <p id="mobile-interlock-status" className="mt-3 font-ui text-sm leading-relaxed text-chrome-300">
            {t('availability')}
          </p>
        </div>
      </div>
    </section>
  );
}
