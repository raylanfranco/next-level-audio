import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';

const BASE_URL = 'https://www.ecusad.com';
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

  const username = process.env.DIST_ECUSAD_USERNAME;
  const password = process.env.DIST_ECUSAD_PASSWORD;
  if (!username || !password) return '';

  try {
    // ECUSAD is ASP.NET — need to get ViewState first
    const loginPageRes = await fetch(`${BASE_URL}/login.aspx`, {
      headers: HEADERS,
    });
    const initialCookies = extractCookies(loginPageRes);
    const loginHtml = await loginPageRes.text();
    const $ = cheerio.load(loginHtml);

    const viewState = $('input[name="__VIEWSTATE"]').val() as string || '';
    const viewStateGen = $('input[name="__VIEWSTATEGENERATOR"]').val() as string || '';
    const eventValidation = $('input[name="__EVENTVALIDATION"]').val() as string || '';

    const loginRes = await fetch(`${BASE_URL}/login.aspx`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': initialCookies,
      },
      body: new URLSearchParams({
        '__VIEWSTATE': viewState,
        '__VIEWSTATEGENERATOR': viewStateGen,
        '__EVENTVALIDATION': eventValidation,
        'ctl00$ContentPlaceHolder1$txtUserName': username,
        'ctl00$ContentPlaceHolder1$txtPassword': password,
        'ctl00$ContentPlaceHolder1$btnLogin': 'Login',
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

async function searchEcusad(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  try {
    // First fetch the search page to get ViewState
    const pageRes = await fetch(`${BASE_URL}/display_category.aspx`, {
      headers: { ...HEADERS, Cookie: cookies },
    });
    const pageHtml = await pageRes.text();
    const $page = cheerio.load(pageHtml);

    const viewState = $page('input[name="__VIEWSTATE"]').val() as string || '';
    const viewStateGen = $page('input[name="__VIEWSTATEGENERATOR"]').val() as string || '';
    const eventValidation = $page('input[name="__EVENTVALIDATION"]').val() as string || '';

    // Submit the search form via __doPostBack
    const searchRes = await fetch(`${BASE_URL}/display_category.aspx`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': mergeCookies(cookies, extractCookies(pageRes)),
      },
      body: new URLSearchParams({
        '__VIEWSTATE': viewState,
        '__VIEWSTATEGENERATOR': viewStateGen,
        '__EVENTVALIDATION': eventValidation,
        '__EVENTTARGET': 'ctl00$btnSearch',
        '__EVENTARGUMENT': '',
        'ctl00$txtSearch': query,
      }).toString(),
      redirect: 'follow',
    });

    if (!searchRes.ok) return results;

    const html = await searchRes.text();
    const $ = cheerio.load(html);

    // Parse product results — ECUSAD uses table-based layouts
    $('table tr, .product-item, [class*="product"], [class*="item"]').each((_, el) => {
      const row = $(el);
      const cells = row.find('td');
      if (cells.length < 2) return;

      // Try to extract product info from table cells
      const name = cells.eq(0).text().trim() || cells.eq(1).text().trim();
      const link = row.find('a').first().attr('href') || '';

      if (!name || name.length < 3) return;

      // Check if this matches our query
      const qLower = query.toLowerCase();
      const nLower = name.toLowerCase();
      if (!nLower.includes(qLower) && !qLower.split(/\s+/).some(w => nLower.includes(w))) return;

      let priceCents: number | null = null;
      let priceDisplay = 'See website';
      // Look for price in any cell
      cells.each((_, cell) => {
        const text = $(cell).text().trim();
        const priceMatch = text.match(/\$\s*([\d,]+\.?\d*)/);
        if (priceMatch && !priceCents) {
          priceCents = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
          priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
        }
      });

      const imgEl = row.find('img').first().attr('src') || null;
      const skuMatch = name.match(/([A-Z0-9]+-?[A-Z0-9]+)/i);

      results.push({
        distributor: 'ECUSAD',
        distributorUrl: BASE_URL,
        productName: name,
        productUrl: link ? (link.startsWith('http') ? link : `${BASE_URL}/${link}`) : `${BASE_URL}/display_category.aspx`,
        sku: skuMatch ? skuMatch[1] : null,
        priceCents,
        priceDisplay,
        inStock: null,
        imageUrl: imgEl ? (imgEl.startsWith('http') ? imgEl : `${BASE_URL}/${imgEl}`) : null,
        matchConfidence: scoreMatch(name, query),
      });
    });

    // Also check for product links in general page content
    if (results.length === 0) {
      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        if (!text || text.length < 3) return;
        if (!href.includes('product') && !href.includes('item') && !href.includes('display')) return;

        const qLower = query.toLowerCase();
        if (text.toLowerCase().includes(qLower)) {
          results.push({
            distributor: 'ECUSAD',
            distributorUrl: BASE_URL,
            productName: text,
            productUrl: href.startsWith('http') ? href : `${BASE_URL}/${href}`,
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

  return results.slice(0, 10);
}

export const ecusadScraper: DistributorScraper = {
  name: 'ECUSAD',
  baseUrl: BASE_URL,
  search: searchEcusad,
};
