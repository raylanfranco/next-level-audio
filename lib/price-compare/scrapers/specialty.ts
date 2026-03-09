import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';
import { extractCookies, mergeCookies, scoreMatch } from './utils';

const BASE_URL = 'https://www.specialtymarketing.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

let sessionCookies: string = '';
let sessionExpiry: number = 0;

async function ensureSession(): Promise<string> {
  if (sessionCookies && Date.now() < sessionExpiry) return sessionCookies;

  const username = process.env.DIST_SPECIALTY_USERNAME;
  const password = process.env.DIST_SPECIALTY_PASSWORD;
  if (!username || !password) return '';

  try {
    // Try fetching homepage to get login form/cookies
    const homeRes = await fetch(BASE_URL, {
      headers: HEADERS,
      redirect: 'follow',
    });
    const initialCookies = extractCookies(homeRes);
    const homeHtml = await homeRes.text();
    const $ = cheerio.load(homeHtml);

    // Find login form action and fields
    const loginForm = $('form[action*="login"], form[action*="Login"], form#loginForm').first();
    const action = loginForm.attr('action') || '/login';
    const token = $('input[name="_token"], input[name="__RequestVerificationToken"], input[name="csrf_token"]').val() as string || '';

    // Try multiple login patterns
    const loginPatterns: { url: string; body: Record<string, string> }[] = [
      { url: `${BASE_URL}${action}`, body: { email: username, password, _token: token } },
      { url: `${BASE_URL}/login`, body: { username, password, _token: token } },
      { url: `${BASE_URL}/account/login`, body: { email: username, password } },
    ];

    for (const pattern of loginPatterns) {
      try {
        const loginRes = await fetch(pattern.url, {
          method: 'POST',
          headers: {
            ...HEADERS,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': initialCookies,
          },
          body: new URLSearchParams(pattern.body).toString(),
          redirect: 'manual',
        });

        const newCookies = extractCookies(loginRes);
        if (newCookies) {
          sessionCookies = mergeCookies(initialCookies, newCookies);
          sessionExpiry = Date.now() + 25 * 60 * 1000;
          return sessionCookies;
        }
      } catch { continue; }
    }
  } catch { /* login failed */ }

  return '';
}

async function searchSpecialty(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  if (!cookies) {
    // Can't access site without auth — return a helpful message
    return [{
      distributor: 'Specialty Marketing',
      distributorUrl: BASE_URL,
      productName: `Search for: ${query}`,
      productUrl: BASE_URL,
      sku: null,
      priceCents: null,
      priceDisplay: 'Login required',
      inStock: null,
      imageUrl: null,
      matchConfidence: 'partial',
    }];
  }

  // Try search endpoints
  const searchPaths = [
    `/search?q=${encodeURIComponent(query)}`,
    `/search?keyword=${encodeURIComponent(query)}`,
    `/products/search?q=${encodeURIComponent(query)}`,
    `/catalog/search?q=${encodeURIComponent(query)}`,
  ];

  for (const searchPath of searchPaths) {
    try {
      const res = await fetch(`${BASE_URL}${searchPath}`, {
        headers: { ...HEADERS, Cookie: cookies },
        redirect: 'follow',
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Parse product results
      $('[class*="product"], [class*="result"], [class*="item"], .card').each((_, el) => {
        const name = $(el).find('h2, h3, h4, [class*="name"], [class*="title"], a').first().text().trim();
        const link = $(el).find('a').first().attr('href') || '';

        if (!name || name.length < 3) return;

        let priceCents: number | null = null;
        let priceDisplay = 'See website';
        const priceEl = $(el).find('[class*="price"]').first().text().trim();
        const priceMatch = priceEl.match(/\$\s*([\d,]+\.?\d*)/);
        if (priceMatch) {
          priceCents = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
          priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
        }

        const imgEl = $(el).find('img').first().attr('src') || null;
        const skuEl = $(el).find('[class*="sku"], [class*="part"]').first().text().trim();

        results.push({
          distributor: 'Specialty Marketing',
          distributorUrl: BASE_URL,
          productName: name.substring(0, 200),
          productUrl: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : BASE_URL,
          sku: skuEl || null,
          priceCents,
          priceDisplay,
          inStock: null,
          imageUrl: imgEl ? (imgEl.startsWith('http') ? imgEl : `${BASE_URL}${imgEl}`) : null,
          matchConfidence: scoreMatch(name, query),
        });
      });

      if (results.length > 0) break;
    } catch { continue; }
  }

  return results.slice(0, 10);
}

export const specialtyScraper: DistributorScraper = {
  name: 'Specialty Marketing',
  baseUrl: BASE_URL,
  search: searchSpecialty,
};
