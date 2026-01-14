'use client';

import { useState, useEffect } from 'react';

interface VideoLightboxProps {
  videoId: string;
  thumbnail?: string;
  title?: string;
  className?: string;
}

export default function VideoLightbox({
  videoId,
  thumbnail,
  title,
  className = '',
}: VideoLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Prevent body scroll when lightbox is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <>
      {/* Thumbnail Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative group cursor-pointer overflow-hidden ${className}`}
        aria-label={`Play video: ${title || 'Video'}`}
        style={{ borderRadius: 0 }}
      >
        <div className="relative aspect-video bg-black">
          <img
            src={thumbnailUrl}
            alt={title || 'Video thumbnail'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-[#00A0E0]/20 border-2 border-[#00A0E0] flex items-center justify-center group-hover:bg-[#00A0E0]/30 transition-colors shadow-2xl transform group-hover:scale-110 neon-border-soft pulse-glow" style={{ borderRadius: 0 }}>
              <svg
                className="w-8 h-8 text-[#00A0E0] ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {title && (
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-[#00A0E0] font-semibold text-lg neon-glow-soft drop-shadow-lg" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {title.toUpperCase()}
              </h3>
            </div>
          )}
        </div>
      </button>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 md:top-8 md:right-8 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Close video"
            style={{ borderRadius: 0 }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Video Container */}
          <div
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full bg-black">
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || 'Video player'}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

