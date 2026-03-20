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

  const navLinkClass = `relative transition-all duration-300 font-medium text-sm group/link font-oxanium ${
    isScrolled
      ? 'text-white/80 hover:text-[#FF2A3A] neon-glow-soft cursor-pointer'
      : 'text-[#E01020] hover:text-[#FF2A3A] neon-glow-soft cursor-pointer'
  }`;

  const navUnderline = (
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#E01020] transition-all duration-300 group-hover/link:w-full shadow-[0_0_6px_#E01020]" />
  );

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg border-[#E01020]/20'
          : 'bg-transparent border-[#E01020]/10'
      }`}
    >
      <TopBanner />
      <div className="container mx-auto px-4">
        <div className="hidden lg:flex items-center h-20">
          {/* Logo — left aligned */}
          <Link href="/" className="flex items-center flex-shrink-0 mr-10">
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

          {/* Navigation — fills center */}
          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className={navLinkClass}
            >
              {t('home')}
              {navUnderline}
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
                {navUnderline}
              </Link>

              {/* Dropdown panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200">
                <div className="bg-black/95 backdrop-blur-md border-2 border-[#E01020]/30 min-w-[200px] py-2 shadow-[0_0_20px_rgba(224,16,32,0.15)]">
                  <Link
                    href="/services"
                    className="block px-5 py-2.5 text-white/60 hover:text-[#E01020] hover:bg-[#E01020]/5 transition-colors text-xs tracking-widest font-oxanium"
                  >
                    {t('allServices')}
                  </Link>
                  <div className="border-t border-[#E01020]/10 mx-3 my-1" />
                  {serviceSubLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-5 py-2.5 text-white/80 hover:text-[#FF2A3A] hover:bg-[#E01020]/5 transition-colors text-xs tracking-widest font-oxanium"
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
              {navUnderline}
            </Link>
            <Link
              href="/gallery"
              className={navLinkClass}
            >
              {t('gallery')}
              {navUnderline}
            </Link>
            <Link
              href="/careers"
              className={navLinkClass}
            >
              {t('careers')}
              {navUnderline}
            </Link>
            <button
              onClick={openModal}
              className={navLinkClass}
            >
              {t('book')}
              {navUnderline}
            </button>
          </nav>

          {/* Account + Cart + Contact — pushed to right */}
          <div className="ml-auto flex items-center space-x-6">
            <Link
              href={user ? '/account' : '/account/login'}
              className={`${navLinkClass} relative`}
              aria-label={user ? t('myAccount') : tc('signIn')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
            <button
              onClick={openCheckout}
              className={`${navLinkClass} relative`}
              aria-label={t('shoppingCart')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E01020] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <Link
              href="/contact"
              className={`px-4 py-2 border-2 transition-all duration-300 font-medium text-sm cyber-button ${
                isScrolled
                  ? 'bg-[#E01020]/20 text-white border-[#E01020] hover:bg-[#E01020]/30 neon-border-soft'
                  : 'bg-[#E01020]/10 text-white border-[#E01020]/50 hover:bg-[#E01020]/20 neon-border-soft'
              } font-oxanium`}
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
            className={`p-2 transition-colors cursor-pointer ${
              isScrolled ? 'text-[#E01020]' : 'text-[#E01020] drop-shadow-lg'
            }`}
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
            className="p-2 text-[#E01020] cursor-pointer"
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
              className="text-[#E01020] hover:text-[#FF2A3A] text-2xl tracking-widest neon-glow-soft transition-colors font-oxanium"
            >
              {label}
            </Link>
          ))}

          {/* Services with sub-links on mobile */}
          <div className="flex flex-col items-center">
            <Link
              href="/services"
              onClick={() => setIsMenuOpen(false)}
              className="text-[#E01020] hover:text-[#FF2A3A] text-2xl tracking-widest neon-glow-soft transition-colors font-oxanium"
            >
              {t('services')}
            </Link>
            <div className="flex flex-col items-center mt-2 space-y-1.5">
              {serviceSubLinks.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white/50 hover:text-[#FF2A3A] text-sm tracking-widest transition-colors font-oxanium"
                >
                  {sub.label.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={() => { openModal(); setIsMenuOpen(false); }}
            className="text-[#E01020] hover:text-[#FF2A3A] text-2xl tracking-widest neon-glow-soft transition-colors cursor-pointer font-oxanium"
          >
            {t('book')}
          </button>
        </nav>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-6 pb-10">
          <Link
            href={user ? '/account' : '/account/login'}
            onClick={() => setIsMenuOpen(false)}
            className="text-[#E01020] hover:text-[#FF2A3A] transition-colors cursor-pointer"
            aria-label={user ? t('myAccount') : tc('signIn')}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>
          <button
            onClick={() => { openCheckout(); setIsMenuOpen(false); }}
            className="text-[#E01020] hover:text-[#FF2A3A] transition-colors relative cursor-pointer"
            aria-label={t('shoppingCart')}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#E01020] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="px-6 py-3 border-2 border-[#E01020] text-[#E01020] text-sm tracking-widest hover:bg-[#E01020]/10 transition-colors cyber-button font-oxanium"
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
