'use client';

import { Link } from '@/i18n/navigation';
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBookingModal } from './BookingModalContext';
import BrandMarquee from './BrandMarquee';
import CloseoutCarousel from './CloseoutCarousel';

const DEFAULT_VIDEO_URL = '/videos/hero-video.mp4';

interface HeroSectionProps {
  videoSrc?: string;
  videoPoster?: string;
}

function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="inline-block">
      {displayText}
      <span
        className={`inline-block w-[2px] h-[0.8em] bg-[#E01020] ml-1 align-middle ${
          showCursor ? 'animate-pulse' : 'opacity-0'
        }`}
      />
    </span>
  );
}

export default function HeroSection({ videoSrc = DEFAULT_VIDEO_URL, videoPoster }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { openModal } = useBookingModal();
  const [showVideo, setShowVideo] = useState(true);
  const t = useTranslations('hero');
  const tc = useTranslations('common');

  useEffect(() => {
    // On mobile, skip video entirely — use poster only
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;

    if (isMobile || prefersReduced || saveData) {
      setShowVideo(false);
      return;
    }

    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Parallax effect — direct DOM manipulation (no React re-renders)
  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (videoRef.current) {
            videoRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video with Parallax (desktop) or Poster (mobile) */}
      {videoSrc ? (
        <>
          {showVideo ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={videoPoster || '/images/hero-poster.webp'}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <img
              src={videoPoster || '/images/hero-poster.webp'}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-[#E01020]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#E01020]/30 via-black to-[#E01020]/20" />
      )}

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 cyber-grid z-0"></div>

      {/* Content with Staggered Entrance */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left: Hero text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="hero-stagger hero-stagger-1 text-[#E01020] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft font-oxanium">
              {t('welcome')}
            </p>
            <h1 className="hero-stagger hero-stagger-2 text-[clamp(2.5rem,6vw,6rem)] font-bold mb-6 text-white leading-tight neon-glow font-oxanium">
              {t('elevate')}
              <span className="block text-[#E01020] neon-glow-soft">{t('yourJourney')}</span>
              <span className="block text-sm md:text-lg text-white font-normal mt-2">
                <TypewriterText text={t('typewriter')} />
              </span>
            </h1>
            <p className="hero-stagger hero-stagger-3 text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-mono">
              {t('description')}<br />
              {t('description2')}
            </p>
            <div className="hero-stagger hero-stagger-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <button
                onClick={openModal}
                className="px-8 py-4 bg-[#E01020]/20 text-white border-2 border-[#E01020] font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button cursor-pointer font-oxanium"
              >
                {tc('bookAppointment')}
              </button>
              <Link
                href="/services"
                className="px-8 py-4 bg-black/40 backdrop-blur-sm text-white border-2 border-[#E01020]/50 font-semibold text-lg hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button font-oxanium"
              >
                {tc('ourServices')}
              </Link>
            </div>
          </div>

          {/* Right: Closeout carousel (desktop) */}
          <div className="hero-stagger hero-stagger-4 hidden lg:block flex-shrink-0 w-full max-w-md">
            <CloseoutCarousel />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Brand Marquee */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BrandMarquee />
      </div>
    </section>
  );
}
