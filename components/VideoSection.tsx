'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function VideoSection() {
  const previewRef = useRef<HTMLVideoElement>(null);
  const lightboxRef = useRef<HTMLVideoElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Autoplay preview video
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.play().catch(() => {});
    }
  }, []);

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    if (lightboxRef.current) {
      lightboxRef.current.pause();
    }
  }, []);

  // Auto-play lightbox video when opened
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      lightboxRef.current.play().catch(() => {});
    }
  }, [lightboxOpen]);

  // Close on Escape
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, closeLightbox]);

  return (
    <>
      <section className="relative bg-black overflow-hidden border-t-2 border-[#00A0E0]/30">
        {/* Section heading */}
        <div className="py-16 md:py-20">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center">
              <h2
                className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow hover-glitch"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                SEE US IN ACTION
              </h2>
              <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono px-4">
                Watch our expert technicians transform vehicles with premium installations and services
              </p>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Full-width video preview */}
        <AnimateOnScroll animation="scale-up" delay={0.15}>
          <div
            className="relative w-full h-[50vh] md:h-[60vh] cursor-pointer group"
            onClick={openLightbox}
          >
            {/* Preview video — muted autoplay loop */}
            <video
              ref={previewRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src="/videos/about.mp4" type="video/mp4" />
            </video>

            {/* Dark gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

            {/* Scanline overlay for cyberpunk flair */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 160, 224, 0.03) 2px, rgba(0, 160, 224, 0.03) 4px)',
              }}
            />

            {/* Play button + text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              {/* Play circle */}
              <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-[#00A0E0] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 pulse-glow bg-black/40 backdrop-blur-sm">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-[#00A0E0] ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p
                className="mt-4 text-white/80 text-sm md:text-base font-mono uppercase tracking-widest group-hover:text-[#00A0E0] transition-colors duration-300"
              >
                Watch the Full Video
              </p>
            </div>

            {/* Bottom neon line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00A0E0]/50" />
          </div>
        </AnimateOnScroll>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-[#00A0E0] hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Close video"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Video container */}
          <div
            className="relative w-full max-w-5xl mx-4 border-2 border-[#00A0E0]/30 neon-border-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={lightboxRef}
              className="w-full"
              controls
              autoPlay
              playsInline
              preload="auto"
            >
              <source src="/videos/about.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
