import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';

const BASE_URL = 'https://www.directechs.com';
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

  const username = process.env.DIST_DIRECTECHS_USERNAME;
  const password = process.env.DIST_DIRECTECHS_PASSWORD;
  if (!username || !password) return '';

  try {
    // Directechs uses ASP.NET MVC — login via /Account/Login
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

function scoreMatch(productName: string, query: string): 'exact' | 'high' | 'partial' {
  const pLower = productName.toLowerCase();
  const qLower = query.toLowerCase();
  if (pLower === qLower || pLower.includes(qLower)) return 'exact';
  const words = qLower.split(/\s+/);
  const matchCount = words.filter(w => pLower.includes(w)).length;
  if (matchCount >= words.length * 0.7) return 'high';
  return 'partial';
}

async function searchDirectechs(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  // Try product search/compatibility pages
  const searchPages = [
    `/VehicleCompatibility?q=${encodeURIComponent(query)}`,
    `/Product/Search?q=${encodeURIComponent(query)}`,
    `/search?q=${encodeURIComponent(query)}`,
  ];

  for (const searchPath of searchPages) {
    try {
      const res = await fetch(`${BASE_URL}${searchPath}`, {
        headers: { ...HEADERS, Cookie: cookies },
        redirect: 'follow',
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Parse product results
      $('[class*="product"], [class*="result"], [class*="card"], [class*="item"]').each((_, el) => {
        const name = $(el).find('h2, h3, h4, [class*="name"], [class*="title"]').first().text().trim();
        const link = $(el).find('a').first().attr('href') || '';

        if (!name || name.length < 3) return;

        let priceCents: number | null = null;
        let priceDisplay = 'Login for pricing';
        const priceEl = $(el).find('[class*="price"]').first().text().trim();
        const priceMatch = priceEl.match(/\$\s*([\d,]+\.?\d*)/);
        if (priceMatch) {
          priceCents = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
          priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
        }

        const imgEl = $(el).find('img').first().attr('src') || null;

        results.push({
          distributor: 'Directechs',
          distributorUrl: BASE_URL,
          productName: name,
          productUrl: link ? (link.startsWith('http') ? link : `${BASE_URL}${link}`) : BASE_URL,
          sku: null,
          priceCents,
          priceDisplay,
          inStock: null,
          imageUrl: imgEl ? (imgEl.startsWith('http') ? imgEl : `${BASE_URL}${imgEl}`) : null,
          matchConfidence: scoreMatch(name, query),
        });
      });

      if (results.length > 0) break;
    } catch { /* search page failed */ }
  }

  // Also try to scan the main page for product matches if nothing found
  if (results.length === 0) {
    try {
      const mainRes = await fetch(BASE_URL, {
        headers: { ...HEADERS, Cookie: cookies },
      });
      if (mainRes.ok) {
        const html = await mainRes.text();
        const $ = cheerio.load(html);

        $('a').each((_, el) => {
          const href = $(el).attr('href') || '';
          const text = $(el).text().trim();
          if (!text || text.length < 3 || text.length > 200) return;

          const qLower = query.toLowerCase();
          if (text.toLowerCase().includes(qLower) &&
              (href.includes('product') || href.includes('Product') || href.includes('item'))) {
            results.push({
              distributor: 'Directechs',
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
    } catch { /* fallback failed */ }
  }

  return results.slice(0, 10);
}

export const directechsScraper: DistributorScraper = {
  name: 'Directechs',
  baseUrl: BASE_URL,
  search: searchDirectechs,
};
