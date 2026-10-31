import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import EarlyBlackFridayDeals from '@/components/EarlyBlackFridayDeals';
import { getActiveDeals } from '@/lib/deals';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blackFriday' });
  const url = `${locale === 'es' ? '/es' : ''}/deals`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: url, languages: { en: '/deals', es: '/es/deals' } },
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), url },
  };
}

export default function DealsPage() {
  if (!getActiveDeals().length) notFound();
  return <div className="min-h-screen bg-black pt-32 md:pt-36"><EarlyBlackFridayDeals standalone /></div>;
}
