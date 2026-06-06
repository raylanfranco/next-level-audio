'use client';

import { useTranslations } from 'next-intl';

export default function TopBanner() {
  const t = useTranslations('topBanner');

  return (
    // V2: Variant TopBar styling — uppercase, wide tracking, chrome-500 text,
    // electric-red icons, near-black bg. Keeps V1's real SVG icons + i18n.
    <div className="bg-[#020202] border-b border-white/5 text-chrome-500 text-[12px] font-ui font-semibold tracking-wider uppercase">
      <div className="px-6 lg:px-12 py-2 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        {/* Address + Directions */}
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=944+North+9th+Street+Stroudsburg+PA+18360"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-chrome-300 transition-colors group/dir"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-electric-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">944 N 9th St, Stroudsburg, PA</span>
          <span className="sm:hidden">Get Directions</span>
          <span className="ml-1 text-chrome-700 group-hover/dir:text-electric-red transition-colors border-b border-transparent group-hover/dir:border-electric-red">Directions →</span>
        </a>

        {/* Hours */}
        <span className="hidden md:flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-electric-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('hours')}
        </span>

        {/* Phone */}
        <a
          href="tel:+15707304433"
          className="flex items-center gap-2 hover:text-chrome-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-electric-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          (570) 730-4433
        </a>
      </div>
    </div>
  );
}