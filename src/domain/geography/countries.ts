import type { Country } from "./types";

/**
 * Country reference data for the nationalities that actually matter in the UAE market.
 *
 * Indicative for 2026 and must be re-verified against ICP and the relevant foreign
 * ministry before being relied on for a live application. Entry rules in particular change
 * with little notice — the June 2026 expansion added six nationalities on a conditional
 * basis in a single announcement.
 */

const APOSTILLE_STEPS = [
  "Notarise or obtain the document from its issuing authority",
  "Obtain an apostille from the designated competent authority",
  "Attest at the UAE Ministry of Foreign Affairs on arrival",
];

const EMBASSY_STEPS = [
  "Notarise or obtain the document from its issuing authority",
  "Attest at your country's Ministry of Foreign Affairs",
  "Legalise at the UAE embassy or consulate in that country",
  "Attest at the UAE Ministry of Foreign Affairs on arrival",
];

export const countries: Country[] = [
  // ── South Asia — the largest expatriate communities in the UAE ──────────────
  {
    code: "IN",
    name: "India",
    demonym: "Indian",
    region: "South Asia",
    entry: "pre-approval",
    attestation: "apostille",
    attestationSteps: [
      "Obtain the document from the university or issuing authority",
      "State-level authentication (HRD for education, Home Department for personal documents)",
      "Apostille from the Ministry of External Affairs",
      "Attest at the UAE Ministry of Foreign Affairs on arrival",
    ],
    attestationDays: { min: 10, max: 25 },
    notes:
      "India is an apostille member, so the UAE embassy legalisation step is no longer required — but state-level HRD authentication still is, and it is the step that takes the longest. Certificates from universities not recognised by the UAE Ministry of Education will be refused regardless of attestation.",
    policeClearanceCommon: true,
    landingPage: true,
  },
  {
    code: "PK",
    name: "Pakistan",
    demonym: "Pakistani",
    region: "South Asia",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: [
      "Verification by IBCC (education) or the relevant provincial authority",
      "Attestation by the Ministry of Foreign Affairs",
      "Legalisation at the UAE embassy in Islamabad",
      "Attest at the UAE Ministry of Foreign Affairs on arrival",
    ],
    attestationDays: { min: 15, max: 35 },
    notes:
      "Pakistan is not an apostille member, so the full embassy chain applies. IBCC verification of educational certificates is mandatory and is frequently the cause of delay. Employment applications are subject to enhanced screening for some categories.",
    policeClearanceCommon: true,
    landingPage: true,
  },
  {
    code: "BD",
    name: "Bangladesh",
    demonym: "Bangladeshi",
    region: "South Asia",
    entry: "voa-conditional",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 15, max: 35 },
    notes:
      "Visa on arrival only with a valid residence permit or visa from the US, UK, EU, Canada, Australia, New Zealand, Japan, Singapore or South Korea. Otherwise an entry permit must be arranged in advance.",
    policeClearanceCommon: true,
    landingPage: true,
  },
  {
    code: "NP",
    name: "Nepal",
    demonym: "Nepali",
    region: "South Asia",
    entry: "voa-conditional",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 15, max: 30 },
    policeClearanceCommon: true,
  },
  {
    code: "LK",
    name: "Sri Lanka",
    demonym: "Sri Lankan",
    region: "South Asia",
    entry: "voa-conditional",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 12, max: 30 },
    policeClearanceCommon: true,
  },

  // ── Southeast Asia ─────────────────────────────────────────────────────────
  {
    code: "PH",
    name: "Philippines",
    demonym: "Filipino",
    region: "Southeast Asia",
    entry: "voa-conditional",
    attestation: "apostille",
    attestationSteps: [
      "Obtain the document from CHED, PSA or the issuing authority",
      "Apostille from the Department of Foreign Affairs",
      "Attest at the UAE Ministry of Foreign Affairs on arrival",
    ],
    attestationDays: { min: 7, max: 20 },
    notes:
      "The Philippines is an apostille member, so the embassy step is no longer needed. Overseas employment is additionally regulated by the DMW, and an Overseas Employment Certificate is generally required before departure — a step that has nothing to do with the UAE side and is regularly overlooked.",
    policeClearanceCommon: true,
    landingPage: true,
  },
  {
    code: "ID",
    name: "Indonesia",
    demonym: "Indonesian",
    region: "Southeast Asia",
    entry: "voa-conditional",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 10, max: 25 },
    notes:
      "Added to the conditional visa-on-arrival programme in June 2026, subject to holding a residence permit from an approved country.",
  },
  {
    code: "VN",
    name: "Vietnam",
    demonym: "Vietnamese",
    region: "Southeast Asia",
    entry: "voa-conditional",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 12, max: 30 },
    notes: "Added to the conditional visa-on-arrival programme in June 2026.",
  },
  {
    code: "TH",
    name: "Thailand",
    demonym: "Thai",
    region: "Southeast Asia",
    entry: "voa-conditional",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 12, max: 30 },
    notes: "Added to the conditional visa-on-arrival programme in June 2026.",
  },
  {
    code: "MY",
    name: "Malaysia",
    demonym: "Malaysian",
    region: "Southeast Asia",
    entry: "voa-90",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 10, max: 25 },
  },
  {
    code: "SG",
    name: "Singapore",
    demonym: "Singaporean",
    region: "Southeast Asia",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 12 },
  },

  // ── Middle East and North Africa ───────────────────────────────────────────
  {
    code: "EG",
    name: "Egypt",
    demonym: "Egyptian",
    region: "Middle East",
    entry: "voa-conditional",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 12, max: 30 },
    notes:
      "Visa on arrival only with a residence permit from an approved country. Egyptian educational certificates require Ministry of Higher Education authentication before the foreign ministry step.",
    policeClearanceCommon: true,
    landingPage: true,
  },
  {
    code: "JO",
    name: "Jordan",
    demonym: "Jordanian",
    region: "Middle East",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 10, max: 25 },
  },
  {
    code: "LB",
    name: "Lebanon",
    demonym: "Lebanese",
    region: "Middle East",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 12, max: 30 },
  },
  {
    code: "SY",
    name: "Syria",
    demonym: "Syrian",
    region: "Middle East",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 20, max: 60 },
    notes:
      "Applications are subject to enhanced security screening and materially longer processing. Documents issued during periods of conflict may require additional verification.",
    policeClearanceCommon: true,
  },
  {
    code: "IQ",
    name: "Iraq",
    demonym: "Iraqi",
    region: "Middle East",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 20, max: 50 },
    notes:
      "Subject to enhanced screening; allow substantially longer than the standard window.",
    policeClearanceCommon: true,
  },
  {
    code: "MA",
    name: "Morocco",
    demonym: "Moroccan",
    region: "Africa",
    entry: "pre-approval",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 10, max: 25 },
  },
  {
    code: "TN",
    name: "Tunisia",
    demonym: "Tunisian",
    region: "Africa",
    entry: "pre-approval",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 10, max: 25 },
  },
  {
    code: "DZ",
    name: "Algeria",
    demonym: "Algerian",
    region: "Africa",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 15, max: 35 },
  },

  // ── GCC ────────────────────────────────────────────────────────────────────
  {
    code: "SA",
    name: "Saudi Arabia",
    demonym: "Saudi",
    region: "GCC",
    entry: "gcc",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 5, max: 15 },
    notes: "GCC nationals enter on national identity card and do not require a visa.",
  },
  {
    code: "KW",
    name: "Kuwait",
    demonym: "Kuwaiti",
    region: "GCC",
    entry: "gcc",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "OM",
    name: "Oman",
    demonym: "Omani",
    region: "GCC",
    entry: "gcc",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "BH",
    name: "Bahrain",
    demonym: "Bahraini",
    region: "GCC",
    entry: "gcc",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "QA",
    name: "Qatar",
    demonym: "Qatari",
    region: "GCC",
    entry: "gcc",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 5, max: 15 },
  },

  // ── Sub-Saharan Africa ─────────────────────────────────────────────────────
  {
    code: "NG",
    name: "Nigeria",
    demonym: "Nigerian",
    region: "Africa",
    entry: "voa-conditional",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 20, max: 45 },
    notes:
      "Applications receive enhanced document verification. Educational certificates typically require confirmation directly from the awarding institution in addition to the legalisation chain, so start early.",
    policeClearanceCommon: true,
    landingPage: true,
  },
  {
    code: "KE",
    name: "Kenya",
    demonym: "Kenyan",
    region: "Africa",
    entry: "voa-conditional",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 15, max: 35 },
    notes: "Added to the conditional visa-on-arrival programme in June 2026.",
    policeClearanceCommon: true,
  },
  {
    code: "ZA",
    name: "South Africa",
    demonym: "South African",
    region: "Africa",
    entry: "voa-conditional",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 10, max: 25 },
    notes: "Added to the conditional visa-on-arrival programme in June 2026.",
  },
  {
    code: "GH",
    name: "Ghana",
    demonym: "Ghanaian",
    region: "Africa",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 20, max: 40 },
    policeClearanceCommon: true,
  },
  {
    code: "ET",
    name: "Ethiopia",
    demonym: "Ethiopian",
    region: "Africa",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 20, max: 40 },
    policeClearanceCommon: true,
  },
  {
    code: "SD",
    name: "Sudan",
    demonym: "Sudanese",
    region: "Africa",
    entry: "pre-approval",
    attestation: "embassy-legalisation",
    attestationSteps: EMBASSY_STEPS,
    attestationDays: { min: 25, max: 60 },
    notes: "Subject to enhanced screening and extended processing times.",
    policeClearanceCommon: true,
  },

  // ── Europe ─────────────────────────────────────────────────────────────────
  {
    code: "GB",
    name: "United Kingdom",
    demonym: "British",
    region: "Europe",
    entry: "voa-30",
    attestation: "apostille",
    attestationSteps: [
      "Notarise or certify the document (solicitor or issuing body)",
      "Apostille from the FCDO Legalisation Office",
      "Attest at the UAE Ministry of Foreign Affairs on arrival",
    ],
    attestationDays: { min: 5, max: 15 },
    notes:
      "The UK is an apostille member, so the old UAE embassy legalisation step in London is no longer required. Degree certificates usually need certifying by a solicitor or the awarding university before the FCDO will apostille them.",
    landingPage: true,
  },
  {
    code: "RU",
    name: "Russia",
    demonym: "Russian",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 10, max: 25 },
    notes:
      "Documents in Russian require certified legal translation into Arabic or English for UAE use, in addition to the apostille.",
    landingPage: true,
  },
  {
    code: "UA",
    name: "Ukraine",
    demonym: "Ukrainian",
    region: "Europe",
    entry: "voa-conditional",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 12, max: 35 },
  },
  {
    code: "DE",
    name: "Germany",
    demonym: "German",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "FR",
    name: "France",
    demonym: "French",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "IT",
    name: "Italy",
    demonym: "Italian",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "ES",
    name: "Spain",
    demonym: "Spanish",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "NL",
    name: "Netherlands",
    demonym: "Dutch",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "PL",
    name: "Poland",
    demonym: "Polish",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 7, max: 18 },
  },
  {
    code: "RO",
    name: "Romania",
    demonym: "Romanian",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 7, max: 18 },
  },
  {
    code: "TR",
    name: "Türkiye",
    demonym: "Turkish",
    region: "Europe",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 7, max: 20 },
  },

  // ── Central and East Asia ──────────────────────────────────────────────────
  {
    code: "KZ",
    name: "Kazakhstan",
    demonym: "Kazakh",
    region: "Central Asia",
    entry: "voa-conditional",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 10, max: 25 },
  },
  {
    code: "UZ",
    name: "Uzbekistan",
    demonym: "Uzbek",
    region: "Central Asia",
    entry: "voa-conditional",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 12, max: 30 },
  },
  {
    code: "CN",
    name: "China",
    demonym: "Chinese",
    region: "East Asia",
    entry: "voa-30",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 10, max: 25 },
    notes:
      "China acceded to the Apostille Convention in 2023. Documents in Chinese require certified legal translation for UAE use.",
  },
  {
    code: "JP",
    name: "Japan",
    demonym: "Japanese",
    region: "East Asia",
    entry: "voa-30",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },
  {
    code: "KR",
    name: "South Korea",
    demonym: "South Korean",
    region: "East Asia",
    entry: "voa-90",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 5, max: 15 },
  },

  // ── Americas and Oceania ───────────────────────────────────────────────────
  {
    code: "US",
    name: "United States",
    demonym: "American",
    region: "Americas",
    entry: "voa-30",
    attestation: "apostille",
    attestationSteps: [
      "Notarise the document",
      "County clerk certification, where the state requires it",
      "Apostille from the Secretary of State of the issuing state",
      "Attest at the UAE Ministry of Foreign Affairs on arrival",
    ],
    attestationDays: { min: 7, max: 20 },
    notes:
      "Apostilles are issued per state, not federally, so the process depends on where the document was issued. Federal documents go through the US Department of State instead.",
    landingPage: true,
  },
  {
    code: "CA",
    name: "Canada",
    demonym: "Canadian",
    region: "Americas",
    entry: "voa-30",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 10, max: 25 },
    notes:
      "Canada joined the Apostille Convention in 2024. Apostilles are issued provincially for most documents.",
  },
  {
    code: "BR",
    name: "Brazil",
    demonym: "Brazilian",
    region: "Americas",
    entry: "visa-free",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 7, max: 20 },
  },
  {
    code: "AU",
    name: "Australia",
    demonym: "Australian",
    region: "Oceania",
    entry: "voa-30",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 7, max: 18 },
  },
  {
    code: "NZ",
    name: "New Zealand",
    demonym: "New Zealander",
    region: "Oceania",
    entry: "voa-30",
    attestation: "apostille",
    attestationSteps: APOSTILLE_STEPS,
    attestationDays: { min: 7, max: 18 },
  },
];

