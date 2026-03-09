import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';
import { extractCookies, mergeCookies, scoreMatch } from './utils';

const BASE_URL = 'https://www.idatalink.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

let sessionCookies: string = '';
let sessionExpiry: number = 0;

async function ensureSession(): Promise<string> {
  if (sessionCookies && Date.now() < sessionExpiry) return sessionCookies;

  const username = process.env.DIST_IDATALINK_USERNAME;
  const password = process.env.DIST_IDATALINK_PASSWORD;
  if (!username || !password) return '';

  try {
    const loginPageRes = await fetch(`${BASE_URL}/login`, {
      headers: HEADERS,
      redirect: 'manual',
    });
    const initialCookies = extractCookies(loginPageRes);

    // Try JSON login
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/json',
        'Cookie': initialCookies,
      },
      body: JSON.stringify({ email: username, password }),
      redirect: 'manual',
    });

    if (loginRes.status === 405 || loginRes.status >= 400) {
      // Fallback to form login
      const html = await loginPageRes.text();
      const $ = cheerio.load(html);
      const token = $('input[name="_token"]').val() as string || '';

      const formRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          ...HEADERS,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': initialCookies,
        },
        body: new URLSearchParams({
          _token: token,
          email: username,
          password,
        }).toString(),
        redirect: 'manual',
      });
      sessionCookies = mergeCookies(initialCookies, extractCookies(formRes));
    } else {
      sessionCookies = mergeCookies(initialCookies, extractCookies(loginRes));
    }

    sessionExpiry = Date.now() + 25 * 60 * 1000;
    return sessionCookies;
  } catch {
    return '';
  }
}

async function searchIdatalink(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  // iDatalink is product-catalog based — scan product pages for matches
  const productPages = [
    '/products/blade',
    '/products/blade-al',
    '/products/start',
    '/products/harnessmax',
  ];

  for (const page of productPages) {
    try {
      const res = await fetch(`${BASE_URL}${page}`, {
        headers: { ...HEADERS, Cookie: cookies },
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Look for product cards/items
      $('[class*="product"], [class*="card"], [class*="item"], a[href*="/product"]').each((_, el) => {
        const name = $(el).find('h2, h3, h4, [class*="name"], [class*="title"]').first().text().trim() ||
                     $(el).text().trim();
        const link = $(el).is('a') ? $(el).attr('href') : $(el).find('a').first().attr('href');

        if (!name || name.length < 3 || name.length > 200) return;

        const qLower = query.toLowerCase();
        const nLower = name.toLowerCase();
        if (!nLower.includes(qLower) && !qLower.split(/\s+/).some(w => nLower.includes(w))) return;

        let priceCents: number | null = null;
        let priceDisplay = 'See website';
        const priceEl = $(el).find('[class*="price"]').first().text().trim();
        const priceMatch = priceEl.match(/\$\s*([\d,]+\.?\d*)/);
        if (priceMatch) {
          priceCents = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
          priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
        }

        const imgEl = $(el).find('img').first().attr('src') || null;
        const skuMatch = name.match(/([A-Z]{2,}-?[A-Z0-9]+)/i);

        results.push({
          distributor: 'iDatalink',
          distributorUrl: BASE_URL,
          productName: name.substring(0, 200),
          productUrl: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : `${BASE_URL}${page}`,
          sku: skuMatch ? skuMatch[1].toUpperCase() : null,
          priceCents,
          priceDisplay,
          inStock: null,
          imageUrl: imgEl ? (imgEl.startsWith('http') ? imgEl : `${BASE_URL}${imgEl}`) : null,
          matchConfidence: scoreMatch(name, query),
        });
      });

      if (results.length > 0) break;
    } catch { /* page failed */ }
  }

  // Deduplicate
  const seen = new Set<string>();
  return results.filter(r => {
    const key = r.productUrl;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10);
}

export const idatalinkScraper: DistributorScraper = {
  name: 'iDatalink',
  baseUrl: BASE_URL,
  search: searchIdatalink,
};
