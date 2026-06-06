import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const ProductsSection = dynamic(() => import('@/components/ProductsSection'), {
  loading: () => <div className="h-96 bg-black" />,
});
const VideoSection = dynamic(() => import('@/components/VideoSection'), {
  loading: () => <div className="h-[60vh] bg-black" />,
});
const StatsCounter = dynamic(() => import('@/components/StatsCounter'));
const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), {
  loading: () => <div className="h-96 bg-[#030303]" />,
});

export default async function Home() {
  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  return (
    <div className="w-full">
      {/* Hero Section with Video Background */}
      <HeroSection />

      {/* Services Section (V2 — Variant bento cards) */}
      <ServicesSection />

      {/* Stats Counter */}
      <StatsCounter />

      {/* Products Section */}
      <ProductsSection />

      {/* Video Section */}
      <VideoSection />

      {/* About Section (V2 — Variant language, net-new) */}
      <section className="py-20 md:py-32 bg-[#030303] relative overflow-hidden border-y border-[#1a1c20]" aria-labelledby="about-heading">
        <div className="absolute inset-0 bg-noise z-0"></div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — story copy */}
            <AnimateOnScroll animation="slide-right">
              <div>
                {/* Eyebrow */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-[2px] bg-electric-red shadow-[0_0_10px_#e60012]"></div>
                  <span className="font-ui text-chrome-300 font-bold tracking-[0.4em] uppercase text-xs">
                    {t('aboutEyebrow')}
                  </span>
                </div>

                {/* Heading with fire-bar accent */}
                <h2
                  id="about-heading"
                  className="font-display text-chrome uppercase leading-[0.9] tracking-tight text-[clamp(2.5rem,5vw,4.5rem)] mb-8"
                  data-text={t('aboutHeading')}
                >
                  {t('aboutHeading')}
                </h2>

                <p className="font-ui text-chrome-300 mb-6 text-lg leading-relaxed">
                  {t('aboutP1')}
                </p>
                <p className="font-ui text-chrome-300 mb-6 text-lg leading-relaxed">
                  {t('aboutP2')}
                </p>

                {/* Red-accented pull-quote (from existing P3) */}
                <blockquote className="border-l-2 border-electric-red pl-6 my-8 shadow-[-8px_0_20px_-12px_rgba(224,16,32,0.6)]">
                  <p className="font-display text-2xl md:text-3xl uppercase text-white leading-tight">
                    {t('aboutPullQuote')}
                  </p>
                </blockquote>

                {/* Location tag — real NAP fact */}
                <div className="flex items-center gap-3 mt-10">
                  <svg className="w-5 h-5 text-electric-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-ui text-chrome-500 text-sm font-bold uppercase tracking-[0.2em]">
                    {t('aboutLocation')}
                  </span>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Right — framed shop image (graphite frame + screws + grayscale→color) */}
            <AnimateOnScroll animation="slide-left" delay={0.2}>
              <div className="video-frame prod-card group relative p-2 md:p-3">
                <div className="svc-screw svc-screw-tl" aria-hidden="true" />
                <div className="svc-screw svc-screw-tr" aria-hidden="true" />
                <div className="svc-screw svc-screw-bl" aria-hidden="true" />
                <div className="svc-screw svc-screw-br" aria-hidden="true" />
                <div className="relative overflow-hidden h-80 md:h-[28rem]">
                  <Image
                    src="/images/about-short.webp"
                    alt="The Next Level Audio shop in Stroudsburg, PA"
                    width={600}
                    height={448}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 prod-overlay mix-blend-multiply pointer-events-none"></div>
                  <div className="prod-shine"></div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Testimonials Section (V2 — Variant carousel, curated real Google reviews) */}
      <TestimonialsSection />

      {/* Financing Section (V2 — Variant language, net-new) */}
      <section id="financing" className="py-20 md:py-32 bg-black relative overflow-hidden border-t border-[#1a1c20]">
        <div className="absolute inset-0 bg-noise z-0"></div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
          {/* Heading — eyebrow + chrome headline */}
          <AnimateOnScroll animation="fade-up">
            <div className="flex flex-col items-start gap-2 pl-6 mb-16 relative">
              <div className="absolute top-0 left-0 w-[4px] h-full svc-section-bar" aria-hidden="true" />
              <span className="font-ui font-bold text-sm tracking-[0.3em] uppercase text-electric-red">
                {t('financingEyebrow')}
              </span>
              <h2
                className="font-display text-chrome uppercase leading-[0.9] tracking-tight text-[clamp(2rem,5vw,4.5rem)]"
                data-text={t('financingHeading')}
              >
                {t('financingHeading')}
              </h2>
              <p className="font-ui text-lg text-chrome-300 max-w-2xl mt-2 leading-relaxed">
                {t('financingDescription')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-start">
            {/* EasyPay — text card */}
            <AnimateOnScroll animation="fade-up" delay={0} className="svc-card prod-card group flex flex-col">
              <a
                href="https://findastore.easypayfinance.com//?b=mCOPIF7LZY2Ku6BjZuPw3w%3d%3d"
                target="_blank"
                rel="noopener noreferrer"
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <div className="prod-shine" aria-hidden="true" />
                <div className="svc-card-number" aria-hidden="true">01</div>
                <div className="svc-card-content">
                  <h3 className="font-display text-4xl uppercase text-white leading-none mb-3">EasyPay</h3>
                  <p className="font-ui text-chrome-500 text-sm mb-6">{t('easypayDesc')}</p>
                  <span className="svc-btn">
                    {t('applyNow')}
                    <svg className="svc-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
                    </svg>
                  </span>
                </div>
              </a>
            </AnimateOnScroll>

            {/* Acima — image card (brand image kept in full color) */}
            <AnimateOnScroll animation="fade-up" delay={0.15} className="svc-card prod-card group !p-0 overflow-hidden min-h-[20rem]">
              <a
                href="https://www.acima.com/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="block relative h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Acima Leasing — Shop without perfect credit. Apply now."
              >
                <div className="prod-shine z-[3]" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/acima.jpg"
                  alt="Acima Leasing — Shop without perfect credit. Apply now."
                  className="w-full h-full object-cover"
                />
              </a>
            </AnimateOnScroll>

            {/* Snap — text card */}
            <AnimateOnScroll animation="fade-up" delay={0.3} className="svc-card prod-card group flex flex-col">
              <a
                href="https://bk.snapfinance.com/origination?paramId=3w%2FEWVFzVGcQioSdKn1vuqdr2hNr3A1xiMt4CtG%2BqOWbOaA2mq1BYa2lEkK1hZ0tog9ZSjNG2GyQln5HQrzShOzYiaK%2FnFnEZXfXtyBXVEw%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <div className="prod-shine" aria-hidden="true" />
                <div className="svc-card-number" aria-hidden="true">03</div>
                <div className="svc-card-content">
                  <h3 className="font-display text-4xl uppercase text-white leading-none mb-3">Snap</h3>
                  <p className="font-ui text-chrome-500 text-sm mb-6">{t('snapDesc')}</p>
                  <span className="svc-btn">
                    {t('applyNow')}
                    <svg className="svc-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
                    </svg>
                  </span>
                </div>
              </a>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CTA Section (V2 — Variant language, net-new) */}
      <section className="py-24 md:py-36 bg-[#030303] text-white relative overflow-hidden border-t border-[#1a1c20]">
        <div className="absolute inset-0 bg-noise z-0"></div>
        {/* Ambient red bass glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-electric-red stat-round blur-[140px] opacity-[0.12] pointer-events-none z-0"
          style={{ borderRadius: '100%' }}
          aria-hidden="true"
        ></div>
        {/* Speaker rings echo (subtle, behind text) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20" aria-hidden="true">
          <div className="ring-base ring-glow w-[700px] h-[700px] !left-1/2"></div>
          <div className="ring-base ring-dashed w-[460px] h-[460px] !left-1/2 border-[rgba(255,255,255,0.08)]"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 text-center flex flex-col items-center">
          <AnimateOnScroll animation="fade-up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-electric-red shadow-[0_0_10px_#e60012]"></div>
              <span className="font-ui text-chrome-300 font-bold tracking-[0.4em] uppercase text-xs">{t('ctaEyebrow')}</span>
              <div className="w-12 h-[2px] bg-electric-red shadow-[0_0_10px_#e60012]"></div>
            </div>
            <h2
              className="font-display text-chrome uppercase leading-[0.85] tracking-tight text-[clamp(3rem,8vw,7rem)] mb-6"
              data-text={t('ctaHeading')}
            >
              {t('ctaHeading')}
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <p className="font-ui text-xl md:text-2xl text-chrome-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t('ctaDescription')}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/book-appointment"
                className="btn-glow font-ui px-10 py-5 text-base font-bold tracking-[0.2em] uppercase text-white flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {tc('bookAppointment')}
              </Link>
              <Link
                href="/contact"
                className="btn-ghost group font-ui px-10 py-5 text-base font-bold tracking-[0.2em] uppercase text-chrome-100 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className="relative z-10">{tc('contactUs')}</span>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
