'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/components/CartContext';

interface CloseoutItem {
  id: string;
  name: string;
  price: number; // cents
  stockCount: number;
  imageUrl: string | null;
}

export default function CloseoutCarousel() {
  const [items, setItems] = useState<CloseoutItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { addItem } = useCart();
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    fetch('/api/closeout-products')
      .then((r) => r.json())
      .then((data) => {
        if (data.items?.length) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  const transition = useCallback((newIndex: number, dir: 'next' | 'prev') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(dir);
    // Brief fade out, then switch
    setTimeout(() => {
      setCurrent(newIndex);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const next = useCallback(() => {
    transition((current + 1) % items.length, 'next');
  }, [current, items.length, transition]);

  const prev = useCallback(() => {
    transition((current - 1 + items.length) % items.length, 'prev');
  }, [current, items.length, transition]);

  // Auto-rotate every 5s
  useEffect(() => {
    if (items.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [items.length, isPaused, next]);

  if (items.length === 0) return null;

  const item = items[current];
  const priceStr = `$${(item.price / 100).toFixed(2)}`;

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer frame */}
      <div className="relative border border-[#E01020]/30 bg-black/40 backdrop-blur-sm overflow-hidden">
        {/* Top accent bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#E01020]/10 border-b border-[#E01020]/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E01020] shadow-[0_0_8px_#E01020] animate-pulse" />
            <span className="text-[#E01020] text-[10px] font-bold tracking-[0.25em] font-oxanium uppercase">
              Closeout Deals
            </span>
          </div>
          <span className="text-white/30 text-[10px] font-mono">
            {current + 1} / {items.length}
          </span>
        </div>

        {/* Main image — hero-sized */}
        <div className="relative h-[320px] bg-gradient-to-b from-black/40 via-black/20 to-black/60 flex items-center justify-center overflow-hidden">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-contain p-2 drop-shadow-[0_0_30px_rgba(224,16,32,0.15)]"
                sizes="(max-width: 448px) 100vw, 448px"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/20">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Nav arrows — floating over image */}
          {items.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm border border-white/10 text-white/50 hover:text-white hover:border-[#E01020]/60 hover:bg-black/70 transition-all cursor-pointer"
                aria-label="Previous deal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm border border-white/10 text-white/50 hover:text-white hover:border-[#E01020]/60 hover:bg-black/70 transition-all cursor-pointer"
                aria-label="Next deal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Low stock badge — top right */}
          {item.stockCount > 0 && item.stockCount <= 3 && (
            <div className="absolute top-3 right-3 bg-[#FFD700]/90 text-black text-[9px] font-bold font-oxanium tracking-wider px-2 py-0.5 uppercase">
              Only {item.stockCount} left
            </div>
          )}
        </div>

        {/* Product info bar */}
        <div className="px-4 py-3 border-t border-[#E01020]/20 bg-black/60">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-oxanium font-semibold text-sm leading-tight line-clamp-2">
                {item.name}
              </h3>
            </div>
            <span className="text-[#E01020] font-oxanium font-bold text-xl neon-glow-soft whitespace-nowrap flex-shrink-0">
              {priceStr}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={() =>
                addItem({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                })
              }
              className="flex-1 py-2 bg-[#E01020]/20 border border-[#E01020] text-white text-xs font-oxanium font-semibold tracking-wider hover:bg-[#E01020]/40 transition-all cursor-pointer text-center uppercase"
            >
              Add to Cart
            </button>
            <Link
              href="/products"
              className="py-2 px-3 border border-white/20 text-white/60 text-xs font-oxanium tracking-wider hover:text-white hover:border-white/40 transition-all text-center uppercase"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Progress dots */}
        {items.length > 1 && (
          <div className="flex justify-center gap-2 py-2.5 bg-black/40">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => transition(i, i > current ? 'next' : 'prev')}
                className={`h-[3px] transition-all duration-300 cursor-pointer ${
                  i === current
                    ? 'w-6 bg-[#E01020] shadow-[0_0_8px_#E01020]'
                    : 'w-3 bg-white/15 hover:bg-white/30'
                }`}
                aria-label={`Go to deal ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
