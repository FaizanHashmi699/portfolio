import "server-only";

/**
 * A minimal fixed-window rate limiter.
 *
 * In-process, so it protects a single serverless instance rather than the whole fleet —
 * which is honest about what it is. It stops the trivial abuse case (someone looping a
 * form submit) at zero cost and with no extra infrastructure. Before taking real traffic
 * this should move to Upstash Redis or Vercel KV so the window is shared across instances;
 * the call site does not change when it does.
 */

interface Window {
  count: number;
  resetAt: number;
}

const globalBuckets = globalThis as typeof globalThis & {
  __maqamRateLimit?: Map<string, Window>;
};

function buckets(): Map<string, Window> {
  globalBuckets.__maqamRateLimit ??= new Map();
  return globalBuckets.__maqamRateLimit;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const existing = buckets().get(key);

  if (!existing || existing.resetAt <= now) {
    const window: Window = { count: 1, resetAt: now + windowMs };
    buckets().set(key, window);
    return { allowed: true, remaining: limit - 1, resetAt: window.resetAt };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export function resetRateLimits(): void {
  globalBuckets.__maqamRateLimit = new Map();
}
