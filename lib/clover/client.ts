const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL;
const CLOVER_API_TOKEN = process.env.CLOVER_API_TOKEN;
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;

export const isCloverConfigured = !!(
  CLOVER_API_BASE_URL &&
  CLOVER_API_TOKEN &&
  CLOVER_MERCHANT_ID
);

export async function cloverFetch<T = unknown>(
  endpoint: string,
  options?: { params?: Record<string, string> }
): Promise<T> {
  if (!isCloverConfigured) {
    throw new Error("Clover API is not configured. Check your .env.local file.");
  }

  const url = new URL(
    `/v3/merchants/${CLOVER_MERCHANT_ID}${endpoint}`,
    CLOVER_API_BASE_URL!
  );

  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${CLOVER_API_TOKEN}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clover API error ${res.status}: ${body}`);
  }

  return res.json();
}
