import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services | Next Level Audio - Stroudsburg, PA',
  description: 'Professional car audio installation, window tinting, and auto accessories services in Stroudsburg, PA. Quality craftsmanship at competitive prices.',
};

const services = [
   {
     id: 'window-tinting',
     title: 'WINDOW TINTING',
     description: 'Professional window tinting services to reduce glare, increase privacy, and enhance your vehicle\'s comfort and visual appeal. We use premium films that block harmful UV rays while maintaining crystal-clear visibility.',
     features: [
       'UV Protection up to 99%',
       'Heat Rejection Technology',
       'Glare Reduction',
       'Enhanced Privacy',
       'Lifetime Warranty Available',
       'Multiple Shade Options',
     ],
     image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
     icon: (
       <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
       </svg>
     ),
   },
  {
    id: 'car-audio',
    title: 'CAR AUDIO',
    description: 'High-quality car audio installations with our team of experienced technicians. From basic speaker upgrades to complete custom sound systems, we deliver premium audio experiences tailored to your needs and budget.',
    features: [
      'Custom Speaker Installation',
      'Subwoofer & Amplifier Setup',
      'Head Unit Upgrades',
      'Sound Deadening',
      'Bluetooth Integration',
      'Factory System Enhancement',
    ],
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    id: 'remote-start',
    title: 'REMOTE START',
    description: 'Never step into a cold or hot car again. Our remote start systems let you start your vehicle from the comfort of your home or office, ensuring the perfect temperature when you\'re ready to drive.',
    features: [
      '2-Way Remote Systems',
      'Smartphone Integration',
      'Extended Range Options',
      'Keyless Entry Combo',
      'Security Features',
      'Professional Installation',
    ],
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    id: 'security-systems',
    title: 'SECURITY SYSTEMS',
    description: 'Protect your investment with our state-of-the-art vehicle security systems. From basic alarms to advanced GPS tracking, we offer comprehensive solutions to keep your vehicle safe.',
    features: [
      'Car Alarms',
      'GPS Tracking',
      'Kill Switch Installation',
      'Shock Sensors',
      'Smartphone Alerts',
      'Insurance Discounts',
    ],
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'lighting',
    title: 'CUSTOM LIGHTING',
    description: 'Transform your vehicle\'s appearance with custom lighting solutions. From LED headlight upgrades to interior ambient lighting, we help you stand out on the road.',
    features: [
      'LED Headlight Conversion',
      'Interior LED Lighting',
      'Underglow Kits',
      'Accent Lighting',
      'DRL Installation',
      'Custom Color Options',
    ],
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'accessories',
    title: 'AUTO ACCESSORIES',
    description: 'Your one-stop shop for all automotive accessories. From custom wheels to vinyl wraps, dash cams to backup cameras, we have everything you need to personalize and enhance your vehicle.',
    features: [
      'Backup Cameras',
      'Dash Cameras',
      'Phone Mounts & Chargers',
      'Floor Mats & Liners',
      'Vinyl Wraps',
      'Custom Wheels & Tires',
    ],
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function ServicesPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[#00A0E0] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
              WHAT WE OFFER
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              OUR SERVICES
            </h1>
            <p className="text-[#00A0E0]/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              Professional automotive services tailored to your needs. Quality craftsmanship, competitive prices, and customer satisfaction guaranteed.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group neon-border-soft"
              >
                {/* Service Image */}
                {service.image && (
                  <div className="relative h-48 bg-gradient-to-br from-[#00A0E0]/20 to-black overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors"></div>
                    <div className="absolute inset-0 border-b-2 border-[#00A0E0]/50"></div>
                  </div>
                )}
                {/* Service Header */}
                <div className="p-8 border-b-2 border-[#00A0E0]/30">
                  <div className="text-[#00A0E0] mb-4 neon-glow-soft">
                    {service.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-[#00A0E0] mb-4 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {service.title}
                  </h2>
                  <p className="text-[#00A0E0]/70 leading-relaxed font-mono text-sm">
                    {service.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="p-8">
                  <h3 className="text-sm font-bold text-[#00A0E0]/60 mb-4 uppercase tracking-wider font-mono">
                    Features
                  </h3>
                  <ul className="space-y-3">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#00A0E0]/80 font-mono text-sm">
                        <svg className="w-4 h-4 mr-3 text-[#00A0E0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              WHY CHOOSE US
            </h2>
            <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
              We&apos;re committed to delivering exceptional quality and service on every project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'EXPERT TECHNICIANS', desc: 'Years of experience in automotive electronics and customization' },
              { title: 'QUALITY PRODUCTS', desc: 'We only use premium brands and materials for lasting results' },
              { title: 'COMPETITIVE PRICING', desc: 'Fair prices without compromising on quality or service' },
              { title: 'WARRANTY BACKED', desc: 'All our work comes with comprehensive warranty coverage' },
            ].map((item, index) => (
              <div key={index} className="text-center p-8 border-2 border-[#00A0E0]/30 hover:border-[#00A0E0] transition-all duration-300 neon-border-soft">
                <div className="text-5xl font-bold text-[#00A0E0] mb-4 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  0{index + 1}
                </div>
                <h3 className="text-xl font-bold text-[#00A0E0] mb-3 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  {item.title}
                </h3>
                <p className="text-[#00A0E0]/70 font-mono text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-bold mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            READY TO UPGRADE?
          </h2>
          <p className="text-xl md:text-2xl text-[#00A0E0] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
            Contact us today for a free consultation and quote on your next project!
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
