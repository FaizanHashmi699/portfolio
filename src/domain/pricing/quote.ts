import { brand } from "@/config/brand";
import type {
  FeeLine,
  ProcessingSpeed,
  Quote,
  ServiceDefinition,
} from "@/domain/catalog/types";

/**
 * Fee computation.
 *
 * This module is the mechanical expression of the company's core promise: a customer can
 * always see exactly who is being paid and how much. There is deliberately no code path
 * that produces a single opaque total — `buildQuote` always returns the itemised lines
 * alongside the total, and the UI is expected to render them.
 *
 * VAT note: UAE VAT at 5% applies to the supply of services (our fee, medical centres,
 * insurers, typing centres). Fees paid to a government entity acting in a sovereign
 * capacity are outside VAT scope, so each line carries its own `vatable` flag rather than
 * VAT being applied to the subtotal.
 */

export interface QuoteOptions {
  speed?: ProcessingSpeed;
  /** Number of applicants. Government and third-party fees scale; service fee may discount. */
  applicants?: number;
  /** Fractional discount on the service fee only, e.g. 0.1 for 10%. Never on pass-through. */
  serviceDiscount?: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Multi-applicant discount on our own fee only. Pass-through costs never scale down. */
export function volumeDiscount(applicants: number): number {
  if (applicants >= 10) return 0.25;
  if (applicants >= 5) return 0.15;
  if (applicants >= 2) return 0.1;
  return 0;
}

export function buildQuote(
  service: ServiceDefinition,
  options: QuoteOptions = {},
): Quote {
  const { speed = "standard", applicants = 1, serviceDiscount } = options;

  if (!Number.isInteger(applicants) || applicants < 1) {
    throw new Error("applicants must be a positive integer");
  }

  const discount = serviceDiscount ?? volumeDiscount(applicants);
  if (discount < 0 || discount >= 1) {
    throw new Error("serviceDiscount must be between 0 and 1");
  }

  const lines: FeeLine[] = [];

  for (const fee of service.fees) {
    const scaled = fee.amount * applicants;
    const amount =
      fee.kind === "service" ? round2(scaled * (1 - discount)) : round2(scaled);

    lines.push({
      ...fee,
      amount,
      label: applicants > 1 ? `${fee.label} × ${applicants}` : fee.label,
    });
  }

  if (speed === "express" && service.expressSurcharge) {
    lines.push({
      kind: "service",
      label:
        applicants > 1 ? `Express processing × ${applicants}` : "Express processing",
      amount: round2(service.expressSurcharge * applicants * (1 - discount)),
      vatable: true,
      note: "Priority handling and expedited appointment slots.",
    });
  }

  const subtotal = round2(lines.reduce((sum, l) => sum + l.amount, 0));
  const vat = round2(
    lines.reduce((sum, l) => sum + (l.vatable ? l.amount * brand.vatRate : 0), 0),
  );
  const serviceFee = round2(
    lines.filter((l) => l.kind === "service").reduce((s, l) => s + l.amount, 0),
  );
  const passThrough = round2(
    lines.filter((l) => l.kind !== "service").reduce((s, l) => s + l.amount, 0),
  );

  return {
    lines,
    subtotal,
    vat,
    total: round2(subtotal + vat),
    serviceFee,
    passThrough,
  };
}

/** Cheapest achievable total, used for "from AED X" labels. Always a real, honest total. */
export function fromPrice(service: ServiceDefinition): number {
  return buildQuote(service).total;
}

/** Expected processing window in working days for the chosen speed. */
export function processingWindow(
  service: ServiceDefinition,
  speed: ProcessingSpeed = "standard",
): { min: number; max: number } {
  if (speed === "express" && service.expressDays) return service.expressDays;
  return service.processingDays;
}

/**
 * Share of the total that Maqam actually earns. Published on quotes.
 * Competitors hide this; showing it is the entire positioning.
 */
export function serviceFeeShare(quote: Quote): number {
  if (quote.total === 0) return 0;
  return round2(quote.serviceFee / quote.total);
}
