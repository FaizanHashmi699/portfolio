import "server-only";
import { randomBytes } from "node:crypto";
import {
  hashVisitor as hashVisitorPure,
  topPages as topPagesPure,
  topReferrers as topReferrersPure,
  totals as totalsPure,
  type AnalyticsEvent,
} from "@/domain/analytics/privacy";

/**
 * The event store for first-party, cookieless analytics.
 *
 * This module owns only the two things that cannot be pure: the rotating salt and the
 * bounded in-memory buffer. Everything computed from them lives in
 * `domain/analytics/privacy.ts`, where it can be tested directly.
 *
 * The salt is regenerated on every process start and never persisted, so yesterday's
 * visitor hashes cannot be matched to today's. That gives us "roughly how many people"
 * and denies us "which people" by construction. The cost is that funnels and cohorts
 * across days are impossible — a real limitation, chosen deliberately for a site whose
 * visitors are largely migrants.
 */

const MAX_EVENTS = 5000;

const globalState = globalThis as typeof globalThis & {
  __maqamAnalytics?: { salt: string; events: AnalyticsEvent[] };
};

function state() {
  globalState.__maqamAnalytics ??= {
    salt: randomBytes(32).toString("hex"),
    events: [],
  };
  return globalState.__maqamAnalytics;
}

export function hashVisitor(ip: string, userAgent: string): string {
  return hashVisitorPure(ip, userAgent, state().salt);
}

export function recordEvent(event: Omit<AnalyticsEvent, "at">): void {
  const events = state().events;
  events.push({ ...event, at: new Date().toISOString() });
  // Bounded, because this lives in memory. A long-lived instance must not grow forever.
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
}

export function topPages(limit = 20) {
  return topPagesPure(state().events, limit);
}

export function topReferrers(limit = 10) {
  return topReferrersPure(state().events, limit);
}

export function totals() {
  return totalsPure(state().events);
}

/** Test helper, and what a process restart does to the salt. */
export function resetAnalytics(): void {
  globalState.__maqamAnalytics = {
    salt: randomBytes(32).toString("hex"),
    events: [],
  };
}

export { referrerHost, isPrivatePath } from "@/domain/analytics/privacy";
export type { AnalyticsEvent, PageStat } from "@/domain/analytics/privacy";
