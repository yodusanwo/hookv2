import { NextResponse } from "next/server";

/**
 * Per-route sliding window limits (per server instance / cold start).
 * For strict multi-instance limits, add Vercel Firewall or Redis (e.g. Upstash).
 */
export type RateLimitRule = { windowMs: number; maxRequests: number };

export const API_RATE_LIMITS = {
  contact: { windowMs: 60_000, maxRequests: 10 },
  /** Shopify search — moderate cost */
  search: { windowMs: 60_000, maxRequests: 60 },
  events: { windowMs: 60_000, maxRequests: 60 },
  products: { windowMs: 60_000, maxRequests: 120 },
  recommendations: { windowMs: 60_000, maxRequests: 90 },
  reviews: { windowMs: 60_000, maxRequests: 60 },
  shippingSettings: { windowMs: 60_000, maxRequests: 120 },
  /** Called often on client navigation; higher cap */
  footerWaveColor: { windowMs: 60_000, maxRequests: 300 },
  cart: { windowMs: 60_000, maxRequests: 120 },
  cartLines: { windowMs: 60_000, maxRequests: 90 },
  cartDiscount: { windowMs: 60_000, maxRequests: 40 },
  cartNote: { windowMs: 60_000, maxRequests: 40 },
  cartCount: { windowMs: 60_000, maxRequests: 180 },
  /** New cart + checkout URL */
  buyNow: { windowMs: 60_000, maxRequests: 20 },
  collectionProducts: { windowMs: 60_000, maxRequests: 120 },
} as const;

export type ApiRateLimitRouteId = keyof typeof API_RATE_LIMITS;

const PRUNE_THRESHOLD = 8_000;
const PRUNE_TTL_MS = 120_000;

type Bucket = { n: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function pruneBuckets(now: number) {
  if (buckets.size < PRUNE_THRESHOLD) return;
  for (const [k, v] of buckets) {
    if (now > v.resetAt + PRUNE_TTL_MS) buckets.delete(k);
  }
}

export function getClientIpKey(request: Request): string {
  const h = request.headers;
  const xff = h.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export function checkApiRateLimit(
  routeId: string,
  clientKey: string,
  rule: RateLimitRule,
): { ok: boolean; retryAfterSeconds: number } {
  const fullKey = `${routeId}:${clientKey.trim() || "unknown"}`;
  const now = Date.now();
  pruneBuckets(now);
  let b = buckets.get(fullKey);
  if (!b || now >= b.resetAt) {
    buckets.set(fullKey, { n: 1, resetAt: now + rule.windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  if (b.n >= rule.maxRequests) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }
  b.n += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

export function rateLimitResponse(
  retryAfterSeconds: number,
  message = "Too many requests. Please try again later.",
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

/**
 * Returns a 429 response if limited, otherwise null.
 */
export function enforceApiRateLimit(
  request: Request,
  routeId: ApiRateLimitRouteId,
): NextResponse | null {
  const ip = getClientIpKey(request);
  const rule = API_RATE_LIMITS[routeId];
  const { ok, retryAfterSeconds } = checkApiRateLimit(routeId, ip, rule);
  if (!ok) {
    return rateLimitResponse(
      retryAfterSeconds,
      routeId === "contact"
        ? "Too many requests. Please try again in a minute."
        : "Too many requests. Please try again later.",
    );
  }
  return null;
}
