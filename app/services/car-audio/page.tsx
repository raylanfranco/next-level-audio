import type { Metadata } from 'next';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Car Audio Installation Stroudsburg PA | Custom Sound Systems | Next Level Audio',
  description:
    'Expert car audio installation in Stroudsburg, PA. Custom speakers, subwoofers, amplifiers, head units & sound deadening. Serving the Poconos & Monroe County.',
  openGraph: {
    title: 'Car Audio Installation Stroudsburg PA | Next Level Audio',
    description:
      'Expert car audio installation in Stroudsburg, PA. Speakers, subwoofers, amplifiers, head units & sound deadening.',
    url: 'https://nextlevelaudiopa.com/services/car-audio',
    siteName: 'Next Level Audio',
    images: [{ url: '/images/services/car-audio.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Audio Installation Stroudsburg PA | Next Level Audio',
    description:
      'Expert car audio installation in Stroudsburg, PA. Speakers, subwoofers, amplifiers & more.',
    images: ['/images/services/car-audio.png'],
  },
};

const services = [
  {
    title: 'SPEAKERS & COMPONENTS',
    description:
      'Upgrade from factory paper cones to high-quality component and coaxial speakers. We match the right speakers to your vehicle for maximum clarity and soundstage.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5.586v12.828a1 1 0 01-1.707.707L5.586 15z" />
      </svg>
    ),
  },
  {
    title: 'SUBWOOFERS & BASS',
    description:
      'Feel the music, not just hear it. From compact under-seat subs to custom-built enclosures, we deliver tight, clean bass that transforms your listening experience.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    title: 'AMPLIFIERS',
    description:
      'Power your speakers properly with a dedicated amplifier. We size, wire, and tune amplifiers for optimal performance without distortion or electrical strain.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'HEAD UNITS & RECEIVERS',
    description:
      'Modern head units with Apple CarPlay, Android Auto, touchscreen navigation, and HD radio. We integrate seamlessly with your vehicle\'s controls and display.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    title: 'SOUND DEADENING',
    description:
      'Eliminate road noise and rattles with professional sound deadening. We apply vibration-dampening material to doors, floors, and trunk to create a quieter cabin and tighter bass.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9.172 15.828a5 5 0 010-7.656m5.656 0a5 5 0 010 7.656M12 12h.01" />
      </svg>
    ),
  },
  {
    title: 'BLUETOOTH & INTEGRATION',
    description:
      'Add wireless audio streaming, hands-free calling, and steering wheel controls to any vehicle. We integrate modern tech without replacing your factory radio if you prefer.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
      </svg>
    ),
  },
];

const brands = [
  'JBL', 'Kicker', 'Pioneer', 'Kenwood', 'Alpine', 'Rockford Fosgate', 'Sony',
];

