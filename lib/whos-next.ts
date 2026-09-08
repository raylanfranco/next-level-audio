// Server-only integration. Never expose WHOS_NEXT_SERVICE_KEY through NEXT_PUBLIC_*.
export const WHOS_NEXT_API = process.env.WHOS_NEXT_API_URL || process.env.BAYREADY_API_URL || 'https://whos-next-production.up.railway.app';
export const WHOS_NEXT_MERCHANT_ID = process.env.WHOS_NEXT_MERCHANT_ID || process.env.BAYREADY_MERCHANT_ID || 'cmn7rxnc6000001ofxq4dea0q';

export function bookingManagementHeaders(): Record<string, string> {
  const key = process.env.WHOS_NEXT_SERVICE_KEY;
  if (!key || key.length < 32) throw new Error('Booking management credentials are not configured');
  return { 'Content-Type': 'application/json', 'X-NLA-Service-Key': key };
}
