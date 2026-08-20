import type { FreeZone } from "./types";

/**
 * UAE free zone reference data.
 *
 * Free zones pay referral commissions to consultants, which is precisely why almost no
 * published comparison is neutral. Every zone below therefore carries a `limitations`
 * list alongside its strengths — including the zones it would be most profitable for us
 * to recommend. If we ever stop publishing the limitations, we have become the thing we
 * set out to replace.
 *
 * Figures are indicative 2026 entry-level annual costs in AED and must be confirmed with
 * the zone before quoting.
 */

export const freeZones: FreeZone[] = [
  {
    slug: "ifza",
    name: "International Free Zone Authority",
    shortName: "IFZA",
    emirate: "Dubai",
    licenceFromAed: 12500,
    establishmentCardAed: 1200,
    visaQuotaBase: 1,
    officeRequirement: "flexi-desk",
    setupDays: { min: 3, max: 7 },
    strengths: [
      "The cheapest credible route to a genuine Dubai licence",
      "Very broad activity list, including most consulting and services",
      "Fast incorporation, often within a week",
      "No physical office required at entry level",
    ],
    limitations: [
      "Not a prestige address — matters for some client-facing businesses",
      "Banking can be slower than with DMCC or DIFC entities",
      "Visa quota is tied to your package; scaling headcount costs more than the headline",
    ],
    activityFocus: ["Consulting", "Services", "Trading", "E-commerce", "Marketing"],
    bestFor:
      "Consultants and service businesses who want a Dubai licence at the lowest credible cost",
    tier: "mid",
  },
  {
    slug: "meydan",
    name: "Meydan Free Zone",
    emirate: "Dubai",
    licenceFromAed: 12900,
    establishmentCardAed: 1200,
    visaQuotaBase: 1,
    officeRequirement: "none",
    setupDays: { min: 3, max: 7 },
    strengths: [
      "Dubai licence with no office requirement at all at entry level",
      "Strong e-commerce and digital activity coverage",
      "Quick, largely online incorporation",
      "Good value where a physical presence is genuinely unnecessary",
    ],
    limitations: [
      "Fewer activities than DMCC for regulated or specialised sectors",
      "Some banks scrutinise no-office entities more closely at account opening",
    ],
    activityFocus: ["E-commerce", "Consulting", "Media", "Technology", "Services"],
    bestFor:
      "Online and remote-first businesses that need a Dubai licence but no premises",
    tier: "mid",
  },
  {
    slug: "dmcc",
    name: "Dubai Multi Commodities Centre",
    shortName: "DMCC",
    emirate: "Dubai",
    licenceFromAed: 25000,
    establishmentCardAed: 1800,
    visaQuotaBase: 2,
    officeRequirement: "flexi-desk",
    setupDays: { min: 7, max: 20 },
    strengths: [
      "The most respected free zone address in Dubai, and it opens doors",
      "Very extensive activity list, including regulated commodity trading",
      "Strong banking relationships — account opening is materially easier",
      "Excellent JLT location with genuine business community",
    ],
    limitations: [
      "Several times the cost of IFZA or Meydan for a comparable service licence",
      "Slower incorporation, with more documentation required",
      "Overkill for a solo consultant — you pay for infrastructure you won't use",
    ],
    activityFocus: [
      "Commodities",
      "Trading",
      "Financial services",
      "Professional services",
      "Crypto",
    ],
    bestFor:
      "Trading and commodities businesses, and anyone whose clients will check the address",
    tier: "premium",
  },
  {
    slug: "difc",
    name: "Dubai International Financial Centre",
    shortName: "DIFC",
    emirate: "Dubai",
    licenceFromAed: 45000,
    establishmentCardAed: 2500,
    visaQuotaBase: 2,
    officeRequirement: "physical",
    setupDays: { min: 20, max: 60 },
    strengths: [
      "Independent common-law jurisdiction with its own courts",
      "The only credible base for regulated financial services in Dubai",
      "Highest international credibility for funds, fintech and asset management",
    ],
    limitations: [
      "Expensive, and physical office space is mandatory",
      "Regulated activities require DFSA authorisation, which is a project in itself",
      "Wrong choice for anything outside financial and professional services",
    ],
    activityFocus: [
      "Financial services",
      "Fintech",
      "Asset management",
      "Legal",
      "Insurance",
    ],
    bestFor:
      "Regulated financial services and funds that need a common-law jurisdiction",
    tier: "premium",
  },
  {
    slug: "jafza",
    name: "Jebel Ali Free Zone",
    shortName: "JAFZA",
    emirate: "Dubai",
    licenceFromAed: 25000,
    establishmentCardAed: 1800,
    visaQuotaBase: 3,
    officeRequirement: "physical",
    setupDays: { min: 15, max: 40 },
    strengths: [
      "Direct access to Jebel Ali Port — decisive for physical import and export",
      "Warehousing and light industrial space at scale",
      "Generous visa quotas tied to facility size",
    ],
    limitations: [
      "Physical facility required; not viable for service businesses",
      "Location is far from central Dubai for anyone office-based",
      "Setup is slower and more paperwork-heavy",
    ],
    activityFocus: ["Logistics", "Manufacturing", "Warehousing", "Import and export"],
    bestFor: "Businesses moving physical goods through Jebel Ali Port",
    tier: "premium",
  },
  {
    slug: "dafza",
    name: "Dubai Airport Free Zone",
    shortName: "DAFZA",
    emirate: "Dubai",
    licenceFromAed: 28000,
    establishmentCardAed: 1800,
    visaQuotaBase: 2,
    officeRequirement: "physical",
    setupDays: { min: 10, max: 30 },
    strengths: [
      "Adjacent to Dubai International Airport — ideal for air cargo and high-value goods",
      "Strong presence of aviation, electronics and pharmaceutical companies",
      "Premium facilities and reputation",
    ],
    limitations: [
      "Among the more expensive zones, with office space mandatory",
      "Only worth the premium if airport proximity genuinely matters to you",
    ],
    activityFocus: ["Aviation", "Electronics", "Pharmaceuticals", "High-value trading"],
    bestFor: "Air-freight-dependent trading in high-value or time-sensitive goods",
    tier: "premium",
  },
  {
    slug: "dubai-internet-city",
    name: "Dubai Internet City",
    shortName: "DIC",
    emirate: "Dubai",
    licenceFromAed: 22000,
    establishmentCardAed: 1800,
    visaQuotaBase: 2,
    officeRequirement: "flexi-desk",
    setupDays: { min: 10, max: 25 },
    strengths: [
      "The centre of gravity for Dubai's tech sector — genuine ecosystem value",
      "Neighbours include the regional offices of most major technology companies",
      "Well-regarded by investors and technical hires",
    ],
    limitations: [
      "Activity list is tightly scoped to technology; not a general-purpose zone",
      "More expensive than IFZA or Meydan for what is often the same licence in practice",
    ],
    activityFocus: ["Software", "IT services", "Technology", "Internet services"],
    bestFor: "Technology companies that will benefit from being inside the ecosystem",
    tier: "premium",
  },
  {
    slug: "dubai-media-city",
    name: "Dubai Media City",
    shortName: "DMC",
    emirate: "Dubai",
    licenceFromAed: 22000,
    establishmentCardAed: 1800,
    visaQuotaBase: 2,
    officeRequirement: "flexi-desk",
    setupDays: { min: 10, max: 25 },
    strengths: [
      "The established base for regional media, advertising and production",
      "Strong industry clustering and networking",
      "Recognised licence for media-sector client contracts",
    ],
    limitations: [
      "Considerably more expensive than SHAMS for a comparable media licence",
      "Only worth it if the address and proximity carry weight with your clients",
    ],
    activityFocus: ["Media", "Advertising", "Production", "Publishing", "Broadcasting"],
    bestFor: "Media and advertising businesses serving regional clients",
    tier: "premium",
  },
  {
    slug: "shams",
    name: "Sharjah Media City",
    shortName: "SHAMS",
    emirate: "Sharjah",
    licenceFromAed: 5750,
    establishmentCardAed: 900,
    visaQuotaBase: 0,
    officeRequirement: "none",
    setupDays: { min: 2, max: 5 },
    strengths: [
      "The cheapest credible licence in the UAE for creative and media work",
      "Zero-visa packages available for those who don't need residence",
      "Very fast, largely online setup",
      "Popular and well-understood freelance permit route",
    ],
    limitations: [
      "Sharjah, not Dubai — some clients and banks treat it differently",
      "Base package includes no visa allocation; adding visas changes the economics",
      "Narrower activity list than a general-purpose Dubai zone",
    ],
    activityFocus: ["Media", "Creative", "Consulting", "Freelance", "Technology"],
    bestFor: "Freelancers and creatives who want the lowest possible entry cost",
    tier: "budget",
  },
  {
    slug: "rakez",
    name: "Ras Al Khaimah Economic Zone",
    shortName: "RAKEZ",
    emirate: "Ras Al Khaimah",
    licenceFromAed: 6000,
    establishmentCardAed: 1000,
    visaQuotaBase: 1,
    officeRequirement: "flexi-desk",
    setupDays: { min: 3, max: 8 },
    strengths: [
      "Excellent value across both service and industrial activities",
      "Genuine warehousing and light-industrial options at low cost",
      "Fast visa processing, typically around five working days",
      "Very broad activity list for the price",
    ],
    limitations: [
      "Ras Al Khaimah location is impractical if you need to be in Dubai daily",
      "Less recognised internationally than DMCC or DIFC",
    ],
    activityFocus: ["Trading", "Manufacturing", "Consulting", "Services", "E-commerce"],
    bestFor: "Cost-conscious businesses, especially any needing light industrial space",
    tier: "budget",
  },
  {
    slug: "ajman-free-zone",
    name: "Ajman Free Zone",
    shortName: "AFZ",
    emirate: "Ajman",
    licenceFromAed: 5500,
    establishmentCardAed: 900,
    visaQuotaBase: 1,
    officeRequirement: "flexi-desk",
    setupDays: { min: 3, max: 7 },
    strengths: [
      "Among the lowest total costs in the UAE",
      "Straightforward, quick incorporation",
      "Reasonable activity coverage for small trading and service businesses",
    ],
    limitations: [
      "Least recognised of the major zones; banking can be harder",
      "Distance from Dubai is significant for client-facing work",
    ],
    activityFocus: ["Trading", "Services", "Light manufacturing", "E-commerce"],
    bestFor:
      "Very cost-sensitive setups where address and location genuinely don't matter",
    tier: "budget",
  },
  {
    slug: "spc-free-zone",
    name: "Sharjah Publishing City",
    shortName: "SPC",
    emirate: "Sharjah",
    licenceFromAed: 6500,
    establishmentCardAed: 900,
    visaQuotaBase: 1,
    officeRequirement: "none",
    setupDays: { min: 2, max: 5 },
    strengths: [
      "Very fast setup, frequently within 48 hours",
      "Unusually broad activity list for a budget zone — over a thousand activities",
      "Dual-licence options covering both free zone and mainland activity",
    ],
    limitations: [
      "Sharjah address carries less weight with some clients",
      "Newer zone with a shorter track record than SHAMS or RAKEZ",
    ],
    activityFocus: ["Publishing", "Trading", "Consulting", "E-commerce", "Services"],
    bestFor: "Founders who need a licence issued quickly at low cost",
    tier: "budget",
  },
];

