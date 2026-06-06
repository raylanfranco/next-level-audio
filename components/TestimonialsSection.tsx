'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import reviewsData from '@/data/reviews.json';

interface Review {
  id: string;
  name: string;
  stars: number;
  quote: string;
}

const reviews: Review[] = reviewsData.reviews;
const aggregate = reviewsData.aggregate;

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function TestimonialsSection() {
  const t = useTranslations('reviews');
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const isDragging = useRef(false);
  const startPos = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);

  const getTranslateForIndex = useCallback((index: number) => {
    const card = cardRefs.current[index];
    if (!card) return 0;
    const offset = card.offsetLeft;
    const isDesktop = window.innerWidth >= 1024;
    let translate = -offset;
    if (!isDesktop) translate += 20;
    return translate;
  }, []);

  const applyTranslate = useCallback((translate: number, instant = false) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = instant ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(${translate}px)`;
    currentTranslate.current = translate;
    prevTranslate.current = translate;
  }, []);

  const updateCarousel = useCallback((instant = false) => {
    applyTranslate(getTranslateForIndex(currentIndex), instant);
  }, [currentIndex, getTranslateForIndex, applyTranslate]);

  // Position on mount + when index changes + on resize
  useEffect(() => {
    const timer = setTimeout(() => updateCarousel(true), 60);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDragging.current) updateCarousel();
  }, [currentIndex, updateCarousel]);

  useEffect(() => {
    const handleResize = () => updateCarousel(true);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCarousel]);

  const resetAutoAdvance = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    // Respect reduced motion — no auto-advance
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoTimer.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
  }, []);

  useEffect(() => {
    resetAutoAdvance();
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [resetAutoAdvance]);

  const pauseAutoAdvance = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
    resetAutoAdvance();
  }, [resetAutoAdvance]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    resetAutoAdvance();
  }, [resetAutoAdvance]);

  const getPositionX = (event: React.MouseEvent | React.TouchEvent) =>
    'touches' in event ? event.touches[0].clientX : event.pageX;

  const touchStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    startPos.current = getPositionX(event);
    prevTranslate.current = currentTranslate.current;
    if (trackRef.current) trackRef.current.style.transition = 'none';
    pauseAutoAdvance();
  }, [pauseAutoAdvance]);

  const touchMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = getPositionX(event) - startPos.current;
    const newTranslate = prevTranslate.current + diff;
    currentTranslate.current = newTranslate;
    if (trackRef.current) trackRef.current.style.transform = `translateX(${newTranslate}px)`;
  }, []);

  const touchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const movedBy = currentTranslate.current - prevTranslate.current;
    if (movedBy < -100) setCurrentIndex((prev) => (prev + 1) % reviews.length);
    else if (movedBy > 100) setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    else updateCarousel();
    resetAutoAdvance();
  }, [updateCarousel, resetAutoAdvance]);

  const progressPercentage = ((currentIndex + 1) / reviews.length) * 100;
  const ratingUrl = aggregate.url.includes('REPLACE_WITH') ? '#' : aggregate.url;

  return (
    <section
      className="relative w-full py-24 lg:py-32 bg-[#030303] overflow-hidden border-y border-[#1a1c20]"
      aria-labelledby="reviews-heading"
    >
      {/* Backdrop: dark radial + grill + speaker-bump rings */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, #1c1c1c 0%, #030303 70%)', opacity: 0.8 }} aria-hidden="true" />
      <div className="absolute top-0 right-0 w-3/4 h-full rev-grill opacity-[0.03] pointer-events-none transform rotate-12 scale-150" aria-hidden="true" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] rev-ring border border-[#1c1c1c]/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-[15%] -left-[5%] w-[600px] h-[600px] rev-ring border border-[#4A0000]/20 pointer-events-none" style={{ animationDelay: '0.1s' }} aria-hidden="true" />
      <div className="absolute -bottom-[10%] left-0 w-[400px] h-[400px] rev-ring border-2 border-electric-red/10 shadow-[0_0_50px_rgba(224,16,32,0.1)] pointer-events-none" style={{ animationDelay: '0.2s' }} aria-hidden="true" />

      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left column — heading + aggregate + CTA + desktop arrows */}
        <div className="lg:col-span-4 flex flex-col gap-8 relative z-20">
          {/* EQ bars */}
          <div className="flex items-end gap-[3px] h-8 w-16" aria-hidden="true">
            <div className="w-2 bg-electric-red rev-eq shadow-[0_0_8px_#e60012]" />
            <div className="w-2 bg-electric-red rev-eq rev-eq-2 shadow-[0_0_8px_#e60012]" />
            <div className="w-2 bg-electric-red rev-eq rev-eq-3 shadow-[0_0_8px_#e60012]" />
            <div className="w-2 bg-electric-red rev-eq rev-eq-4 shadow-[0_0_8px_#e60012]" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-ui text-electric-red tracking-[0.2em] text-sm uppercase font-bold">{t('kicker')}</p>
            <h2
              id="reviews-heading"
              className="font-display text-chrome font-bold text-5xl md:text-6xl lg:text-7xl leading-none uppercase"
              data-text={t('headline')}
            >
              {t('headline')}
            </h2>
          </div>

          {/* Aggregate rating panel — real Google rating */}
          <div className="flex flex-col gap-4 bg-[#0a0a0a]/80 p-6 border-l-4 border-electric-red backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 rev-metal-brushed opacity-20 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <span className="font-display font-bold text-4xl text-white leading-none">{aggregate.rating.toFixed(1)}</span>
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((i) => {
                  const filled = i <= Math.round(aggregate.rating);
                  return (
                    <StarIcon key={i} className={`w-6 h-6 ${filled ? 'text-electric-red drop-shadow-[0_0_5px_rgba(224,16,32,0.8)]' : 'text-chrome-700'}`} />
                  );
                })}
              </div>
            </div>
            <p className="text-chrome-500 font-ui font-medium text-lg relative z-10">
              {aggregate.rating.toFixed(1)} {t('ratingSuffix')}
            </p>
          </div>

          {/* Read more on Google */}
          <a
            href={ratingUrl}
            target={ratingUrl === '#' ? undefined : '_blank'}
            rel={ratingUrl === '#' ? undefined : 'noopener noreferrer'}
            className="group flex items-center gap-4 text-chrome-300 hover:text-white transition-colors w-fit mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="font-ui uppercase tracking-wider font-bold text-sm border-b border-electric-red/50 pb-1 group-hover:border-electric-red transition-colors">
              {t('ctaLink')}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#121212] border border-[#1c1c1c] flex items-center justify-center group-hover:bg-electric-red transition-colors">
              <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </a>

          {/* Desktop arrows */}
          <div className="hidden lg:flex gap-4 mt-6">
            <button onClick={prevSlide} className="rev-btn-metal w-14 h-14 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red" aria-label={t('prev')}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="rev-btn-metal w-14 h-14 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red" aria-label={t('next')}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Right column — carousel */}
        <div className="lg:col-span-8 relative">
          <div
            className="overflow-hidden scrollbar-hide pb-10 pt-4 -mx-6 px-6 lg:mx-0 lg:px-0"
            onMouseEnter={pauseAutoAdvance}
            onMouseLeave={resetAutoAdvance}
          >
            <div
              ref={trackRef}
              className="rev-track flex gap-6 md:gap-8 w-max cursor-grab active:cursor-grabbing"
              onMouseDown={touchStart}
              onMouseUp={touchEnd}
              onMouseLeave={touchEnd}
              onMouseMove={touchMove}
              onTouchStart={touchStart}
              onTouchEnd={touchEnd}
              onTouchMove={touchMove}
            >
              {reviews.map((review, index) => {
                const isActive = index === currentIndex;
                return (
                  <div
                    key={review.id}
                    ref={(el) => { cardRefs.current[index] = el; }}
                    className={`rev-card ${isActive ? 'active' : ''} w-[300px] md:w-[420px] shrink-0 bg-[#121212] border-t-2 ${isActive ? 'border-electric-red' : 'border-chrome-700'} border-x border-b ${isActive ? 'border-[#4A0000]' : 'border-[#1c1c1c]'} p-8 md:p-10 relative flex flex-col justify-between min-h-[380px]`}
                    onClick={() => { setCurrentIndex(index); resetAutoAdvance(); }}
                  >
                    <div className="absolute inset-0 rev-metal-brushed opacity-10 pointer-events-none" />
                    <div className="absolute top-4 right-6 font-display text-7xl leading-none text-chrome-700/40 select-none" aria-hidden="true">&ldquo;</div>

                    <div className="relative z-10 flex-grow">
                      <div className="flex gap-1 mb-6" aria-label={`${review.stars} out of 5 stars`}>
                        {Array.from({ length: review.stars }).map((_, i) => (
                          <StarIcon key={i} className={`w-4 h-4 text-electric-red ${isActive ? 'drop-shadow-[0_0_3px_rgba(224,16,32,0.8)]' : ''}`} />
                        ))}
                      </div>
                      <p className={`font-ui text-lg md:text-xl font-medium leading-snug ${isActive ? 'text-white' : 'text-chrome-300'}`}>
                        &ldquo;{review.quote}&rdquo;
                      </p>
                    </div>

                    <div className={`mt-8 pt-6 border-t ${isActive ? 'border-[#4A0000]/50' : 'border-[#1c1c1c]/50'} relative z-10`}>
                      <p className={`font-display font-bold text-2xl text-white tracking-wider uppercase ${isActive ? 'drop-shadow-[0_0_2px_rgba(224,16,32,0.5)]' : ''}`}>
                        {review.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile arrows */}
          <div className="flex lg:hidden justify-end gap-4 mt-6 px-6">
            <button onClick={prevSlide} className="rev-btn-metal w-12 h-12 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red" aria-label={t('prev')}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="rev-btn-metal w-12 h-12 flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red" aria-label={t('next')}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-8 mx-6 lg:mx-0 h-1 bg-[#121212] overflow-hidden flex">
            <div className="h-full bg-electric-red transition-all duration-500 shadow-[0_0_10px_#e60012]" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
