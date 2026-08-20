import { describe, expect, it } from "vitest";
import {
  medianTimeToDecision,
  openApplications,
  pipelineByStatus,
  revenueSummary,
  servicePerformance,
} from "../reports";
import type { Application, Invoice } from "@/server/repositories/types";

const NOW = new Date("2026-08-20T00:00:00.000Z");

function application(overrides: Partial<Application> = {}): Application {
  return {
    id: "a1",
    reference: "MQ-2026-0001",
    userId: "u1",
    serviceSlug: "tourist-visa-30-day",
    status: "in-review",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-10T00:00:00.000Z",
    applicantName: "Test Person",
    applicantEmail: "test@example.com",
    quotedTotal: 1000,
    currentStage: 0,
    documents: [],
    events: [],
    ...overrides,
  };
}

function invoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "i1",
    reference: "INV-1",
    applicationId: "a1",
    userId: "u1",
    issuedAt: "2026-08-01T00:00:00.000Z",
    dueAt: "2026-08-15T00:00:00.000Z",
    status: "sent",
    lines: [
      { kind: "service", label: "Service fee", amount: 500, vatable: true },
      { kind: "government", label: "Gov fee", amount: 400, vatable: false },
    ],
    subtotal: 900,
    vat: 25,
    total: 925,
    description: "Test invoice",
    ...overrides,
  };
}

describe("pipelineByStatus", () => {
  it("groups by status with counts and value", () => {
    const buckets = pipelineByStatus([
      application({ id: "1", status: "in-review", quotedTotal: 1000 }),
      application({ id: "2", status: "in-review", quotedTotal: 500 }),
      application({ id: "3", status: "approved", quotedTotal: 2000 }),
    ]);

    const inReview = buckets.find((b) => b.status === "in-review")!;
    expect(inReview.count).toBe(2);
    expect(inReview.value).toBe(1500);
  });

  it("sorts the busiest status first", () => {
    const buckets = pipelineByStatus([
      application({ id: "1", status: "approved" }),
      application({ id: "2", status: "in-review" }),
      application({ id: "3", status: "in-review" }),
    ]);
    expect(buckets[0].status).toBe("in-review");
  });

  it("returns nothing for no applications", () => {
    expect(pipelineByStatus([])).toEqual([]);
  });
});

describe("servicePerformance", () => {
  it("counts starts, approvals and rejections per service", () => {
    const rows = servicePerformance([
      application({ id: "1", serviceSlug: "golden-visa", status: "approved" }),
      application({ id: "2", serviceSlug: "golden-visa", status: "rejected" }),
      application({ id: "3", serviceSlug: "golden-visa", status: "in-review" }),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].started).toBe(3);
    expect(rows[0].approved).toBe(1);
    expect(rows[0].rejected).toBe(1);
  });

  it("computes approval rate over decided applications only", () => {
    const rows = servicePerformance([
      application({ id: "1", serviceSlug: "golden-visa", status: "approved" }),
      application({ id: "2", serviceSlug: "golden-visa", status: "rejected" }),
      // Three still open — these must not drag the rate down.
      application({ id: "3", serviceSlug: "golden-visa", status: "in-review" }),
      application({ id: "4", serviceSlug: "golden-visa", status: "submitted" }),
      application({ id: "5", serviceSlug: "golden-visa", status: "draft" }),
    ]);
    expect(rows[0].approvalRate).toBe(0.5);
  });

  it("reports null rather than zero when nothing is decided", () => {
    const rows = servicePerformance([
      application({ serviceSlug: "golden-visa", status: "in-review" }),
    ]);
    // Showing 0% off no decisions would read as catastrophic performance.
    expect(rows[0].approvalRate).toBeNull();
  });

  it("resolves the human service name", () => {
    const rows = servicePerformance([application({ serviceSlug: "golden-visa" })]);
    expect(rows[0].serviceName).toContain("Golden Visa");
  });

  it("falls back to the slug for an unknown service", () => {
    const rows = servicePerformance([application({ serviceSlug: "not-a-service" })]);
    expect(rows[0].serviceName).toBe("not-a-service");
  });

  it("sorts by volume", () => {
    const rows = servicePerformance([
      application({ id: "1", serviceSlug: "golden-visa" }),
      application({ id: "2", serviceSlug: "tourist-visa-30-day" }),
      application({ id: "3", serviceSlug: "tourist-visa-30-day" }),
    ]);
    expect(rows[0].serviceSlug).toBe("tourist-visa-30-day");
  });
});

