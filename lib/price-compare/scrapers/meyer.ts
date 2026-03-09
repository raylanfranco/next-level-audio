import type { PriceResult, DistributorScraper } from '../types';

const BASE_URL = 'https://online.meyerdistributing.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

let authToken: string = '';
let sessionExpiry: number = 0;

function extractCookies(res: Response): string {
  const setCookies = res.headers.getSetCookie?.() || [];
  return setCookies.map(c => c.split(';')[0]).join('; ');
}

async function ensureSession(): Promise<{ cookies: string; token: string }> {
  if (authToken && Date.now() < sessionExpiry) return { cookies: '', token: authToken };

  const username = process.env.DIST_MEYER_USERNAME;
  const password = process.env.DIST_MEYER_PASSWORD;
  if (!username || !password) return { cookies: '', token: '' };

  try {
    // Meyer uses an Ionic SPA — likely has a REST API for auth
    // Try common patterns for Ionic/Angular SPA login
    const loginEndpoints = [
      '/api/auth/login',
      '/api/login',
      '/auth/login',
      '/api/v1/auth/login',
      '/Account/Login',
    ];

    for (const endpoint of loginEndpoints) {
      try {
        const loginRes = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            ...HEADERS,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            customerNumber: username, // Meyer may use customer number
          }),
          redirect: 'manual',
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          if (data.token || data.accessToken || data.access_token) {
            authToken = data.token || data.accessToken || data.access_token;
            sessionExpiry = Date.now() + 25 * 60 * 1000;
            return { cookies: extractCookies(loginRes), token: authToken };
          }
        }

        // Check for session cookie auth
        const cookies = extractCookies(loginRes);
        if (cookies && (loginRes.status === 302 || loginRes.status === 200)) {
          sessionExpiry = Date.now() + 25 * 60 * 1000;
          return { cookies, token: '' };
        }
      } catch { continue; }
    }

    // Fallback: try form-encoded login
    const formRes = await fetch(`${BASE_URL}/Account/Login`, {
      method: 'POST',
      headers: {
        ...HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        UserName: username,
        Password: password,
      }).toString(),
      redirect: 'manual',
    });

    const cookies = extractCookies(formRes);
    if (cookies) {
      sessionExpiry = Date.now() + 25 * 60 * 1000;
      return { cookies, token: '' };
    }
  } catch { /* login failed */ }

  return { cookies: '', token: '' };
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

async function searchMeyer(query: string): Promise<PriceResult[]> {
  const { cookies, token } = await ensureSession();
  const results: PriceResult[] = [];

  const authHeaders: Record<string, string> = { ...HEADERS };
  if (token) authHeaders['Authorization'] = `Bearer ${token}`;
  if (cookies) authHeaders['Cookie'] = cookies;

  // Try common search API patterns for Ionic SPAs
  const searchEndpoints = [
    `/api/products/search?q=${encodeURIComponent(query)}`,
    `/api/search?q=${encodeURIComponent(query)}`,
    `/api/v1/products?search=${encodeURIComponent(query)}`,
    `/api/catalog/search?keyword=${encodeURIComponent(query)}`,
    `/api/items?search=${encodeURIComponent(query)}`,
  ];

  for (const endpoint of searchEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: authHeaders,
      });

      if (!res.ok) continue;

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('json')) continue;

      const data = await res.json();

      // Handle various JSON response shapes
      const items = Array.isArray(data) ? data :
                    data.results || data.items || data.products || data.data || [];

      if (!Array.isArray(items) || items.length === 0) continue;

      for (const item of items.slice(0, 10)) {
        const name = item.name || item.description || item.title || item.productName || '';
        if (!name) continue;

        let priceCents: number | null = null;
        let priceDisplay = 'Login for pricing';
        const price = item.price || item.unitPrice || item.listPrice || item.cost;
        if (price && typeof price === 'number') {
          priceCents = Math.round(price * 100);
          priceDisplay = `$${price.toFixed(2)}`;
        } else if (typeof price === 'string') {
          const match = price.replace(/[$,]/g, '').match(/([\d.]+)/);
          if (match) {
            priceCents = Math.round(parseFloat(match[1]) * 100);
            priceDisplay = `$${(priceCents / 100).toFixed(2)}`;
          }
        }

        const sku = item.sku || item.partNumber || item.itemNumber || item.productId || null;
        const productUrl = item.url || item.link || (sku ? `${BASE_URL}/product/${sku}` : BASE_URL);

        results.push({
          distributor: 'Meyer Distributing',
          distributorUrl: BASE_URL,
          productName: name,
          productUrl: productUrl.startsWith('http') ? productUrl : `${BASE_URL}${productUrl}`,
          sku,
          priceCents,
          priceDisplay,
          inStock: item.inStock ?? item.available ?? null,
          imageUrl: item.imageUrl || item.image || null,
          matchConfidence: scoreMatch(name, query),
        });
      }

      if (results.length > 0) break;
    } catch { continue; }
  }

  return results.slice(0, 10);
}

export const meyerScraper: DistributorScraper = {
  name: 'Meyer Distributing',
  baseUrl: BASE_URL,
  search: searchMeyer,
};
