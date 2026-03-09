import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';
import { extractCookies, mergeCookies, scoreMatch } from './utils';

const BASE_URL = 'https://www.myfirstech.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

let sessionCookies: string = '';
let sessionExpiry: number = 0;

async function ensureSession(): Promise<string> {
  if (sessionCookies && Date.now() < sessionExpiry) return sessionCookies;

  const username = process.env.DIST_FIRSTECH_USERNAME;
  const password = process.env.DIST_FIRSTECH_PASSWORD;
  if (!username || !password) return '';

  try {
    // Firstech is Nuxt.js/Vue — get initial cookies
    const loginPageRes = await fetch(`${BASE_URL}/login`, {
      headers: HEADERS,
      redirect: 'manual',
    });
    const initialCookies = extractCookies(loginPageRes);

    // Try form-encoded login (Nuxt typically handles form POSTs)
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': initialCookies,
      },
      body: new URLSearchParams({
        email: username,
        password: password,
      }).toString(),
      redirect: 'manual',
    });

    sessionCookies = mergeCookies(initialCookies, extractCookies(loginRes));

    // If 302 redirect, follow it to get auth cookies
    if (loginRes.status === 302) {
      const loc = loginRes.headers.get('location') || '';
      if (loc) {
        const followRes = await fetch(
          loc.startsWith('http') ? loc : `${BASE_URL}${loc}`,
          { headers: { ...HEADERS, Cookie: sessionCookies }, redirect: 'manual' }
        );
        sessionCookies = mergeCookies(sessionCookies, extractCookies(followRes));
      }
    }

    sessionExpiry = Date.now() + 25 * 60 * 1000;
    return sessionCookies;
  } catch {
    return '';
  }
}

async function searchFirstech(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  try {
    // Real URL structure: /search?s={SKU}&b=approved-brands-only&p=1&so=price-desc
    const searchUrl = `${BASE_URL}/search?s=${encodeURIComponent(query)}&b=approved-brands-only&p=1&so=price-desc`;
    const res = await fetch(searchUrl, {
      headers: { ...HEADERS, Cookie: cookies },
    });

    if (!res.ok) return results;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Real selector: .ProductCardFull__price for price
    // Product cards use ProductCardFull component (Vue/Nuxt)
    $('[class*="ProductCardFull"], [class*="ProductCard"], [class*="product-card"]').each((_, el) => {
      const card = $(el);

      // Product name
      const name = card.find('[class*="ProductCardFull__name"], [class*="ProductCard__name"], [class*="name"], h3, h4').first().text().trim();
      const link = card.find('a').first().attr('href') || '';

      if (!name || name.length < 3) return;

      // Price: .ProductCardFull__price
      let priceCents: number | null = null;
      let priceDisplay = 'Login for pricing';
      const priceText = card.find('[class*="ProductCardFull__price"], [class*="ProductCard__price"], [class*="price"]').first().text().trim();
      const priceMatch = priceText.match(/\$\s*([\d,]+\.?\d*)/);
      if (priceMatch) {
        priceCents = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
        priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
      }

      // SKU
      const skuText = card.find('[class*="sku"], [class*="part-number"], [class*="PartNumber"]').first().text().trim();

      // Image
      const imgEl = card.find('img').first().attr('src') || null;

      results.push({
        distributor: 'Firstech',
        distributorUrl: BASE_URL,
        productName: name,
        productUrl: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : searchUrl,
        sku: skuText || null,
        priceCents,
        priceDisplay,
        inStock: null,
        imageUrl: imgEl ? (imgEl.startsWith('http') ? imgEl : `${BASE_URL}${imgEl}`) : null,
        matchConfidence: scoreMatch(name, query),
      });
    });

    // Fallback: look for product links if no card components found
    if (results.length === 0) {
      $('a[href*="/product/"], a[href*="/p/"]').each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (!text || text.length < 3 || text.length > 200) return;

        // Check for price near the link
        const parent = $(el).parent();
        let priceCents: number | null = null;
        let priceDisplay = 'See website';
        const nearbyPrice = parent.find('[class*="price"]').first().text().trim();
        const priceMatch = nearbyPrice.match(/\$\s*([\d,]+\.?\d*)/);
        if (priceMatch) {
          priceCents = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
          priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
        }

        results.push({
          distributor: 'Firstech',
          distributorUrl: BASE_URL,
          productName: text,
          productUrl: href.startsWith('http') ? href : `${BASE_URL}${href}`,
          sku: null,
          priceCents,
          priceDisplay,
          inStock: null,
          imageUrl: null,
          matchConfidence: scoreMatch(text, query),
        });
      });
    }
  } catch { /* search failed */ }

  // Deduplicate by URL
  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.productUrl)) return false;
    seen.add(r.productUrl);
    return true;
  }).slice(0, 10);
}

export const firstechScraper: DistributorScraper = {
  name: 'Firstech',
  baseUrl: BASE_URL,
  search: searchFirstech,
};
