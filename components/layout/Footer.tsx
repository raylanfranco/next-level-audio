'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Footer() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const quickLinks = [
    { href: '/' as const, label: t('aboutUs') },
    { href: '/services' as const, label: t('services') },
    { href: '/products' as const, label: t('products') },
    { href: '/gallery' as const, label: t('gallery') },
    { href: '/careers' as const, label: t('careers') },
    { href: '/contact' as const, label: t('contact') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <footer className="nla-footer" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">{t('brandName')}</h2>
      <div className="relative z-[2] max-w-[1600px] mx-auto px-6 lg:px-12 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-12 lg:gap-16 mb-16">
          {/* Brand */}
          <div className="nla-foot-col flex flex-col items-start">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-end gap-[2px] h-6" aria-hidden="true">
                <div className="nla-eq-bar"></div>
                <div className="nla-eq-bar"></div>
                <div className="nla-eq-bar"></div>
              </div>
              <span className="nla-foot-brand">{t('brandName')}</span>
            </div>
            <p className="text-[#adb5bd] uppercase tracking-[0.2em] text-sm font-semibold mb-8 font-ui">
              {t('tagline')}
            </p>
            <LanguageSwitcher />
          </div>

          {/* Quick Links */}
          <nav className="nla-foot-col" aria-label={t('quickLinks')}>
            <h3 className="nla-foot-h4">{t('quickLinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="nla-foot-link font-ui">{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/#financing" className="nla-foot-link font-ui">{t('financing')}</Link>
              </li>
            </ul>
          </nav>

          {/* Contact / HQ */}
          <div className="nla-foot-col">
            <h3 className="nla-foot-h4">{t('contactInfo')}</h3>
            <div className="space-y-4 font-ui">
              <div className="flex gap-3">
                <span className="text-[#343a40] font-bold uppercase text-xs tracking-[0.1em] w-14 pt-1 shrink-0">{t('location')}</span>
                <span className="text-[#f8f9fa] leading-snug">
                  944 N 9th St.<br />Stroudsburg, PA 18360
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-[#343a40] font-bold uppercase text-xs tracking-[0.1em] w-14 pt-1 shrink-0">{t('phone')}</span>
                <a href="tel:+15707304433" className="nla-foot-link font-display text-lg !text-white tracking-wide">(570) 730-4433</a>
              </div>
              <div className="flex gap-3">
                <span className="text-[#343a40] font-bold uppercase text-xs tracking-[0.1em] w-14 pt-1 shrink-0">{t('email')}</span>
                <a href="mailto:nextlevelauto@ymail.com" className="nla-foot-link font-ui break-all">nextlevelauto@ymail.com</a>
              </div>
              <div className="flex gap-3">
                <span className="text-[#343a40] font-bold uppercase text-xs tracking-[0.1em] w-14 pt-1 shrink-0">{t('hours')}</span>
                <span className="text-[#adb5bd] leading-relaxed">
                  {t('monFri')}<br />{t('saturday')}<br />{t('sunday')}
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="nla-foot-col">
            <h3 className="nla-foot-h4">{t('newsletterHeading')}</h3>
            <p className="text-[#adb5bd] text-sm mb-4 leading-relaxed tracking-[0.03em] font-ui">
              {t('newsletterDesc')}
            </p>
            <form onSubmit={handleSubmit} className="relative">
              <div className="nla-news-wrap">
                <label htmlFor="newsletter-email" className="sr-only">{t('email')}</label>
                <input
                  id="newsletter-email"
                  type="email"
                  className="nla-news-input"
                  placeholder={t('newsletterPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                />
                <button type="submit" className="nla-news-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red" aria-label={t('newsletterSubscribe')} disabled={status === 'loading'}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
                  </svg>
                </button>
              </div>
              {status === 'success' && (
                <p className="text-electric-red text-xs mt-2 tracking-[0.1em] font-ui" role="status">{t('newsletterSuccess')}</p>
              )}
              {status === 'error' && (
                <p className="text-chrome-500 text-xs mt-2 tracking-[0.1em] font-ui" role="status">{t('newsletterError')}</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1a1b1e] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[#343a40] text-xs font-semibold tracking-[0.1em] uppercase font-ui">
          <div>{t('copyright', { year: new Date().getFullYear() })}</div>
          <div className="flex items-center gap-2">
            {t('siteBy')}{' '}
            <a
              href="https://www.victoryrush.dev"
              target="_blank"
              rel="noopener"
              className="text-[#adb5bd] hover:text-white transition-colors"
            >
              Victory Rush
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
