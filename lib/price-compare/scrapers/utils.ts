export function extractCookies(res: Response): string {
  // getSetCookie() is Node 20+ — fallback to get('set-cookie') for Node 18
  try {
    const setCookies = res.headers.getSetCookie?.();
    if (setCookies && setCookies.length > 0) {
      return setCookies.map(c => c.split(';')[0]).join('; ');
    }
  } catch { /* fallback below */ }

  // Fallback: parse from raw header (may be comma-joined)
  const raw = res.headers.get('set-cookie');
  if (!raw) return '';
  // Split on comma but not within expires date patterns
  return raw.split(/,(?=\s*[A-Za-z_]+=)/)
    .map(c => c.trim().split(';')[0])
    .join('; ');
}

export function mergeCookies(...cookieStrings: string[]): string {
  const map = new Map<string, string>();
  for (const str of cookieStrings) {
    if (!str) continue;
    for (const part of str.split('; ')) {
      const eq = part.indexOf('=');
      const key = eq > 0 ? part.substring(0, eq) : part;
      if (key) map.set(key, part);
    }
  }
  return Array.from(map.values()).join('; ');
}

export function scoreMatch(productName: string, query: string): 'exact' | 'high' | 'partial' {
  const pLower = productName.toLowerCase();
  const qLower = query.toLowerCase();
  if (pLower === qLower || pLower.includes(qLower)) return 'exact';
  const words = qLower.split(/\s+/);
  const matchCount = words.filter(w => pLower.includes(w)).length;
  if (matchCount >= words.length * 0.7) return 'high';
  return 'partial';
}
