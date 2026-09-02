/**
 * The giving categories offered on the homepage.
 *
 * The descriptions state what each category means in Islamic law, which is
 * factual. They deliberately avoid "£30 feeds a family for a week" style
 * impact claims — those need Manarat's real unit costs before they can be
 * printed, and an unverified one on a charity site is a liability.
 */
export interface GivingOption {
  slug: string;
  label: string;
  arabic: string;
  blurb: string;
  amounts: number[];
  /** Nudged as the default when someone opens the form from this card. */
  suggested: number;
  monthly?: boolean;
  /** Single-path SVG icon, 24×24 viewBox. */
  d: string;
}

export const GIVING_OPTIONS: GivingOption[] = [
  {
    slug: "zakat",
    label: "Zakat",
    arabic: "زكاة",
    blurb:
      "The obligatory 2.5% due yearly on wealth held above the nisab. We distribute it only to those in the eight categories named in the Qur'an.",
    amounts: [50, 100, 250, 500],
    suggested: 100,
    d: "M12 3v18M8 6.5h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6",
  },
  {
    slug: "sadaqah-jariyah",
    label: "Sadaqah Jariyah",
    arabic: "صدقة جارية",
    blurb:
      "Ongoing charity. Building the prayer hall and teaching rooms is the classic example — the reward continues for as long as they are used.",
    amounts: [100, 250, 500, 1000],
    suggested: 250,
    d: "M4 20V9.2L12 4l8 5.2V20M4 20h16M9.5 20v-5.5h5V20",
  },
  {
    slug: "sponsor-a-student",
    label: "Sponsor a student",
    arabic: "كفالة طالب",
    blurb:
      "Monthly support towards a place on the Hifz programme. A steady gift is what lets the academy plan a three-year course with confidence.",
    amounts: [15, 25, 50, 100],
    suggested: 25,
    monthly: true,
    d: "M4 18V6.5A2.5 2.5 0 0 1 6.5 4H20v13H6.5A2.5 2.5 0 0 0 4 19.5M8 8.5h7",
  },
  {
    slug: "lillah",
    label: "Lillah",
    arabic: "لله",
    blurb:
      "General charity given for the sake of Allah, with none of Zakat's restrictions — so it can cover the bills, the heating and the day-to-day running of the masjid.",
    amounts: [10, 25, 50, 100],
    suggested: 25,
    d: "M12 20.4S3.6 15.6 3.6 9.9A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8.4 1.9c0 5.7-8.4 10.5-8.4 10.5Z",
  },
];

/** Deep-link into the donate form with the amount and designation prefilled. */
export function donateHref(option: GivingOption, amount?: number) {
  const params = new URLSearchParams({
    cause: option.slug,
    amount: String(amount ?? option.suggested),
  });
  if (option.monthly) params.set("frequency", "monthly");
  return `/donate?${params.toString()}`;
}

export function findGivingOption(slug: string | undefined) {
  return GIVING_OPTIONS.find((o) => o.slug === slug) ?? null;
}
