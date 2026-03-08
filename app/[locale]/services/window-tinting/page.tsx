'use client';

import { Link } from '@/i18n/navigation';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { useTranslations } from 'next-intl';

export default function WindowTintingPage() {
  const t = useTranslations('windowTintingPage');

  const benefits = [
    {
      title: t('uvProtection'),
      stat: '99%',
      description: t('uvProtectionDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: t('heatRejection'),
      stat: '60%+',
      description: t('heatRejectionDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
    },
    {
      title: t('glareReduction'),
      stat: '95%',
      description: t('glareReductionDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: t('privacySecurity'),
      stat: '100%',
      description: t('privacySecurityDesc'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  const filmTypes = [
    {
      name: t('ceramicFilm'),
      tier: t('ceramicTier'),
      heatRejection: t('ceramicHeat'),
      uvBlock: '99%',
      warranty: t('lifetime'),
      description: t('ceramicDesc'),
      features: [t('ceramicF1'), t('ceramicF2'), t('ceramicF3'), t('ceramicF4')],
    },
    {
      name: t('carbonFilm'),
      tier: t('carbonTier'),
      heatRejection: t('carbonHeat'),
      uvBlock: '99%',
      warranty: t('lifetime'),
      description: t('carbonDesc'),
      features: [t('carbonF1'), t('carbonF2'), t('carbonF3'), t('carbonF4')],
    },
    {
      name: t('dyedFilm'),
      tier: t('dyedTier'),
      heatRejection: t('dyedHeat'),
      uvBlock: '99%',
      warranty: t('fiveYears'),
      description: t('dyedDesc'),
      features: [t('dyedF1'), t('dyedF2'), t('dyedF3'), t('dyedF4')],
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
    name: 'Window Tinting',
    description:
      'Professional ceramic and carbon window film installation for vehicles in Stroudsburg, PA.',
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
                className="text-[#E01020] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft font-oxanium"
              >
                {t('location')}
              </p>
              <h1
                className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow font-oxanium"
              >
                {t('heroTitle')}
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-xl font-mono leading-relaxed mb-8">
                {t('heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-8 py-4 font-semibold text-base hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button text-center font-oxanium"
                >
                  {t('getFreeQuote')}
                </Link>
                <Link
                  href="tel:+15707304433"
                  className="inline-block border-2 border-[#E01020]/50 bg-black/40 text-[#E01020] px-8 py-4 font-semibold text-base hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button text-center font-oxanium"
                >
                  {t('callUs')}
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden border-2 border-[#E01020]/30 neon-border-soft">
                <img
                  src="/images/services/window-tints.webp"
                  alt="Professional window tinting on a vehicle in Stroudsburg, PA"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow font-oxanium"
              >
                {t('whyTint')}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
                {t('whyTintDesc')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <AnimateOnScroll key={benefit.title} animation="fade-up" delay={index * 0.1}>
                <div className="bg-black border-2 border-[#E01020]/30 p-8 hover:border-[#E01020] transition-all duration-300 transform hover:-translate-y-2 neon-border-soft h-full">
                  <div className="text-[#E01020] mb-4 neon-glow-soft">
                    {benefit.icon}
                  </div>
                  <div
                    className="text-3xl font-bold text-[#E01020] mb-2 neon-glow font-oxanium"
                  >
                    {benefit.stat}
                  </div>
                  <h3
                    className="text-lg font-bold text-[#E01020] mb-3 neon-glow-soft font-oxanium"
                  >
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 font-mono text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Film Types */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow font-oxanium"
              >
                {t('filmOptions')}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
                {t('filmOptionsDesc')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filmTypes.map((film, index) => (
              <AnimateOnScroll key={film.name} animation="fade-up" delay={index * 0.15}>
                <div className={`bg-black border-2 ${index === 0 ? 'border-[#E01020]' : 'border-[#E01020]/30'} overflow-hidden hover:border-[#E01020] transition-all duration-300 transform hover:-translate-y-2 neon-border-soft h-full flex flex-col`}>
                  {/* Tier badge */}
                  <div className={`px-6 py-3 ${index === 0 ? 'bg-[#E01020]/20' : 'bg-[#E01020]/5'} border-b-2 border-[#E01020]/30`}>
                    <span
                      className="text-xs font-bold text-[#E01020] tracking-widest font-oxanium"
                    >
                      {film.tier}
                    </span>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3
                      className="text-2xl font-bold text-[#E01020] mb-4 neon-glow-soft font-oxanium"
                    >
                      {film.name}
                    </h3>
                    <p className="text-white/70 font-mono text-sm leading-relaxed mb-6">
                      {film.description}
                    </p>

                    {/* Specs */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center border-b border-[#E01020]/10 pb-2">
                        <span className="text-white/60 font-mono text-xs uppercase tracking-wider">{t('heatRejectionLabel')}</span>
                        <span className="text-[#E01020] font-mono text-sm font-bold">{film.heatRejection}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#E01020]/10 pb-2">
                        <span className="text-white/60 font-mono text-xs uppercase tracking-wider">{t('uvBlockLabel')}</span>
                        <span className="text-[#E01020] font-mono text-sm font-bold">{film.uvBlock}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 font-mono text-xs uppercase tracking-wider">{t('warrantyLabel')}</span>
                        <span className="text-[#E01020] font-mono text-sm font-bold">{film.warranty}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mt-auto">
                      {film.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center text-white/80 font-mono text-sm">
                          <svg className="w-4 h-4 mr-2 text-[#E01020] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* PA Tint Laws */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="max-w-4xl mx-auto">
              <div className="bg-black border-2 border-[#E01020]/50 p-8 md:p-12 neon-border-soft">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-[#E01020] shrink-0 mt-1">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2
                      className="text-3xl md:text-4xl font-bold text-white mb-2 neon-glow font-oxanium"
                    >
                      {t('paLaws')}
                    </h2>
                    <p className="text-white/60 font-mono text-sm">
                      {t('paLawsDesc')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border border-[#E01020]/20 p-6">
                    <h3
                      className="text-[#E01020] font-bold mb-3 tracking-wider font-oxanium"
                    >
                      {t('sedans')}
                    </h3>
                    <ul className="space-y-2 text-white/80 font-mono text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-[#E01020] shrink-0">&#9656;</span>
                        <span>{t('windshieldRule')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E01020] shrink-0">&#9656;</span>
                        <span>{t('frontSides70')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E01020] shrink-0">&#9656;</span>
                        <span>{t('rearSides70')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E01020] shrink-0">&#9656;</span>
                        <span>{t('backWindshield70')}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border border-[#E01020]/20 p-6">
                    <h3
                      className="text-[#E01020] font-bold mb-3 tracking-wider font-oxanium"
                    >
                      {t('suvsVansTrucks')}
                    </h3>
                    <ul className="space-y-2 text-white/80 font-mono text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-[#E01020] shrink-0">&#9656;</span>
                        <span>{t('windshieldRule')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E01020] shrink-0">&#9656;</span>
                        <span>{t('frontSides70Short')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E01020] shrink-0">&#9656;</span>
                        <span>{t('rearSidesAny')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#E01020] shrink-0">&#9656;</span>
                        <span>{t('backWindshieldAny')}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-white/50 font-mono text-xs">
                  {t('medicalExemption')}
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center max-w-4xl mx-auto">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow font-oxanium"
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
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow font-oxanium"
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
                    className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-oxanium"
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
              className="text-4xl md:text-7xl font-bold mb-6 neon-glow font-oxanium"
            >
              {t('readyToTint')}
            </h2>
            <p className="text-xl md:text-2xl text-[#E01020] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
              {t('readyToTintDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-10 py-5 font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button font-oxanium"
              >
                {t('getFreeQuote')}
              </Link>
              <Link
                href="tel:+15707304433"
                className="inline-block border-2 border-[#E01020]/50 bg-black/40 backdrop-blur-sm text-[#E01020] px-10 py-5 font-semibold text-lg hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button font-oxanium"
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
