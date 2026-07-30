'use client';

import { useState, useEffect } from 'react';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BOOKING_URL = 'https://whos-next-frontend.vercel.app/book/cmn7rxnc6000001ofxq4dea0q';

export default function BookingWizardModal({ isOpen, onClose }: BookingWizardModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Lock background scroll while open (prevents the double-scroll fight on
  // mobile where the page scrolls behind the overlay) and allow Escape to close.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Mobile + small tablet: full-bleed overlay, no padding. Desktop (md+): centered modal.
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center md:p-4">
      {/*
        Mobile/tablet: edge-to-edge, full dynamic-viewport height (dvh accounts
        for the mobile browser address bar so the app isn't clipped), no border.
        Desktop (md+): the original centered card with the neon border, unchanged.
      */}
      <div className="bg-black w-full h-[100dvh] flex flex-col md:max-w-3xl md:h-[90vh] md:border-2 md:border-[#E01020]/50 md:neon-border-soft">
        {/* Header — slimmer on mobile to give the booking app more vertical room */}
        <div className="p-3 md:p-4 border-b-2 border-[#E01020]/30 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-[#E01020] neon-glow font-oxanium">
            BOOK APPOINTMENT
          </h2>
          <button
            onClick={() => {
              onClose();
              setIframeLoaded(false);
              setIframeError(false);
            }}
            className="text-[#E01020] hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Iframe Content */}
        <div className="flex-1 relative overflow-hidden">
          {/* Loading state */}
          {!iframeLoaded && !iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#E01020]/30 border-t-[#E01020] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60 font-mono text-sm">Loading booking system...</p>
              </div>
            </div>
          )}

          {/* Error fallback */}
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center px-6">
                <p className="text-white/80 font-mono text-sm mb-4">
                  The booking system couldn&apos;t be loaded inline.
                </p>
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-8 py-3 font-semibold text-sm hover:bg-[#E01020]/30 transition-all duration-300 neon-border-soft cyber-button font-oxanium"
                >
                  OPEN BOOKING PAGE
                </a>
              </div>
            </div>
          )}

          <iframe
            src={BOOKING_URL}
            title="Book an Appointment"
            className={`w-full h-full border-0 ${iframeError ? 'hidden' : ''}`}
            style={{}}
            onLoad={() => setIframeLoaded(true)}
            onError={() => setIframeError(true)}
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </div>
  );
}
