'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-black text-[#E01020] border-t-2 border-[#E01020]/30 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <h3 className="text-[#E01020] text-xl font-bold mb-6 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>{t('brandName')}</h3>
            <p className="text-white/70 leading-relaxed font-mono text-sm">
              {t('brandDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#E01020] text-xl font-bold mb-6 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>{t('quickLinks')}</h3>
            <ul className="space-y-3 font-mono text-sm">
              <li>
                <Link href="/" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  {t('careers')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <a href="/#financing" className="text-white/70 hover:text-[#E01020] transition-colors neon-glow-soft">
                  {t('financing')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-[#E01020] text-xl font-bold mb-6 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>{t('contactInfo')}</h3>
            <ul className="space-y-3 text-white/70 font-mono text-sm">
              <li>
                <a href="tel:+15707304433" className="hover:text-[#E01020] transition-colors neon-glow-soft">
                  (570) 730-4433
                </a>
              </li>
              <li className="leading-relaxed">
                944 North 9th Street<br />
                Stroudsburg, PA 18360
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-[#E01020] text-xl font-bold mb-6 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>{t('hours')}</h3>
            <ul className="space-y-3 text-white/70 font-mono text-sm">
              <li>{t('monFri')}</li>
              <li>{t('saturday')}</li>
              <li>{t('sunday')}</li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-[#E01020]/30 mt-12 pt-8 text-center">
          <p className="text-white/60 text-sm font-mono">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
