import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getActiveDeals } from '@/lib/deals';
import DealCard from '@/components/DealCard';
import DealCarousel from '@/components/DealCarousel';

export default function EarlyBlackFridayDeals({ standalone = false }: { standalone?: boolean }) {
  const t = useTranslations('blackFriday');
  const deals = getActiveDeals();
  if (!deals.length) return null;
  const Heading = standalone ? 'h1' : 'h2';

  return (
    <section id="early-black-friday" aria-labelledby="black-friday-heading" className="relative scroll-mt-40 overflow-hidden border-y border-amber-300/25 bg-[#080808] py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.13),transparent_65%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12">
        <div className="mb-9 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 font-ui text-xs font-bold uppercase tracking-[0.3em] text-amber-300">{t('eyebrow')}</p>
            <Heading id="black-friday-heading" className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.9] tracking-tight text-white">
              <span className="text-amber-300">{t('early')}</span><br />{t('blackFriday')}
            </Heading>
            <p className="mt-5 max-w-xl font-ui text-lg leading-relaxed text-chrome-300">{t('intro')}</p>
          </div>
          {!standalone && (
            <Link href="/deals" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-5 self-start bg-amber-300 px-7 py-4 font-ui text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black">
              {t('shopAll')} <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
        <DealCarousel>
          {deals.map((deal) => (
            <li key={deal.slug} className="w-[86%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)]">
              <DealCard deal={deal} />
            </li>
          ))}
        </DealCarousel>
        <p className="mt-4 font-ui text-sm leading-relaxed text-chrome-300">{t('compatibility')}</p>
      </div>
    </section>
  );
}