export function getFreeZone(slug: string): FreeZone | undefined {
  return freeZones.find((zone) => zone.slug === slug);
}

export function freeZonesByTier(tier: FreeZone["tier"]): FreeZone[] {
  return freeZones.filter((zone) => zone.tier === tier);
}

/** Cheapest realistic first-year cost: licence plus establishment card. */
export function freeZoneEntryCost(zone: FreeZone): number {
  return zone.licenceFromAed + zone.establishmentCardAed;
}

/**
 * Rank zones against what the founder actually needs, rather than what pays us most.
 * Deliberately ignores commission entirely — there is no field for it in the data.
 */
export function recommendFreeZones(criteria: {
  budgetAed?: number;
  needsDubaiAddress?: boolean;
  needsPhysicalSpace?: boolean;
  visasNeeded?: number;
}): FreeZone[] {
  const {
    budgetAed,
    needsDubaiAddress,
    needsPhysicalSpace,
    visasNeeded = 0,
  } = criteria;

  return freeZones
    .filter((zone) => {
      if (budgetAed !== undefined && freeZoneEntryCost(zone) > budgetAed) return false;
      if (needsDubaiAddress && zone.emirate !== "Dubai") return false;
      if (needsPhysicalSpace && zone.officeRequirement === "none") return false;
      if (visasNeeded > 0 && zone.visaQuotaBase === 0) return false;
      return true;
    })
    .sort((a, b) => freeZoneEntryCost(a) - freeZoneEntryCost(b));
}