describe("revenueSummary", () => {
  it("counts only paid invoices as collected", () => {
    const summary = revenueSummary(
      [
        invoice({ id: "1", status: "paid", total: 1000 }),
        invoice({ id: "2", status: "sent", total: 500 }),
      ],
      NOW,
    );
    expect(summary.collected).toBe(1000);
    expect(summary.outstanding).toBe(500);
  });

  it("separates what we earned from what passed through", () => {
    const summary = revenueSummary([invoice({ status: "paid" })], NOW);
    expect(summary.serviceFeeEarned).toBe(500);
    expect(summary.passThrough).toBe(400);
  });

  it("counts nothing as earned until the invoice is actually paid", () => {
    // Invoiced-but-unpaid is a hope, not revenue.
    const summary = revenueSummary([invoice({ status: "sent" })], NOW);
    expect(summary.serviceFeeEarned).toBe(0);
    expect(summary.passThrough).toBe(0);
  });

  it("flags an unpaid invoice past its due date as overdue", () => {
    const summary = revenueSummary(
      [invoice({ status: "sent", dueAt: "2026-08-01T00:00:00.000Z", total: 300 })],
      NOW,
    );
    expect(summary.overdue).toBe(300);
  });

  it("does not treat a future due date as overdue", () => {
    const summary = revenueSummary(
      [invoice({ status: "sent", dueAt: "2026-09-30T00:00:00.000Z" })],
      NOW,
    );
    expect(summary.overdue).toBe(0);
  });

  it("ignores draft and void invoices entirely", () => {
    const summary = revenueSummary(
      [
        invoice({ id: "1", status: "draft", total: 9999 }),
        invoice({ id: "2", status: "void", total: 9999 }),
      ],
      NOW,
    );
    expect(summary.invoiced).toBe(0);
    expect(summary.outstanding).toBe(0);
  });

  it("handles no invoices without dividing by zero", () => {
    const summary = revenueSummary([], NOW);
    expect(summary).toEqual({
      invoiced: 0,
      collected: 0,
      outstanding: 0,
      overdue: 0,
      serviceFeeEarned: 0,
      passThrough: 0,
    });
  });
});

describe("medianTimeToDecision", () => {
  it("returns the middle value for an odd count", () => {
    const days = (n: number) =>
      application({
        status: "approved",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: new Date(
          Date.parse("2026-08-01T00:00:00.000Z") + n * 86_400_000,
        ).toISOString(),
      });
    expect(medianTimeToDecision([days(2), days(10), days(30)])).toBe(10);
  });

  it("averages the middle pair for an even count", () => {
    const days = (n: number) =>
      application({
        status: "approved",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: new Date(
          Date.parse("2026-08-01T00:00:00.000Z") + n * 86_400_000,
        ).toISOString(),
      });
    expect(medianTimeToDecision([days(4), days(6), days(8), days(10)])).toBe(7);
  });

  it("ignores applications that have not been decided", () => {
    expect(medianTimeToDecision([application({ status: "in-review" })])).toBeNull();
  });

  it("is not dragged by a single stuck outlier the way a mean would be", () => {
    const days = (n: number) =>
      application({
        status: "approved",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: new Date(
          Date.parse("2026-08-01T00:00:00.000Z") + n * 86_400_000,
        ).toISOString(),
      });
    const median = medianTimeToDecision([days(5), days(5), days(5), days(500)])!;
    const mean = (5 + 5 + 5 + 500) / 4;
    expect(median).toBeLessThan(mean);
    expect(median).toBe(5);
  });

  it("returns null with nothing to measure", () => {
    expect(medianTimeToDecision([])).toBeNull();
  });
});

describe("openApplications", () => {
  it("excludes every terminal status", () => {
    const open = openApplications([
      application({ id: "1", status: "approved" }),
      application({ id: "2", status: "rejected" }),
      application({ id: "3", status: "cancelled" }),
      application({ id: "4", status: "in-review" }),
    ]);
    expect(open.map((a) => a.id)).toEqual(["4"]);
  });
});
