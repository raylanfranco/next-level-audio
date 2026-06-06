'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

// Gallery category IDs
const categoryIds = ['all', 'audio', 'tinting', 'lighting', 'accessories'] as const;

interface GalleryItem {
  id: number;
  category: string;
  title: string;
  description: string;
  image: string;
}

const galleryItems: GalleryItem[] = [
  { id: 1, category: 'accessories', title: 'Auto Accessories', description: 'Premium auto accessories installation and customization', image: '/images/gallery/auto-accessories.jpg' },
  { id: 2, category: 'accessories', title: 'Custom Accessory Install', description: 'Professional accessory fitting and installation', image: '/images/gallery/auto-accessories-1.jpg' },
  { id: 3, category: 'accessories', title: 'Accessory Upgrade', description: 'Quality parts and expert installation', image: '/images/gallery/auto-accessories-2.jpg' },
  { id: 4, category: 'accessories', title: 'Custom Build', description: 'Tailored accessories to match your style', image: '/images/gallery/auto-accessories-3.jpg' },
  { id: 5, category: 'accessories', title: 'Vehicle Enhancement', description: 'Functional and aesthetic accessory upgrades', image: '/images/gallery/auto-accessories-4.jpg' },
  { id: 6, category: 'accessories', title: 'Accessory Detail', description: 'Attention to detail on every install', image: '/images/gallery/auto-accessories-5.jpg' },
  { id: 7, category: 'accessories', title: 'Finished Accessory Work', description: 'Clean, professional results every time', image: '/images/gallery/auto-accessories-6.jpg' },
  { id: 8, category: 'audio', title: 'Auto Service', description: 'Full-service automotive work by our expert team', image: '/images/gallery/auto-service.jpg' },
  { id: 9, category: 'audio', title: 'Service in Progress', description: 'Hands-on craftsmanship on every project', image: '/images/gallery/auto-service-1.jpg' },
  { id: 10, category: 'audio', title: 'Service Work', description: 'Behind the scenes at Next Level Audio', image: '/images/gallery/auto-service-2.jpg' },
  { id: 11, category: 'audio', title: 'Car Audio Installation', description: 'Premium car audio systems installed by professionals', image: '/images/gallery/car-audio.jpg' },
  { id: 12, category: 'tinting', title: 'Window Tinting', description: 'Professional ceramic window tint application', image: '/images/gallery/window-tinting-1.jpg' },
  { id: 13, category: 'audio', title: 'Next Level Audio Truck', description: 'Our mobile service unit ready to roll', image: '/images/gallery/next-level-audio-truck.jpg' },
];

