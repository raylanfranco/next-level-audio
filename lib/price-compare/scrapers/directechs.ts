import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';
import { extractCookies, mergeCookies, scoreMatch } from './utils';

const BASE_URL = 'https://www.directechs.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

let sessionCookies: string = '';
let sessionExpiry: number = 0;

async function ensureSession(): Promise<string> {
  if (sessionCookies && Date.now() < sessionExpiry) return sessionCookies;

  const username = process.env.DIST_DIRECTECHS_USERNAME;
  const password = process.env.DIST_DIRECTECHS_PASSWORD;
  if (!username || !password) return '';

  try {
    const loginPageRes = await fetch(`${BASE_URL}/Account/Login`, {
      headers: HEADERS,
    });
    const initialCookies = extractCookies(loginPageRes);
    const loginHtml = await loginPageRes.text();
    const $ = cheerio.load(loginHtml);

    const token = $('input[name="__RequestVerificationToken"]').val() as string || '';

    const loginRes = await fetch(`${BASE_URL}/Account/Login`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': initialCookies,
      },
      body: new URLSearchParams({
        '__RequestVerificationToken': token,
        'Email': username,
        'Password': password,
        'RememberMe': 'false',
      }).toString(),
      redirect: 'manual',
    });

    sessionCookies = mergeCookies(initialCookies, extractCookies(loginRes));
    sessionExpiry = Date.now() + 25 * 60 * 1000;
    return sessionCookies;
  } catch {
    return '';
  }
}

async function searchDirectechs(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  // Directechs is a vehicle compatibility tool, not a product catalog.
  // Products are lines like DS4, DS4+, BP1 etc. on the homepage.
  // We scan for product line links that match the query.
  try {
    const res = await fetch(BASE_URL, {
      headers: { ...HEADERS, Cookie: cookies },
    });
    if (!res.ok) return results;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Product links follow: /VehicleCompatibility/SelectMake{CODE}
    const seen = new Set<string>();
    $('a[href*="/VehicleCompatibility/SelectMake"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      const img = $(el).find('img').attr('src') || null;

      // Extract product code from URL
      const codeMatch = href.match(/SelectMake([A-Za-z0-9+]+)/);
      const code = codeMatch ? codeMatch[1] : '';
      const name = text && text.length > 1 && text.length < 80 ? text : code;

      if (!name || name.length < 2) return;
      // Skip non-product links (YouTube, social, etc.)
      const lower = name.toLowerCase();
      if (lower.includes('watch') || lower.includes('youtube') || lower.includes('channel')) return;
      if (lower.includes('subscribe') || lower === 'product:') return;

      const key = code || href;
      if (seen.has(key)) return;
      seen.add(key);

      // Check if matches query
      const qLower = query.toLowerCase();
      const qWords = qLower.split(/\s+/);
      if (!lower.includes(qLower) && !qWords.some(w => lower.includes(w))) return;

      results.push({
        distributor: 'Directechs',
        distributorUrl: BASE_URL,
        productName: name,
        productUrl: href.startsWith('http') ? href : `${BASE_URL}${href}`,
        sku: code || null,
        priceCents: null,
        priceDisplay: 'Login for pricing',
        inStock: null,
        imageUrl: img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : null,
        matchConfidence: scoreMatch(name, query),
      });
    });
  } catch { /* search failed */ }

  return results.slice(0, 10);
}

export const directechsScraper: DistributorScraper = {
  name: 'Directechs',
  baseUrl: BASE_URL,
  search: searchDirectechs,
};
