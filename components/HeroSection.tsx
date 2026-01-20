'use client';

import Link from 'next/link';
import { useRef, useEffect } from 'react';
import { useBookingModal } from './BookingModalContext';

// Default video - local file in public folder for reliable playback
const DEFAULT_VIDEO_URL = '/videos/hero-video.mp4';

interface HeroSectionProps {
  videoSrc?: string;
  videoPoster?: string;
}

export default function HeroSection({ videoSrc = DEFAULT_VIDEO_URL, videoPoster }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { openModal } = useBookingModal();

  useEffect(() => {
    // Ensure video plays and loops
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay prevented:', error);
      });
    }
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
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
          {/* Video Overlay - Black at top for nav visibility, fading to blue */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-[#00A0E0]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </>
      ) : (
        // Fallback gradient if no video
        <div className="absolute inset-0 bg-gradient-to-br from-[#00A0E0]/30 via-black to-[#00A0E0]/20" />
      )}

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 cyber-grid z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#00A0E0] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
            WELCOME TO NEXT LEVEL AUDIO
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            ELEVATE
            <span className="block text-[#00A0E0] neon-glow-soft">YOUR JOURNEY</span>
            <span className="block text-sm md:text-lg text-white font-normal mt-2">
              WITH OUR EXPERT TOUCH
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed font-mono">
            Indulge your vehicle with our meticulous car audio installation and window tinting services.<br />
            Experience premium quality that turns heads on every road adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={openModal}
              className="px-8 py-4 bg-[#00A0E0]/20 text-white border-2 border-[#00A0E0] font-semibold text-lg hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              BOOK APPOINTMENT
            </button>
            <Link
              href="/services"
              className="px-8 py-4 bg-black/40 backdrop-blur-sm text-white border-2 border-[#00A0E0]/50 font-semibold text-lg hover:border-[#00A0E0] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              OUR SERVICES
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

