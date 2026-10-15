import { useTranslations } from 'next-intl';

export default function VipAfterHours() {
  const t = useTranslations('vipAfterHours');

  return (
    <section aria-labelledby="vip-after-hours-heading" className="border border-[#E01020]/40 bg-gradient-to-br from-[#E01020]/10 to-black p-6 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <svg className="h-6 w-6 shrink-0 text-[#E01020]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-white/70">{t('eyebrow')}</p>
      </div>
      <h2 id="vip-after-hours-heading" className="font-display text-3xl uppercase leading-tight text-white md:text-4xl">
        {t('heading')}
      </h2>
      <p className="mt-2 font-oxanium text-lg font-bold text-white">{t('hours')}</p>
      <p className="mt-3 max-w-2xl font-ui text-lg leading-relaxed text-chrome-300">{t('details')}</p>
      <a
        href="tel:+15707304433"
        className="mt-5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#E01020] py-2 font-ui font-bold text-white transition-colors hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
      >
        <span>{t('cta')}</span>
        <span className="whitespace-nowrap">(570) 730-4433</span>
      </a>
    </section>
  );
}
