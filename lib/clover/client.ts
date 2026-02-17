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
  options?: {
    params?: Record<string, string>;
    method?: string;
    body?: unknown;
  }
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

  const headers: Record<string, string> = {
    Authorization: `Bearer ${CLOVER_API_TOKEN}`,
    Accept: "application/json",
  };

  const fetchOptions: RequestInit = { headers };

  if (options?.method) {
    fetchOptions.method = options.method;
  }

  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url.toString(), fetchOptions);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clover API error ${res.status}: ${body}`);
  }

  // DELETE returns empty body
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json();
}
