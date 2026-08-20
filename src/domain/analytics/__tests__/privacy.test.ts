import { describe, expect, it } from "vitest";
import {
  hashVisitor,
  isPrivatePath,
  referrerHost,
  topPages,
  topReferrers,
  totals,
  type AnalyticsEvent,
} from "../privacy";

/**
 * These test a privacy property, not a feature. The claim on our cookies page is that we
 * cannot follow anyone between visits — that has to hold structurally, not by policy.
 */

const SALT_A = "salt-a";
const SALT_B = "salt-b";

function event(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    at: "2026-08-20T00:00:00.000Z",
    path: "/",
    visitor: "v1",
    ...overrides,
  };
}

describe("hashVisitor", () => {
  it("is stable for the same visitor and salt", () => {
    expect(hashVisitor("1.2.3.4", "Mozilla/5.0", SALT_A)).toBe(
      hashVisitor("1.2.3.4", "Mozilla/5.0", SALT_A),
    );
  });

  it("distinguishes different visitors", () => {
    expect(hashVisitor("1.2.3.4", "Mozilla/5.0", SALT_A)).not.toBe(
      hashVisitor("5.6.7.8", "Mozilla/5.0", SALT_A),
    );
  });

  it("distinguishes the same IP on a different browser", () => {
    expect(hashVisitor("1.2.3.4", "Chrome", SALT_A)).not.toBe(
      hashVisitor("1.2.3.4", "Safari", SALT_A),
    );
  });

  it("becomes unlinkable once the salt rotates", () => {
    // This is the whole privacy claim: a process restart severs the link.
    expect(hashVisitor("1.2.3.4", "Mozilla/5.0", SALT_B)).not.toBe(
      hashVisitor("1.2.3.4", "Mozilla/5.0", SALT_A),
    );
  });

  it("never leaks the raw IP address", () => {
    const hash = hashVisitor("203.0.113.45", "Mozilla/5.0", SALT_A);
    expect(hash).not.toContain("203");
    expect(hash).not.toContain("113");
    expect(hash).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe("referrerHost", () => {
  it("keeps only the host, discarding the path and query", () => {
    // A full referrer routinely carries the search terms someone used.
    expect(referrerHost("https://www.google.com/search?q=uae+golden+visa+cost")).toBe(
      "www.google.com",
    );
  });

  it("returns nothing for a missing or malformed referrer", () => {
    expect(referrerHost(null)).toBeUndefined();
    expect(referrerHost(undefined)).toBeUndefined();
    expect(referrerHost("not-a-url")).toBeUndefined();
    expect(referrerHost("")).toBeUndefined();
  });
});

describe("isPrivatePath", () => {
  it("excludes every authenticated surface", () => {
    for (const path of ["/portal", "/portal/applications/app-1", "/admin", "/api/x"]) {
      expect(isPrivatePath(path), path).toBe(true);
    }
  });

  it("allows public marketing paths", () => {
    for (const path of [
      "/",
      "/pricing",
      "/services/golden-visa",
      "/uae-visa-for/india",
    ]) {
      expect(isPrivatePath(path), path).toBe(false);
    }
  });
});

describe("aggregation", () => {
  it("counts views and distinct visitors per page", () => {
    const [page] = topPages([
      event({ path: "/pricing", visitor: "a" }),
      event({ path: "/pricing", visitor: "a" }),
      event({ path: "/pricing", visitor: "b" }),
    ]);

    expect(page).toEqual({ path: "/pricing", views: 3, visitors: 2 });
  });

  it("ranks the busiest page first", () => {
    const pages = topPages([
      event({ path: "/quiet", visitor: "a" }),
      event({ path: "/busy", visitor: "a" }),
      event({ path: "/busy", visitor: "b" }),
    ]);
    expect(pages[0].path).toBe("/busy");
  });

  it("breaks ties deterministically", () => {
    const pages = topPages([
      event({ path: "/zebra", visitor: "a" }),
      event({ path: "/alpha", visitor: "b" }),
    ]);
    expect(pages.map((page) => page.path)).toEqual(["/alpha", "/zebra"]);
  });

  it("respects the limit", () => {
    const events = Array.from({ length: 30 }, (_, index) =>
      event({ path: `/page-${index}`, visitor: `v${index}` }),
    );
    expect(topPages(events, 5)).toHaveLength(5);
  });

  it("counts referrers and ignores direct visits", () => {
    const referrers = topReferrers([
      event({ referrerHost: "google.com" }),
      event({ referrerHost: "google.com" }),
      event({ referrerHost: "bing.com" }),
      event({}),
    ]);
    expect(referrers[0]).toEqual({ host: "google.com", count: 2 });
    expect(referrers).toHaveLength(2);
  });

  it("reports overall totals with distinct visitors", () => {
    expect(
      totals([
        event({ path: "/", visitor: "a" }),
        event({ path: "/pricing", visitor: "a" }),
        event({ path: "/", visitor: "b" }),
      ]),
    ).toEqual({ views: 3, visitors: 2 });
  });

  it("handles an empty set without dividing by zero", () => {
    expect(totals([])).toEqual({ views: 0, visitors: 0 });
    expect(topPages([])).toEqual([]);
    expect(topReferrers([])).toEqual([]);
  });
});