const whyPro = [
  {
    title: 'PROPER WIRING',
    description:
      'Incorrect wiring can cause shorts, blown fuses, or even fires. Our technicians follow factory wiring diagrams and use quality connectors — no cutting corners.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'WARRANTY-SAFE',
    description:
      'Professional installation preserves your vehicle\'s factory warranty. We use non-destructive methods and OEM-compatible harnesses whenever possible.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'TUNED TO PERFECTION',
    description:
      'We don\'t just install — we tune. Using a combination of ear and measurement tools, we dial in crossover points, gain levels, and time alignment so your system sounds its best.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

const faqs = [
  {
    question: 'How long does a car audio installation take?',
    answer:
      'It depends on the scope of work. A basic speaker swap can be done in 1-2 hours. A full system build — head unit, speakers, amplifier, subwoofer, and sound deadening — typically takes a full day. We\'ll give you a time estimate when you schedule your appointment.',
  },
  {
    question: 'Can you upgrade my factory speakers without replacing the head unit?',
    answer:
      'Absolutely. We can upgrade your factory speakers, add an amplifier, and even add a subwoofer while keeping your stock radio. We use line output converters and integration modules to work with factory systems, preserving features like steering wheel controls and backup cameras.',
  },
  {
    question: 'Do I need an amplifier?',
    answer:
      'If you want the best sound quality, yes. Factory head units typically produce 15-20 watts per channel — not enough to drive quality speakers to their full potential. An external amplifier delivers clean, distortion-free power. For subwoofers, an amplifier is essential.',
  },
  {
    question: 'What is sound deadening and do I need it?',
    answer:
      'Sound deadening is a vibration-dampening material applied to metal panels in your vehicle (doors, floor, trunk). It reduces road noise, eliminates rattles, and dramatically improves bass response. If you\'re investing in a quality audio system, sound deadening is one of the best upgrades you can make.',
  },
  {
    question: 'Do you offer financing on car audio installations?',
    answer:
      'Contact us about available payment options for larger projects. We\'ll work with you to find a solution that fits your budget. Call us at (570) 730-4433 to discuss your project.',
  },
  {
    question: 'Can you install car audio in any vehicle?',
    answer:
      'We work on all makes and models — cars, trucks, SUVs, Jeeps, UTVs, and boats. From a daily driver to a show car, we have the experience and tools to handle any installation. Some specialty vehicles may require additional parts or labor — we\'ll let you know upfront.',
  },
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

export default function CarAudioPage() {
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
                className="text-[#00A0E0] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                STROUDSBURG, PA &bull; POCONO REGION
              </p>
              <h1
                className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                CUSTOM CAR AUDIO INSTALLATION
              </h1>
              <p className="text-[#00A0E0]/80 text-lg md:text-xl max-w-xl font-mono leading-relaxed mb-8">
                From basic speaker upgrades to full custom builds, our experienced technicians deliver premium sound tailored to your vehicle and your budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-block bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-8 py-4 font-semibold text-base hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button text-center"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  GET A FREE QUOTE
                </Link>
                <Link
                  href="tel:+15707304433"
                  className="inline-block border-2 border-[#00A0E0]/50 bg-black/40 text-[#00A0E0] px-8 py-4 font-semibold text-base hover:border-[#00A0E0] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button text-center"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  CALL (570) 730-4433
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden border-2 border-[#00A0E0]/30 neon-border-soft">
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
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                WHAT WE INSTALL
              </h2>
              <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
                A full range of car audio services — from simple upgrades to complete custom builds
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <AnimateOnScroll key={service.title} animation="fade-up" delay={index * 0.1}>
                <div className="bg-black border-2 border-[#00A0E0]/30 p-8 hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 neon-border-soft h-full">
                  <div className="text-[#00A0E0] mb-4 neon-glow-soft">
                    {service.icon}
                  </div>
                  <h3
                    className="text-xl font-bold text-[#00A0E0] mb-3 neon-glow-soft"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-[#00A0E0]/70 font-mono text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                BRANDS WE TRUST
              </h2>
              <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
                We only install products from brands known for quality, reliability, and performance
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-5xl mx-auto">
            {brands.map((brand, index) => (
              <AnimateOnScroll key={brand} animation="scale-up" delay={index * 0.05}>
                <div className="bg-black border-2 border-[#00A0E0]/30 p-6 text-center hover:border-[#00A0E0] hover:bg-[#00A0E0]/5 transition-all duration-300 neon-border-soft">
                  <span
                    className="text-[#00A0E0] font-bold text-sm tracking-wider"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {brand}
                  </span>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Why Professional Installation */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                WHY PROFESSIONAL INSTALLATION?
              </h2>
              <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
                Don&apos;t risk your vehicle or your investment with a DIY job
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyPro.map((item, index) => (
              <AnimateOnScroll key={item.title} animation="fade-up" delay={index * 0.15}>
                <div className="text-center p-8 border-2 border-[#00A0E0]/30 hover:border-[#00A0E0] transition-all duration-300 neon-border-soft h-full">
                  <div className="text-[#00A0E0] mb-4 flex justify-center neon-glow-soft">
                    {item.icon}
                  </div>
                  <h3
                    className="text-xl font-bold text-[#00A0E0] mb-4 neon-glow-soft"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[#00A0E0]/70 font-mono text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center max-w-4xl mx-auto">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                SERVING THE POCONO REGION
              </h2>
              <p className="text-[#00A0E0]/80 text-lg font-mono leading-relaxed mb-8">
                Next Level Audio is the Pocono region&apos;s go-to shop for professional car audio installation. Whether you&apos;re upgrading a daily driver or building a competition system, we&apos;ve got you covered. Located in Stroudsburg, PA and serving all of Monroe County and beyond.
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
                    className="px-4 py-2 border border-[#00A0E0]/30 text-[#00A0E0]/80 font-mono text-sm hover:border-[#00A0E0] hover:text-[#00A0E0] transition-colors"
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
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
                Common questions about car audio installation
              </p>
            </div>
          </AnimateOnScroll>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <AnimateOnScroll key={index} animation="fade-up" delay={index * 0.08}>
                <details className="group border-2 border-[#00A0E0]/30 hover:border-[#00A0E0]/60 transition-colors bg-black">
                  <summary
                    className="flex items-center justify-between px-6 py-5 cursor-pointer list-none"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    <span className="text-[#00A0E0] font-bold tracking-wide text-sm md:text-base pr-4">
                      {faq.question}
                    </span>
                    <svg
                      className="w-5 h-5 text-[#00A0E0]/60 shrink-0 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 border-t border-[#00A0E0]/10 pt-4">
                    <p className="text-[#00A0E0]/70 font-mono text-sm leading-relaxed">
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
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimateOnScroll animation="scale-up">
            <h2
              className="text-4xl md:text-7xl font-bold mb-6 neon-glow"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              UPGRADE YOUR SOUND
            </h2>
            <p className="text-xl md:text-2xl text-[#00A0E0] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
              Ready for premium car audio? Contact us for a free consultation and quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-10 py-5 font-semibold text-lg hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                GET A FREE QUOTE
              </Link>
              <Link
                href="tel:+15707304433"
                className="inline-block border-2 border-[#00A0E0]/50 bg-black/40 backdrop-blur-sm text-[#00A0E0] px-10 py-5 font-semibold text-lg hover:border-[#00A0E0] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                CALL (570) 730-4433
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
