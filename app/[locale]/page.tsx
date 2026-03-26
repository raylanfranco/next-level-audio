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
      cta: t('learnMoreTinting'),
    },
    {
      num: '02',
      title: t('carAudio'),
      desc: t('carAudioDesc'),
      image: '/images/services/car-audio.webp',
      href: '/services/car-audio' as const,
      cta: t('learnMoreAudio'),
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
              <a
                href="https://www.acima.com/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black border-2 border-[#E01020]/30 overflow-hidden text-center hover:border-[#E01020] transition-all duration-500 transform hover:-translate-y-2 neon-border-soft group"
              >
                <img
                  src="/images/acima.jpg"
                  alt="Acima Leasing — Shop without perfect credit. Apply now."
                  className="w-full h-full object-cover"
                />
              </a>
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
