import { useTranslations } from 'next-intl';
import { formatDealPrice, type Deal } from '@/lib/deals';

export default function DealPrice({ deal }: { deal: Deal }) {
  const t = useTranslations('blackFriday');

  return (
    <div>
      {deal.originalPriceCents !== undefined && (
        <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-base">
          <span className="text-white/55">
            {t('was')} <del>{formatDealPrice(deal.originalPriceCents)}</del>
          </span>
          <span className="font-bold text-amber-300">
            {t('saveAmount', { amount: formatDealPrice(deal.originalPriceCents - deal.priceCents) })}
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-oxanium text-4xl font-bold tracking-tight text-white">{formatDealPrice(deal.priceCents)}</span>
        <span className="font-ui text-base font-semibold text-white/70">{t(deal.installationIncluded ? 'installed' : 'productOnly')}</span>
      </div>
    </div>
  );
}
