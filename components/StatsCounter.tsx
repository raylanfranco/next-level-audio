'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

// Chrome gradient for the stat numbers — ported verbatim from the Variant export.
const chromeStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #ffffff 0%, #e5e7eb 35%, #1f2228 50%, #9ca3af 55%, #ffffff 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0px -1px 1px rgba(255, 255, 255, 0.3))',
};

function formatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function StatCounter({
  target,
  suffix,
  label1,
  label2,
}: {
  target: number;
  suffix: string;
  label1: string;
  label2: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion: jump straight to the final value. matchMedia is
    // browser-only, so this capability check must live in an effect.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client capability detection requires an effect
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();
          const duration = 2000;

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Exponential ease-out (verbatim from Variant)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeProgress * target));
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-10 lg:py-16 relative z-10 group cursor-default">
      <div className="font-display text-7xl md:text-8xl lg:text-9xl leading-[0.8] tracking-tighter" style={chromeStyle}>
        {formatNumber(count)}
        <span className="text-4xl md:text-5xl lg:text-6xl text-[#e60012] drop-shadow-[0_0_8px_rgba(224,16,32,0.8)] ml-1 align-baseline">
          {suffix}
        </span>
      </div>
      <div className="mt-4 text-xs lg:text-sm font-bold uppercase tracking-[0.25em] text-[#777] group-hover:text-[#e60012] transition-colors duration-300 text-center font-ui">
        <span className="block">{label1}</span>
        <span className="block">{label2}</span>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-4 group">
      <div className="relative w-5 h-5 flex items-center justify-center">
        <div className="absolute inset-0 stat-round border border-[#333] group-hover:border-[#e60012]/50 transition-colors duration-300" />
        <div className="w-1.5 h-1.5 bg-[#444] stat-round group-hover:bg-[#e60012] group-hover:shadow-[0_0_8px_#e60012] transition-all duration-300" />
      </div>
      <span className="text-sm md:text-base font-semibold uppercase tracking-[0.15em] text-[#a0a0a0] group-hover:text-white transition-colors duration-300 font-ui">
        {text}
      </span>
    </li>
  );
}

