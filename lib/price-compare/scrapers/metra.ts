import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';
import { extractCookies, mergeCookies, scoreMatch } from './utils';

const BASE_URL = 'https://www.metraonline.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

let sessionCookies: string = '';
let sessionExpiry: number = 0;

async function ensureSession(): Promise<string> {
  if (sessionCookies && Date.now() < sessionExpiry) return sessionCookies;

  const username = process.env.DIST_METRA_USERNAME;
  const password = process.env.DIST_METRA_PASSWORD;
  if (!username || !password) return '';

  try {
    // Metra uses Laravel — login via POST
    const csrfPage = await fetch(`${BASE_URL}/login`, { headers: HEADERS, redirect: 'manual' });
    const csrfCookies = extractCookies(csrfPage);
    const csrfHtml = await csrfPage.text();
    const $ = cheerio.load(csrfHtml);
    const token = $('input[name="_token"]').val() as string || '';

    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookies,
      },
      body: new URLSearchParams({
        _token: token,
        email: username,
        password: password,
      }).toString(),
      redirect: 'manual',
    });

    sessionCookies = mergeCookies(csrfCookies, extractCookies(loginRes));
    sessionExpiry = Date.now() + 25 * 60 * 1000;
    return sessionCookies;
  } catch {
    return '';
  }
}

async function searchMetra(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  // Try direct part number lookup first
  try {
    const partRes = await fetch(`${BASE_URL}/part/${encodeURIComponent(query)}`, {
      headers: { ...HEADERS, Cookie: cookies },
      redirect: 'follow',
    });

    if (partRes.ok && !partRes.url.includes('/404')) {
      const html = await partRes.text();
      const $ = cheerio.load(html);

      const name = $('h1').first().text().trim() ||
                   $('[class*="product-name"]').first().text().trim();
      const sku = query.toUpperCase();

      // Try to find price in various patterns
      let price: number | null = null;
      let priceDisplay = 'Login for pricing';
      const priceText = $('[class*="price"]').first().text().trim() ||
                        $('[x-show*="price"]').first().text().trim();
      const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
      if (priceMatch) {
        price = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
        priceDisplay = `$${(price / 100).toFixed(2)}`;
      }

      if (name) {
        results.push({
          distributor: 'Metra Online',
          distributorUrl: BASE_URL,
          productName: name,
          productUrl: `${BASE_URL}/part/${encodeURIComponent(query)}`,
          sku,
          priceCents: price,
          priceDisplay,
          inStock: null,
          imageUrl: $('img[src*="product"]').first().attr('src') || null,
          matchConfidence: 'exact',
        });
      }
    }
  } catch { /* direct lookup failed, try brand search below */ }

  // Try brand category search for keyword queries
  if (results.length === 0) {
    try {
      // Search Metra's Livewire component — try product listing pages
      for (const category of ['DASH-KITS', 'WIRE-HARNESSES', 'ANTENNAS', 'SPEAKERS']) {
        const catRes = await fetch(`${BASE_URL}/brand/metra/${category}`, {
          headers: { ...HEADERS, Cookie: cookies },
        });
        if (!catRes.ok) continue;
        const html = await catRes.text();
        const $ = cheerio.load(html);

        $('a[href*="/part/"]').each((_, el) => {
          const name = $(el).text().trim();
          const href = $(el).attr('href') || '';
          if (!name || !href) return;

          const qLower = query.toLowerCase();
          if (name.toLowerCase().includes(qLower) ||
              href.toLowerCase().includes(qLower)) {
            const skuMatch = href.match(/\/part\/(.+)/);
            results.push({
              distributor: 'Metra Online',
              distributorUrl: BASE_URL,
              productName: name,
              productUrl: href.startsWith('http') ? href : `${BASE_URL}${href}`,
              sku: skuMatch ? skuMatch[1] : null,
              priceCents: null,
              priceDisplay: 'Login for pricing',
              inStock: null,
              imageUrl: null,
              matchConfidence: scoreMatch(name, query),
            });
          }
        });

        if (results.length > 0) break;
      }
    } catch { /* category search failed */ }
  }

  return results.slice(0, 10);
}

export const metraScraper: DistributorScraper = {
  name: 'Metra Online',
  baseUrl: BASE_URL,
  search: searchMetra,
};
