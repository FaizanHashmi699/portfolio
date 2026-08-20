import "server-only";
import { env } from "@/server/env";

/**
 * Rate limiting.
 *
 * Two backends behind one call. Without Redis configured this is an in-process fixed
 * window, which is honest about what it protects: a single serverless instance, not the
 * fleet. It stops the trivial abuse case at zero cost. With `UPSTASH_REDIS_REST_URL` set
 * it becomes a shared window across every instance, which is what production actually
 * needs — the same call site, no code change.
 *
 * The Redis path is deliberately fail-open. If Redis is unreachable we allow the request
 * rather than locking every customer out of the sign-in form because a cache is down; a
 * brief window of unlimited requests is a smaller harm than a total outage.
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

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: RateLimitOptions = {},
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

export function isDistributedRateLimitConfigured(): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Shared across instances. Uses INCR with an expiry set on first write, which is the
 * standard fixed-window primitive and needs no Lua script.
 */
export async function rateLimitDistributed(
  key: string,
  { limit = 5, windowMs = 60_000 }: RateLimitOptions = {},
): Promise<RateLimitResult> {
  if (!isDistributedRateLimitConfigured()) {
    return rateLimit(key, { limit, windowMs });
  }

  const base = env.UPSTASH_REDIS_REST_URL!;
  const headers = { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN!}` };
  const namespaced = `ratelimit:${key}`;
  const seconds = Math.ceil(windowMs / 1000);

  try {
    const response = await fetch(`${base}/pipeline`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", namespaced],
        ["EXPIRE", namespaced, String(seconds), "NX"],
        ["PTTL", namespaced],
      ]),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Upstash returned ${response.status}`);

    const results = (await response.json()) as { result: number }[];
    const count = Number(results[0]?.result ?? 1);
    const ttl = Number(results[2]?.result ?? windowMs);

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: Date.now() + (ttl > 0 ? ttl : windowMs),
    };
  } catch (error) {
    // Fail open. Locking every customer out because a cache is unreachable is a worse
    // outcome than a brief window of unlimited requests.
    console.error("[rate-limit] distributed check failed, allowing request", error);
    return { allowed: true, remaining: limit, resetAt: Date.now() + windowMs };
  }
}

export function resetRateLimits(): void {
  globalBuckets.__maqamRateLimit = new Map();
}
