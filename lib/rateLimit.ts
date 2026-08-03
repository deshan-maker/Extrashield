/**
 * Lightweight in-memory rate limiter.
 *
 * This is process-local (resets on server restart, and won't share state
 * across multiple server instances behind a load balancer). That's a fine
 * tradeoff for a single-instance deployment and needs zero extra
 * infrastructure. If this app is later deployed across multiple instances,
 * swap the Map below for a Redis-backed store (e.g. Upstash) using the same
 * `checkRateLimit` signature — nothing else needs to change.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this Map doesn't grow forever.
let lastCleanup = Date.now();
function cleanupIfNeeded() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return; // every 5 minutes at most
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Checks and records one attempt against `key` within a sliding window.
 *
 * @param key        Unique identifier for what's being limited, e.g.
 *                    `login:user@example.com` or `register:203.0.113.4`.
 * @param max         Max attempts allowed within the window.
 * @param windowMs    Window size in milliseconds.
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  cleanupIfNeeded();

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: max - existing.count,
    retryAfterSeconds: 0,
  };
}

/** Best-effort client IP extraction for App Router Request objects. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}