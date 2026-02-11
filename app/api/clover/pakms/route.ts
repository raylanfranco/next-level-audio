import { NextResponse } from 'next/server';

let cachedKey: { apiAccessKey: string; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET() {
  // If a static ecommerce public key is set (from Clover Dashboard > Setup > Ecommerce),
  // use it directly — no API call needed. This is the recommended approach
  // when using merchant API tokens rather than OAuth access_tokens.
  const staticKey = process.env.CLOVER_ECOMM_PUBLIC_KEY;
  if (staticKey) {
    return NextResponse.json({ apiAccessKey: staticKey });
  }

  // Fallback: try fetching via the PAKMS endpoint (requires OAuth access_token)
  const token = process.env.CLOVER_API_TOKEN;
  const baseUrl = process.env.CLOVER_API_BASE_URL || 'https://api.clover.com';

  if (!token) {
    return NextResponse.json(
      { error: 'Clover API not configured' },
      { status: 503 }
    );
  }

  // Return cached key if still valid
  if (cachedKey && Date.now() - cachedKey.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ apiAccessKey: cachedKey.apiAccessKey });
  }

  try {
    const res = await fetch(`${baseUrl}/pakms/apikey`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('PAKMS key fetch error:', res.status, body);
      return NextResponse.json(
        { error: 'Failed to fetch PAKMS key. Add CLOVER_ECOMM_PUBLIC_KEY to env vars (from Clover Dashboard > Setup > Ecommerce).' },
        { status: 500 }
      );
    }

    const data = await res.json();
    const apiAccessKey = data.apiAccessKey;

    cachedKey = { apiAccessKey, fetchedAt: Date.now() };

    return NextResponse.json({ apiAccessKey });
  } catch (error) {
    console.error('PAKMS key error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PAKMS key' },
      { status: 500 }
    );
  }
}
