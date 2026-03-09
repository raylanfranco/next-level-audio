import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';

const BASE_URL = 'https://www.myfirstech.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

let sessionCookies: string = '';
let sessionExpiry: number = 0;

function extractCookies(res: Response): string {
  const setCookies = res.headers.getSetCookie?.() || [];
  return setCookies.map(c => c.split(';')[0]).join('; ');
}

function mergeCookies(...cookieStrings: string[]): string {
  const map = new Map<string, string>();
  for (const str of cookieStrings) {
    for (const part of str.split('; ')) {
      const [key] = part.split('=');
      if (key) map.set(key, part);
    }
  }
  return Array.from(map.values()).join('; ');
}

async function ensureSession(): Promise<string> {
  if (sessionCookies && Date.now() < sessionExpiry) return sessionCookies;

  const username = process.env.DIST_FIRSTECH_USERNAME;
  const password = process.env.DIST_FIRSTECH_PASSWORD;
  if (!username || !password) return '';

  try {
    // Firstech uses Nuxt.js — login via POST to /login or /api/auth
    const loginPageRes = await fetch(`${BASE_URL}/login`, {
      headers: HEADERS,
      redirect: 'manual',
    });
    const initialCookies = extractCookies(loginPageRes);

    // Try JSON login endpoint first (common in Nuxt apps)
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/json',
        'Cookie': initialCookies,
      },
      body: JSON.stringify({
        email: username,
        password: password,
      }),
      redirect: 'manual',
    });

    if (loginRes.status === 405 || loginRes.status === 422) {
      // Try form-encoded login
      const formRes = await fetch(`${BASE_URL}/login`, {
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

function scoreMatch(productName: string, query: string): 'exact' | 'high' | 'partial' {
  const pLower = productName.toLowerCase();
  const qLower = query.toLowerCase();
  if (pLower === qLower || pLower.includes(qLower)) return 'exact';
  const words = qLower.split(/\s+/);
  const matchCount = words.filter(w => pLower.includes(w)).length;
  if (matchCount >= words.length * 0.7) return 'high';
  return 'partial';
}

async function searchFirstech(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  try {
    const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(query)}&p=1&so=price-asc`;
    const res = await fetch(searchUrl, {
      headers: { ...HEADERS, Cookie: cookies },
    });

    if (!res.ok) return results;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Parse Nuxt __NUXT__ state for product data
    const nuxtScript = $('script').filter((_, el) => {
      const text = $(el).html() || '';
      return text.includes('__NUXT__') || text.includes('window.__NUXT__');
    }).html() || '';

    // Try to extract product data from __NUXT__ payload
    // The payload often contains serialized product arrays
    const productDataMatch = nuxtScript.match(/products['":\s]*\[([\s\S]*?)\]/);

    // Also try parsing product cards from HTML
    $('[class*="product-card"], [class*="ProductCard"], .product-item, .search-result').each((_, el) => {
      const name = $(el).find('[class*="name"], [class*="title"], h3, h4').first().text().trim();
      const link = $(el).find('a').first().attr('href') || '';
      const skuEl = $(el).find('[class*="sku"], [class*="part"]').first().text().trim();
      const priceEl = $(el).find('[class*="price"]').first().text().trim();
      const imgEl = $(el).find('img').first().attr('src') || null;

      if (!name) return;

      let priceCents: number | null = null;
      let priceDisplay = 'Login for pricing';
      const priceMatch = priceEl.match(/\$?([\d,]+\.?\d*)/);
      if (priceMatch) {
        priceCents = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
        priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
      }

      results.push({
        distributor: 'Firstech',
        distributorUrl: BASE_URL,
        productName: name,
        productUrl: link.startsWith('http') ? link : `${BASE_URL}${link}`,
        sku: skuEl || null,
        priceCents,
        priceDisplay,
        inStock: null,
        imageUrl: imgEl,
        matchConfidence: scoreMatch(name, query),
      });
    });

    // Fallback: try to find any product links matching the query
    if (results.length === 0) {
      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        if (text && href && (href.includes('/product') || href.includes('/p/')) &&
            (text.toLowerCase().includes(query.toLowerCase()) ||
             href.toLowerCase().includes(query.toLowerCase()))) {
          results.push({
            distributor: 'Firstech',
            distributorUrl: BASE_URL,
            productName: text,
            productUrl: href.startsWith('http') ? href : `${BASE_URL}${href}`,
            sku: null,
            priceCents: null,
            priceDisplay: 'See website',
            inStock: null,
            imageUrl: null,
            matchConfidence: scoreMatch(text, query),
          });
        }
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