export function getCountry(code: string): Country | undefined {
  return countries.find((c) => c.code.toUpperCase() === code.toUpperCase());
}

export function countriesWithLandingPages(): Country[] {
  return countries.filter((c) => c.landingPage);
}

/** Plain-language description of a nationality's entry rule. */
export function entryRuleSummary(country: Country): string {
  switch (country.entry) {
    case "gcc":
      return `${country.demonym} nationals enter the UAE on a national identity card and need no visa.`;
    case "visa-free":
      return `${country.demonym} passport holders enter the UAE visa-free.`;
    case "voa-90":
      return `${country.demonym} passport holders receive a free 90-day visa on arrival.`;
    case "voa-30":
      return `${country.demonym} passport holders receive a free 30-day visa on arrival.`;
    case "voa-conditional":
      return `${country.demonym} passport holders can obtain a visa on arrival only if they also hold a valid residence permit or visa from the US, UK, an EU state, Canada, Australia, New Zealand, Japan, Singapore or South Korea. Nationality alone is not enough. Otherwise an entry permit must be arranged before travelling.`;
    case "pre-approval":
      return `${country.demonym} passport holders must obtain an entry permit before travelling to the UAE.`;
  }
}

/** Why the attestation route differs, explained without jargon. */
export function attestationSummary(country: Country): string {
  return country.attestation === "apostille"
    ? `${country.name} is a member of the Hague Apostille Convention, which the UAE joined in 2022. That means documents need an apostille from the designated authority in ${country.name}, then a single attestation at UAE MOFA — the old UAE embassy legalisation step no longer applies. A lot of published guidance still describes the older, longer route.`
    : `${country.name} is not a member of the Hague Apostille Convention, so the full legalisation chain applies: your document must be attested in ${country.name}, then legalised by the UAE embassy or consulate there, then attested at UAE MOFA once it reaches the UAE. Skipping a step invalidates every step after it.`;
}
