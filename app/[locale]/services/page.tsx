'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useBookingModal } from '@/components/BookingModalContext';
import QuoteCalculator from '@/components/QuoteCalculator';

export default function ServicesPage() {
  const { openModal } = useBookingModal();
  const t = useTranslations('services');
  const tc = useTranslations('common');

  const services = [
    {
      id: 'window-tinting',
      title: t('windowTinting'),
      description: t('windowTintingDesc'),
      features: [t('uvProtection'), t('heatRejection'), t('glareReduction'), t('enhancedPrivacy'), t('lifetimeWarranty'), t('multipleShades')],
      image: '/images/services/window-tints.webp',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
    },
    {
      id: 'car-audio',
      title: t('carAudio'),
      description: t('carAudioDesc'),
      features: [t('customSpeaker'), t('subwooferAmp'), t('headUnit'), t('soundDeadening'), t('bluetoothIntegration'), t('factoryEnhancement')],
      image: '/images/services/car-audio.webp',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
    },
    {
      id: 'remote-start',
      title: t('remoteStart'),
      description: t('remoteStartDesc'),
      features: [t('twoWayRemote'), t('smartphoneIntegration'), t('extendedRange'), t('keylessEntry'), t('securityFeatures'), t('professionalInstall')],
      image: '/images/services/remote-start.webp',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
    {
      id: 'security-systems',
      title: t('securitySystems'),
      description: t('securitySystemsDesc'),
      features: [t('carAlarms'), t('gpsTracking'), t('killSwitch'), t('shockSensors'), t('smartphoneAlerts'), t('insuranceDiscounts')],
      image: '/images/services/security-systems.webp',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'lighting',
      title: t('customLighting'),
      description: t('customLightingDesc'),
      features: [t('ledHeadlight'), t('interiorLed'), t('underglowKits'), t('accentLighting'), t('drlInstallation'), t('customColorOptions')],
      image: '/images/services/custom-lighting.webp',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: 'accessories',
      title: t('autoAccessories'),
      description: t('autoAccessoriesDesc'),
      features: [t('backupCameras'), t('dashCameras'), t('phoneMounts'), t('floorMats'), t('vinylWraps'), t('customWheels')],
      image: '/images/services/auto-parts.webp',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[#E01020] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft font-oxanium">
              {t('whatWeOffer')}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow font-oxanium">
              {t('title')}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-black border-2 border-[#E01020]/30 overflow-hidden hover:border-[#E01020] transition-all duration-300 transform hover:-translate-y-2 group neon-border-soft"
              >
                {/* Service Image */}
                {service.image && (
                  <div className="relative h-48 bg-gradient-to-br from-[#E01020]/20 to-black overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#E01020]/10 group-hover:bg-[#E01020]/20 transition-colors"></div>
                    <div className="absolute inset-0 border-b-2 border-[#E01020]/50"></div>
                  </div>
                )}
                {/* Service Header */}
                <div className="p-8 border-b-2 border-[#E01020]/30">
                  <div className="text-[#E01020] mb-4 neon-glow-soft">
                    {service.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-[#E01020] mb-4 neon-glow-soft font-oxanium">
                    {service.title}
                  </h2>
                  <p className="text-white/70 leading-relaxed font-mono text-sm">
                    {service.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="p-8">
                  <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider font-mono">
                    {t('features')}
                  </h3>
                  <ul className="space-y-3">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-white/80 font-mono text-sm">
                        <svg className="w-4 h-4 mr-3 text-[#E01020] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Quote Calculator */}
      <QuoteCalculator />

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow font-oxanium">
              {t('whyChooseUs')}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
              {t('whyChooseUsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t('expertTechnicians'), desc: t('expertTechniciansDesc') },
              { title: t('qualityProducts'), desc: t('qualityProductsDesc') },
              { title: t('competitivePricing'), desc: t('competitivePricingDesc') },
              { title: t('warrantyBacked'), desc: t('warrantyBackedDesc') },
            ].map((item, index) => (
              <div key={index} className="text-center p-8 border-2 border-[#E01020]/30 hover:border-[#E01020] transition-all duration-300 neon-border-soft">
                <div className="text-5xl font-bold text-[#E01020] mb-4 neon-glow font-oxanium">
                  0{index + 1}
                </div>
                <h3 className="text-xl font-bold text-[#E01020] mb-3 neon-glow-soft font-oxanium">
                  {item.title}
                </h3>
                <p className="text-white/70 font-mono text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-bold mb-6 neon-glow font-oxanium">
            {t('readyToUpgrade')}
          </h2>
          <p className="text-xl md:text-2xl text-[#E01020] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
            {t('readyToUpgradeDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={openModal}
              className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-10 py-5 font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button font-oxanium"
            >
              {tc('bookAppointment')}
            </button>
            <Link
              href="/contact"
              className="inline-block border-2 border-[#E01020]/50 bg-black/40 backdrop-blur-sm text-[#E01020] px-10 py-5 font-semibold text-lg hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button font-oxanium"
            >
              {tc('contactUs')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
