import type { Application, Invoice } from "@/server/repositories/types";
import { getService } from "@/domain/catalog/services";

/**
 * Operational reporting.
 *
 * Pure functions over the repository's output, so every figure on the reports page is
 * unit-testable without a database. Reporting logic that lives only inside a page
 * component is reporting logic nobody ever verifies.
 */

export interface PipelineBucket {
  status: Application["status"];
  count: number;
  value: number;
}

export interface ServicePerformance {
  serviceSlug: string;
  serviceName: string;
  started: number;
  approved: number;
  rejected: number;
  /** Share of decided applications that were approved, 0–1. Null when none decided. */
  approvalRate: number | null;
  revenue: number;
}

export interface RevenueSummary {
  invoiced: number;
  collected: number;
  outstanding: number;
  overdue: number;
  /** What we actually earned, as opposed to money passed through. */
  serviceFeeEarned: number;
  passThrough: number;
}

const TERMINAL: Application["status"][] = ["approved", "rejected", "cancelled"];

export function pipelineByStatus(applications: Application[]): PipelineBucket[] {
  const buckets = new Map<Application["status"], PipelineBucket>();

  for (const application of applications) {
    const existing = buckets.get(application.status) ?? {
      status: application.status,
      count: 0,
      value: 0,
    };
    existing.count += 1;
    existing.value += application.quotedTotal;
    buckets.set(application.status, existing);
  }

  return [...buckets.values()].sort((a, b) => b.count - a.count);
}

export function servicePerformance(applications: Application[]): ServicePerformance[] {
  const rows = new Map<string, ServicePerformance>();

  for (const application of applications) {
    const existing = rows.get(application.serviceSlug) ?? {
      serviceSlug: application.serviceSlug,
      serviceName: getService(application.serviceSlug)?.name ?? application.serviceSlug,
      started: 0,
      approved: 0,
      rejected: 0,
      approvalRate: null,
      revenue: 0,
    };

    existing.started += 1;
    existing.revenue += application.quotedTotal;
    if (application.status === "approved") existing.approved += 1;
    if (application.status === "rejected") existing.rejected += 1;

    rows.set(application.serviceSlug, existing);
  }

  for (const row of rows.values()) {
    const decided = row.approved + row.rejected;
    row.approvalRate = decided === 0 ? null : row.approved / decided;
  }

  return [...rows.values()].sort((a, b) => b.started - a.started);
}

export function revenueSummary(invoices: Invoice[], now = new Date()): RevenueSummary {
  let invoiced = 0;
  let collected = 0;
  let outstanding = 0;
  let overdue = 0;
  let serviceFeeEarned = 0;
  let passThrough = 0;

  for (const invoice of invoices) {
    if (invoice.status === "void" || invoice.status === "draft") continue;

    invoiced += invoice.total;

    if (invoice.status === "paid") {
      collected += invoice.total;
      // Only collected money counts as earned. Invoiced-but-unpaid is a hope, not revenue.
      for (const line of invoice.lines) {
        if (line.kind === "service") serviceFeeEarned += line.amount;
        else passThrough += line.amount;
      }
    } else {
      outstanding += invoice.total;
      if (new Date(invoice.dueAt) < now) overdue += invoice.total;
    }
  }

  const round = (value: number) => Math.round(value * 100) / 100;

  return {
    invoiced: round(invoiced),
    collected: round(collected),
    outstanding: round(outstanding),
    overdue: round(overdue),
    serviceFeeEarned: round(serviceFeeEarned),
    passThrough: round(passThrough),
  };
}

/**
 * Median days from creation to a decision. Median rather than mean because one stuck file
 * distorts an average badly enough to make it useless for planning.
 */
export function medianTimeToDecision(applications: Application[]): number | null {
  const durations = applications
    .filter((application) => TERMINAL.includes(application.status))
    .map((application) => {
      const start = new Date(application.createdAt).getTime();
      const end = new Date(application.updatedAt).getTime();
      return Math.max(0, Math.round((end - start) / 86_400_000));
    })
    .sort((a, b) => a - b);

  if (durations.length === 0) return null;

  const middle = Math.floor(durations.length / 2);
  return durations.length % 2 === 0
    ? Math.round((durations[middle - 1] + durations[middle]) / 2)
    : durations[middle];
}

/** Applications not yet decided, i.e. still consuming operational capacity. */
export function openApplications(applications: Application[]): Application[] {
  return applications.filter((a) => !TERMINAL.includes(a.status));
}
