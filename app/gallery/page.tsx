'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

// Gallery categories
const categories = [
  { id: 'all', name: 'ALL WORK' },
  { id: 'audio', name: 'CAR AUDIO' },
  { id: 'tinting', name: 'WINDOW TINTING' },
  { id: 'lighting', name: 'CUSTOM LIGHTING' },
  { id: 'accessories', name: 'ACCESSORIES' },
];

// Mock gallery items - replace with actual images from your work
const galleryItems = [
  {
    id: 1,
    category: 'audio',
    title: 'Custom Subwoofer Enclosure',
    description: 'Custom-built ported enclosure with dual 12" subwoofers',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
  },
  {
    id: 2,
    category: 'tinting',
    title: 'Full Vehicle Tint - BMW M3',
    description: '20% ceramic tint on all windows with 5% rear',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
  },
  {
    id: 3,
    category: 'audio',
    title: 'Component Speaker Upgrade',
    description: 'Premium 6.5" component speakers with custom pods',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  },
  {
    id: 4,
    category: 'lighting',
    title: 'LED Interior Lighting',
    description: 'RGB ambient lighting with smartphone control',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
  },
  {
    id: 5,
    category: 'tinting',
    title: 'Commercial Window Tint',
    description: 'Privacy tint for commercial fleet vehicles',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
  },
  {
    id: 6,
    category: 'audio',
    title: 'Full System Install - Jeep Wrangler',
    description: 'Complete audio overhaul with amplifier and DSP',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
  },
  {
    id: 7,
    category: 'accessories',
    title: 'Backup Camera Installation',
    description: 'HD backup camera with parking guidelines',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=600&fit=crop',
  },
  {
    id: 8,
    category: 'lighting',
    title: 'LED Headlight Conversion',
    description: 'Upgraded to 6000K LED headlights and fog lights',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
  },
  {
    id: 9,
    category: 'tinting',
    title: 'Ceramic Tint - Tesla Model 3',
    description: 'Full ceramic tint package with windshield strip',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
  },
  {
    id: 10,
    category: 'audio',
    title: 'Head Unit Upgrade',
    description: 'Apple CarPlay/Android Auto head unit installation',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
  },
  {
    id: 11,
    category: 'accessories',
    title: 'Dash Cam Installation',
    description: 'Front and rear dash cam with hardwire kit',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop',
  },
  {
    id: 12,
    category: 'lighting',
    title: 'Underglow Kit',
    description: 'RGB underglow with wireless remote control',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&h=600&fit=crop',
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<typeof galleryItems[0] | null>(null);

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
            <p className="text-[#00A0E0] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
              OUR PORTFOLIO
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              GALLERY
            </h1>
            <p className="text-[#00A0E0]/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              Browse our recent work and see the quality craftsmanship we deliver on every project.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-black border-t-2 border-b-2 border-[#00A0E0]/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-2 border-2 font-semibold text-sm transition-all duration-300 cyber-button ${
                  activeCategory === category.id
                    ? 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0] neon-border-soft'
                    : 'bg-transparent text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60 hover:text-[#00A0E0]'
                }`}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {category.name}
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
                className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer neon-border-soft"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors"></div>
                  <div className="absolute inset-0 border-b-2 border-[#00A0E0]/50"></div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 text-[#00A0E0] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      <p className="text-[#00A0E0] font-mono text-sm">VIEW DETAILS</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#00A0E0] mb-1 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {item.title.toUpperCase()}
                  </h3>
                  <p className="text-[#00A0E0]/60 text-sm font-mono line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#00A0E0]/60 font-mono text-lg">No items found in this category.</p>
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
            className="relative max-w-5xl w-full bg-black border-2 border-[#00A0E0] neon-border-soft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-[#00A0E0] hover:text-[#00B8FF] transition-colors"
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
            <div className="p-6 border-t-2 border-[#00A0E0]/30">
              <h3 className="text-2xl font-bold text-[#00A0E0] mb-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {selectedImage.title.toUpperCase()}
              </h3>
              <p className="text-[#00A0E0]/70 font-mono">
                {selectedImage.description}
              </p>
              <div className="mt-4">
                <span className="inline-block px-4 py-1 bg-[#00A0E0]/20 text-[#00A0E0] border border-[#00A0E0]/50 text-sm font-mono uppercase">
                  {categories.find((c) => c.id === selectedImage.category)?.name || selectedImage.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            LIKE WHAT YOU SEE?
          </h2>
          <p className="text-xl md:text-2xl text-[#00A0E0] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
            Let us transform your vehicle with the same quality craftsmanship. Get in touch today!
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
