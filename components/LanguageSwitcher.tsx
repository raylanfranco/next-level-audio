'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const otherLocale = locale === 'en' ? 'es' : 'en';
  const label = locale === 'en' ? 'ES' : 'EN';

  function handleSwitch() {
    // Hard navigation to force full page refresh with new locale
    const newPath = otherLocale === 'es' ? `/es${pathname}` : pathname;
    window.location.href = newPath;
  }

  return (
    <button
      onClick={handleSwitch}
      className="px-2.5 py-1 border border-[#E01020]/40 text-[#E01020] text-xs font-bold font-mono tracking-wider hover:bg-[#E01020]/10 hover:border-[#E01020] transition-all duration-200 cursor-pointer"
      style={{ fontFamily: 'var(--font-oxanium)' }}
      aria-label={`Switch to ${otherLocale === 'en' ? 'English' : 'Español'}`}
    >
      {label}
    </button>
  );
}
