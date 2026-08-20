/**
 * Country and jurisdiction reference data.
 *
 * Pure data. No I/O. This module underpins three things at once: the eligibility engine's
 * nationality-sensitive rules, the document checklists we generate, and the nationality
 * landing pages that are our largest organic-search opportunity.
 */

export type EntryRule =
  /** GCC national — enters on national ID, no visa at all. */
  | "gcc"
  /** Visa-free entry by treaty. */
  | "visa-free"
  /** Free visa on arrival, 90 days. */
  | "voa-90"
  /** Free visa on arrival, 30 days. */
  | "voa-30"
  /**
   * Visa on arrival, but only when the traveller also holds a residence permit or visa
   * from an approved country (US, UK, EU, Canada, Australia, NZ, Japan, Singapore, South
   * Korea). Nationality alone is not enough — a distinction that catches a lot of people out.
   */
  | "voa-conditional"
  /** Must obtain an entry permit before travelling. */
  | "pre-approval";

/**
 * How documents from this country are legalised for UAE use.
 *
 * The UAE acceded to the Hague Apostille Convention in 2022, which replaced the old
 * four-step embassy chain with a two-step process for member states. A great deal of
 * published guidance — including our competitors' — still describes only the old route,
 * which sends applicants from apostille countries through steps they do not need and
 * cannot always complete.
 */
export type AttestationRoute = "apostille" | "embassy-legalisation";

export interface Country {
  /** ISO 3166-1 alpha-2. */
  code: string;
  name: string;
  /** "Indian", "Pakistani" — used in copy and page titles. */
  demonym: string;
  region:
    | "South Asia"
    | "Southeast Asia"
    | "East Asia"
    | "Middle East"
    | "GCC"
    | "Africa"
    | "Europe"
    | "Americas"
    | "Oceania"
    | "Central Asia";
  entry: EntryRule;
  attestation: AttestationRoute;
  /** Ordered legalisation steps in the country of origin, before UAE MOFA. */
  attestationSteps: string[];
  /** Typical elapsed working days for the origin-country steps. */
  attestationDays: { min: number; max: number };
  /** Anything genuinely specific to this nationality that affects an application. */
  notes?: string;
  /** A police clearance certificate is commonly requested for employment. */
  policeClearanceCommon?: boolean;
  /**
   * Large enough UAE community, or high enough search volume, to justify a dedicated
   * landing page.
   */
  landingPage?: boolean;
}

export type OfficeRequirement = "none" | "flexi-desk" | "physical";

export interface FreeZone {
  slug: string;
  name: string;
  /** Common abbreviation, if any. */
  shortName?: string;
  emirate: string;
  /** Indicative annual licence cost in AED, excluding visas. */
  licenceFromAed: number;
  establishmentCardAed: number;
  /** Visa allocation included in the entry package. */
  visaQuotaBase: number;
  officeRequirement: OfficeRequirement;
  setupDays: { min: number; max: number };
  /** What this zone is genuinely good at. */
  strengths: string[];
  /** Where it is a poor fit. Published deliberately. */
  limitations: string[];
  activityFocus: string[];
  bestFor: string;
  tier: "budget" | "mid" | "premium";
}