// Adaptive bento: cyclic sizing pattern so any filtered count tiles cleanly.
// Position 0 of each 6-item cycle is a 2x2 feature; position 3 is a tall tile.
function bentoClass(index: number): string {
  const pos = index % 6;
  if (pos === 0) return 'feature';
  if (pos === 3) return 'tall';
  return '';
}

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const tc = useTranslations('common');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const categoryNames: Record<string, string> = {
    all: t('allWork'),
    audio: t('carAudio'),
    tinting: t('windowTinting'),
    lighting: t('customLighting'),
    accessories: t('accessories'),
  };

  const filteredItems =
    activeCategory === 'all' ? galleryItems : galleryItems.filter((item) => item.category === activeCategory);

  // Scroll-reveal for all revealable blocks (heading, filter, tiles, CTA)
  useEffect(() => {
    const els = mainRef.current?.querySelectorAll('.gallery-reveal:not(.is-visible)');
    if (!els || els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredItems]);

  // Lightbox: Escape close, focus return, scroll lock
  useEffect(() => {
    if (!selectedImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  const openLightbox = (item: GalleryItem, e: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = e.currentTarget;
    setSelectedImage(item);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    triggerRef.current?.focus();
  };

  return (
    <div className="w-full bg-[#030303] relative">
      {/* Ambient backdrop — concentric rings + pulsing red glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute w-[1200px] h-[1200px] hero-round border border-white/[0.02] top-[30%] left-1/2 -translate-x-1/2 shadow-[inset_0_0_100px_rgba(0,0,0,1)]" />
        <div className="absolute w-[900px] h-[900px] hero-round border border-white/[0.03] top-[30%] left-1/2 -translate-x-1/2" />
        <div className="absolute top-[10%] left-[12%] w-[600px] h-[600px] bg-electric-red gallery-ambient blur-[200px] mix-blend-screen" />
        <div className="absolute bottom-[15%] right-[8%] w-[500px] h-[500px] bg-electric-red gallery-ambient blur-[180px] mix-blend-screen" style={{ animationDelay: '-4s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030303_100%)]" />
      </div>

      <main ref={mainRef} className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12 pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Heading — EQ bars + eyebrow + chrome headline */}
        <div className="gallery-reveal mb-12 md:mb-16 flex flex-col items-start">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-end gap-[3px] h-6 md:h-8" aria-hidden="true">
              <div className="w-2 md:w-3 bg-electric-red rev-eq" style={{ animationDuration: '0.9s' }} />
              <div className="w-2 md:w-3 bg-electric-red rev-eq" style={{ animationDuration: '1.2s', animationDelay: '0.1s' }} />
              <div className="w-2 md:w-3 bg-electric-red rev-eq" style={{ animationDuration: '0.8s', animationDelay: '0.3s' }} />
              <div className="w-2 md:w-3 bg-electric-red rev-eq" style={{ animationDuration: '1.1s', animationDelay: '0.2s' }} />
              <div className="w-2 md:w-3 bg-electric-red rev-eq" style={{ animationDuration: '1.0s', animationDelay: '0.4s' }} />
            </div>
            <span className="font-display text-electric-red text-2xl md:text-3xl tracking-[0.3em] uppercase font-bold">
              {t('theWork')}
            </span>
          </div>
          <h1 className="font-display text-chrome text-6xl md:text-8xl xl:text-[7rem] leading-none uppercase tracking-tight" data-text={t('recentBuilds')}>
            {t('recentBuilds')}
          </h1>
          <p className="font-ui text-chrome-300 text-lg md:text-xl max-w-2xl mt-4">{t('description')}</p>
        </div>

        {/* Category filter */}
        <div className="gallery-reveal flex flex-wrap gap-8 mb-10 border-y border-white/5 py-5">
          {categoryIds.map((id) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`font-ui text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                activeCategory === id ? 'text-white border-b border-electric-red pb-1' : 'text-chrome-500 hover:text-white'
              }`}
            >
              {categoryNames[id]}
            </button>
          ))}
        </div>

        {/* Adaptive bento grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-chrome-500 font-ui text-lg">{t('noItems')}</p>
          </div>
        ) : (
          <div className="gallery-grid w-full">
            {filteredItems.map((item, index) => (
              <button
                key={item.id}
                onClick={(e) => openLightbox(item, e)}
                className={`gallery-tile gallery-reveal ${bentoClass(index)} group relative overflow-hidden block w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
                style={{ transitionDelay: `${Math.min(index * 60, 400)}ms` }}
                aria-label={`${item.title} — ${t('viewDetails')}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent group-hover:from-black/80 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="transform translate-y-4 opacity-70 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out mb-3">
                    <span className="gallery-chip inline-block text-white font-display font-bold uppercase tracking-[0.2em] px-3 py-1 text-sm">
                      {categoryNames[item.category] || item.category}
                    </span>
                  </div>
                  <h3 className="font-display text-white leading-tight transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-75 uppercase text-2xl md:text-3xl">
                    {item.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="gallery-reveal mt-20 md:mt-28 text-center flex flex-col items-center">
          <h2 className="font-display text-chrome uppercase leading-[0.9] tracking-tight text-[clamp(2.5rem,6vw,5rem)] mb-6" data-text={t('likeWhatYouSee')}>
            {t('likeWhatYouSee')}
          </h2>
          <p className="font-ui text-xl md:text-2xl text-chrome-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/book-appointment" className="btn-glow font-ui px-10 py-5 text-base font-bold tracking-[0.2em] uppercase text-white flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">
              {tc('bookAppointment')}
            </Link>
            <Link href="/contact" className="btn-ghost group font-ui px-10 py-5 text-base font-bold tracking-[0.2em] uppercase text-chrome-100 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">
              <span className="relative z-10">{tc('contactUs')}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
        >
          <div className="relative w-full max-w-4xl bg-[#121212] border border-[#333] shadow-[0_0_60px_rgba(224,16,32,0.25)]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-electric-red transition-colors font-display text-lg uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red"
              aria-label={tc('close')}
            >
              {tc('close')}
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage.image} alt={selectedImage.title} className="w-full max-h-[60vh] object-contain bg-black" />
            <div className="p-6 md:p-8 border-t border-[#333]">
              <span className="gallery-chip inline-block text-white font-display font-bold uppercase tracking-[0.2em] px-3 py-1 text-sm mb-4">
                {categoryNames[selectedImage.category] || selectedImage.category}
              </span>
              <h3 id="lightbox-title" className="font-display text-white text-2xl md:text-3xl uppercase tracking-tight mb-3">
                {selectedImage.title}
              </h3>
              <p className="font-ui text-lg text-chrome-300">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
