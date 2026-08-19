import { describe, expect, it } from "vitest";
import {
  assessEligibility,
  STRONG_THRESHOLD,
  verdictDescription,
  verdictLabel,
} from "../engine";
import { routes } from "../rules/routes";
import type { ApplicantProfile } from "../types";
import { getService } from "@/domain/catalog/services";

const NOW = new Date("2026-08-19T00:00:00.000Z");

const base: ApplicantProfile = {
  nationality: "IN",
  age: 32,
  purpose: "work",
  currentStatus: "outside-uae",
  education: "bachelors",
  yearsExperience: 6,
  hasJobOffer: true,
  hasAttestedDegree: true,
  monthlySalaryAed: 18_000,
};

const assess = (p: Partial<ApplicantProfile> = {}) =>
  assessEligibility({ ...base, ...p }, { now: NOW });

describe("assessEligibility — determinism and shape", () => {
  it("is deterministic for the same profile", () => {
    expect(JSON.stringify(assess())).toBe(JSON.stringify(assess()));
  });

  it("stamps the rules version so a report can be reproduced later", () => {
    expect(assess().rulesVersion).toMatch(/^\d{4}\.\d{2}\.\d+$/);
  });

  it("uses the injected clock rather than the wall clock", () => {
    expect(assess().generatedAt).toBe(NOW.toISOString());
  });

  it("never returns an empty report, even for an unusual purpose", () => {
    const report = assessEligibility({ ...base, purpose: "visit" }, { now: NOW });
    expect(report.routes.length).toBeGreaterThan(0);
  });

  it("scores every route between 0 and 100", () => {
    for (const route of assessEligibility(base, { now: NOW, includeAllRoutes: true })
      .routes) {
      expect(route.score).toBeGreaterThanOrEqual(0);
      expect(route.score).toBeLessThanOrEqual(100);
    }
  });
});

describe("assessEligibility — Golden Visa salary route", () => {
  it("blocks a AED 18,000 earner on the salary route", () => {
    const report = assessEligibility(
      { ...base, purpose: "long-term-residence" },
      { now: NOW },
    );
    const golden = report.routes.find((r) => r.routeId === "golden-salary")!;
    expect(golden.blockers.map((b) => b.id)).toContain("salary-30k");
    expect(golden.verdict).not.toBe("strong");
  });

  it("clears the salary blocker at AED 30,000", () => {
    const report = assessEligibility(
      { ...base, purpose: "long-term-residence", monthlySalaryAed: 30_000 },
      { now: NOW },
    );
    const golden = report.routes.find((r) => r.routeId === "golden-salary")!;
    expect(golden.blockers).toHaveLength(0);
    expect(golden.score).toBeGreaterThanOrEqual(STRONG_THRESHOLD);
    expect(golden.verdict).toBe("strong");
  });

  it("treats the threshold as inclusive", () => {
    const at = assessEligibility(
      { ...base, purpose: "long-term-residence", monthlySalaryAed: 30_000 },
      { now: NOW },
    ).routes.find((r) => r.routeId === "golden-salary")!;
    const below = assessEligibility(
      { ...base, purpose: "long-term-residence", monthlySalaryAed: 29_999 },
      { now: NOW },
    ).routes.find((r) => r.routeId === "golden-salary")!;
    expect(at.blockers).toHaveLength(0);
    expect(below.blockers).toHaveLength(1);
  });

  it("gives an actionable next step for every blocker", () => {
    const golden = assessEligibility(
      { ...base, purpose: "long-term-residence" },
      { now: NOW },
    ).routes.find((r) => r.routeId === "golden-salary")!;
    expect(golden.nextSteps.length).toBeGreaterThan(0);
    for (const step of golden.nextSteps) expect(step.length).toBeGreaterThan(10);
  });
});

describe("assessEligibility — property route", () => {
  it("qualifies a AED 2m property owner", () => {
    const report = assessEligibility(
      {
        ...base,
        purpose: "long-term-residence",
        propertyValueAed: 2_000_000,
        hasJobOffer: false,
      },
      { now: NOW },
    );
    const property = report.routes.find((r) => r.routeId === "golden-property")!;
    expect(property.blockers).toHaveLength(0);
  });

  it("blocks below the investment threshold", () => {
    const property = assessEligibility(
      { ...base, purpose: "long-term-residence", propertyValueAed: 1_500_000 },
      { now: NOW },
    ).routes.find((r) => r.routeId === "golden-property")!;
    expect(property.blockers.map((b) => b.id)).toContain("property-2m");
  });

  it("does not guess when property value was never supplied", () => {
    const property = assessEligibility(
      { ...base, purpose: "long-term-residence", propertyValueAed: undefined },
      { now: NOW },
    ).routes.find((r) => r.routeId === "golden-property")!;
    const rule = property.outcomes.find((o) => o.id === "property-2m")!;
    expect(rule.status).toBe("unknown");
  });
});

