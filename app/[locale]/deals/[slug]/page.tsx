import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getDeal } from '@/lib/deals';
import DealPrice from '@/components/DealPrice';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const deal = getDeal(slug);
  if (!deal) notFound();
  const t = await getTranslations({ locale, namespace: 'blackFriday' });
  const url = `${locale === 'es' ? '/es' : ''}/deals/${deal.slug}`;
  const title = `${deal.name} | ${t('campaign')} | Next Level Audio`;
  const description = t(`products.${deal.copyKey}.summary`);
  return {
    title,
    description,
    alternates: { canonical: url, languages: { en: `/deals/${deal.slug}`, es: `/es/deals/${deal.slug}` } },
    openGraph: { title, description, url, images: [{ url: deal.image, width: deal.imageWidth, height: deal.imageHeight, alt: deal.name }] },
  };
}

export default async function DealPage({ params }: Props) {
  const { locale, slug } = await params;
  const deal = getDeal(slug);
  if (!deal) notFound();
  const t = await getTranslations({ locale, namespace: 'blackFriday' });
  const features = t.raw(`products.${deal.copyKey}.features`) as string[];

  return (
    <div className="min-h-screen bg-black pt-36 pb-20 md:pt-40">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <Link href="/deals" className="mb-8 inline-flex items-center gap-3 py-2 font-ui text-sm font-bold text-amber-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
          <span aria-hidden="true">←</span> {t('backToDeals')}
        </Link>
        <div className="grid gap-9 lg:grid-cols-2 lg:gap-14">
          <div className="relative flex aspect-square items-center justify-center self-start border border-white/15 bg-white p-6">
            <Image src={deal.image} alt={deal.name} width={deal.imageWidth} height={deal.imageHeight} sizes="(max-width: 1024px) 100vw, 540px" priority className="h-full w-full object-contain" />
            {deal.discountPercent && <span className="absolute top-0 left-0 bg-amber-300 px-5 py-3 font-ui text-sm font-bold uppercase text-black">{t('percentOff', { percent: deal.discountPercent })}</span>}
          </div>
          <div>
            <p className="mb-4 font-ui text-xs font-bold uppercase tracking-[0.25em] text-amber-300">{t('campaign')}</p>
            <h1 className="font-display text-5xl uppercase leading-none text-white md:text-6xl">{deal.name}</h1>
            <p className="mt-3 font-mono text-xs text-white/50">{t('model', { model: deal.model })}</p>
            <p className="mt-5 mb-7 font-ui text-lg leading-relaxed text-chrome-300">{t(`products.${deal.copyKey}.description`)}</p>
            <DealPrice deal={deal} />
            <p className="mt-3 font-ui text-sm text-amber-300">{t(deal.installationIncluded ? 'installationIncluded' : 'installationNotIncluded')}</p>
            <ul className="my-7 space-y-3 border-y border-white/15 py-6">
              {features.map((feature) => <li key={feature} className="flex gap-3 font-ui text-base text-chrome-300"><span aria-hidden="true" className="text-amber-300">✓</span>{feature}</li>)}
            </ul>
            <p className="mb-5 font-ui text-sm leading-relaxed text-chrome-300">{t('compatibility')}</p>
            <a href="tel:+15707304433" className="flex min-h-12 flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-300 px-6 py-4 font-ui text-base font-bold text-black transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black">
              <span>{t('callToBook')}</span> <span className="whitespace-nowrap">(570) 730-4433</span>
            </a>
            <p className="mt-4 font-ui text-sm leading-relaxed text-white/60">{t('mentionOffer', { name: deal.name })}</p>
            {deal.copyKey === 'csx5300s' && <p className="mt-4 font-ui text-sm leading-relaxed text-white/60">{t('dronePlan')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
