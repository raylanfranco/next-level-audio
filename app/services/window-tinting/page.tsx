import type { Metadata } from 'next';
import Link from 'next/link';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Window Tinting Stroudsburg PA | Ceramic & Carbon Film | Next Level Audio',
  description:
    'Professional window tinting in Stroudsburg, PA. Ceramic & carbon films with up to 99% UV protection and heat rejection. Serving the Poconos, East Stroudsburg, Tannersville & Monroe County.',
  openGraph: {
    title: 'Window Tinting Stroudsburg PA | Next Level Audio',
    description:
      'Professional window tinting in Stroudsburg, PA. Ceramic & carbon films with up to 99% UV protection and heat rejection.',
    url: 'https://nextlevelaudiopa.com/services/window-tinting',
    siteName: 'Next Level Audio',
    images: [{ url: '/images/services/window-tints.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Window Tinting Stroudsburg PA | Next Level Audio',
    description:
      'Professional window tinting in Stroudsburg, PA. Ceramic & carbon films with up to 99% UV protection.',
    images: ['/images/services/window-tints.png'],
  },
};

const benefits = [
  {
    title: 'UV PROTECTION',
    stat: '99%',
    description:
      'Our premium ceramic and carbon films block up to 99% of harmful UV rays, protecting your skin and preventing interior fading and cracking.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'HEAT REJECTION',
    stat: '60%+',
    description:
      'Keep your vehicle cool during hot Pocono summers. Our ceramic films reject over 60% of solar heat, reducing the load on your A/C and saving fuel.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    title: 'GLARE REDUCTION',
    stat: '95%',
    description:
      'Reduce blinding glare from sunlight and oncoming headlights for a safer, more comfortable drive on Route 80, I-380, and Pocono backroads.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'PRIVACY & SECURITY',
    stat: '100%',
    description:
      'Deter break-ins and keep valuables out of sight. Tinted windows add a layer of security and privacy whether you\'re parked downtown or at the trailhead.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const filmTypes = [
  {
    name: 'CERAMIC FILM',
    tier: 'PREMIUM',
    heatRejection: 'Up to 80%',
    uvBlock: '99%',
    warranty: 'Lifetime',
    description:
      'The gold standard in window film. Nano-ceramic technology delivers maximum heat rejection without interfering with electronics, GPS, or phone signals. Crystal-clear visibility with no metallic look.',
    features: ['Non-metallic — no signal interference', 'Color-stable — won\'t fade or purple', 'Optical clarity glass', 'Maximum heat rejection'],
  },
  {
    name: 'CARBON FILM',
    tier: 'MID-RANGE',
    heatRejection: 'Up to 50%',
    uvBlock: '99%',
    warranty: 'Lifetime',
    description:
      'Carbon-infused film with a matte finish that complements any vehicle. Excellent heat rejection at a mid-range price point. Will never fade or turn purple over time.',
    features: ['Matte finish — no mirror effect', 'Color-stable for life', 'Good heat rejection', 'Clean, factory look'],
  },
  {
    name: 'DYED FILM',
    tier: 'BUDGET',
    heatRejection: 'Up to 25%',
    uvBlock: '99%',
    warranty: '5 Years',
    description:
      'A solid entry-level option for privacy and style. Dyed films provide excellent glare reduction and a sleek appearance at the most affordable price point.',
    features: ['Most affordable option', 'Great for privacy', 'Solid glare reduction', 'Clean appearance'],
  },
];

const faqs = [
  {
    question: 'How long does window tinting take?',
    answer:
      'Most vehicles can be completed in 2-4 hours depending on the number of windows and the complexity of the installation. Full vehicle tints (all windows) typically take 3-4 hours. We recommend leaving your vehicle with us for the day for best results.',
  },
  {
    question: 'Is window tinting legal in Pennsylvania?',
    answer:
      'Yes, with restrictions. Pennsylvania law allows non-reflective tint on the top 3 inches of the windshield. Front side windows must allow at least 70% of light through (VLT). Rear side windows and the back windshield can be any darkness for SUVs, vans, and trucks. Sedans must maintain 70% VLT on all windows. Medical exemptions are available for certain conditions.',
  },
  {
    question: 'How long before I can roll down my windows after tinting?',
    answer:
      'We recommend waiting 3-5 days before rolling down your newly tinted windows. This allows the adhesive to fully cure and bond to the glass. In cooler weather (common in the Poconos during fall and winter), the curing process may take up to a week.',
  },
  {
    question: 'What\'s the difference between ceramic and carbon film?',
    answer:
      'Ceramic film uses nano-ceramic particles for superior heat rejection (up to 80%) and won\'t interfere with electronic signals. Carbon film uses carbon particles for a matte finish with good heat rejection (up to 50%). Both block 99% of UV rays and come with a lifetime warranty. Ceramic is the premium choice for maximum comfort; carbon is an excellent mid-range option.',
  },
  {
    question: 'Do you offer a warranty on window tinting?',
    answer:
      'Yes. Our ceramic and carbon films come with a lifetime warranty against bubbling, peeling, cracking, and discoloration. Our dyed films carry a 5-year warranty. If anything goes wrong with your tint due to materials or workmanship, we\'ll fix it at no charge.',
  },
  {
    question: 'How much does window tinting cost?',
    answer:
      'Pricing depends on the type of film, the number of windows, and your vehicle type. We offer free quotes — give us a call at (570) 730-4433 or use our online quote tool to get a personalized estimate. We\'re competitively priced for the Stroudsburg and Pocono region.',
  },
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

export default function WindowTintingPage() {
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
                PROFESSIONAL WINDOW TINTING
              </h1>
              <p className="text-[#00A0E0]/80 text-lg md:text-xl max-w-xl font-mono leading-relaxed mb-8">
                Premium ceramic and carbon window films installed by experienced technicians.
                Protect your interior, reduce heat, and upgrade your vehicle&apos;s look — right here in Stroudsburg.
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
                  src="/images/services/window-tints.png"
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
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                WHY TINT YOUR WINDOWS?
              </h2>
              <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
                More than just aesthetics — professional window tinting protects you, your passengers, and your vehicle
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <AnimateOnScroll key={benefit.title} animation="fade-up" delay={index * 0.1}>
                <div className="bg-black border-2 border-[#00A0E0]/30 p-8 hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 neon-border-soft h-full">
                  <div className="text-[#00A0E0] mb-4 neon-glow-soft">
                    {benefit.icon}
                  </div>
                  <div
                    className="text-3xl font-bold text-[#00A0E0] mb-2 neon-glow"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {benefit.stat}
                  </div>
                  <h3
                    className="text-lg font-bold text-[#00A0E0] mb-3 neon-glow-soft"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {benefit.title}
                  </h3>
                  <p className="text-[#00A0E0]/70 font-mono text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Film Types */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                FILM OPTIONS
              </h2>
              <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
                We carry multiple tiers of window film to match every budget and performance need
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filmTypes.map((film, index) => (
              <AnimateOnScroll key={film.name} animation="fade-up" delay={index * 0.15}>
                <div className={`bg-black border-2 ${index === 0 ? 'border-[#00A0E0]' : 'border-[#00A0E0]/30'} overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 neon-border-soft h-full flex flex-col`}>
                  {/* Tier badge */}
                  <div className={`px-6 py-3 ${index === 0 ? 'bg-[#00A0E0]/20' : 'bg-[#00A0E0]/5'} border-b-2 border-[#00A0E0]/30`}>
                    <span
                      className="text-xs font-bold text-[#00A0E0] tracking-widest"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      {film.tier}
                    </span>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3
                      className="text-2xl font-bold text-[#00A0E0] mb-4 neon-glow-soft"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      {film.name}
                    </h3>
                    <p className="text-[#00A0E0]/70 font-mono text-sm leading-relaxed mb-6">
                      {film.description}
                    </p>

                    {/* Specs */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center border-b border-[#00A0E0]/10 pb-2">
                        <span className="text-[#00A0E0]/60 font-mono text-xs uppercase tracking-wider">Heat Rejection</span>
                        <span className="text-[#00A0E0] font-mono text-sm font-bold">{film.heatRejection}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[#00A0E0]/10 pb-2">
                        <span className="text-[#00A0E0]/60 font-mono text-xs uppercase tracking-wider">UV Block</span>
                        <span className="text-[#00A0E0] font-mono text-sm font-bold">{film.uvBlock}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#00A0E0]/60 font-mono text-xs uppercase tracking-wider">Warranty</span>
                        <span className="text-[#00A0E0] font-mono text-sm font-bold">{film.warranty}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mt-auto">
                      {film.features.map((feature) => (
                        <li key={feature} className="flex items-center text-[#00A0E0]/80 font-mono text-sm">
                          <svg className="w-4 h-4 mr-2 text-[#00A0E0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="max-w-4xl mx-auto">
              <div className="bg-black border-2 border-[#00A0E0]/50 p-8 md:p-12 neon-border-soft">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-[#00A0E0] shrink-0 mt-1">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2
                      className="text-3xl md:text-4xl font-bold text-white mb-2 neon-glow"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      PENNSYLVANIA TINT LAWS
                    </h2>
                    <p className="text-[#00A0E0]/60 font-mono text-sm">
                      Know the rules before you tint — we&apos;ll help you stay legal
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="border border-[#00A0E0]/20 p-6">
                    <h3
                      className="text-[#00A0E0] font-bold mb-3 tracking-wider"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      SEDANS
                    </h3>
                    <ul className="space-y-2 text-[#00A0E0]/80 font-mono text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-[#00A0E0] shrink-0">&#9656;</span>
                        <span>Windshield: Non-reflective tint on top 3 inches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00A0E0] shrink-0">&#9656;</span>
                        <span>Front sides: Must allow 70% VLT (visible light transmission)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00A0E0] shrink-0">&#9656;</span>
                        <span>Rear sides: Must allow 70% VLT</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00A0E0] shrink-0">&#9656;</span>
                        <span>Back windshield: Must allow 70% VLT</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border border-[#00A0E0]/20 p-6">
                    <h3
                      className="text-[#00A0E0] font-bold mb-3 tracking-wider"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      SUVs, VANS & TRUCKS
                    </h3>
                    <ul className="space-y-2 text-[#00A0E0]/80 font-mono text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-[#00A0E0] shrink-0">&#9656;</span>
                        <span>Windshield: Non-reflective tint on top 3 inches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00A0E0] shrink-0">&#9656;</span>
                        <span>Front sides: Must allow 70% VLT</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00A0E0] shrink-0">&#9656;</span>
                        <span>Rear sides: Any darkness permitted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#00A0E0] shrink-0">&#9656;</span>
                        <span>Back windshield: Any darkness permitted</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-[#00A0E0]/50 font-mono text-xs">
                  Medical exemptions are available for certain conditions. We&apos;ll help you navigate the regulations and choose the right tint level for your vehicle type. Not sure what&apos;s legal? Give us a call.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
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
                Next Level Audio is proud to serve Stroudsburg and the surrounding Pocono Mountain communities with professional window tinting services. Our shop is conveniently located and easily accessible from throughout Monroe County and beyond.
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
                Everything you need to know about window tinting
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
              READY TO TINT?
            </h2>
            <p className="text-xl md:text-2xl text-[#00A0E0] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
              Contact us today for a free quote on professional window tinting in Stroudsburg, PA.
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