describe("assessEligibility — employment route", () => {
  it("blocks without a job offer", () => {
    const employment = assess({ hasJobOffer: false }).routes.find(
      (r) => r.routeId === "employment",
    )!;
    expect(employment.blockers.map((b) => b.id)).toContain("job-offer");
  });

  it("blocks on an unattested degree — the most common real-world delay", () => {
    const employment = assess({ hasAttestedDegree: false }).routes.find(
      (r) => r.routeId === "employment",
    )!;
    expect(employment.blockers.map((b) => b.id)).toContain("attested-degree-emp");
    expect(employment.verdict).toBe("not-yet");
  });

  it("does not demand attestation from someone with no degree to attest", () => {
    const employment = assess({
      education: "secondary",
      hasAttestedDegree: false,
    }).routes.find((r) => r.routeId === "employment")!;
    const rule = employment.outcomes.find((o) => o.id === "attested-degree-emp")!;
    expect(rule.status).toBe("unknown");
  });

  it("recommends the employment route for a well-prepared hire", () => {
    const report = assess();
    expect(report.recommended?.routeId).toBe("employment");
  });
});

describe("assessEligibility — family sponsorship", () => {
  it("blocks a non-resident from sponsoring", () => {
    const family = assessEligibility(
      { ...base, purpose: "family", currentStatus: "outside-uae" },
      { now: NOW },
    ).routes.find((r) => r.routeId === "family-sponsorship")!;
    expect(family.blockers.map((b) => b.id)).toContain("sponsor-resident");
  });

  it("allows a qualifying resident sponsor", () => {
    const family = assessEligibility(
      {
        ...base,
        purpose: "family",
        currentStatus: "residence-visa",
        monthlySalaryAed: 8_000,
      },
      { now: NOW },
    ).routes.find((r) => r.routeId === "family-sponsorship")!;
    expect(family.blockers).toHaveLength(0);
  });

  it("marks two unmet blockers as ineligible rather than not-yet", () => {
    const family = assessEligibility(
      {
        ...base,
        purpose: "family",
        currentStatus: "outside-uae",
        monthlySalaryAed: 1_000,
      },
      { now: NOW },
    ).routes.find((r) => r.routeId === "family-sponsorship")!;
    expect(family.blockers.length).toBeGreaterThanOrEqual(2);
    expect(family.verdict).toBe("ineligible");
  });
});

describe("assessEligibility — minors", () => {
  it("blocks every adult route for a 16-year-old", () => {
    const report = assessEligibility(
      { ...base, age: 16, purpose: "long-term-residence" },
      { now: NOW },
    );
    for (const route of report.routes) {
      expect(route.outcomes.find((o) => o.id === "age-18")?.status).toBe("unmet");
    }
  });
});

describe("assessEligibility — ordering", () => {
  it("sorts strong matches ahead of blocked ones", () => {
    const report = assessEligibility(
      {
        ...base,
        purpose: "long-term-residence",
        monthlySalaryAed: 60_000,
        hasRecognisedAchievements: true,
      },
      { now: NOW },
    );
    const rank = { strong: 0, possible: 1, "not-yet": 2, ineligible: 3 } as const;
    const ranks = report.routes.map((r) => rank[r.verdict]);
    expect([...ranks]).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("recommends only a route with no unmet blockers", () => {
    const report = assessEligibility(
      { ...base, purpose: "long-term-residence", monthlySalaryAed: 60_000 },
      { now: NOW },
    );
    if (report.recommended) expect(report.recommended.blockers).toHaveLength(0);
  });
});

describe("route definitions integrity", () => {
  it("uses unique route ids", () => {
    const ids = routes.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every route at a real catalog service", () => {
    for (const route of routes) {
      expect(getService(route.serviceSlug), route.id).toBeDefined();
    }
  });

  it("gives every rule a positive weight and a unique id within its route", () => {
    for (const route of routes) {
      const ids = route.rules.map((r) => r.id);
      expect(new Set(ids).size, route.id).toBe(ids.length);
      for (const rule of route.rules) expect(rule.weight).toBeGreaterThan(0);
    }
  });

  it("gives every blocker a fix, so the engine never dead-ends a user", () => {
    for (const route of routes) {
      for (const rule of route.rules.filter((r) => r.blocker)) {
        expect(rule.fix, `${route.id}/${rule.id}`).toBeTruthy();
      }
    }
  });

  it("carries an effective date so policy changes stay auditable", () => {
    for (const route of routes) {
      expect(route.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(route.purposes.length).toBeGreaterThan(0);
    }
  });
});

describe("verdict copy", () => {
  it("provides a label and description for every verdict", () => {
    for (const v of ["strong", "possible", "not-yet", "ineligible"] as const) {
      expect(verdictLabel(v)).toBeTruthy();
      expect(verdictDescription(v)).toBeTruthy();
    }
  });

  it("never promises approval", () => {
    for (const v of ["strong", "possible", "not-yet", "ineligible"] as const) {
      const text = `${verdictLabel(v)} ${verdictDescription(v)}`.toLowerCase();
      expect(text).not.toMatch(/guarantee|will be approved|approval guaranteed/);
    }
  });
});
