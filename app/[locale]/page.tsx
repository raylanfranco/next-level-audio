import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const ProductsSection = dynamic(() => import('@/components/ProductsSection'), {
  loading: () => <div className="h-96 bg-black" />,
});
const VideoSection = dynamic(() => import('@/components/VideoSection'), {
  loading: () => <div className="h-[60vh] bg-black" />,
});
const StatsCounter = dynamic(() => import('@/components/StatsCounter'));

export default async function Home() {
  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  const services = [
    {
      num: '01',
      title: t('windowTinting'),
      desc: t('windowTintingDesc'),
      image: '/images/services/window-tints.webp',
      href: '/services/window-tinting' as const,
      cta: t('learnMore'),
    },
    {
      num: '02',
      title: t('carAudio'),
      desc: t('carAudioDesc'),
      image: '/images/services/car-audio.webp',
      href: '/services/car-audio' as const,
      cta: t('learnMore'),
    },
    {
      num: '03',
      title: t('autoAccessories'),
      desc: t('autoAccessoriesDesc'),
      image: '/images/services/auto-parts.webp',
      href: '/products' as const,
      cta: t('shopNow'),
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section with Video Background */}
      <HeroSection />

      {/* Services Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow hover-glitch font-oxanium">
                {t('servicesHeading')}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
                {t('servicesDescription')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <AnimateOnScroll key={service.num} animation="fade-up" delay={index * 0.15}>
                <div className="bg-black border-2 border-[#E01020]/30 overflow-hidden hover:border-[#E01020] transition-all duration-500 transform hover:-translate-y-2 group neon-border-soft">
                  <div className="h-64 bg-gradient-to-br from-[#E01020]/20 to-black relative overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-[#E01020]/10 group-hover:bg-[#E01020]/20 transition-colors duration-500"></div>
                    <div className="absolute inset-0 border-b-2 border-[#E01020]/50"></div>
                    {/* Animated number overlay */}
                    <div
                      className="absolute top-4 right-4 text-6xl font-bold text-white/10 group-hover:text-[#E01020]/25 transition-colors duration-500 select-none font-oxanium"
                    >
                      {service.num}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#E01020] mb-4 neon-glow-soft group-hover:text-[#FF2A3A] transition-colors duration-300 font-oxanium">
                      {service.title}
                    </h3>
                    <p className="text-white/70 mb-6 leading-relaxed font-mono text-sm">
                      {service.desc}
                    </p>
                    <Link
                      href={service.href}
                      className="text-[#E01020] font-semibold hover:text-[#FF2A3A] transition-colors inline-flex items-center group/link font-mono text-sm neon-glow-soft"
                    >
                      {service.cta}
                      <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <StatsCounter />

      {/* Premium Brands */}
      <section className="py-16 md:py-24 bg-black relative overflow-hidden border-t-2 border-b-2 border-[#E01020]/20">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll animation="slide-right">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 neon-glow font-oxanium">
                  {t('brandsHeading')}
                </h2>
                <p className="text-white/70 font-mono text-sm md:text-base">
                  {t('brandsDescription')}
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-left" delay={0.2}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Sony', image: '/images/brands/stroudsburg_sony.avif' },
                  { name: 'Compustar', image: '/images/brands/stroudsburg_compustar.avif' },
                  { name: 'Kicker', image: '/images/brands/stroundsburg_kicker.avif' },
                  { name: 'Pioneer', image: '/images/brands/stroudsburg_pioneer.avif' },
                  { name: 'JBL', image: '/images/brands/stroudsburg_jbl.avif' },
                  { name: 'Stinger', image: '/images/brands/stroudsburg_s.avif' },
                ].map((brand) => (
                  <div
                    key={brand.name}
                    className="flex items-center justify-center border border-[#E01020]/20 bg-[#E01020]/5 hover:border-[#E01020]/50 hover:bg-[#E01020]/10 transition-all duration-300 aspect-[3/2] overflow-hidden"
                  >
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      width={200}
                      height={133}
                      className="w-full h-full object-contain p-4 opacity-80 hover:opacity-100 transition-opacity duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <ProductsSection />

      {/* Video Section */}
      <VideoSection />

      {/* About Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <AnimateOnScroll animation="slide-right">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 neon-glow hover-glitch font-oxanium">
                  {t('aboutHeading')}
                </h2>
                <p className="text-white/80 mb-6 text-lg leading-relaxed font-mono">
                  {t('aboutP1')}
                </p>
                <p className="text-white/80 mb-6 text-lg leading-relaxed font-mono">
                  {t('aboutP2')}
                </p>
                <p className="text-white/80 text-lg leading-relaxed font-mono">
                  {t('aboutP3')}
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-left" delay={0.2}>
              <div className="border-2 border-[#E01020]/30 h-96 shadow-2xl overflow-hidden neon-border-soft">
                <Image
                  src="/images/about-short.webp"
                  alt="About Next Level Audio"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Financing Section */}
      <section id="financing" className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow hover-glitch font-oxanium"
              >
                {t('financingHeading')}
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
                {t('financingDescription')}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimateOnScroll animation="fade-up" delay={0}>
              <a
                href="https://findastore.easypayfinance.com//?b=mCOPIF7LZY2Ku6BjZuPw3w%3d%3d"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black border-2 border-[#E01020]/30 p-8 text-center hover:border-[#E01020] transition-all duration-500 transform hover:-translate-y-2 neon-border-soft group"
              >
                <div
                  className="text-3xl font-bold text-white mb-4 font-oxanium"
                >
                  EASYPAY
                </div>
                <p className="text-white/60 font-mono text-sm mb-6">
                  {t('easypayDesc')}
                </p>
                <span className="text-[#E01020] font-semibold font-mono text-sm group-hover:text-[#FF2A3A] transition-colors inline-flex items-center">
                  {t('applyNow')}
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={0.15}>
              <div className="bg-black border-2 border-[#E01020]/30 p-8 text-center hover:border-[#E01020] transition-all duration-500 transform hover:-translate-y-2 neon-border-soft">
                <div
                  className="text-3xl font-bold text-white mb-4 font-oxanium"
                >
                  ACIMA
                </div>
                <p className="text-white/60 font-mono text-sm mb-6">
                  {t('acimaDesc')}
                </p>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 inline-block" style={{ width: 200, height: 200 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 61 61" shapeRendering="crispEdges"><path fill="#ffffff" d="M0 0h61v61H0z"></path><path stroke="#000000" d="M4 4.5h7m3 0h1m1 0h2m1 0h1m1 0h1m1 0h3m1 0h1m1 0h4m1 0h4m1 0h3m4 0h1m3 0h7M4 5.5h1m5 0h1m4 0h2m3 0h1m3 0h1m1 0h1m3 0h1m2 0h1m3 0h2m1 0h3m3 0h2m2 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m1 0h2m1 0h1m2 0h2m1 0h1m1 0h1m1 0h1m1 0h1m1 0h2m3 0h3m2 0h1m1 0h4m2 0h1m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h1m1 0h2m1 0h2m8 0h2m3 0h1m1 0h2m1 0h1m2 0h2m1 0h1m1 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h6m1 0h4m1 0h14m1 0h3m3 0h2m3 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h2m1 0h1m3 0h1m3 0h1m2 0h2m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m3 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h2m1 0h2m1 0h1m1 0h2m1 0h1m1 0h1m1 0h2m3 0h4m5 0h2m1 0h1m1 0h2M4 12.5h1m1 0h5m2 0h4m1 0h1m9 0h7m2 0h4m2 0h1m1 0h4m1 0h5M4 13.5h1m3 0h2m3 0h2m2 0h1m1 0h2m3 0h12m5 0h1m3 0h3m1 0h1m1 0h1m1 0h2m1 0h1M4 14.5h1m2 0h2m1 0h2m1 0h3m1 0h1m2 0h5m4 0h2m2 0h1m4 0h1m1 0h1m1 0h4m1 0h2m1 0h1m1 0h3M5 15.5h2m1 0h1m4 0h1m1 0h3m1 0h2m1 0h1m1 0h2m1 0h3m3 0h1m1 0h2m1 0h1m4 0h9m1 0h1m1 0h1M6 16.5h2m1 0h2m2 0h1m3 0h1m2 0h1m6 0h2m1 0h2m3 0h1m2 0h1m1 0h3m2 0h1m1 0h2m2 0h2m1 0h3M6 17.5h2m5 0h3m2 0h1m1 0h1m3 0h1m1 0h2m3 0h3m2 0h1m4 0h1m3 0h2m6 0h4M5 18.5h1m3 0h4m1 0h2m1 0h3m1 0h1m4 0h2m2 0h1m3 0h2m1 0h4m1 0h1m1 0h2m1 0h1m1 0h3m1 0h1M11 19.5h1m1 0h2m2 0h1m3 0h2m5 0h1m2 0h1m1 0h1m2 0h2m3 0h1m1 0h2m4 0h2m4 0h2M4 20.5h1m2 0h1m2 0h1m5 0h1m3 0h3m2 0h1m1 0h4m2 0h1m1 0h1m1 0h4m2 0h1m1 0h2m1 0h2m1 0h5M4 21.5h1m4 0h1m2 0h1m3 0h2m1 0h2m2 0h1m2 0h2m2 0h1m2 0h5m1 0h3m4 0h2m1 0h1m1 0h2m2 0h2M6 22.5h1m2 0h3m2 0h2m1 0h1m1 0h2m1 0h2m1 0h1m3 0h1m5 0h3m1 0h1m2 0h4m1 0h5m1 0h1M4 23.5h4m4 0h2m2 0h2m2 0h5m2 0h3m1 0h1m1 0h4m1 0h1m5 0h1m1 0h4m1 0h1m1 0h1M7 24.5h1m2 0h4m2 0h1m1 0h1m2 0h2m1 0h2m1 0h2m1 0h2m5 0h4m1 0h1m3 0h1m1 0h1m3 0h1m1 0h1m1 0h1M7 25.5h3m2 0h2m2 0h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h1m4 0h1m4 0h3m2 0h1m1 0h2m1 0h1m1 0h1m3 0h2M4 26.5h2m1 0h1m1 0h2m2 0h4m1 0h2m1 0h1m1 0h2m1 0h4m1 0h1m1 0h1m1 0h1m1 0h3m2 0h1m1 0h1m2 0h4m1 0h4M5 27.5h4m2 0h1m4 0h1m1 0h1m1 0h4m2 0h1m1 0h2m4 0h1m1 0h1m2 0h1m3 0h3m1 0h2m4 0h1M6 28.5h8m2 0h1m1 0h1m3 0h1m2 0h1m1 0h8m3 0h4m1 0h1m1 0h8m1 0h3M4 29.5h1m1 0h3m3 0h1m1 0h1m2 0h2m2 0h3m1 0h2m1 0h1m3 0h4m1 0h1m1 0h3m1 0h1m1 0h4m3 0h2m1 0h2M8 30.5h1m1 0h1m1 0h2m1 0h1m1 0h1m7 0h1m2 0h1m1 0h1m1 0h1m2 0h2m1 0h2m2 0h2m1 0h4m1 0h1m1 0h1M4 31.5h1m1 0h1m1 0h1m3 0h2m1 0h1m1 0h4m2 0h4m1 0h1m3 0h3m6 0h2m1 0h1m1 0h1m1 0h1m3 0h2m1 0h1M4 32.5h12m3 0h4m1 0h1m2 0h6m1 0h3m2 0h5m2 0h9m1 0h1M4 33.5h4m4 0h1m2 0h1m2 0h1m2 0h3m1 0h3m2 0h2m1 0h2m1 0h1m3 0h2m1 0h4m1 0h2m1 0h2m2 0h2M5 34.5h1m1 0h4m3 0h1m2 0h2m3 0h1m1 0h3m4 0h2m2 0h2m1 0h1m3 0h2m1 0h1m3 0h1m2 0h3M5 35.5h1m6 0h1m3 0h1m1 0h3m1 0h3m3 0h2m4 0h1m1 0h2m1 0h1m4 0h10m1 0h1M6 36.5h1m2 0h3m1 0h1m3 0h1m2 0h2m1 0h1m3 0h1m4 0h3m5 0h2m1 0h1m1 0h2m2 0h3m2 0h1M4 37.5h2m2 0h1m2 0h1m3 0h1m1 0h2m1 0h2m1 0h7m2 0h1m1 0h1m4 0h1m3 0h1m1 0h2m2 0h4m1 0h1m1 0h1M9 38.5h2m1 0h2m2 0h3m1 0h5m1 0h1m1 0h1m1 0h6m2 0h1m1 0h3m6 0h1m2 0h2M7 39.5h1m3 0h2m1 0h1m3 0h2m1 0h1m2 0h1m2 0h1m1 0h1m4 0h2m2 0h1m5 0h1m1 0h5m1 0h1M4 40.5h2m3 0h3m1 0h1m2 0h1m1 0h4m1 0h1m3 0h3m1 0h1m1 0h3m1 0h2m1 0h2m8 0h1m2 0h2M7 41.5h1m5 0h1m1 0h1m1 0h1m1 0h1m5 0h4m1 0h2m1 0h3m2 0h4m1 0h1m2 0h3m1 0h3m2 0h2M5 42.5h1m2 0h3m1 0h1m1 0h1m3 0h2m2 0h1m3 0h1m2 0h1m2 0h2m1 0h3m2 0h3m1 0h2m2 0h1m2 0h5M4 43.5h2m1 0h3m1 0h3m2 0h1m1 0h3m2 0h6m1 0h2m2 0h4m5 0h3m2 0h3m1 0h2m1 0h2M5 44.5h1m3 0h2m1 0h1m1 0h1m2 0h1m4 0h2m2 0h1m11 0h5m2 0h2m3 0h1m3 0h1m1 0h1M4 45.5h3m1 0h1m6 0h2m5 0h4m1 0h4m1 0h1m1 0h2m3 0h3m2 0h5m2 0h2m1 0h1m1 0h1M4 46.5h2m1 0h4m1 0h1m2 0h1m2 0h1m2 0h2m1 0h1m1 0h1m1 0h2m2 0h1m3 0h3m3 0h2m3 0h1m3 0h2m2 0h1M5 47.5h2m4 0h3m2 0h2m1 0h1m4 0h1m4 0h2m2 0h1m2 0h1m2 0h1m4 0h2m1 0h1m1 0h2m2 0h1M7 48.5h1m2 0h1m3 0h2m1 0h2m2 0h2m1 0h1m3 0h8m1 0h2m1 0h3m2 0h1m2 0h5m1 0h2M12 49.5h5m1 0h1m1 0h1m1 0h5m1 0h1m3 0h6m1 0h3m3 0h4m3 0h2m1 0h2M4 50.5h7m2 0h2m1 0h1m1 0h1m2 0h1m1 0h3m2 0h1m1 0h1m1 0h2m1 0h2m1 0h3m1 0h1m1 0h2m1 0h2m1 0h1m1 0h1M4 51.5h1m5 0h1m1 0h1m3 0h1m4 0h3m3 0h2m3 0h2m1 0h1m7 0h2m1 0h3m3 0h2m1 0h2M4 52.5h1m1 0h3m1 0h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1m1 0h8m2 0h1m1 0h4m3 0h9M4 53.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h3m1 0h1m2 0h2m4 0h1m1 0h1m1 0h3m3 0h1m1 0h1m2 0h5m1 0h1m4 0h2M4 54.5h1m1 0h3m1 0h1m1 0h3m2 0h1m7 0h3m2 0h2m1 0h2m2 0h2m1 0h1m1 0h1m4 0h1m3 0h3m1 0h2M4 55.5h1m5 0h1m5 0h2m4 0h4m3 0h1m1 0h1m1 0h1m2 0h2m4 0h3m3 0h1m2 0h1m1 0h1m1 0h1M4 56.5h7m1 0h1m2 0h3m5 0h1m1 0h4m3 0h1m2 0h1m1 0h5m3 0h3m2 0h1m1 0h3"></path></svg>
                  </div>
                </div>
                <p className="text-white/40 font-mono text-xs">{t('scanToApply')}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-up" delay={0.3}>
              <a
                href="https://bk.snapfinance.com/origination?paramId=3w%2FEWVFzVGcQioSdKn1vuqdr2hNr3A1xiMt4CtG%2BqOWbOaA2mq1BYa2lEkK1hZ0tog9ZSjNG2GyQln5HQrzShOzYiaK%2FnFnEZXfXtyBXVEw%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black border-2 border-[#E01020]/30 p-8 text-center hover:border-[#E01020] transition-all duration-500 transform hover:-translate-y-2 neon-border-soft group"
              >
                <div
                  className="text-3xl font-bold text-white mb-4 font-oxanium"
                >
                  SNAP
                </div>
                <p className="text-white/60 font-mono text-sm mb-6">
                  {t('snapDesc')}
                </p>
                <span className="text-[#E01020] font-semibold font-mono text-sm group-hover:text-[#FF2A3A] transition-colors inline-flex items-center">
                  {t('applyNow')}
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-4xl md:text-7xl font-bold mb-6 neon-glow hover-glitch font-oxanium">
              {t('ctaHeading')}
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <p className="text-xl md:text-2xl text-[#E01020] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
              {t('ctaDescription')}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/book-appointment"
                className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-10 py-5 font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button font-oxanium"
              >
                {tc('bookAppointment')}
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-[#E01020]/50 bg-black/40 backdrop-blur-sm text-[#E01020] px-10 py-5 font-semibold text-lg hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button font-oxanium"
              >
                {tc('contactUs')}
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