function EqBars({ className, bars }: { className: string; bars: { height: string; animation: string }[] }) {
  return (
    <div className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-12 items-end gap-[3px] z-20 opacity-40 ${className}`} aria-hidden="true">
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: bar.height,
            backgroundColor: '#e60012',
            transformOrigin: 'bottom',
            animation: bar.animation,
          }}
        />
      ))}
    </div>
  );
}

const bgGraphiteStyle: React.CSSProperties = {
  backgroundColor: '#0c0c0e',
  backgroundImage:
    'radial-gradient(circle at 50% 0%, rgba(30, 30, 35, 0.4) 0%, transparent 70%), repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 4px)',
  boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9)',
};

const chromeHeadingStyle = chromeStyle;

export default function StatsCounter() {
  const t = useTranslations('stats');

  const eqSets = [
    {
      className: 'left-1/4',
      bars: [
        { height: '60%', animation: 'eq-pulse 1.2s infinite ease-in-out 0s' },
        { height: '100%', animation: 'eq-pulse 0.8s infinite ease-in-out 0.2s' },
        { height: '40%', animation: 'eq-pulse 1.1s infinite ease-in-out 0.4s' },
        { height: '80%', animation: 'eq-pulse 0.9s infinite ease-in-out 0.1s' },
      ],
    },
    {
      className: 'left-2/4',
      bars: [
        { height: '80%', animation: 'eq-pulse 1.1s infinite ease-in-out 0.4s' },
        { height: '50%', animation: 'eq-pulse 1.2s infinite ease-in-out 0s' },
        { height: '100%', animation: 'eq-pulse 0.9s infinite ease-in-out 0.1s' },
        { height: '70%', animation: 'eq-pulse 0.8s infinite ease-in-out 0.2s' },
      ],
    },
    {
      className: 'left-3/4',
      bars: [
        { height: '40%', animation: 'eq-pulse 0.8s infinite ease-in-out 0.2s' },
        { height: '90%', animation: 'eq-pulse 0.9s infinite ease-in-out 0.1s' },
        { height: '60%', animation: 'eq-pulse 1.2s infinite ease-in-out 0s' },
        { height: '100%', animation: 'eq-pulse 1.1s infinite ease-in-out 0.4s' },
      ],
    },
  ];

  const features = [t('feature1'), t('feature2'), t('feature3'), t('feature4')];

  return (
    <section className="relative w-full py-24 lg:py-32 bg-[#030303] overflow-hidden border-y border-[#1a1c20]" aria-labelledby="stats-heading">
      {/* Ambient bass glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#e60012] stat-round blur-[120px] opacity-10 pointer-events-none z-0"
        style={{ animation: 'bass-ambient 4s infinite ease-in-out', borderRadius: '100%' }}
        aria-hidden="true"
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-16 lg:gap-8 mb-20">
          <div className="w-full lg:w-7/12 relative">
            <div className="absolute -top-6 -left-6 w-8 h-8 border-t-2 border-l-2 border-[#333] opacity-50" aria-hidden="true" />
            <h2 id="stats-heading" className="font-display text-3xl md:text-5xl lg:text-[3.5rem] font-bold uppercase tracking-wide leading-[1.1] text-white">
              {t('headingLine1')} <br />
              {t('headingLine2')} <span className="block mt-3 lg:mt-4" style={chromeHeadingStyle}>{t('headingHighlight')}</span>
            </h2>
            <div className="mt-8 flex items-center gap-4 w-full max-w-md">
              <div className="h-[2px] bg-gradient-to-r from-[#e60012] to-transparent flex-grow shadow-[0_0_8px_rgba(224,16,32,0.6)]" />
              <div className="w-2 h-2 bg-[#e60012] rotate-45" style={{ boxShadow: '0 0 15px rgba(224, 16, 32, 0.7), inset 0 0 10px rgba(224, 16, 32, 0.7)' }} />
            </div>
          </div>

          <div className="w-full lg:w-5/12 flex lg:justify-end">
            <ul className="flex flex-col gap-5">
              {features.map((text, i) => (
                <FeatureItem key={i} text={text} />
              ))}
            </ul>
          </div>
        </div>

        <div className="border border-[#1a1c20] relative" style={bgGraphiteStyle}>
          <div className="absolute top-2 left-2 w-1.5 h-1.5 stat-round bg-[#333] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)]" aria-hidden="true" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 stat-round bg-[#333] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)]" aria-hidden="true" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 stat-round bg-[#333] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)]" aria-hidden="true" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 stat-round bg-[#333] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)]" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative">
            <StatCounter target={20} suffix="+" label1={t('yearsLabel1')} label2={t('yearsLabel2')} />
            <EqBars className={eqSets[0].className} bars={eqSets[0].bars} />
            <div className="lg:hidden w-full h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent" aria-hidden="true" />

            <StatCounter target={15} suffix="+" label1={t('brandsLabel1')} label2={t('brandsLabel2')} />
            <EqBars className={eqSets[1].className} bars={eqSets[1].bars} />
            <div className="hidden md:block lg:hidden absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#333] to-transparent" aria-hidden="true" />
            <div className="md:hidden w-full h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent" aria-hidden="true" />

            <StatCounter target={5} suffix="★" label1={t('ratingLabel1')} label2={t('ratingLabel2')} />
            <EqBars className={eqSets[2].className} bars={eqSets[2].bars} />
            <div className="lg:hidden w-full h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent" aria-hidden="true" />

            <StatCounter target={100} suffix="%" label1={t('warrantyLabel1')} label2={t('warrantyLabel2')} />
          </div>
        </div>
      </div>
    </section>
  );
}
