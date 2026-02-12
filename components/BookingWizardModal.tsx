'use client';

import { useState } from 'react';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BOOKING_URL = 'https://bayready.vercel.app/book/cmlh31wyn000068j37couyy08';

export default function BookingWizardModal({ isOpen, onClose }: BookingWizardModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border-2 border-[#00A0E0]/50 w-full max-w-3xl h-[90vh] flex flex-col neon-border-soft">
        {/* Header */}
        <div className="p-4 border-b-2 border-[#00A0E0]/30 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-[#00A0E0] neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            BOOK APPOINTMENT
          </h2>
          <button
            onClick={() => {
              onClose();
              setIframeLoaded(false);
              setIframeError(false);
            }}
            className="text-[#00A0E0] hover:text-white transition-colors cursor-pointer"
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
                <div className="w-8 h-8 border-2 border-[#00A0E0]/30 border-t-[#00A0E0] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#00A0E0]/60 font-mono text-sm">Loading booking system...</p>
              </div>
            </div>
          )}

          {/* Error fallback */}
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center px-6">
                <p className="text-[#00A0E0]/80 font-mono text-sm mb-4">
                  The booking system couldn&apos;t be loaded inline.
                </p>
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-8 py-3 font-semibold text-sm hover:bg-[#00A0E0]/30 transition-all duration-300 neon-border-soft cyber-button"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
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
