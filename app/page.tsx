import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import ProductsSection from '@/components/ProductsSection';
import VideoSection from '@/components/VideoSection';
import StatsCounter from '@/components/StatsCounter';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const services = [
  {
    num: '01',
    title: 'WINDOW TINTING',
    desc: 'Professional window tinting services to reduce glare and increase your vehicle\'s comfort and visual appeal.',
    image: '/images/services/window-tints.png',
    href: '/services/window-tinting',
    cta: 'LEARN MORE',
  },
  {
    num: '02',
    title: 'CAR AUDIO',
    desc: 'High-quality car audio installations with our team of experienced technicians. Premium sound systems tailored to your needs.',
    image: '/images/services/car-audio.png',
    href: '/services/car-audio',
    cta: 'LEARN MORE',
  },
  {
    num: '03',
    title: 'AUTO ACCESSORIES',
    desc: 'Your one-stop shop for all automotive needs. From custom wheels to vinyl wraps, we have everything you need.',
    image: '/images/services/auto-parts.png',
    href: '/products',
    cta: 'SHOP NOW',
  },
];

export default function Home() {
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
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow hover-glitch" style={{ fontFamily: 'var(--font-oxanium)' }}>
                OUR SERVICES
              </h2>
              <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
                We specialize in professional car audio installation, window tinting, and auto accessories
                in the Stroudsburg area.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <AnimateOnScroll key={service.num} animation="fade-up" delay={index * 0.15}>
                <div className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-500 transform hover:-translate-y-2 group neon-border-soft">
                  <div className="h-64 bg-gradient-to-br from-[#00A0E0]/20 to-black relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors duration-500"></div>
                    <div className="absolute inset-0 border-b-2 border-[#00A0E0]/50"></div>
                    {/* Animated number overlay */}
                    <div
                      className="absolute top-4 right-4 text-6xl font-bold text-white/10 group-hover:text-[#00A0E0]/25 transition-colors duration-500 select-none"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      {service.num}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#00A0E0] mb-4 neon-glow-soft group-hover:text-[#00B8FF] transition-colors duration-300" style={{ fontFamily: 'var(--font-oxanium)' }}>
                      {service.title}
                    </h3>
                    <p className="text-[#00A0E0]/70 mb-6 leading-relaxed font-mono text-sm">
                      {service.desc}
                    </p>
                    <Link
                      href={service.href}
                      className="text-[#00A0E0] font-semibold hover:text-[#00B8FF] transition-colors inline-flex items-center group/link font-mono text-sm neon-glow-soft"
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
      <section className="py-16 md:py-24 bg-black relative overflow-hidden border-t-2 border-b-2 border-[#00A0E0]/20">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll animation="slide-right">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  PREMIUM BRANDS YOU CAN TRUST
                </h2>
                <p className="text-[#00A0E0]/70 font-mono text-sm md:text-base">
                  Expert installation with quality parts from the industry&apos;s leading manufacturers.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-left" delay={0.2}>
              <div className="grid grid-cols-3 gap-4">
                {['SONY', 'COMPUSTAR', 'KICKER', 'PIONEER', 'JBL', 'KENWOOD'].map((brand) => (
                  <div
                    key={brand}
                    className="flex items-center justify-center py-6 px-4 border border-[#00A0E0]/20 bg-[#00A0E0]/5 hover:border-[#00A0E0]/50 hover:bg-[#00A0E0]/10 transition-all duration-300"
                  >
                    <span
                      className="text-white/80 text-sm md:text-base font-bold tracking-widest"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      {brand}
                    </span>
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
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <AnimateOnScroll animation="slide-right">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 neon-glow hover-glitch" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  ABOUT NEXT LEVEL AUDIO
                </h2>
                <p className="text-[#00A0E0]/80 mb-6 text-lg leading-relaxed font-mono">
                  We are the top choice in Stroudsburg, PA for window tinting services and car audio installation.
                  We understand the importance of sticking to a budget while still providing high-quality craftsmanship.
                </p>
                <p className="text-[#00A0E0]/80 mb-6 text-lg leading-relaxed font-mono">
                  Our team will work closely with you throughout the project to ensure that the results exceed
                  your expectations while staying within your budget constraints.
                </p>
                <p className="text-[#00A0E0]/80 text-lg leading-relaxed font-mono">
                  We strive for excellence in everything we do - no matter how big or small the job may be -
                  because your satisfaction is our top priority!
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="slide-left" delay={0.2}>
              <div className="border-2 border-[#00A0E0]/30 h-96 shadow-2xl overflow-hidden neon-border-soft">
                <img
                  src="/images/about-short.png"
                  alt="About Next Level Audio"
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-4xl md:text-7xl font-bold mb-6 neon-glow hover-glitch" style={{ fontFamily: 'var(--font-oxanium)' }}>
              READY TO GET STARTED?
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.15}>
            <p className="text-xl md:text-2xl text-[#00A0E0] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
              Contact us today to discuss how we can help meet your automotive needs!
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/book-appointment"
                className="inline-block bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-10 py-5 font-semibold text-lg hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                BOOK APPOINTMENT
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-[#00A0E0]/50 bg-black/40 backdrop-blur-sm text-[#00A0E0] px-10 py-5 font-semibold text-lg hover:border-[#00A0E0] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                CONTACT US
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
