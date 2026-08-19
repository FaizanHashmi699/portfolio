import type { PillarDefinition } from "./types";

export const pillars: PillarDefinition[] = [
  {
    slug: "uae-visas",
    name: "UAE Visas",
    headline: "Every UAE visa, priced to the dirham before you commit.",
    description:
      "Tourist, employment, family sponsorship, Golden Visa, renewals and status change. We run the same checks the ICP's AI screening runs — before you pay a single government fee.",
    icon: "PlaneLanding",
  },
  {
    slug: "business-setup",
    name: "Business Setup",
    headline: "Mainland and free zone company formation without the quote runaround.",
    description:
      "Trade licence, establishment card, investor visas and PRO services. Full cost breakdown published up front, including the fees other consultants leave until the contract.",
    icon: "Building2",
  },
  {
    slug: "outbound-visas",
    name: "Outbound Visas",
    headline: "Schengen, UK and beyond — from UAE residents who get approved.",
    description:
      "Travelling out of the UAE? We prepare applications to the standard the consulate expects, with document validation that catches the errors that cause refusals.",
    icon: "Globe2",
  },
  {
    slug: "attestation-pro",
    name: "Attestation & PRO",
    headline: "Legalisation chains handled end to end.",
    description:
      "Degree and marriage certificate attestation, MOFA legalisation, legal translation and ongoing PRO support. The step most people get wrong, and the most expensive one to redo.",
    icon: "Stamp",
  },
];

export function getPillar(slug: string): PillarDefinition | undefined {
  return pillars.find((p) => p.slug === slug);
}
