'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect, useCallback } from 'react';
import AnimateOnScroll from '@/components/AnimateOnScroll';

type ServiceKey = 'audio' | 'tint' | 'acc';

const SERVICE_HREF = {
  audio: '/services/car-audio',
  tint: '/services/window-tinting',
  acc: '/products',
} as const;

const ArrowIcon = () => (
  <svg className="svc-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
  </svg>
);

const Screws = () => (
  <>
    <div className="svc-screw svc-screw-tl" aria-hidden="true" />
    <div className="svc-screw svc-screw-tr" aria-hidden="true" />
    <div className="svc-screw svc-screw-bl" aria-hidden="true" />
    <div className="svc-screw svc-screw-br" aria-hidden="true" />
  </>
);

export default function ServicesSection() {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const [active, setActive] = useState<ServiceKey | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const detail: Record<ServiceKey, { title: string; body: string; cta: string }> = {
    audio: { title: t('carAudio'), body: t('carAudioDetail'), cta: t('viewFullPage') },
    tint: { title: t('windowTinting'), body: t('windowTintingDetail'), cta: t('viewFullPage') },
    acc: { title: t('autoAccessories'), body: t('autoAccessoriesDetail'), cta: t('viewFullPage') },
  };

  const open = (key: ServiceKey, e: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = e.currentTarget;
    setActive(key);
  };

  const close = useCallback(() => {
    setActive(null);
    // Return focus to the trigger that opened the modal (WCAG 2.1 AA).
    triggerRef.current?.focus();
  }, []);

  // Move focus into the modal on open; trap Tab; close on Escape.
  useEffect(() => {
    if (!active) return;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [active, close]);

  return (
    <section className="py-20 md:py-32 bg-black relative overflow-hidden" aria-labelledby="services-heading">
      {/* subtle noise + metallic base to match the Variant services backdrop */}
      <div className="absolute inset-0 bg-noise z-0" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section header — fire bar + eyebrow + chrome headline */}
        <AnimateOnScroll animation="fade-up">
          <header className="flex flex-col items-start gap-2 pl-6 mb-12 relative">
            <div className="absolute top-0 left-0 w-[4px] h-full svc-section-bar" aria-hidden="true" />
            <span className="font-ui font-bold text-sm tracking-[0.3em] uppercase text-electric-red">
              {t('servicesEyebrow')}
            </span>
            <h2
              id="services-heading"
              className="font-display text-chrome uppercase leading-[0.9] tracking-tight text-[clamp(2rem,5vw,4.5rem)]"
              data-text={t('servicesHeading')}
            >
              {t('servicesHeading')}
            </h2>
            <p className="font-ui text-lg text-chrome-300 max-w-[600px] mt-2 leading-relaxed">
              {t('servicesDescription')}
            </p>
          </header>
        </AnimateOnScroll>

        <div className="svc-grid">
          {/* Card 01 — Car Audio (large, animated speaker cone) */}
          <AnimateOnScroll animation="fade-up" className="svc-card svc-card-audio">
            <Screws />
            <div className="svc-graphic" aria-hidden="true">
              <div className="svc-speaker-cone" />
            </div>
            <div className="svc-card-number" aria-hidden="true">01</div>
            <div className="svc-card-content">
              <h3 className="svc-card-title">{t('carAudio')}</h3>
              <p className="svc-card-desc">{t('carAudioDesc')}</p>
              <button
                type="button"
                className="svc-btn"
                aria-haspopup="dialog"
                onClick={(e) => open('audio', e)}
              >
                {t('learnMore')}
                <ArrowIcon />
              </button>
            </div>
          </AnimateOnScroll>

          {/* Card 02 — Window Tinting (tint slashes + EQ bars) */}
          <AnimateOnScroll animation="fade-up" delay={0.15} className="svc-card svc-card-tint">
            <Screws />
            <div className="svc-graphic" aria-hidden="true">
              <div className="svc-tint-slashes" />
              <div className="svc-eq-bars">
                <div className="svc-eq-bar" style={{ height: '40%' }} />
                <div className="svc-eq-bar" style={{ height: '70%' }} />
                <div className="svc-eq-bar" style={{ height: '30%' }} />
                <div className="svc-eq-bar" style={{ height: '90%' }} />
              </div>
            </div>
            <div className="svc-card-number" aria-hidden="true">02</div>
            <div className="svc-card-content">
              <h3 className="svc-card-title">{t('windowTinting')}</h3>
              <p className="svc-card-desc">{t('windowTintingDesc')}</p>
              <button
                type="button"
                className="svc-btn"
                aria-haspopup="dialog"
                onClick={(e) => open('tint', e)}
              >
                {t('learnMore')}
                <ArrowIcon />
              </button>
            </div>
          </AnimateOnScroll>

          {/* Card 03 — Auto Accessories (tech grid + EQ bars) */}
          <AnimateOnScroll animation="fade-up" delay={0.3} className="svc-card svc-card-acc">
            <Screws />
            <div className="svc-graphic" aria-hidden="true">
              <div className="svc-tech-grid" />
              <div className="svc-eq-bars">
                <div className="svc-eq-bar" style={{ height: '60%' }} />
                <div className="svc-eq-bar" style={{ height: '20%' }} />
                <div className="svc-eq-bar" style={{ height: '80%' }} />
                <div className="svc-eq-bar" style={{ height: '50%' }} />
              </div>
            </div>
            <div className="svc-card-number" aria-hidden="true">03</div>
            <div className="svc-card-content">
              <h3 className="svc-card-title">{t('autoAccessories')}</h3>
              <p className="svc-card-desc">{t('autoAccessoriesDesc')}</p>
              <button
                type="button"
                className="svc-btn"
                aria-haspopup="dialog"
                onClick={(e) => open('acc', e)}
              >
                {t('learnMore')}
                <ArrowIcon />
              </button>
            </div>
          </AnimateOnScroll>
        </div>
      </div>

      {/* Detail modal — Variant beveled panel, accessible (focus trap + Escape) */}
      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/85"
          onClick={close}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-modal-title"
            aria-describedby="svc-modal-desc"
            className="svc-modal-panel relative w-full max-w-[600px] p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Screws />
            <h3
              id="svc-modal-title"
              className="font-display text-chrome uppercase text-2xl mb-6 pt-1"
              data-text={detail[active].title}
            >
              {detail[active].title}
            </h3>
            <p id="svc-modal-desc" className="font-ui text-base text-[#aaa] leading-relaxed">
              {detail[active].body}
            </p>
            <div className="mt-8 flex items-center justify-between gap-4">
              <Link
                href={SERVICE_HREF[active]}
                className="svc-btn"
                onClick={close}
              >
                {detail[active].cta}
                <ArrowIcon />
              </Link>
              <button ref={closeRef} type="button" className="svc-btn" onClick={close}>
                {tc('close')}
                <svg className="svc-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
