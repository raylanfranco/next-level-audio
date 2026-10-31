'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

export default function DealCarousel({ children }: { children: ReactNode }) {
  const t = useTranslations('blackFriday');
  const railRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  function updateEdges() {
    const rail = railRef.current;
    if (!rail) return;
    const start = rail.scrollLeft <= 2;
    const end = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
    setEdges((previous) => previous.start === start && previous.end === end ? previous : { start, end });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  function move(direction: number) {
    const rail = railRef.current;
    const card = rail?.firstElementChild;
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p id="deal-carousel-help" className="font-ui text-sm text-chrome-300">{t('browseHint')}</p>
        <div className="flex shrink-0 gap-2">
          {([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => move(direction)}
              disabled={direction === -1 ? edges.start : edges.end}
              aria-label={t(direction === -1 ? 'previous' : 'next')}
              aria-controls="black-friday-deal-list"
              className="flex h-11 w-11 cursor-pointer items-center justify-center border border-white/30 font-ui text-xl text-white transition-colors hover:border-amber-300 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-default disabled:opacity-25"
            >
              <span aria-hidden="true">{direction === -1 ? '←' : '→'}</span>
            </button>
          ))}
        </div>
      </div>
      <ul
        id="black-friday-deal-list"
        ref={railRef}
        tabIndex={0}
        aria-label={t('listLabel')}
        aria-describedby="deal-carousel-help"
        onScroll={updateEdges}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
        className="flex snap-x snap-mandatory scroll-px-1 gap-5 overflow-x-auto overscroll-x-contain px-1 pt-1 pb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:gap-6"
        style={{ scrollbarColor: '#fcd34d #171717', scrollbarWidth: 'thin' }}
      >
        {children}
      </ul>
    </div>
  );
}
