import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Deal } from '@/lib/deals';
import DealPrice from '@/components/DealPrice';

export default function DealCard({ deal, compact = false }: { deal: Deal; compact?: boolean }) {
  const t = useTranslations('blackFriday');

  return (
    <article className="h-full border border-white/15 bg-[#101010] transition-colors hover:border-amber-300/60">
      <Link
        href={`/deals/${deal.slug}`}
        className="group flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        aria-label={t('viewNamedDeal', { name: deal.name })}
      >
        <div className={`relative flex items-center justify-center bg-white ${compact ? 'h-44 p-4 sm:h-48' : 'h-56 p-5 sm:h-64'}`}>
          <Image
            src={deal.image}
            alt={deal.name}
            width={deal.imageWidth}
            height={deal.imageHeight}
            sizes={compact ? '(max-width: 640px) 85vw, 448px' : '(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 480px'}
            className="h-full w-full object-contain transition-transform duration-300 motion-safe:group-hover:scale-105"
          />
          <span className="absolute left-0 top-0 bg-amber-300 px-4 py-2 font-ui text-xs font-bold uppercase tracking-wider text-black">
            {deal.discountPercent ? t('percentOff', { percent: deal.discountPercent }) : t('specialPrice')}
          </span>
        </div>
        <div className={`flex flex-1 flex-col ${compact ? 'p-4' : 'p-6 sm:p-7'}`}>
          <p className="mb-2 font-ui text-xs font-bold uppercase tracking-[0.2em] text-amber-300">{t('remoteStart')}</p>
          <h3 className={`font-display text-3xl uppercase leading-tight text-white ${compact ? '' : 'sm:text-4xl'}`}>{deal.name}</h3>
          {!compact && <p className="mt-2 mb-6 font-ui text-base leading-relaxed text-chrome-300">{t(`products.${deal.copyKey}.summary`)}</p>}
          <div className={`mt-auto ${compact ? 'pt-3' : ''}`}>
            <DealPrice deal={deal} />
            <span className={`flex items-center justify-between border-t border-white/15 font-ui text-sm font-bold uppercase tracking-wider text-amber-300 ${compact ? 'mt-4 pt-3' : 'mt-6 pt-4'}`}>
              {t('viewDeal')}
              <span aria-hidden="true">↗</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
