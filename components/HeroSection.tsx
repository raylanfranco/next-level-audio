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

export default function HeroSection({ videoSrc = DEFAULT_VIDEO_URL, videoPoster }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { openModal } = useBookingModal();
  // Default to false (poster) so SSR + first paint match. The browser-only
  // capability checks below (matchMedia / navigator.connection) can't run
  // during render without a hydration mismatch, so opting into video must
  // happen in an effect — a sanctioned "sync with external system" case.
  const [showVideo, setShowVideo] = useState(false);
  const t = useTranslations('hero');
  const tc = useTranslations('common');

  useEffect(() => {
    // On mobile / reduced-motion / data-saver, keep the poster (no video).
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;

    if (isMobile || prefersReduced || saveData) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- client capability detection requires an effect
    setShowVideo(true);
  }, []);

  // Once video is mounted, kick off playback.
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [showVideo]);

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
    <header className="relative flex flex-col justify-center min-h-[640px] h-dvh bg-black overflow-hidden pt-20">
      {/* V1 hero video as the base layer (with mobile/reduced-motion/save-data guards + parallax) */}
      <div className="absolute inset-0 z-0">
        {videoSrc && showVideo ? (
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
          // Fullscreen object-cover poster swapped imperatively with the <video>;
          // next/image adds no benefit for a decorative background layer here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={videoPoster || '/images/hero-poster.webp'}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Variant atmospheric overlays — layered over the video to preserve the Variant look */}
      <div className="absolute inset-0 bg-metallic-gradient opacity-70 z-0 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-brushed-metal opacity-30 z-0 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-noise z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_100%)] opacity-80 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-0"></div>

      {/* Red glow blobs */}
      <div className="absolute top-1/2 right-[-10%] w-[800px] h-[800px] bg-electric-red hero-round blur-[150px] opacity-[0.15] mix-blend-screen transform -translate-y-1/2 animate-pulse-glow-blob z-0"></div>
      <div className="absolute top-1/2 right-[10%] w-[400px] h-[400px] bg-hot-red hero-round blur-[100px] opacity-[0.1] mix-blend-screen transform -translate-y-1/2 z-0"></div>

      {/* Variant speaker-ring motif — lifted ABOVE the video (z-[5]) at 30% opacity
          so it plays over the footage and adds motion the static shop video lacks.
          Kept at the Variant's right-of-center position (.ring-base left:70%). */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden opacity-30">
        <div className="ring-base ring-pulse w-[1400px] h-[1400px]"></div>
        <div className="ring-base ring-dashed animate-spin-slow w-[1100px] h-[1100px]"></div>
        <div className="ring-base w-[800px] h-[800px] ring-glow"></div>
        <div className="ring-base ring-dashed w-[550px] h-[550px] border-[rgba(255,255,255,0.1)]"></div>
        <div className="absolute top-1/2 left-[70%] transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 hero-round bg-gradient-to-br from-gray-800 to-black border border-gray-700 shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center">
          <div className="w-16 h-16 hero-round bg-black shadow-[inset_0_5px_10px_rgba(255,255,255,0.1),0_0_20px_rgba(230,0,18,0.2)]"></div>
        </div>
      </div>

      {/* Light streaks */}
      <div className="absolute top-[30%] left-[40%] w-[200px] h-[1px] bg-gradient-to-r from-transparent via-electric-red to-transparent opacity-50 rotate-[-45deg] blur-[1px] z-0"></div>
      <div className="absolute top-[60%] right-[30%] w-[300px] h-[2px] bg-gradient-to-r from-transparent via-chrome-100 to-transparent opacity-30 rotate-[15deg] blur-[2px] z-0"></div>

      {/* EQ bars */}
      <div className="absolute bottom-[20%] right-[10%] z-0 flex items-end gap-[6px] h-48 opacity-40 transform skew-x-[-10deg]">
        <div className="w-3 bg-gradient-to-t from-black via-electric-red to-hot-red animate-eq-1 origin-bottom"></div>
        <div className="w-3 bg-gradient-to-t from-black via-chrome-700 to-chrome-300 animate-eq-2 origin-bottom"></div>
        <div className="w-3 bg-gradient-to-t from-black via-electric-red to-hot-red animate-eq-3 origin-bottom shadow-[0_0_15px_#e60012]"></div>
        <div className="w-3 bg-gradient-to-t from-black via-chrome-700 to-chrome-300 animate-eq-4 origin-bottom"></div>
        <div className="w-3 bg-gradient-to-t from-black via-electric-red to-hot-red animate-eq-5 origin-bottom"></div>
        <div className="w-3 bg-gradient-to-t from-black via-chrome-700 to-chrome-300 animate-eq-1 origin-bottom" style={{ animationDelay: '0.3s' }}></div>
        <div className="w-3 bg-gradient-to-t from-black via-electric-red to-hot-red animate-eq-2 origin-bottom shadow-[0_0_15px_#e60012]" style={{ animationDelay: '0.1s' }}></div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 h-full justify-center pb-24">
        {/* Left: headline + copy + CTAs */}
        <div className="flex-1 flex flex-col items-start justify-center">
          <div className="max-w-4xl hero-stagger hero-stagger-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-electric-red shadow-[0_0_10px_#e60012]"></div>
              <span className="font-ui text-chrome-300 font-bold tracking-[0.4em] uppercase text-sm">{t('welcome')}</span>
            </div>
            {/* Headline fix: two clean clamped lines, no manual <br/> indent, no mid-gradient
                black band slicing the text. "YOUR JOURNEY" picks up the electric-red accent. */}
            <h1 className="font-display text-[clamp(3.5rem,11vw,11rem)] leading-[0.85] uppercase tracking-normal mb-6">
              <span className="block text-chrome" data-text={t('elevate')}>{t('elevate')}</span>
              <span className="block text-electric-red drop-shadow-[0_0_20px_rgba(230,0,18,0.4)]">{t('yourJourney')}</span>
            </h1>
          </div>

          <div className="max-w-2xl hero-stagger hero-stagger-2">
            <p className="font-ui text-xl sm:text-2xl text-chrome-300 font-medium leading-relaxed border-l-2 border-white/10 pl-6 mb-12">
              {t('description')}{' '}
              <span className="text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{t('description2')}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 hero-stagger hero-stagger-3">
            <button
              onClick={openModal}
              className="btn-glow w-full sm:w-auto px-10 py-5 text-base font-bold tracking-[0.2em] uppercase text-white flex items-center justify-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {tc('bookAppointment')}
            </button>

            <Link
              href="/services"
              className="btn-ghost group w-full sm:w-auto px-10 py-5 text-base font-bold tracking-[0.2em] uppercase text-chrome-100 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className="relative z-10">{tc('ourServices')}</span>
            </Link>
          </div>
        </div>

        {/* Right: closeout carousel (desktop) */}
        <div className="hero-stagger hero-stagger-4 hidden lg:block flex-shrink-0 w-full max-w-md">
          <CloseoutCarousel />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-32 left-6 lg:left-16 flex flex-col items-center gap-2 hero-stagger hero-stagger-4 z-10">
        <span className="font-ui text-[10px] tracking-[0.3em] text-chrome-500 uppercase rotate-[-90deg] origin-left translate-y-8 translate-x-3 whitespace-nowrap">Scroll</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-electric-red to-transparent"></div>
      </div>

      {/* Brand marquee — V1 brand logo imagery in the Variant bottom bar */}
      <div className="absolute bottom-0 left-0 w-full bg-black/90 border-t border-white/5 backdrop-blur-md overflow-hidden z-20">
        <div className="absolute inset-0 shadow-[inset_0_10px_20px_rgba(0,0,0,1)] pointer-events-none z-10"></div>
        <BrandMarquee />
      </div>
    </header>
  );
}
