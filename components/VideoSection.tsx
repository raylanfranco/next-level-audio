'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import AnimateOnScroll from '@/components/AnimateOnScroll';

const Screws = () => (
  <>
    <div className="svc-screw svc-screw-tl" aria-hidden="true" />
    <div className="svc-screw svc-screw-tr" aria-hidden="true" />
    <div className="svc-screw svc-screw-bl" aria-hidden="true" />
    <div className="svc-screw svc-screw-br" aria-hidden="true" />
  </>
);

export default function VideoSection() {
  const t = useTranslations('home');
  const previewRef = useRef<HTMLVideoElement>(null);
  const lightboxRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Lazy-load preview video: play only when section is visible
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && previewRef.current) {
          previewRef.current.play().catch(() => {});
        } else if (!entry.isIntersecting && previewRef.current) {
          previewRef.current.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    if (lightboxRef.current) {
      lightboxRef.current.pause();
    }
    // Return focus to the trigger (WCAG 2.1 AA)
    triggerRef.current?.focus();
  }, []);

  // Auto-play lightbox video + focus management when opened
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      lightboxRef.current.play().catch(() => {});
      closeBtnRef.current?.focus();
    }
  }, [lightboxOpen]);

  // Close on Escape
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, closeLightbox]);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-[#030303] overflow-hidden py-20 md:py-28 border-y border-[#1a1c20]"
        aria-labelledby="video-heading"
      >
        <div className="absolute inset-0 bg-noise z-0" aria-hidden="true" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
          {/* Heading — Variant eyebrow + chrome headline */}
          <AnimateOnScroll animation="fade-up">
            <div className="flex flex-col items-start gap-2 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-[2px] bg-electric-red shadow-[0_0_10px_#e60012]" />
                <span className="font-ui text-chrome-300 font-bold tracking-[0.4em] uppercase text-xs">
                  {t('videoEyebrow')}
                </span>
              </div>
              <h2
                id="video-heading"
                className="font-display text-chrome uppercase leading-[0.9] tracking-tight text-[clamp(2.5rem,6vw,5rem)]"
                data-text={t('videoHeading')}
              >
                {t('videoHeading')}
              </h2>
              <p className="font-ui text-lg text-chrome-300 max-w-2xl mt-2 leading-relaxed">
                {t('videoDescription')}
              </p>
            </div>
          </AnimateOnScroll>

          {/* Framed graphite video panel w/ screws */}
          <AnimateOnScroll animation="scale-up" delay={0.15}>
            <div className="video-frame relative p-2 md:p-3">
              <Screws />
              <button
                ref={triggerRef}
                type="button"
                onClick={openLightbox}
                aria-haspopup="dialog"
                aria-label={t('watchFullVideo')}
                className="group relative block w-full h-[50vh] md:h-[60vh] overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                {/* Preview video — muted autoplay loop */}
                <video
                  ref={previewRef}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                >
                  <source src="/videos/about.mp4" type="video/mp4" />
                </video>

                {/* Variant chrome overlay + dark gradients for legibility */}
                <div className="absolute inset-0 prod-overlay mix-blend-multiply pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

                {/* Brushed-metal scanline flair */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(224, 16, 32, 0.03) 2px, rgba(224, 16, 32, 0.03) 4px)',
                  }}
                />

                {/* EQ bars accent (bottom-right), echoing the services/stats motif */}
                <div className="hidden md:flex absolute bottom-6 right-8 items-end gap-[3px] h-12 opacity-40 z-10" aria-hidden="true">
                  {[
                    { h: '40%', a: 'eq-pulse 1.2s infinite ease-in-out 0s' },
                    { h: '90%', a: 'eq-pulse 0.8s infinite ease-in-out 0.2s' },
                    { h: '60%', a: 'eq-pulse 1.1s infinite ease-in-out 0.4s' },
                    { h: '100%', a: 'eq-pulse 0.9s infinite ease-in-out 0.1s' },
                    { h: '50%', a: 'eq-pulse 1.3s infinite ease-in-out 0.3s' },
                  ].map((bar, i) => (
                    <div key={i} style={{ width: '3px', height: bar.h, backgroundColor: '#e60012', transformOrigin: 'bottom', animation: bar.a }} />
                  ))}
                </div>

                {/* Speaker-ring play button (focal interaction) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <span className="play-ring play-ring-1" aria-hidden="true" />
                    <span className="play-ring play-ring-2" aria-hidden="true" />
                    <span className="play-ring play-ring-3" aria-hidden="true" />
                    <span className="play-core w-20 h-20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-electric-red ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-6 font-ui text-white text-sm md:text-base uppercase tracking-[0.25em] group-hover:text-electric-red transition-colors duration-300">
                    {t('watchFullVideo')}
                  </p>
                </div>
              </button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Lightbox Modal — Variant beveled frame */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={t('videoHeading')}
        >
          <button
            ref={closeBtnRef}
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-electric-red hover:text-white transition-colors z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={t('closeVideo')}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="video-frame relative w-full max-w-5xl mx-4 p-2" onClick={(e) => e.stopPropagation()}>
            <Screws />
            <video ref={lightboxRef} className="w-full" controls autoPlay playsInline preload="auto">
              <source src="/videos/about.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
