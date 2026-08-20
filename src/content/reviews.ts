/**
 * Reviews.
 *
 * Deliberately empty until there are real, independently verifiable ones.
 *
 * Research on this category is unambiguous: self-hosted walls of five-star reviews now
 * read as a scam signal rather than a trust signal, and sophisticated buyers actively
 * discount them. Seeding this file with invented testimonials would be the single fastest
 * way to become indistinguishable from the firms we are positioning against.
 *
 * When real reviews exist they will live on independent platforms, and this page will link
 * to them with the bad ones left in place.
 */

export interface Review {
  id: string;
  /** Where it was published. Must be a platform we do not control. */
  platform: "trustpilot" | "google";
  author: string;
  rating: number;
  date: string;
  body: string;
  serviceSlug?: string;
  /** Our public reply, where one was warranted. */
  response?: string;
}

export const reviews: Review[] = [];

export const reviewPlatforms = [
  {
    name: "Trustpilot",
    url: "https://www.trustpilot.com",
    why: "Independent, hard to game, and displays the negative reviews as prominently as the positive ones.",
  },
  {
    name: "Google Business Profile",
    url: "https://www.google.com/maps",
    why: "Tied to a verified physical business, and the reviews follow you whether you like them or not.",
  },
] as const;

export function averageRating(list: Review[] = reviews): number | null {
  if (list.length === 0) return null;
  return (
    Math.round(
      (list.reduce((sum, review) => sum + review.rating, 0) / list.length) * 10,
    ) / 10
  );
}
