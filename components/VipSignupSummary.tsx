import { useTranslations } from 'next-intl';

/** Keep the offer visible while a customer creates or signs in to an account. */
export default function VipSignupSummary() {
  const t = useTranslations('vip');

  return (
    <section aria-labelledby="vip-signup-title" className="border-2 border-[#E01020]/40 bg-[#E01020]/5 p-5 mb-8">
      <h2 id="vip-signup-title" className="font-oxanium font-bold text-2xl text-white mb-4">
        {t('signupTitle')}
      </h2>
      <ul className="space-y-2 mb-5">
        {(['perk10Products', 'perk10Install', 'perkDiagnostics', 'perkCheckups', 'perkPriority', 'perkAfterHours', 'perkDeals'] as const).map((key) => (
          <li key={key} className="flex items-start gap-2 text-white/80 font-mono text-xs leading-relaxed">
            <span aria-hidden="true" className="text-[#E01020]">✓</span>
            {t(key)}
          </li>
        ))}
      </ul>
      <ol className="space-y-2 text-white font-mono text-sm border-t border-white/15 pt-4">
        <li>{t('signupStep')}</li>
        <li>{t('paymentStep')}</li>
      </ol>
      <p className="text-white/60 font-mono text-xs leading-relaxed mt-3">{t('signupPaymentNext')}</p>
      <p className="text-white/60 font-mono text-xs leading-relaxed mt-3">{t('paymentDetails')}</p>
    </section>
  );
}
