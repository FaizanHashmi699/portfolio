/**
 * Catalog domain types.
 *
 * Pure data shapes. No I/O, no framework imports — this file must stay importable
 * from tests, Server Components and Client Components alike.
 */

export type ServicePillar =
  "uae-visas" | "business-setup" | "outbound-visas" | "attestation-pro";

/**
 * A single line in a quote. Every price the customer sees is built from these,
 * never from an opaque total. This is the structural expression of our core
 * differentiator: the customer can always see who is being paid, and why.
 */
export type FeeKind =
  /** Paid to a UAE government entity (ICP, GDRFA, MoHRE, free zone authority). */
  | "government"
  /** Paid to a mandated third party (medical centre, insurer, typing centre, courier). */
  | "third-party"
  /** Maqam's own professional fee. The only line we actually earn. */
  | "service";

export interface FeeLine {
  kind: FeeKind;
  label: string;
  /** Amount in AED, excluding VAT. */
  amount: number;
  /** Whether UAE VAT (5%) applies. Government fees are generally outside scope. */
  vatable: boolean;
  /** Shown as a tooltip so the customer can verify the charge independently. */
  note?: string;
  /** True when the amount varies and this is a representative figure. */
  estimated?: boolean;
}

export interface Quote {
  lines: FeeLine[];
  subtotal: number;
  vat: number;
  total: number;
  /** Sum of the `service` lines — what Maqam earns. Deliberately shown to the customer. */
  serviceFee: number;
  /** Sum of `government` + `third-party` — money that passes straight through. */
  passThrough: number;
}

export type ProcessingSpeed = "standard" | "express";

export interface ServiceStage {
  title: string;
  description: string;
  /** Typical duration of this stage in working days. */
  days: number;
  /** Who must act for this stage to advance. Drives the portal's "waiting on you" state. */
  actor: "customer" | "maqam" | "government";
}

export interface DocumentRequirement {
  id: string;
  label: string;
  description: string;
  /** Some documents are only needed in certain circumstances. */
  conditional?: string;
  /** Must be attested through the full legalisation chain. */
  attestationRequired?: boolean;
}

export interface ServiceDefinition {
  slug: string;
  pillar: ServicePillar;
  name: string;
  /** One-line promise, used on cards and in search results. */
  summary: string;
  /** Longer explanation for the service detail page. */
  description: string;
  /** Who this is for — helps the visitor self-select without contacting us. */
  audience: string;
  fees: FeeLine[];
  /** Additional service fee for expedited handling, excluding VAT. */
  expressSurcharge?: number;
  processingDays: { min: number; max: number };
  expressDays?: { min: number; max: number };
  stages: ServiceStage[];
  documents: DocumentRequirement[];
  /** Common reasons this specific application gets rejected. Displayed publicly. */
  commonRejectionReasons: string[];
  /** Related service slugs for internal linking (SEO + discovery). */
  related: string[];
  popular?: boolean;
}

export interface PillarDefinition {
  slug: ServicePillar;
  name: string;
  headline: string;
  description: string;
  /** Lucide icon name, resolved in the UI layer. */
  icon: string;
}
