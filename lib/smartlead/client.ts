const BASE_URL = "https://server.smartlead.ai/api/v1";

/**
 * Strict allowlist regex patterns for GET endpoints.
 * Any request that does NOT match one of these is immediately rejected.
 */
const ALLOWED_GET_PATTERNS: RegExp[] = [
  /^\/campaigns\/?$/,
  /^\/campaigns\/\d+$/,
  /^\/campaigns\/\d+\/analytics$/,
  /^\/campaigns\/\d+\/analytics-by-date$/,
  /^\/campaigns\/\d+\/statistics$/,
  /^\/campaigns\/\d+\/leads$/,
  /^\/campaigns\/\d+\/email-accounts$/,
  /^\/email-accounts\/?$/,
  /^\/email-accounts\/\d+\/warmup-stats$/,
  /^\/leads\/fetch-categories$/,
  /^\/analytics\/overview$/,
];

export function isAllowedPath(path: string): boolean {
  // Strip query string for path verification
  const cleanPath = path.split("?")[0].trim();
  return ALLOWED_GET_PATTERNS.some((pattern) => pattern.test(cleanPath));
}

// In-flight request de-duplication cache
const inFlightRequests = new Map<string, Promise<any>>();

// Server-side rate limiter: token bucket / queue enforcing max ~5 requests/second (200ms delay)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 200; // 5 req/sec

async function throttle(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    const delay = MIN_REQUEST_INTERVAL_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();
}

/**
 * Strips sensitive query parameters from URLs for safe logging
 */
export function sanitizeUrlForLogging(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    if (url.searchParams.has("api_key")) {
      url.searchParams.set("api_key", "[REDACTED]");
    }
    return url.toString();
  } catch {
    return urlStr.replace(/api_key=[^&]+/g, "api_key=[REDACTED]");
  }
}

export interface SmartleadRequestOptions {
  apiKey?: string;
  cacheTtlMs?: number;
}

/**
 * Secure, rate-limited, read-only Smartlead API Client.
 */
export async function smartleadGet<T = any>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  options: SmartleadRequestOptions = {}
): Promise<T> {
  // 1. Path Allowlist check (HARD CONSTRAINT: Read-only)
  const cleanPath = path.split("?")[0].trim();
  if (!isAllowedPath(cleanPath)) {
    throw new Error(
      `[SECURITY] Smartlead path "${cleanPath}" is not on the read-only allowlist. Request rejected.`
    );
  }

  // 2. Resolve API key from env (NEVER from client)
  const apiKey = options.apiKey || process.env.SMARTLEAD_API_KEY;
  if (!apiKey) {
    throw new Error("SMARTLEAD_API_KEY environment variable is not configured");
  }

  // 3. Build canonical URL
  const url = new URL(`${BASE_URL}${cleanPath}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const cacheKey = url.toString();
  const safeLogUrl = sanitizeUrlForLogging(cacheKey);

  // 4. In-flight request de-duplication
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  // 5. Execute request with throttling and exponential backoff retry on 429/5xx
  const requestPromise = (async () => {
    const maxRetries = 3;
    let attempt = 0;
    let backoffMs = 2000; // Start at 2s per specs

    while (attempt <= maxRetries) {
      try {
        await throttle();

        const res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          // Disable Next.js default fetch caching inside client to manage caching in service layer
          cache: "no-store",
        });

        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          if (attempt < maxRetries) {
            console.warn(
              `[Smartlead API] HTTP ${res.status} on ${safeLogUrl}. Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})...`
            );
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            backoffMs *= 2; // Exponential backoff: 2s -> 4s -> 8s
            attempt++;
            continue;
          }
        }

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          throw new Error(
            `Smartlead API error ${res.status}: ${res.statusText}. Target: ${cleanPath}`
          );
        }

        const data = await res.json();
        return data as T;
      } catch (err: any) {
        if (attempt >= maxRetries) {
          console.error(`[Smartlead API] Request failed permanently: ${safeLogUrl}`, err.message);
          throw err;
        }
        console.warn(
          `[Smartlead API] Network error on ${safeLogUrl}: ${err.message}. Retrying in ${backoffMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        backoffMs *= 2;
        attempt++;
      }
    }

    throw new Error(`Failed to complete request to ${cleanPath} after ${maxRetries} retries`);
  })();

  inFlightRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

/**
 * Helper to fetch all items across a paginated list endpoint until exhausted
 */
export async function smartleadGetPaginated<T = any>(
  path: string,
  dataKey: string = "data",
  pageSize: number = 100,
  params: Record<string, any> = {},
  options: SmartleadRequestOptions = {}
): Promise<T[]> {
  const allItems: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const res = await smartleadGet<any>(
      path,
      {
        ...params,
        offset,
        limit: pageSize,
      },
      options
    );

    let items: T[] = [];
    if (Array.isArray(res)) {
      items = res;
    } else if (res && Array.isArray(res[dataKey])) {
      items = res[dataKey];
    } else if (res && Array.isArray(res.items)) {
      items = res.items;
    }

    allItems.push(...items);

    if (items.length < pageSize || (res && res.total_leads && allItems.length >= Number(res.total_leads))) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  return allItems;
}
