'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';

// Gallery category IDs
const categoryIds = ['all', 'audio', 'tinting', 'lighting', 'accessories'] as const;

const galleryItems = [
  {
    id: 1,
    category: 'accessories',
    title: 'Auto Accessories',
    description: 'Premium auto accessories installation and customization',
    image: '/images/gallery/auto-accessories.jpg',
  },
  {
    id: 2,
    category: 'accessories',
    title: 'Custom Accessory Install',
    description: 'Professional accessory fitting and installation',
    image: '/images/gallery/auto-accessories-1.jpg',
  },
  {
    id: 3,
    category: 'accessories',
    title: 'Accessory Upgrade',
    description: 'Quality parts and expert installation',
    image: '/images/gallery/auto-accessories-2.jpg',
  },
  {
    id: 4,
    category: 'accessories',
    title: 'Custom Build',
    description: 'Tailored accessories to match your style',
    image: '/images/gallery/auto-accessories-3.jpg',
  },
  {
    id: 5,
    category: 'accessories',
    title: 'Vehicle Enhancement',
    description: 'Functional and aesthetic accessory upgrades',
    image: '/images/gallery/auto-accessories-4.jpg',
  },
  {
    id: 6,
    category: 'accessories',
    title: 'Accessory Detail',
    description: 'Attention to detail on every install',
    image: '/images/gallery/auto-accessories-5.jpg',
  },
  {
    id: 7,
    category: 'accessories',
    title: 'Finished Accessory Work',
    description: 'Clean, professional results every time',
    image: '/images/gallery/auto-accessories-6.jpg',
  },
  {
    id: 8,
    category: 'audio',
    title: 'Auto Service',
    description: 'Full-service automotive work by our expert team',
    image: '/images/gallery/auto-service.jpg',
  },
  {
    id: 9,
    category: 'audio',
    title: 'Service in Progress',
    description: 'Hands-on craftsmanship on every project',
    image: '/images/gallery/auto-service-1.jpg',
  },
  {
    id: 10,
    category: 'audio',
    title: 'Service Work',
    description: 'Behind the scenes at Next Level Audio',
    image: '/images/gallery/auto-service-2.jpg',
  },
  {
    id: 11,
    category: 'audio',
    title: 'Car Audio Installation',
    description: 'Premium car audio systems installed by professionals',
    image: '/images/gallery/car-audio.jpg',
  },
  {
    id: 12,
    category: 'tinting',
    title: 'Window Tinting',
    description: 'Professional ceramic window tint application',
    image: '/images/gallery/window-tinting-1.jpg',
  },
  {
    id: 13,
    category: 'audio',
    title: 'Next Level Audio Truck',
    description: 'Our mobile service unit ready to roll',
    image: '/images/gallery/next-level-audio-truck.jpg',
  },
];

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const tc = useTranslations('common');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<typeof galleryItems[0] | null>(null);

  const categoryNames: Record<string, string> = {
    all: t('allWork'),
    audio: t('carAudio'),
    tinting: t('windowTinting'),
    lighting: t('customLighting'),
    accessories: t('accessories'),
  };

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[#E01020] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
              {t('ourPortfolio')}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              {t('title')}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-black border-t-2 border-b-2 border-[#E01020]/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {categoryIds.map((id) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`px-6 py-2 border-2 font-semibold text-sm transition-all duration-300 cyber-button ${
                  activeCategory === id
                    ? 'bg-[#E01020]/20 text-[#E01020] border-[#E01020] neon-border-soft'
                    : 'bg-transparent text-white/60 border-[#E01020]/30 hover:border-[#E01020]/60 hover:text-[#E01020]'
                }`}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {categoryNames[id]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="bg-black border-2 border-[#E01020]/30 overflow-hidden hover:border-[#E01020] transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer neon-border-soft"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#E01020]/10 group-hover:bg-[#E01020]/20 transition-colors"></div>
                  <div className="absolute inset-0 border-b-2 border-[#E01020]/50"></div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 text-[#E01020] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      <p className="text-[#E01020] font-mono text-sm">{t('viewDetails')}</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#E01020] mb-1 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {item.title.toUpperCase()}
                  </h3>
                  <p className="text-white/60 text-sm font-mono line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/60 font-mono text-lg">{t('noItems')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-black border-2 border-[#E01020] neon-border-soft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-[#E01020] hover:text-[#FF2A3A] transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="relative">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            {/* Info */}
            <div className="p-6 border-t-2 border-[#E01020]/30">
              <h3 className="text-2xl font-bold text-[#E01020] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {selectedImage.title.toUpperCase()}
              </h3>
              <p className="text-white/70 font-mono">
                {selectedImage.description}
              </p>
              <div className="mt-4">
                <span className="inline-block px-4 py-1 bg-[#E01020]/20 text-[#E01020] border border-[#E01020]/50 text-sm font-mono uppercase">
                  {categoryNames[selectedImage.category] || selectedImage.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            {t('likeWhatYouSee')}
          </h2>
          <p className="text-xl md:text-2xl text-[#E01020] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/book-appointment"
              className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-10 py-5 font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {tc('bookAppointment')}
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-[#E01020]/50 bg-black/40 backdrop-blur-sm text-[#E01020] px-10 py-5 font-semibold text-lg hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {tc('contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
