import { createHash } from "node:crypto";

/**
 * The privacy-preserving parts of analytics, as pure functions.
 *
 * These live in `domain/` rather than beside the event store because they are exactly the
 * thing that has to be verifiable: the claim on our cookies page is that we *cannot*
 * follow anyone between visits, and that has to hold structurally rather than by policy.
 * Pure functions can be tested directly; a module that owns mutable state and imports
 * `server-only` cannot.
 */

export interface AnalyticsEvent {
  at: string;
  path: string;
  /** Ephemeral, unlinkable once the salt rotates. */
  visitor: string;
  referrerHost?: string;
  locale?: string;
}

export interface PageStat {
  path: string;
  views: number;
  visitors: number;
}

/**
 * Derives a visitor hash from IP, user agent and a rotating salt.
 *
 * The salt is regenerated on every process start and never persisted, which is what makes
 * the output unlinkable across restarts. Truncating to 16 hex characters is deliberate:
 * it is enough to distinguish visitors within a window and short enough that the space is
 * not a reversible index of every IP address on the internet.
 */
export function hashVisitor(ip: string, userAgent: string, salt: string): string {
  return createHash("sha256")
    .update(`${ip}:${userAgent}:${salt}`)
    .digest("hex")
    .slice(0, 16);
}

/**
 * Keeps only the referrer's host.
 *
 * A full referrer URL routinely carries the search terms someone used and sometimes an
 * identifier. "google.com" answers the only question we actually have.
 */
export function referrerHost(referrer: string | null | undefined): string | undefined {
  if (!referrer) return undefined;
  try {
    return new URL(referrer).hostname;
  } catch {
    return undefined;
  }
}

/** Paths we never record at all. Which application someone is reading is not our business. */
export function isPrivatePath(path: string): boolean {
  return (
    path.startsWith("/portal") || path.startsWith("/admin") || path.startsWith("/api")
  );
}

export function topPages(events: AnalyticsEvent[], limit = 20): PageStat[] {
  const byPath = new Map<string, { views: number; visitors: Set<string> }>();

  for (const event of events) {
    const entry = byPath.get(event.path) ?? { views: 0, visitors: new Set<string>() };
    entry.views += 1;
    entry.visitors.add(event.visitor);
    byPath.set(event.path, entry);
  }

  return [...byPath.entries()]
    .map(([path, entry]) => ({
      path,
      views: entry.views,
      visitors: entry.visitors.size,
    }))
    .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path))
    .slice(0, limit);
}

export function topReferrers(
  events: AnalyticsEvent[],
  limit = 10,
): { host: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (!event.referrerHost) continue;
    counts.set(event.referrerHost, (counts.get(event.referrerHost) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count || a.host.localeCompare(b.host))
    .slice(0, limit);
}

export function totals(events: AnalyticsEvent[]): { views: number; visitors: number } {
  return {
    views: events.length,
    visitors: new Set(events.map((event) => event.visitor)).size,
  };
}
