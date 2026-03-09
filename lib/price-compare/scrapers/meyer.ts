import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';
import { extractCookies, mergeCookies, scoreMatch } from './utils';

const BASE_URL = 'https://online.meyerdistributing.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

let sessionCookies: string = '';
let sessionExpiry: number = 0;

async function ensureSession(): Promise<string> {
  if (sessionCookies && Date.now() < sessionExpiry) return sessionCookies;

  const username = process.env.DIST_MEYER_USERNAME;
  const password = process.env.DIST_MEYER_PASSWORD;
  if (!username || !password) return '';

  try {
    // Meyer Angular SPA — cookie-based auth
    const loginPageRes = await fetch(`${BASE_URL}/Account/Login`, {
      headers: HEADERS,
      redirect: 'manual',
    });
    const initialCookies = extractCookies(loginPageRes);

    const loginRes = await fetch(`${BASE_URL}/Account/Login`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': initialCookies,
      },
      body: new URLSearchParams({
        UserName: username,
        Password: password,
      }).toString(),
      redirect: 'manual',
    });

    sessionCookies = mergeCookies(initialCookies, extractCookies(loginRes));

    // Follow redirect to pick up auth cookies
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

async function searchMeyer(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  // Meyer is SKU-only lookup: /parts/details/{SKU}
  const skuVariants = generateSkuVariants(query);

  for (const sku of skuVariants) {
    try {
      const url = `${BASE_URL}/parts/details/${encodeURIComponent(sku)}`;
      const res = await fetch(url, {
        headers: { ...HEADERS, Cookie: cookies },
        redirect: 'follow',
      });

      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Check we actually landed on a product page (not 404/error)
      const pageTitle = $('title').text().trim();
      if (pageTitle.toLowerCase().includes('error') || pageTitle.toLowerCase().includes('not found')) continue;

      const name = $('h1').first().text().trim() ||
                   $('[class*="product-name"], [class*="part-name"], [class*="detail-title"]').first().text().trim() ||
                   pageTitle.replace(/ - Meyer.*$/i, '');

      if (!name || name.length < 3) continue;

      // Price: .sale-price has the discounted price, .sale-line-break has "MY COST"
      let priceCents: number | null = null;
      let priceDisplay = 'Login for pricing';

      // Sale price (best price)
      const salePriceText = $('.sale-price').first().text().trim();
      const salePriceMatch = salePriceText.match(/\$\s*([\d,]+\.?\d*)/);
      if (salePriceMatch) {
        priceCents = Math.round(parseFloat(salePriceMatch[1].replace(',', '')) * 100);
        priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
      }

      // Fallback: MY COST from .sale-line-break
      if (!priceCents) {
        const costText = $('.sale-line-break').first().text().trim();
        const costMatch = costText.match(/\$\s*([\d,]+\.?\d*)/);
        if (costMatch) {
          priceCents = Math.round(parseFloat(costMatch[1].replace(',', '')) * 100);
          priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
        }
      }

      // Last fallback: any price element
      if (!priceCents) {
        const anyPrice = $('[class*="price"]').first().text().trim();
        const anyMatch = anyPrice.match(/\$\s*([\d,]+\.?\d*)/);
        if (anyMatch) {
          priceCents = Math.round(parseFloat(anyMatch[1].replace(',', '')) * 100);
          priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
        }
      }

      const imgEl = $('img[src*="product"], img[src*="image"], img[src*="parts"]').first().attr('src') || null;

      results.push({
        distributor: 'Meyer Distributing',
        distributorUrl: BASE_URL,
        productName: name,
        productUrl: url,
        sku,
        priceCents,
        priceDisplay,
        inStock: null,
        imageUrl: imgEl ? (imgEl.startsWith('http') ? imgEl : `${BASE_URL}${imgEl}`) : null,
        matchConfidence: 'exact',
      });

      break; // Found a product
    } catch { continue; }
  }

  return results.slice(0, 10);
}

/** Generate SKU variants from a query (user may enter "SHE898-205" or "Alpine S2-S50 Speaker") */
function generateSkuVariants(query: string): string[] {
  const variants: string[] = [query];
  const words = query.split(/\s+/);

  // Each word that looks like a SKU (has letters+numbers or hyphens)
  for (const word of words) {
    if (word !== query && /[A-Z0-9]{2,}[-]?[A-Z0-9]+/i.test(word)) {
      variants.push(word);
    }
  }

  // Hyphenated version of full query
  const hyphenated = words.join('-');
  if (hyphenated !== query) variants.push(hyphenated);

  return [...new Set(variants)];
}

export const meyerScraper: DistributorScraper = {
  name: 'Meyer Distributing',
  baseUrl: BASE_URL,
  search: searchMeyer,
};
