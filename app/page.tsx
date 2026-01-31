import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import ProductsSection from '@/components/ProductsSection';
import VideoSection from '@/components/VideoSection';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section with Video Background - uses default Google video */}
      <HeroSection />

      {/* Services Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              OUR SERVICES
            </h2>
            <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
              We specialize in professional car audio installation, window tinting, and auto accessories 
              in the Stroudsburg area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group neon-border-soft">
              <div className="h-64 bg-gradient-to-br from-[#00A0E0]/20 to-black relative overflow-hidden">
                <img
                  src="/images/services/window-tints.png"
                  alt="Window Tinting"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors"></div>
                <div className="absolute inset-0 border-b-2 border-[#00A0E0]/50"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#00A0E0] mb-4 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>WINDOW TINTING</h3>
                <p className="text-[#00A0E0]/70 mb-6 leading-relaxed font-mono text-sm">
                  Professional window tinting services to reduce glare and increase your vehicle's comfort and visual appeal.
                </p>
                <Link 
                  href="/services/window-tinting" 
                  className="text-[#00A0E0] font-semibold hover:text-[#00B8FF] transition-colors inline-flex items-center group font-mono text-sm neon-glow-soft"
                >
                  LEARN MORE 
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group neon-border-soft">
              <div className="h-64 bg-gradient-to-br from-[#00A0E0]/20 to-black relative overflow-hidden">
                <img
                  src="/images/services/car-audio.png"
                  alt="Car Audio"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors"></div>
                <div className="absolute inset-0 border-b-2 border-[#00A0E0]/50"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#00A0E0] mb-4 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>CAR AUDIO</h3>
                <p className="text-[#00A0E0]/70 mb-6 leading-relaxed font-mono text-sm">
                  High-quality car audio installations with our team of experienced technicians. 
                  Premium sound systems tailored to your needs.
                </p>
                <Link 
                  href="/services/car-audio" 
                  className="text-[#00A0E0] font-semibold hover:text-[#00B8FF] transition-colors inline-flex items-center group font-mono text-sm neon-glow-soft"
                >
                  LEARN MORE 
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group neon-border-soft">
              <div className="h-64 bg-gradient-to-br from-black to-[#00A0E0]/20 relative overflow-hidden">
                <img
                  src="/images/services/auto-parts.png"
                  alt="Auto Accessories"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors"></div>
                <div className="absolute inset-0 border-b-2 border-[#00A0E0]/50"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#00A0E0] mb-4 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>AUTO ACCESSORIES</h3>
                <p className="text-[#00A0E0]/70 mb-6 leading-relaxed font-mono text-sm">
                  Your one-stop shop for all automotive needs. From custom wheels to vinyl wraps, 
                  we have everything you need.
                </p>
                <Link 
                  href="/products" 
                  className="text-[#00A0E0] font-semibold hover:text-[#00B8FF] transition-colors inline-flex items-center group font-mono text-sm neon-glow-soft"
                >
                  SHOP NOW 
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <ProductsSection />

      {/* Video Section */}
      <VideoSection 
        // Replace with actual YouTube video ID from your channel
        // Get the ID from your YouTube video URL: https://www.youtube.com/watch?v=VIDEO_ID_HERE
        defaultVideoId="dQw4w9WgXcQ" // Classic rickroll - replace with your video ID! 😄
        defaultVideoTitle="Next Level Audio - Our Work"
        // Or pass multiple videos:
        // videos={[
        //   { id: 'video-id-1', title: 'Car Audio Installation' },
        //   { id: 'video-id-2', title: 'Window Tinting Process' },
        // ]}
      />

      {/* About Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
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
            <div className="border-2 border-[#00A0E0]/30 h-96 shadow-2xl overflow-hidden neon-border-soft">
              <img
                src="/images/about-short.png"
                alt="About Next Level Audio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-bold mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            READY TO GET STARTED?
          </h2>
          <p className="text-xl md:text-2xl text-[#00A0E0] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
            Contact us today to discuss how we can help meet your automotive needs!
          </p>
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
        </div>
      </section>
    </div>
  );
}
