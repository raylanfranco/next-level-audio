import type { MetadataRoute } from 'next';

const SITE_URL = 'https://nextlevelaudiopa.com';
const PUBLIC_ROUTES = [
  '',
  '/careers',
  '/contact',
  '/gallery',
  '/products',
  '/services',
  '/services/car-audio',
  '/services/window-tinting',
  '/vip',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.flatMap((path) => {
    const englishUrl = `${SITE_URL}${path || '/'}`;
    const spanishUrl = `${SITE_URL}/es${path || ''}`;
    const alternates = {
      languages: {
        en: englishUrl,
        es: spanishUrl,
      },
    };

    return [
      {
        url: englishUrl,
        lastModified,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.8,
        alternates,
      },
      {
        url: spanishUrl,
        lastModified,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 0.9 : 0.7,
        alternates,
      },
    ];
  });
}
