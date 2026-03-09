import * as cheerio from 'cheerio';
import type { PriceResult, DistributorScraper } from '../types';
import { extractCookies, mergeCookies, scoreMatch } from './utils';

const BASE_URL = 'https://www.ecusad.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

let sessionCookies: string = '';
let sessionExpiry: number = 0;

async function ensureSession(): Promise<string> {
  if (sessionCookies && Date.now() < sessionExpiry) return sessionCookies;

  const username = process.env.DIST_ECUSAD_USERNAME;
  const password = process.env.DIST_ECUSAD_PASSWORD;
  if (!username || !password) return '';

  try {
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

async function searchEcusad(query: string): Promise<PriceResult[]> {
  const cookies = await ensureSession();
  const results: PriceResult[] = [];

  try {
    // Fetch the category page to get ViewState for search
    const pageRes = await fetch(`${BASE_URL}/display_category.aspx`, {
      headers: { ...HEADERS, Cookie: cookies },
    });
    const pageHtml = await pageRes.text();
    const $page = cheerio.load(pageHtml);

    const viewState = $page('input[name="__VIEWSTATE"]').val() as string || '';
    const viewStateGen = $page('input[name="__VIEWSTATEGENERATOR"]').val() as string || '';
    const eventValidation = $page('input[name="__EVENTVALIDATION"]').val() as string || '';

    // Submit the search
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

    // ECUSAD uses .scOuter > .scInner + .scText > a for product cards
    $('.scOuter').each((_, el) => {
      const card = $(el);
      const linkEl = card.find('.scText a, a').first();
      const name = linkEl.text().trim();
      const href = linkEl.attr('href') || '';
      const imgEl = card.find('img').first();
      const imgSrc = imgEl.attr('src') || null;

      if (!name || name.length < 3 || name.length > 150) return;

      // Extract price if visible
      let priceCents: number | null = null;
      let priceDisplay = 'See website';
      const cardText = card.text();
      const priceMatch = cardText.match(/\$\s*([\d,]+\.?\d*)/);
      if (priceMatch) {
        priceCents = Math.round(parseFloat(priceMatch[1].replace(',', '')) * 100);
        priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
      }

      results.push({
        distributor: 'ECUSAD',
        distributorUrl: BASE_URL,
        productName: name,
        productUrl: href ? (href.startsWith('http') ? href : `${BASE_URL}/${href.replace(/^\//, '')}`) : `${BASE_URL}/display_category.aspx`,
        sku: null,
        priceCents,
        priceDisplay,
        inStock: null,
        imageUrl: imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `${BASE_URL}/${imgSrc.replace(/^\//, '')}`) : null,
        matchConfidence: scoreMatch(name, query),
      });
    });

    // If no .scOuter cards found, try product detail links as fallback
    if (results.length === 0) {
      $('a[href*="display_product"], a[href*="product_detail"]').each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (!text || text.length < 3 || text.length > 150) return;

        const qLower = query.toLowerCase();
        const words = qLower.split(/\s+/);
        const textLower = text.toLowerCase();
        if (!words.some(w => textLower.includes(w))) return;

        results.push({
          distributor: 'ECUSAD',
          distributorUrl: BASE_URL,
          productName: text,
          productUrl: href.startsWith('http') ? href : `${BASE_URL}/${href.replace(/^\//, '')}`,
          sku: null,
          priceCents: null,
          priceDisplay: 'See website',
          inStock: null,
          imageUrl: null,
          matchConfidence: scoreMatch(text, query),
        });
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
