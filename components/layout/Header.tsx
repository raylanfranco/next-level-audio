'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = `transition-all duration-300 font-medium text-sm ${
    isScrolled
      ? 'text-[#00A0E0]/80 hover:text-[#00B8FF] neon-glow-soft'
      : 'text-[#00A0E0] hover:text-[#00B8FF] neon-glow-soft'
  }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md shadow-lg border-[#00A0E0]/20'
          : 'bg-transparent border-[#00A0E0]/10'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-24">
          {/* Centered Navigation Group */}
          <div className="hidden lg:flex items-center">
            {/* Left Navigation - Adjacent to Logo */}
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

            {/* Center Logo - Prominent */}
            <Link href="/" className="flex items-center justify-center flex-shrink-0 mx-8 mt-6">
              <Image
                src="/images/logo.png"
                alt="Next Level Audio"
                width={280}
                height={80}
                className="h-20 lg:h-24 w-auto transition-all duration-300 hover:scale-105"
                priority
              />
            </Link>

            {/* Right Navigation - Adjacent to Logo */}
            <nav className="flex items-center space-x-8">
              <Link
                href="/gallery"
                className={navLinkClass}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                GALLERY
              </Link>
              <Link
                href="/book-appointment"
                className={navLinkClass}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                BOOK
              </Link>
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
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 transition-colors ${
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav
            className={`lg:hidden py-4 border-t-2 transition-colors ${
              isScrolled
                ? 'border-[#00A0E0]/30 bg-black/95 backdrop-blur-md'
                : 'border-[#00A0E0]/20 bg-black/80 backdrop-blur-md'
            }`}
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-[#00A0E0] hover:text-[#00B8FF] transition-colors neon-glow-soft text-sm"
                onClick={() => setIsMenuOpen(false)}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                HOME
              </Link>
              <Link
                href="/services"
                className="text-[#00A0E0] hover:text-[#00B8FF] transition-colors neon-glow-soft text-sm"
                onClick={() => setIsMenuOpen(false)}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                SERVICES
              </Link>
              <Link
                href="/products"
                className="text-[#00A0E0] hover:text-[#00B8FF] transition-colors neon-glow-soft text-sm"
                onClick={() => setIsMenuOpen(false)}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                PRODUCTS
              </Link>
              <Link
                href="/gallery"
                className="text-[#00A0E0] hover:text-[#00B8FF] transition-colors neon-glow-soft text-sm"
                onClick={() => setIsMenuOpen(false)}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                GALLERY
              </Link>
              <Link
                href="/book-appointment"
                className="text-[#00A0E0] hover:text-[#00B8FF] transition-colors neon-glow-soft text-sm"
                onClick={() => setIsMenuOpen(false)}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                BOOK APPOINTMENT
              </Link>
              <Link
                href="/contact"
                className="text-[#00A0E0] hover:text-[#00B8FF] transition-colors neon-glow-soft text-sm"
                onClick={() => setIsMenuOpen(false)}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                CONTACT
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
