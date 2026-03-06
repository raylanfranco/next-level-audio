'use client';

import { Link } from '@/i18n/navigation';
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBookingModal } from './BookingModalContext';

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
        // Blink cursor a few times then hide
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
  const [scrollY, setScrollY] = useState(0);
  const t = useTranslations('hero');
  const tc = useTranslations('common');

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay prevented:', error);
      });
    }
  }, []);

  // Parallax effect — disabled on mobile
  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video with Parallax */}
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `translateY(${scrollY * 0.25}px)` }}
            autoPlay
            loop
            muted
            playsInline
            poster={videoPoster}
            crossOrigin="anonymous"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-[#E01020]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#E01020]/30 via-black to-[#E01020]/20" />
      )}

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 cyber-grid z-0"></div>

      {/* Content with Staggered Entrance */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p
            className="hero-stagger hero-stagger-1 text-[#E01020] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {t('welcome')}
          </p>
          <h1
            className="hero-stagger hero-stagger-2 text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight neon-glow"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {t('elevate')}
            <span className="block text-[#E01020] neon-glow-soft">{t('yourJourney')}</span>
            <span className="block text-sm md:text-lg text-white font-normal mt-2">
              <TypewriterText text={t('typewriter')} />
            </span>
          </h1>
          <p className="hero-stagger hero-stagger-3 text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed font-mono">
            {t('description')}<br />
            {t('description2')}
          </p>
          <div className="hero-stagger hero-stagger-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={openModal}
              className="px-8 py-4 bg-[#E01020]/20 text-white border-2 border-[#E01020] font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {tc('bookAppointment')}
            </button>
            <Link
              href="/services"
              className="px-8 py-4 bg-black/40 backdrop-blur-sm text-white border-2 border-[#E01020]/50 font-semibold text-lg hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {tc('ourServices')}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
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
    </section>
  );
}
