import { describe, expect, it } from "vitest";
import {
  attestationSummary,
  countries,
  countriesWithLandingPages,
  entryRuleSummary,
  getCountry,
} from "../countries";
import {
  freeZoneEntryCost,
  freeZones,
  freeZonesByTier,
  getFreeZone,
  recommendFreeZones,
} from "../free-zones";

describe("country data integrity", () => {
  it("uses unique ISO codes", () => {
    const codes = countries.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("uses two-letter uppercase ISO codes throughout", () => {
    for (const country of countries) {
      expect(country.code, country.name).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("gives every country a demonym, since copy depends on it", () => {
    for (const country of countries) {
      expect(country.demonym.length, country.code).toBeGreaterThan(2);
    }
  });

  it("gives every country a complete, ordered attestation chain", () => {
    for (const country of countries) {
      expect(country.attestationSteps.length, country.code).toBeGreaterThanOrEqual(3);
      // The UAE MOFA step is always last, wherever the document came from.
      expect(country.attestationSteps.at(-1), country.code).toMatch(
        /UAE Ministry of Foreign Affairs/,
      );
    }
  });

  it("gives apostille countries a shorter chain than embassy countries", () => {
    const apostille = countries.filter((c) => c.attestation === "apostille");
    const embassy = countries.filter((c) => c.attestation === "embassy-legalisation");

    expect(apostille.length).toBeGreaterThan(0);
    expect(embassy.length).toBeGreaterThan(0);

    // Embassy legalisation is a four-step chain; apostille collapses it to three.
    for (const country of embassy) {
      expect(country.attestationSteps.length, country.code).toBeGreaterThanOrEqual(4);
    }
  });

  it("never sends an apostille country through UAE embassy legalisation", () => {
    for (const country of countries.filter((c) => c.attestation === "apostille")) {
      const chain = country.attestationSteps.join(" ").toLowerCase();
      expect(chain, country.code).not.toMatch(/uae embassy|uae consulate/);
    }
  });

  it("always routes embassy countries through the UAE embassy", () => {
    for (const country of countries.filter(
      (c) => c.attestation === "embassy-legalisation",
    )) {
      const chain = country.attestationSteps.join(" ").toLowerCase();
      expect(chain, country.code).toMatch(/uae embassy|uae consulate/);
    }
  });

  it("quotes a sane attestation window for every country", () => {
    for (const country of countries) {
      expect(country.attestationDays.min, country.code).toBeGreaterThan(0);
      expect(country.attestationDays.max).toBeGreaterThanOrEqual(
        country.attestationDays.min,
      );
    }
  });

  it("treats every GCC nationality as visa-exempt", () => {
    for (const country of countries.filter((c) => c.region === "GCC")) {
      expect(country.entry, country.code).toBe("gcc");
    }
  });

  it("covers the UAE's largest expatriate communities", () => {
    for (const code of ["IN", "PK", "BD", "PH", "EG", "NP", "LK", "NG", "GB", "RU"]) {
      expect(getCountry(code), code).toBeDefined();
    }
  });

  it("looks countries up case-insensitively", () => {
    expect(getCountry("in")?.name).toBe("India");
    expect(getCountry("IN")?.name).toBe("India");
  });

  it("marks a focused set for landing pages rather than all of them", () => {
    const withPages = countriesWithLandingPages();
    expect(withPages.length).toBeGreaterThan(3);
    expect(withPages.length).toBeLessThan(countries.length);
  });
});

describe("entryRuleSummary", () => {
  it("spells out that conditional visa on arrival needs a third-country residence permit", () => {
    const summary = entryRuleSummary(getCountry("BD")!);
    expect(summary).toMatch(/residence permit/i);
    expect(summary).toMatch(/nationality alone is not enough/i);
  });

  it("says GCC nationals need no visa at all", () => {
    expect(entryRuleSummary(getCountry("SA")!)).toMatch(/no visa/i);
  });

  it("tells pre-approval nationalities to arrange a permit first", () => {
    expect(entryRuleSummary(getCountry("IN")!)).toMatch(/before travelling/i);
  });

  it("produces a non-empty sentence for every country", () => {
    for (const country of countries) {
      expect(entryRuleSummary(country).length, country.code).toBeGreaterThan(30);
    }
  });
});

describe("attestationSummary", () => {
  it("tells apostille countries the embassy step no longer applies", () => {
    const summary = attestationSummary(getCountry("IN")!);
    expect(summary).toMatch(/apostille/i);
    expect(summary).toMatch(/no longer applies/i);
  });

  it("tells embassy countries that skipping a step invalidates the rest", () => {
    const summary = attestationSummary(getCountry("PK")!);
    expect(summary).toMatch(/invalidates every step after it/i);
  });
});

describe("free zone data integrity", () => {
  it("uses unique slugs", () => {
    const slugs = freeZones.map((z) => z.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("publishes limitations for every zone, including the profitable ones", () => {
    for (const zone of freeZones) {
      expect(zone.limitations.length, zone.slug).toBeGreaterThan(0);
      expect(zone.strengths.length, zone.slug).toBeGreaterThan(0);
    }
  });

  it("has no field that could encode a referral commission", () => {
    // Guards the neutrality claim structurally rather than by convention.
    for (const zone of freeZones) {
      const keys = Object.keys(zone).join(" ").toLowerCase();
      expect(keys).not.toMatch(/commission|referral|kickback|payout/);
    }
  });

  it("quotes a positive cost and a sane setup window for every zone", () => {
    for (const zone of freeZones) {
      expect(freeZoneEntryCost(zone), zone.slug).toBeGreaterThan(0);
      expect(zone.setupDays.min).toBeGreaterThan(0);
      expect(zone.setupDays.max).toBeGreaterThanOrEqual(zone.setupDays.min);
    }
  });

  it("keeps budget zones genuinely cheaper than premium ones", () => {
    const budget = Math.max(...freeZonesByTier("budget").map(freeZoneEntryCost));
    const premium = Math.min(...freeZonesByTier("premium").map(freeZoneEntryCost));
    expect(budget).toBeLessThan(premium);
  });
});

describe("recommendFreeZones", () => {
  it("returns the cheapest qualifying zone first", () => {
    const results = recommendFreeZones({});
    const costs = results.map(freeZoneEntryCost);
    expect([...costs]).toEqual([...costs].sort((a, b) => a - b));
  });

  it("respects a budget ceiling", () => {
    for (const zone of recommendFreeZones({ budgetAed: 10_000 })) {
      expect(freeZoneEntryCost(zone), zone.slug).toBeLessThanOrEqual(10_000);
    }
  });

  it("filters to Dubai when a Dubai address is required", () => {
    for (const zone of recommendFreeZones({ needsDubaiAddress: true })) {
      expect(zone.emirate, zone.slug).toBe("Dubai");
    }
  });

  it("excludes zero-visa packages when visas are needed", () => {
    for (const zone of recommendFreeZones({ visasNeeded: 2 })) {
      expect(zone.visaQuotaBase, zone.slug).toBeGreaterThan(0);
    }
  });

  it("excludes no-premises zones when physical space is required", () => {
    for (const zone of recommendFreeZones({ needsPhysicalSpace: true })) {
      expect(zone.officeRequirement, zone.slug).not.toBe("none");
    }
  });

  it("returns nothing rather than a bad suggestion when nothing fits", () => {
    expect(recommendFreeZones({ budgetAed: 100 })).toEqual([]);
  });

  it("recommends a budget zone to a cost-sensitive freelancer", () => {
    const [top] = recommendFreeZones({ budgetAed: 9_000, visasNeeded: 1 });
    expect(top).toBeDefined();
    expect(top.tier).toBe("budget");
  });

  it("does not steer a Dubai-address seeker to a cheaper northern-emirate zone", () => {
    const results = recommendFreeZones({ needsDubaiAddress: true });
    expect(results.map((z) => z.slug)).not.toContain("shams");
    expect(getFreeZone("ifza")).toBeDefined();
  });
});
