'use client';

import { Link } from '@/i18n/navigation';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { useTranslations } from 'next-intl';

const brands = [
  { name: 'JBL', image: '/images/brands/stroudsburg_jbl.avif' },
  { name: 'Kicker', image: '/images/brands/stroundsburg_kicker.avif' },
  { name: 'Pioneer', image: '/images/brands/stroudsburg_pioneer.avif' },
  { name: 'Compustar', image: '/images/brands/stroudsburg_compustar.avif' },
  { name: 'Sony', image: '/images/brands/stroudsburg_sony.avif' },
  { name: 'PRV Audio', image: '/images/brands/stroudsburg_prv.avif' },
  { name: 'Drone Mobile', image: '/images/brands/stroudsburg_drone.avif' },
  { name: 'iDatalink', image: '/images/brands/stroudsburg_idatalink.avif' },
  { name: 'Elite Audio', image: '/images/brands/stroudsburg_elite.avif' },
  { name: 'Stinger', image: '/images/brands/stroudsburg_s.avif' },
];

export default function CarAudioPage() {
  const t = useTranslations('carAudioPage');

  const services = [
    {
      title: t('speakers'),
      description: t('speakersDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5.586v12.828a1 1 0 01-1.707.707L5.586 15z" />
        </svg>
      ),
    },
    {
      title: t('subwoofers'),
      description: t('subwoofersDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
    },
    {
      title: t('amplifiers'),
      description: t('amplifiersDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: t('headUnits'),
      description: t('headUnitsDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
          <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        </svg>
      ),
    },
    {
      title: t('soundDeadening'),
      description: t('soundDeadeningDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9.172 15.828a5 5 0 010-7.656m5.656 0a5 5 0 010 7.656M12 12h.01" />
        </svg>
      ),
    },
    {
      title: t('bluetooth'),
      description: t('bluetoothDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
        </svg>
      ),
    },
  ];

  const whyPro = [
    {
      title: t('properWiring'),
      description: t('properWiringDesc'),
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: t('warrantySafe'),
      description: t('warrantySafeDesc'),
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: t('tunedPerfection'),
      description: t('tunedPerfectionDesc'),
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
  ];

  const faqs = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
    { question: t('faq5Q'), answer: t('faq5A') },
    { question: t('faq6Q'), answer: t('faq6A') },
  ];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Car Audio Installation',
    description:
      'Expert car audio installation including speakers, subwoofers, amplifiers, head units, and sound deadening in Stroudsburg, PA.',
    provider: {
      '@type': 'AutoRepair',
      name: 'Next Level Audio',
      telephone: '+1-570-730-4433',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Stroudsburg',
        addressRegion: 'PA',
        postalCode: '18360',
        addressCountry: 'US',
      },
    },
    areaServed: {
      '@type': 'City',
      name: 'Stroudsburg',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="text-[#E01020] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('location')}
              </p>
              <h1
                className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('heroTitle')}
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-xl font-mono leading-relaxed mb-8">
                {t('heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-8 py-4 font-semibold text-base hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button text-center"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  {t('getFreeQuote')}
                </Link>
                <Link
                  href="tel:+15707304433"
                  className="inline-block border-2 border-[#E01020]/50 bg-black/40 text-[#E01020] px-8 py-4 font-semibold text-base hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button text-center"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  {t('callUs')}
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden border-2 border-[#E01020]/30 neon-border-soft">
                <img
                  src="/images/services/car-audio.png"
                  alt="Custom car audio installation in Stroudsburg, PA"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Breakdown */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('whatWeInstall')}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
                {t('whatWeInstallDesc')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <AnimateOnScroll key={service.title} animation="fade-up" delay={index * 0.1}>
                <div className="bg-black border-2 border-[#E01020]/30 p-8 hover:border-[#E01020] transition-all duration-300 transform hover:-translate-y-2 neon-border-soft h-full">
                  <div className="text-[#E01020] mb-4 neon-glow-soft">
                    {service.icon}
                  </div>
                  <h3
                    className="text-xl font-bold text-[#E01020] mb-3 neon-glow-soft"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-white/70 font-mono text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('brandsWeTrust')}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
                {t('brandsWeTrustDesc')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {brands.map((brand, index) => (
              <AnimateOnScroll key={brand.name} animation="scale-up" delay={index * 0.05}>
                <div className="bg-black border-2 border-[#E01020]/30 p-4 flex items-center justify-center hover:border-[#E01020] hover:bg-[#E01020]/5 transition-all duration-300 neon-border-soft aspect-[3/2]">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="max-h-20 w-full object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                  />
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Why Professional Installation */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('whyProfessional')}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
                {t('whyProfessionalDesc')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyPro.map((item, index) => (
              <AnimateOnScroll key={item.title} animation="fade-up" delay={index * 0.15}>
                <div className="text-center p-8 border-2 border-[#E01020]/30 hover:border-[#E01020] transition-all duration-300 neon-border-soft h-full">
                  <div className="text-[#E01020] mb-4 flex justify-center neon-glow-soft">
                    {item.icon}
                  </div>
                  <h3
                    className="text-xl font-bold text-[#E01020] mb-4 neon-glow-soft"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/70 font-mono text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center max-w-4xl mx-auto">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('servingPocono')}
              </h2>
              <p className="text-white/80 text-lg font-mono leading-relaxed mb-8">
                {t('servingPoconoDesc')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  'Stroudsburg',
                  'East Stroudsburg',
                  'Tannersville',
                  'Bartonsville',
                  'Mount Pocono',
                  'Scotrun',
                  'Tobyhanna',
                  'Pocono Summit',
                  'Marshalls Creek',
                  'Delaware Water Gap',
                  'Brodheadsville',
                  'Monroe County',
                ].map((area) => (
                  <span
                    key={area}
                    className="px-4 py-2 border border-[#E01020]/30 text-white/80 font-mono text-sm hover:border-[#E01020] hover:text-[#E01020] transition-colors"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('faqTitle')}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
                {t('faqDesc')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <AnimateOnScroll key={index} animation="fade-up" delay={index * 0.08}>
                <details className="group border-2 border-[#E01020]/30 hover:border-[#E01020]/60 transition-colors bg-black">
                  <summary
                    className="flex items-center justify-between px-6 py-5 cursor-pointer list-none"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    <span className="text-[#E01020] font-bold tracking-wide text-sm md:text-base pr-4">
                      {faq.question}
                    </span>
                    <svg
                      className="w-5 h-5 text-white/60 shrink-0 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 border-t border-[#E01020]/10 pt-4">
                    <p className="text-white/70 font-mono text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimateOnScroll animation="scale-up">
            <h2
              className="text-4xl md:text-7xl font-bold mb-6 neon-glow"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {t('upgradeSound')}
            </h2>
            <p className="text-xl md:text-2xl text-[#E01020] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
              {t('upgradeDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-10 py-5 font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('getFreeQuote')}
              </Link>
              <Link
                href="tel:+15707304433"
                className="inline-block border-2 border-[#E01020]/50 bg-black/40 backdrop-blur-sm text-[#E01020] px-10 py-5 font-semibold text-lg hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {t('callUs')}
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
