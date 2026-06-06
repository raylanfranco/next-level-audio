'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useBookingModal } from '@/components/BookingModalContext';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TopBanner from '@/components/layout/TopBanner';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { openModal } = useBookingModal();
  const { itemCount, openCheckout } = useCart();
  const { user } = useAuth();
  const t = useTranslations('header');
  const tc = useTranslations('common');

  const serviceSubLinks = [
    { href: '/services/window-tinting' as const, label: t('windowTinting') },
    { href: '/services/car-audio' as const, label: t('carAudio') },
  ];

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // V2: Variant navbar link styling — chrome→white with red underglow,
  // uppercase Rajdhani. The .nav-link class supplies the animated underline,
  // so no separate navUnderline span is needed.
  const navLinkClass =
    'nav-link font-ui text-sm font-bold tracking-widest uppercase cursor-pointer';

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg border-[#E01020]/20'
          : 'bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px] border-transparent'
      }`}
    >
      <TopBanner />
      <div className="px-6 lg:px-12">
        <div className="hidden lg:flex items-center h-20">
          {/* Logo — far left (flex-1 zone so nav can truly center) */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/images/logo.webp"
                alt="Next Level Audio"
                width={945}
                height={745}
                className="h-16 lg:h-20 w-auto transition-all duration-300 hover:scale-105"
                priority
                fetchPriority="high"
              />
            </Link>
          </div>

          {/* Navigation — centered */}
          <nav className="flex items-center justify-center space-x-8">
            <Link
              href="/"
              className={navLinkClass}
            >
              {t('home')}
            </Link>

            {/* Services dropdown */}
            <div className="relative group/dropdown">
              <Link
                href="/services"
                className={`${navLinkClass} flex items-center gap-1`}
              >
                {t('services')}
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover/dropdown:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Dropdown panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200">
                <div className="bg-graphite/95 backdrop-blur-md border border-white/10 min-w-[200px] py-2 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <Link
                    href="/services"
                    className="block px-5 py-2.5 font-ui text-chrome-500 hover:text-electric-red hover:bg-white/5 transition-colors text-xs tracking-widest uppercase"
                  >
                    {t('allServices')}
                  </Link>
                  <div className="border-t border-white/10 mx-3 my-1" />
                  {serviceSubLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-5 py-2.5 font-ui text-chrome-300 hover:text-white hover:bg-white/5 transition-colors text-xs tracking-widest uppercase"
                    >
                      {sub.label.toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/products"
              className={navLinkClass}
            >
              {t('products')}
            </Link>
            <Link
              href="/gallery"
              className={navLinkClass}
            >
              {t('gallery')}
            </Link>
            <Link
              href="/careers"
              className={navLinkClass}
            >
              {t('careers')}
            </Link>
            <button
              onClick={openModal}
              className={navLinkClass}
            >
              {t('book')}
            </button>
          </nav>

          {/* Account + Cart + Contact — right zone (flex-1 to balance the logo zone) */}
          <div className="flex-1 flex items-center justify-end space-x-6">
            <Link
              href={user ? '/account' : '/account/login'}
              className="relative text-chrome-300 hover:text-electric-red transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label={user ? t('myAccount') : tc('signIn')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
            <button
              onClick={openCheckout}
              className="relative text-chrome-300 hover:text-electric-red transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label={t('shoppingCart')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-electric-red text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <Link
              href="/contact"
              className="btn-glow font-ui px-8 py-3 text-sm font-bold tracking-[0.2em] uppercase text-white flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {t('contact')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.webp"
              alt="Next Level Audio"
              width={945}
              height={745}
              className="h-12 w-auto"
              priority
              fetchPriority="high"
            />
          </Link>
          <button
            className="p-2 text-chrome-100 transition-colors cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t('toggleMenu')}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>
    </header>

    {/* Full-screen mobile navigation overlay */}
    {isMenuOpen && (
      <div className="fixed inset-0 z-[60] lg:hidden bg-black/98 backdrop-blur-md flex flex-col">
        {/* Overlay header — matches mobile bar */}
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
            <Image
              src="/images/logo.webp"
              alt="Next Level Audio"
              width={945}
              height={745}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <button
            className="p-2 text-chrome-100 cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
            aria-label={t('closeMenu')}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links — centered vertically */}
        <nav className="flex-1 flex flex-col items-center justify-center space-y-6">
          {[
            { href: '/' as const, label: t('home') },
            { href: '/products' as const, label: t('products') },
            { href: '/gallery' as const, label: t('gallery') },
            { href: '/careers' as const, label: t('careers') },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className="nav-link font-ui font-bold text-chrome-100 hover:text-white text-2xl tracking-widest uppercase transition-colors"
            >
              {label}
            </Link>
          ))}

          {/* Services with sub-links on mobile */}
          <div className="flex flex-col items-center">
            <Link
              href="/services"
              onClick={() => setIsMenuOpen(false)}
              className="nav-link font-ui font-bold text-chrome-100 hover:text-white text-2xl tracking-widest uppercase transition-colors"
            >
              {t('services')}
            </Link>
            <div className="flex flex-col items-center mt-2 space-y-1.5">
              {serviceSubLinks.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-ui text-chrome-500 hover:text-electric-red text-sm tracking-widest uppercase transition-colors"
                >
                  {sub.label.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={() => { openModal(); setIsMenuOpen(false); }}
            className="nav-link font-ui font-bold text-chrome-100 hover:text-white text-2xl tracking-widest uppercase transition-colors cursor-pointer"
          >
            {t('book')}
          </button>
        </nav>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-6 pb-10">
          <Link
            href={user ? '/account' : '/account/login'}
            onClick={() => setIsMenuOpen(false)}
            className="text-chrome-300 hover:text-electric-red transition-colors cursor-pointer"
            aria-label={user ? t('myAccount') : tc('signIn')}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
          <button
            onClick={() => { openCheckout(); setIsMenuOpen(false); }}
            className="text-chrome-300 hover:text-electric-red transition-colors relative cursor-pointer"
            aria-label={t('shoppingCart')}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-electric-red text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="btn-glow font-ui px-6 py-3 text-sm font-bold tracking-[0.2em] uppercase text-white transition-colors"
          >
            {t('contact')}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    )}
    </>
  );
}
