'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const otherLocale = locale === 'en' ? 'es' : 'en';
  const label = locale === 'en' ? 'ES' : 'EN';

  function handleSwitch() {
    startTransition(() => {
      router.replace(
        { pathname },
        { locale: otherLocale }
      );
    });
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className="px-2.5 py-1 border border-[#E01020]/40 text-[#E01020] text-xs font-bold font-mono tracking-wider hover:bg-[#E01020]/10 hover:border-[#E01020] transition-all duration-200 disabled:opacity-50 cursor-pointer"
      style={{ fontFamily: 'var(--font-oxanium)' }}
      aria-label={`Switch to ${otherLocale === 'en' ? 'English' : 'Español'}`}
    >
      {isPending ? '...' : label}
    </button>
  );
}
