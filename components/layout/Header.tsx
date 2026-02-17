'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useBookingModal } from '@/components/BookingModalContext';
import { useCart } from '@/components/CartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { openModal } = useBookingModal();
  const { itemCount, openCheckout } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
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

  const navLinkClass = `transition-all duration-300 font-medium text-sm ${
    isScrolled
      ? 'text-[#00A0E0]/80 hover:text-[#00B8FF] neon-glow-soft cursor-pointer'
      : 'text-[#00A0E0] hover:text-[#00B8FF] neon-glow-soft cursor-pointer'
  }`;

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg border-[#00A0E0]/20'
          : 'bg-transparent border-[#00A0E0]/10'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="hidden lg:flex items-center justify-center h-28 relative">
          {/* Centered Navigation Group: links + logo + links */}
          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className={navLinkClass}
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              HOME
            </Link>
            <Link
              href="/services"
              className={navLinkClass}
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              SERVICES
            </Link>
            <Link
              href="/products"
              className={navLinkClass}
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              PRODUCTS
            </Link>
          </nav>

          <Link href="/" className="flex items-center justify-center flex-shrink-0 mx-8 mt-8">
            <Image
              src="/images/logo.png"
              alt="Next Level Audio"
              width={360}
              height={100}
              className="h-24 lg:h-32 w-auto transition-all duration-300 hover:scale-105"
              priority
            />
          </Link>

          <nav className="flex items-center space-x-8">
            <Link
              href="/gallery"
              className={navLinkClass}
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              GALLERY
            </Link>
            <Link
              href="/careers"
              className={navLinkClass}
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              CAREERS
            </Link>
            <button
              onClick={openModal}
              className={navLinkClass}
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              BOOK
            </button>
          </nav>

          {/* Cart + Contact — absolute so they don't shift the centered group */}
          <div className="absolute right-0 flex items-center space-x-6">
            <button
              onClick={openCheckout}
              className={`${navLinkClass} relative`}
              style={{ fontFamily: 'var(--font-oxanium)' }}
              aria-label="Shopping cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#00A0E0] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <Link
              href="/contact"
              className={`px-4 py-2 border-2 transition-all duration-300 font-medium text-sm cyber-button ${
                isScrolled
                  ? 'bg-[#00A0E0]/20 text-white border-[#00A0E0] hover:bg-[#00A0E0]/30 neon-border-soft'
                  : 'bg-[#00A0E0]/10 text-white border-[#00A0E0]/50 hover:bg-[#00A0E0]/20 neon-border-soft'
              }`}
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              CONTACT
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Next Level Audio"
              width={180}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <button
            className={`p-2 transition-colors cursor-pointer ${
              isScrolled ? 'text-[#00A0E0]' : 'text-[#00A0E0] drop-shadow-lg'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
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
              src="/images/logo.png"
              alt="Next Level Audio"
              width={180}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <button
            className="p-2 text-[#00A0E0] cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links — centered vertically */}
        <nav className="flex-1 flex flex-col items-center justify-center space-y-6">
          {[
            { href: '/', label: 'HOME' },
            { href: '/services', label: 'SERVICES' },
            { href: '/products', label: 'PRODUCTS' },
            { href: '/gallery', label: 'GALLERY' },
            { href: '/careers', label: 'CAREERS' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className="text-[#00A0E0] hover:text-[#00B8FF] text-2xl tracking-widest neon-glow-soft transition-colors"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => { openModal(); setIsMenuOpen(false); }}
            className="text-[#00A0E0] hover:text-[#00B8FF] text-2xl tracking-widest neon-glow-soft transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            BOOK
          </button>
        </nav>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-6 pb-10">
          <button
            onClick={() => { openCheckout(); setIsMenuOpen(false); }}
            className="text-[#00A0E0] hover:text-[#00B8FF] transition-colors relative cursor-pointer"
            aria-label="Shopping cart"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#00A0E0] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="px-6 py-3 border-2 border-[#00A0E0] text-[#00A0E0] text-sm tracking-widest hover:bg-[#00A0E0]/10 transition-colors cyber-button"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            CONTACT
          </Link>
        </div>
      </div>
    )}
    </>
  );
}
