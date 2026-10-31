import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getActiveDeals } from '@/lib/deals';
import DealCard from '@/components/DealCard';
import DealCarousel from '@/components/DealCarousel';

export default function HeroBlackFridayDeals() {
  const t = useTranslations('blackFriday');
  const deals = getActiveDeals();
  if (!deals.length) return null;

  return (
    <section id="early-black-friday" aria-labelledby="black-friday-heading" className="border border-amber-300/30 bg-black/75 p-3 shadow-[0_0_40px_rgba(251,191,36,0.08)] backdrop-blur-sm sm:p-4">
      <DealCarousel heading={<h2 id="black-friday-heading" className="font-display text-3xl uppercase leading-none text-amber-300">{t('campaign')}</h2>}>
        {deals.map((deal) => (
          <li key={deal.slug} className="w-[92%] shrink-0 snap-start lg:w-full">
            <DealCard deal={deal} compact />
          </li>
        ))}
      </DealCarousel>
      <Link href="/deals" className="flex min-h-11 items-center justify-between gap-4 border-t border-amber-300/20 px-1 pt-3 font-ui text-sm font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
        {t('shopAll')} <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
