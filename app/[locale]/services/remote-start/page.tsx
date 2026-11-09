import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const phoneHref = 'tel:+15707304433';
const directionsHref = 'https://www.google.com/maps/dir/?api=1&destination=944+North+9th+Street+Stroudsburg+PA+18360';
const inlineLink = 'font-semibold text-white underline decoration-electric-red underline-offset-4 hover:text-electric-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red';
const sectionContainer = 'mx-auto max-w-[1200px] px-6 lg:px-12';
type CopyItem = { title: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'remoteStartPage' });
  const path = '/services/remote-start';
  const url = `${locale === 'es' ? '/es' : ''}${path}`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: url, languages: { en: path, es: `/es${path}` } },
    openGraph: {
      title: t('metaTitle'), description: t('metaDescription'), url,
      siteName: 'Next Level Audio', type: 'website', locale: locale === 'es' ? 'es_US' : 'en_US',
      images: [{ url: '/images/services/remote-start.webp', alt: t('imageAlt') }],
    },
    twitter: { card: 'summary_large_image', title: t('metaTitle'), description: t('metaDescription'), images: ['/images/services/remote-start.webp'] },
  };
}

export default async function RemoteStartPage() {
  const t = await getTranslations('remoteStartPage');
  const steps = t.raw('steps') as CopyItem[];
  const benefits = t.raw('benefits') as CopyItem[];
  const reasons = t.raw('reasons') as CopyItem[];
  const areas = t.raw('areas') as string[];
  const faqs = t.raw('faqs') as { question: string; answer: string }[];
  const copy = (key: string) => t.rich(key, {
    phone: (chunks) => <a href={phoneHref} className={inlineLink}>{chunks}</a>,
    message: (chunks) => <Link href="/contact" className={inlineLink}>{chunks}</Link>,
    reviews: (chunks) => <Link href="/#reviews-heading" className={inlineLink}>{chunks}</Link>,
  });
  const packageRows = [
    ['system', 'systemValue'], ['keyFob', 'included'], ['warranty', 'warrantyValue'],
    ['installation', 'installationValue'], ['where', 'whereValue'], ['book', 'bookValue'],
  ];

  return (
    <div className="bg-black pt-32 lg:pt-36">
      <div id="remote-start-mobile-call" className="sticky top-32 z-40 border-y border-electric-red/30 bg-black/95 px-6 py-2 backdrop-blur-md sm:top-28 md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <span className="font-ui text-sm font-bold text-white">{t('startingPrice')}</span>
          <a href={phoneHref} className="bg-electric-red px-4 py-2 text-center font-ui text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <span className="block">{t('callToBook')}</span>
            <span className="block whitespace-nowrap">{t('phone')}</span>
          </a>
        </div>
      </div>

      <section aria-labelledby="remote-start-title" className="border-b border-white/10 py-10 md:py-16">
        <div className={sectionContainer}>
          <Link href="/services" className="mb-8 inline-flex items-center gap-2 py-2 font-ui text-sm text-chrome-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red">
            <span aria-hidden="true">←</span>{t('allServices')}
          </Link>
          <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="mb-4 font-ui text-xs font-bold uppercase tracking-[0.2em] text-electric-red">{t('eyebrow')}</p>
              <h1 id="remote-start-title" className="font-display text-5xl uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl">{t('title')}</h1>
              <p className="mt-6 font-ui text-2xl font-semibold leading-snug text-electric-red">{t('tagline')}</p>
              <p className="mt-5 font-ui text-lg leading-relaxed text-chrome-300">{t('intro')}</p>
              <p className="mt-5 font-ui text-lg leading-relaxed text-white">{copy('offerIntro')}</p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a href={phoneHref} className="btn-glow inline-flex min-h-12 items-center justify-center px-6 py-3 font-ui font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{t('callToBook')} · {t('phone')}</a>
                <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center border border-white/30 px-6 py-3 font-ui font-semibold text-white hover:border-electric-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red">{t('directions')}</a>
              </div>
            </div>
            <div className="relative overflow-hidden border border-white/15 bg-[#111]">
              <Image src="/images/services/remote-start.webp" alt={t('imageAlt')} width={1408} height={768} sizes="(max-width: 1024px) 100vw, 550px" priority className="aspect-[4/3] w-full object-cover" />
              <div className="border-t border-electric-red/30 bg-[#101010] px-6 py-5">
                <p className="font-ui text-xs font-bold uppercase tracking-widest text-chrome-300">{t('package.systemValue')}</p>
                <p className="mt-1 font-oxanium text-3xl font-bold text-white">{t('startingPrice')}</p>
                <p className="mt-2 font-ui text-sm text-chrome-300">{t('package.installationValue')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="remote-start-package" className="bg-[#0b0c0e] py-14 md:py-20">
        <div className={`${sectionContainer} grid gap-9 md:grid-cols-[1fr_1.4fr] md:gap-14`}>
          <div>
            <h2 id="remote-start-package" className="font-display text-4xl uppercase leading-none text-white md:text-5xl">{t('package.heading')}</h2>
            <p className="mt-5 font-oxanium text-3xl font-bold text-electric-red">{t('startingPrice')}</p>
            <p className="mt-5 font-ui text-lg leading-relaxed text-chrome-300">{t('package.priceNote')}</p>
          </div>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {packageRows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-4 font-ui text-lg sm:grid-cols-[7rem_1fr] sm:gap-4">
                <dt className="font-semibold text-chrome-300">{t(`package.${label}`)}</dt>
                <dd className="text-white">{copy(`package.${value}`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="remote-start-process" className="border-y border-white/10 py-14 md:py-20">
        <div className={sectionContainer}>
          <h2 id="remote-start-process" className="font-display text-4xl uppercase leading-none text-white md:text-5xl">{t('processTitle')}</h2>
          <p className="mt-4 font-ui text-lg text-chrome-300">{t('processIntro')}</p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="border border-white/15 bg-[#101010] p-6">
                <span aria-hidden="true" className="font-display text-5xl text-electric-red">0{index + 1}</span>
                <h3 className="mt-3 font-ui text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 font-ui text-lg leading-relaxed text-chrome-300">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-7 max-w-3xl font-ui text-lg leading-relaxed text-chrome-300">{t('processOutro')}</p>
        </div>
      </section>

      <section aria-labelledby="remote-start-winter" className="py-14 md:py-20">
        <div className={`${sectionContainer} grid gap-10 md:grid-cols-2 md:gap-14`}>
          <div>
            <h2 id="remote-start-winter" className="font-display text-4xl uppercase leading-none text-white md:text-5xl">{t('winterTitle')}</h2>
            <p className="mt-5 font-ui text-lg leading-relaxed text-chrome-300">{t('winterIntro')}</p>
          </div>
          <ul className="space-y-7">
            {benefits.map((benefit) => <li key={benefit.title} className="border-l-2 border-electric-red pl-5"><h3 className="font-ui text-xl font-bold text-white">{benefit.title}</h3><p className="mt-2 font-ui text-lg leading-relaxed text-chrome-300">{benefit.body}</p></li>)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="remote-start-why" className="border-y border-white/10 bg-[#0b0c0e] py-14 md:py-20">
        <div className={sectionContainer}>
          <h2 id="remote-start-why" className="max-w-3xl font-display text-4xl uppercase leading-none text-white md:text-5xl">{t('whyTitle')}</h2>
          <ul className="mt-9 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {reasons.map((reason, index) => <li key={reason.title}><h3 className="font-ui text-xl font-bold text-white">{reason.title}</h3><p className="mt-2 font-ui text-lg leading-relaxed text-chrome-300">{copy(`reasons.${index}.body`)}</p></li>)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="remote-start-area" className="py-14 md:py-20">
        <div className={sectionContainer}>
          <h2 id="remote-start-area" className="font-display text-4xl uppercase leading-none text-white md:text-5xl">{t('areaTitle')}</h2>
          <p className="mt-5 max-w-3xl font-ui text-lg leading-relaxed text-chrome-300">{t('areaIntro')}</p>
          <ul className="my-7 flex flex-wrap gap-3">{areas.map((area) => <li key={area} className="border border-white/20 px-4 py-2 font-ui text-base text-white">{area}</li>)}</ul>
          <p className="max-w-3xl font-ui text-lg leading-relaxed text-chrome-300">{copy('areaOutro')}</p>
        </div>
      </section>

      <section aria-labelledby="remote-start-faq" className="border-y border-white/10 bg-[#0b0c0e] py-14 md:py-20">
        <div className={sectionContainer}>
          <h2 id="remote-start-faq" className="font-display text-4xl uppercase leading-none text-white md:text-5xl">{t('faqTitle')}</h2>
          <div className="mt-8 divide-y divide-white/15 border-y border-white/15">
            {faqs.map((faq, index) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-ui text-xl font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red">
                  {faq.question}<span aria-hidden="true" className="shrink-0 text-2xl text-electric-red transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-4xl pb-6 font-ui text-lg leading-relaxed text-chrome-300">{copy(`faqs.${index}.answer`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="remote-start-book" className="py-14 md:py-20">
        <div className={sectionContainer}>
          <div className="border border-electric-red/40 bg-[radial-gradient(ellipse_at_top_right,rgba(224,16,32,0.13),transparent_70%)] p-6 md:p-10">
            <h2 id="remote-start-book" className="font-display text-4xl uppercase leading-none text-white md:text-5xl">{t('bookingTitle')}</h2>
            <p className="mt-5 font-ui text-2xl font-semibold text-white">{t('bookingTagline')}</p>
            <p className="mt-3 max-w-3xl font-ui text-lg leading-relaxed text-chrome-300">{t('bookingOffer')}</p>
            <div className="my-7 flex flex-wrap gap-4">
              <a href={phoneHref} className="btn-glow inline-flex min-h-12 items-center justify-center px-6 py-3 font-ui font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{t('callToBook')} · {t('phone')}</a>
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center border border-white/30 px-6 py-3 font-ui font-semibold text-white hover:border-electric-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red">{t('sendMessage')}</Link>
            </div>
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className={`${inlineLink} font-ui text-base`}>{t('address')}</a>
            <p className="mt-3 font-ui text-base text-chrome-300">{t('hours')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
