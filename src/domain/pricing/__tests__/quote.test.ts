import { describe, expect, it } from "vitest";
import {
  buildQuote,
  fromPrice,
  processingWindow,
  serviceFeeShare,
  volumeDiscount,
} from "../quote";
import { getService, services } from "@/domain/catalog/services";
import type { ServiceDefinition } from "@/domain/catalog/types";

const stub: ServiceDefinition = {
  slug: "test-service",
  pillar: "uae-visas",
  name: "Test Service",
  summary: "s",
  description: "d",
  audience: "a",
  fees: [
    { kind: "government", label: "Gov fee", amount: 1000, vatable: false },
    { kind: "third-party", label: "Medical", amount: 200, vatable: true },
    { kind: "service", label: "Service fee", amount: 500, vatable: true },
  ],
  expressSurcharge: 300,
  processingDays: { min: 5, max: 10 },
  expressDays: { min: 2, max: 4 },
  stages: [],
  documents: [],
  commonRejectionReasons: [],
  related: [],
};

describe("buildQuote", () => {
  it("splits every quote into government, third-party and service lines", () => {
    const quote = buildQuote(stub);
    const kinds = quote.lines.map((l) => l.kind);
    expect(kinds).toContain("government");
    expect(kinds).toContain("third-party");
    expect(kinds).toContain("service");
  });

  it("applies VAT per line, not to the subtotal", () => {
    const quote = buildQuote(stub);
    // Only the AED 200 and AED 500 lines are vatable: (200 + 500) * 0.05 = 35
    expect(quote.vat).toBe(35);
    expect(quote.subtotal).toBe(1700);
    expect(quote.total).toBe(1735);
  });

  it("does not charge VAT on government fees", () => {
    const govOnly: ServiceDefinition = {
      ...stub,
      fees: [{ kind: "government", label: "Gov", amount: 1000, vatable: false }],
    };
    expect(buildQuote(govOnly).vat).toBe(0);
  });

  it("separates what we earn from what passes through", () => {
    const quote = buildQuote(stub);
    expect(quote.serviceFee).toBe(500);
    expect(quote.passThrough).toBe(1200);
    expect(quote.serviceFee + quote.passThrough).toBe(quote.subtotal);
  });

  it("adds an express surcharge only when express is chosen", () => {
    expect(buildQuote(stub, { speed: "standard" }).total).toBe(1735);
    const express = buildQuote(stub, { speed: "express" });
    // subtotal 2000, vat on (200 + 500 + 300) = 50
    expect(express.subtotal).toBe(2000);
    expect(express.total).toBe(2050);
  });

  it("ignores express when the service has no express option", () => {
    const noExpress = { ...stub, expressSurcharge: undefined };
    expect(buildQuote(noExpress, { speed: "express" }).total).toBe(
      buildQuote(noExpress).total,
    );
  });

  it("scales every fee by the number of applicants", () => {
    const quote = buildQuote(stub, { applicants: 2, serviceDiscount: 0 });
    expect(quote.passThrough).toBe(2400);
    expect(quote.serviceFee).toBe(1000);
  });

  it("discounts only our own fee for multiple applicants, never pass-through", () => {
    const quote = buildQuote(stub, { applicants: 5 });
    // 15% volume discount on 5 x 500 = 2500 -> 2125
    expect(quote.serviceFee).toBe(2125);
    // Government and third-party costs scale linearly with no discount
    expect(quote.passThrough).toBe(6000);
  });

  it("labels lines with the applicant multiplier so the maths is visible", () => {
    const quote = buildQuote(stub, { applicants: 3 });
    expect(quote.lines[0].label).toBe("Gov fee × 3");
  });

  it("rejects nonsensical inputs rather than producing a wrong price", () => {
    expect(() => buildQuote(stub, { applicants: 0 })).toThrow();
    expect(() => buildQuote(stub, { applicants: 1.5 })).toThrow();
    expect(() => buildQuote(stub, { serviceDiscount: 1 })).toThrow();
    expect(() => buildQuote(stub, { serviceDiscount: -0.1 })).toThrow();
  });

  it("rounds to two decimals so totals never drift", () => {
    const quote = buildQuote(stub, { applicants: 3 });
    for (const line of quote.lines) {
      expect(Number.isFinite(line.amount)).toBe(true);
      expect(line.amount).toBe(Math.round(line.amount * 100) / 100);
    }
  });
});

describe("volumeDiscount", () => {
  it.each([
    [1, 0],
    [2, 0.1],
    [4, 0.1],
    [5, 0.15],
    [9, 0.15],
    [10, 0.25],
    [50, 0.25],
  ])("gives %i applicant(s) a %f discount", (applicants, expected) => {
    expect(volumeDiscount(applicants)).toBe(expected);
  });
});

describe("catalog integrity", () => {
  it("every service produces a positive, finite quote", () => {
    for (const service of services) {
      const quote = buildQuote(service);
      expect(quote.total).toBeGreaterThan(0);
      expect(Number.isFinite(quote.total)).toBe(true);
    }
  });

  it("every service earns us something — no accidental free work", () => {
    for (const service of services) {
      expect(buildQuote(service).serviceFee).toBeGreaterThan(0);
    }
  });

  it("uses unique slugs", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only links to services that exist", () => {
    for (const service of services) {
      for (const slug of service.related) {
        expect(getService(slug), `${service.slug} -> ${slug}`).toBeDefined();
      }
    }
  });

  it("never links a service to itself", () => {
    for (const service of services) {
      expect(service.related).not.toContain(service.slug);
    }
  });

  it("quotes a sane processing window for every service", () => {
    for (const service of services) {
      expect(service.processingDays.min).toBeLessThanOrEqual(
        service.processingDays.max,
      );
      if (service.expressDays) {
        expect(service.expressDays.max).toBeLessThanOrEqual(service.processingDays.max);
      }
    }
  });

  it("publishes rejection reasons for every service, since that is the promise", () => {
    for (const service of services) {
      expect(service.commonRejectionReasons.length).toBeGreaterThan(0);
      expect(service.documents.length).toBeGreaterThan(0);
    }
  });

  it("keeps our fee share honest and inspectable", () => {
    const service = getService("tourist-visa-30-day")!;
    const share = serviceFeeShare(buildQuote(service));
    expect(share).toBeGreaterThan(0);
    expect(share).toBeLessThan(1);
  });
});

describe("processingWindow", () => {
  it("returns the express window when express is selected", () => {
    expect(processingWindow(stub, "express")).toEqual({ min: 2, max: 4 });
  });

  it("falls back to the standard window when there is no express option", () => {
    const noExpress = { ...stub, expressDays: undefined };
    expect(processingWindow(noExpress, "express")).toEqual({ min: 5, max: 10 });
  });
});

describe("fromPrice", () => {
  it("is a real total, not a teaser figure", () => {
    const service = getService("tourist-visa-30-day")!;
    expect(fromPrice(service)).toBe(buildQuote(service).total);
  });
});
