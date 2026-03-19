'use client';

import Image from 'next/image';

const brandLogos = [
  { name: 'Pioneer', src: '/images/brands/pioneer-logo.png' },
  { name: 'Alpine', src: '/images/brands/alpine-logo.png' },
  { name: 'Kicker', src: '/images/brands/kicker-logo.png' },
  { name: 'JL Audio', src: '/images/brands/jl-audio-logo.png' },
  { name: 'Rockford Fosgate', src: '/images/brands/rockford-fosgate-logo.png' },
  { name: 'Focal', src: '/images/brands/focal-logo.png' },
  { name: 'Hertz', src: '/images/brands/hertz-car-audio-logo.png' },
  { name: 'Skar Audio', src: '/images/brands/skar-audio-logo.png' },
  { name: 'Taramps', src: '/images/brands/taramps-logo.png' },
  { name: 'Sundown Audio', src: '/images/brands/sundown-audio-logo.png' },
  { name: 'Compustar', src: '/images/brands/compustar-logo-black.webp' },
  { name: 'Viper', src: '/images/brands/viper-auto-security-logo.png' },
  { name: 'Morel', src: '/images/brands/morel-logo.png' },
  { name: 'Stinger', src: '/images/brands/stinger-logo.png' },
  { name: 'Metra', src: '/images/brands/metra-logo.png' },
];

export default function BrandMarquee() {
  const allLogos = [...brandLogos, ...brandLogos];

  return (
    <div className="relative overflow-hidden py-6" aria-hidden="true">
      {/* Fade edges — dark to match hero bg */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-black to-transparent z-10" />

      <div className="marquee-track">
        {allLogos.map((brand, idx) => (
          <div
            key={`${brand.name}-${idx}`}
            className="flex-shrink-0 mx-6 md:mx-10 flex items-center justify-center brightness-0 invert opacity-30 hover:opacity-80 hover:brightness-100 hover:invert-0 transition-all duration-500"
          >
            <Image
              src={brand.src}
              alt={brand.name}
              width={120}
              height={48}
              className="h-7 md:h-9 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}