/**
 * Best-effort per-IP contact form rate limit (in-memory).
 * Resets per server instance / cold start; use Vercel Firewall or Redis for strict limits.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const PRUNE_THRESHOLD = 2000;

type Bucket = { n: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function pruneBuckets(now: number) {
  if (buckets.size < PRUNE_THRESHOLD) return;
  for (const [k, v] of buckets) {
    if (now > v.resetAt + WINDOW_MS) buckets.delete(k);
  }
}

/** Returns true if this client should be blocked (429). */
export function isContactRateLimited(clientKey: string): boolean {
  const now = Date.now();
  pruneBuckets(now);
  const key = clientKey.trim() || "unknown";
  let b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { n: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (b.n >= MAX_PER_WINDOW) return true;
  b.n += 1;
  return false;
}
