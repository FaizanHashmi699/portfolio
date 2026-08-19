import type {
  ApplicantProfile,
  EducationLevel,
  RouteDefinition,
  RuleStatus,
} from "../types";

/**
 * Route definitions — the rule set, expressed as data.
 *
 * Thresholds below are indicative for 2026 and MUST be reconciled against the ICP, GDRFA
 * and MoHRE published criteria before going live. They are intentionally stored as data
 * with an `effectiveFrom` date so that a policy change is a reviewable content edit with
 * an audit trail, rather than a code change requiring a deployment.
 *
 * Nothing here promises an outcome. A high score means "your file matches the published
 * criteria", not "you will be approved".
 */

export const RULES_VERSION = "2026.08.1";

/** Golden Visa salary route threshold (AED / month). */
const GOLDEN_SALARY_THRESHOLD = 30_000;
/** Golden Visa executive route threshold (AED / month). */
const EXECUTIVE_SALARY_THRESHOLD = 50_000;
/** Golden Visa property investment threshold (AED). */
const GOLDEN_PROPERTY_THRESHOLD = 2_000_000;
/** Golden Visa entrepreneur route — technical project value (AED). */
const ENTREPRENEUR_VALUE_THRESHOLD = 500_000;
/** Minimum sponsor salary for family sponsorship (AED / month). */
const FAMILY_SPONSOR_SALARY = 4_000;

const EDUCATION_RANK: Record<EducationLevel, number> = {
  none: 0,
  secondary: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

const atLeast =
  (level: EducationLevel) =>
  (p: ApplicantProfile): RuleStatus =>
    EDUCATION_RANK[p.education] >= EDUCATION_RANK[level] ? "met" : "unmet";

/** Numeric comparison that reports `unknown` rather than guessing when data is absent. */
const numAtLeast =
  (get: (p: ApplicantProfile) => number | undefined, threshold: number) =>
  (p: ApplicantProfile): RuleStatus => {
    const value = get(p);
    if (value === undefined || value === null) return "unknown";
    return value >= threshold ? "met" : "unmet";
  };

const isAdult = {
  id: "age-18",
  label: "You are at least 18 years old",
  weight: 1,
  blocker: true,
  fix: "Applicants under 18 must be sponsored by a parent or guardian.",
  evaluate: (p: ApplicantProfile): RuleStatus => (p.age >= 18 ? "met" : "unmet"),
};

export const routes: RouteDefinition[] = [
  // ───────────────────────────── Golden Visa routes ─────────────────────────────
  {
    id: "golden-salary",
    name: "Golden Visa — Salary Route",
    serviceSlug: "golden-visa",
    summary: "Ten-year residence for high earners on a valid UAE employment contract.",
    effectiveFrom: "2026-01-01",
    purposes: ["long-term-residence", "work"],
    rules: [
      isAdult,
      {
        id: "salary-30k",
        label: `Monthly salary of at least AED ${GOLDEN_SALARY_THRESHOLD.toLocaleString()}`,
        weight: 5,
        blocker: true,
        fix: "This route requires a salary at or above the threshold, evidenced by an attested salary certificate and matching bank credits.",
        evaluate: numAtLeast((p) => p.monthlySalaryAed, GOLDEN_SALARY_THRESHOLD),
      },
      {
        id: "employment-contract",
        label: "You hold a valid UAE employment contract",
        weight: 3,
        blocker: true,
        fix: "Secure a UAE employment offer, or consider the property or entrepreneur routes instead.",
        evaluate: (p) =>
          p.hasJobOffer || p.currentStatus === "residence-visa" ? "met" : "unmet",
      },
      {
        id: "degree",
        label: "Bachelor's degree or higher",
        weight: 2,
        fix: "A degree strengthens this application considerably, though it is not always mandatory on the salary route.",
        evaluate: atLeast("bachelors"),
      },
      {
        id: "attested-degree",
        label: "Your degree is attested for UAE use",
        weight: 2,
        fix: "Complete the attestation chain: notary, home country MOFA, UAE embassy, then UAE MOFA.",
        evaluate: (p) =>
          p.education === "none" || p.education === "secondary"
            ? "unknown"
            : p.hasAttestedDegree
              ? "met"
              : "unmet",
      },
    ],
  },
  {
    id: "golden-property",
    name: "Golden Visa — Property Investment",
    serviceSlug: "golden-visa",
    summary:
      "Ten-year residence for owners of UAE property at or above the investment threshold.",
    effectiveFrom: "2026-01-01",
    purposes: ["long-term-residence", "business"],
    rules: [
      isAdult,
      {
        id: "property-2m",
        label: `UAE property worth at least AED ${GOLDEN_PROPERTY_THRESHOLD.toLocaleString()}`,
        weight: 6,
        blocker: true,
        fix: "The property must be valued at or above the threshold on the DLD title deed. Multiple properties may be combined.",
        evaluate: numAtLeast((p) => p.propertyValueAed, GOLDEN_PROPERTY_THRESHOLD),
      },
      {
        id: "title-deed",
        label: "The property is registered in your name",
        weight: 3,
        blocker: true,
        fix: "A DLD title deed in the applicant's own name is required. Company-held property does not qualify on this route.",
        evaluate: (p) => ((p.propertyValueAed ?? 0) > 0 ? "met" : "unknown"),
      },
      {
        id: "mortgage-ratio",
        label: "Any mortgage is within the permitted ratio",
        weight: 2,
        fix: "If mortgaged, a bank letter confirming the paid-up amount meets the threshold will be required.",
        evaluate: () => "unknown",
      },
    ],
  },
  {
    id: "golden-talent",
    name: "Golden Visa — Specialised Talent",
    serviceSlug: "golden-visa",
    summary:
      "Ten-year residence for scientists, doctors, specialists and senior executives.",
    effectiveFrom: "2026-01-01",
    purposes: ["long-term-residence", "work"],
    rules: [
      isAdult,
      {
        id: "advanced-degree",
        label: "Bachelor's degree or higher in a specialised field",
        weight: 4,
        blocker: true,
        fix: "This route requires a recognised qualification in the field of specialisation.",
        evaluate: atLeast("bachelors"),
      },
      {
        id: "experience-5y",
        label: "At least 5 years of relevant professional experience",
        weight: 3,
        fix: "Provide experience certificates from previous employers covering the full period.",
        evaluate: (p) => (p.yearsExperience >= 5 ? "met" : "unmet"),
      },
      {
        id: "executive-salary",
        label: `Senior role with salary of at least AED ${EXECUTIVE_SALARY_THRESHOLD.toLocaleString()}`,
        weight: 3,
        fix: "The executive sub-route requires this salary level. Scientists and doctors may qualify via accreditation instead.",
        evaluate: numAtLeast((p) => p.monthlySalaryAed, EXECUTIVE_SALARY_THRESHOLD),
      },
      {
        id: "recognition",
        label: "Documented professional recognition",
        weight: 3,
        blocker: true,
        fix: "Awards, publications, patents, accreditation or an official nomination are required to evidence specialised talent.",
        evaluate: (p) => (p.hasRecognisedAchievements ? "met" : "unmet"),
      },
    ],
  },
  {
    id: "golden-creator",
    name: "Golden Visa — Creators & Freelancers",
    serviceSlug: "golden-visa",
    summary:
      "Expanded 2026 route for content creators, influencers, podcasters and visual artists.",
    effectiveFrom: "2026-01-01",
    purposes: ["long-term-residence", "freelance"],
    rules: [
      isAdult,
      {
        id: "creator-portfolio",
        label: "Verifiable body of published creative work",
        weight: 5,
        blocker: true,
        fix: "Assemble a portfolio: published work, verified audience metrics, media coverage or awards.",
        evaluate: (p) => (p.hasRecognisedAchievements ? "met" : "unmet"),
      },
      {
        id: "creator-field",
        label: "You work in a creative or content field",
        weight: 3,
        fix: "This route covers content creation, influencing, podcasting, film and visual arts.",
        evaluate: (p) =>
          p.purpose === "freelance" || p.profession ? "met" : "unknown",
      },
      {
        id: "creator-experience",
        label: "At least 3 years active in the field",
        weight: 2,
        fix: "Demonstrate a sustained track record rather than a recent start.",
        evaluate: (p) => (p.yearsExperience >= 3 ? "met" : "unmet"),
      },
    ],
  },
  {
    id: "golden-entrepreneur",
    name: "Golden Visa — Entrepreneur",
    serviceSlug: "golden-visa",
    summary:
      "Ten-year residence for founders of an approved technical or innovative project.",
    effectiveFrom: "2026-01-01",
    purposes: ["long-term-residence", "business"],
    rules: [
      isAdult,
      {
        id: "business-value",
        label: `Project valued at least AED ${ENTREPRENEUR_VALUE_THRESHOLD.toLocaleString()}`,
        weight: 5,
        blocker: true,
        fix: "An approved auditor's valuation, or acceptance into an accredited UAE incubator, is required.",
        evaluate: numAtLeast((p) => p.businessValueAed, ENTREPRENEUR_VALUE_THRESHOLD),
      },
      {
        id: "approval-letter",
        label: "Endorsement from an approved UAE incubator or auditor",
        weight: 4,
        blocker: true,
        fix: "Obtain an endorsement letter from an accredited business incubator or an approved auditor.",
        evaluate: () => "unknown",
      },
    ],
  },

  // ───────────────────────────── Employment routes ─────────────────────────────
  {
    id: "employment",
    name: "Employment Residence Visa",
    serviceSlug: "employment-visa-mainland",
    summary:
      "Two-year renewable residence sponsored by a UAE employer, mainland or free zone.",
    effectiveFrom: "2026-01-01",
    purposes: ["work"],
    rules: [
      isAdult,
      {
        id: "job-offer",
        label: "You have a UAE job offer",
        weight: 5,
        blocker: true,
        fix: "An employment visa must be sponsored by a licensed UAE employer. Secure an offer first.",
        evaluate: (p) => (p.hasJobOffer ? "met" : "unmet"),
      },
      {
        id: "qualification",
        label: "Qualification matching the declared job title",
        weight: 3,
        fix: "MoHRE skill classification links job titles to qualifications. A mismatch is a common cause of rejection.",
        evaluate: atLeast("secondary"),
      },
      {
        id: "attested-degree-emp",
        label: "Degree attested for UAE use",
        weight: 4,
        blocker: true,
        fix: "Skilled roles require full attestation before the work permit can issue. This is the most common delay in the entire process.",
        evaluate: (p) =>
          EDUCATION_RANK[p.education] < EDUCATION_RANK.diploma
            ? "unknown"
            : p.hasAttestedDegree
              ? "met"
              : "unmet",
      },
      {
        id: "age-limit",
        label: "Within the standard working age range",
        weight: 1,
        fix: "Applicants over 60 face additional fees and require employer justification.",
        evaluate: (p) => (p.age <= 60 ? "met" : "unmet"),
      },
    ],
  },
  {
    id: "freelance-permit",
    name: "Freelance Permit & Visa",
    serviceSlug: "free-zone-company-setup",
    summary:
      "Free-zone freelance permit with residence eligibility, for independent professionals.",
    effectiveFrom: "2026-01-01",
    purposes: ["freelance", "work", "business"],
    rules: [
      isAdult,
      {
        id: "freelance-field",
        label: "Your activity is covered by a freelance permit category",
        weight: 3,
        fix: "Freelance permits cover media, tech, education and consulting activities. Regulated professions need extra approvals.",
        evaluate: (p) => (p.profession ? "met" : "unknown"),
      },
      {
        id: "freelance-portfolio",
        label: "Portfolio or CV evidencing your professional practice",
        weight: 2,
        fix: "Prepare a CV and portfolio; some zones also request client references.",
        evaluate: (p) => (p.yearsExperience >= 1 ? "met" : "unmet"),
      },
      {
        id: "freelance-noc",
        label: "NOC from your current sponsor, if you are a UAE resident",
        weight: 2,
        fix: "Existing residents need a no-objection certificate from their current sponsor.",
        evaluate: (p) => (p.currentStatus === "residence-visa" ? "unknown" : "met"),
      },
    ],
  },

  // ───────────────────────────── Family & visit ─────────────────────────────
  {
    id: "family-sponsorship",
    name: "Family Sponsorship",
    serviceSlug: "family-sponsorship-visa",
    summary:
      "Sponsor a spouse, children or parents as a UAE resident meeting the salary threshold.",
    effectiveFrom: "2026-01-01",
    purposes: ["family"],
    rules: [
      isAdult,
      {
        id: "sponsor-resident",
        label: "You hold a valid UAE residence visa",
        weight: 5,
        blocker: true,
        fix: "You must hold residence yourself before you can sponsor family members.",
        evaluate: (p) => (p.currentStatus === "residence-visa" ? "met" : "unmet"),
      },
      {
        id: "sponsor-salary",
        label: `Monthly salary of at least AED ${FAMILY_SPONSOR_SALARY.toLocaleString()}`,
        weight: 4,
        blocker: true,
        fix: "A lower salary may still qualify if accommodation is provided by your employer.",
        evaluate: numAtLeast((p) => p.monthlySalaryAed, FAMILY_SPONSOR_SALARY),
      },
      {
        id: "accommodation",
        label: "Registered Ejari tenancy with adequate bedrooms",
        weight: 3,
        fix: "A tenancy contract registered with Ejari is mandatory, and bedroom count is assessed against family size.",
        evaluate: () => "unknown",
      },
    ],
  },
  {
    id: "visit",
    name: "Visit / Tourist Visa",
    serviceSlug: "tourist-visa-30-day",
    summary: "Short-stay entry permit for tourism, family visits or business meetings.",
    effectiveFrom: "2026-01-01",
    purposes: ["visit", "family", "business"],
    rules: [
      {
        id: "passport-validity",
        label: "Passport valid at least 6 months beyond entry",
        weight: 5,
        blocker: true,
        fix: "Renew your passport before applying. This is the most common tourist visa rejection reason.",
        evaluate: () => "unknown",
      },
      {
        id: "onward-ticket",
        label: "Confirmed return or onward ticket",
        weight: 2,
        fix: "Book a confirmed return ticket covering your intended stay.",
        evaluate: () => "unknown",
      },
      {
        id: "no-overstay",
        label: "No unresolved UAE overstay or absconding record",
        weight: 3,
        blocker: true,
        fix: "Any outstanding immigration record must be settled before a new visa can issue.",
        evaluate: () => "unknown",
      },
    ],
  },

  // ───────────────────────────── Business setup ─────────────────────────────
  {
    id: "investor",
    name: "Investor / Partner Visa via Company Setup",
    serviceSlug: "free-zone-company-setup",
    summary:
      "Residence through owning a UAE company — free zone or mainland — with visa quota.",
    effectiveFrom: "2026-01-01",
    purposes: ["business", "long-term-residence"],
    rules: [
      isAdult,
      {
        id: "capital",
        label: "Funds available for licence and setup costs",
        weight: 3,
        fix: "Budget from roughly AED 14,000 for a free-zone licence including the establishment card.",
        evaluate: numAtLeast((p) => p.savingsAed, 15_000),
      },
      {
        id: "activity",
        label: "A defined business activity",
        weight: 2,
        fix: "Your activity determines which free zones and licence types are available to you.",
        evaluate: (p) => (p.profession ? "met" : "unknown"),
      },
      {
        id: "investor-noc",
        label: "NOC from current sponsor, if a UAE resident",
        weight: 2,
        fix: "Existing residents need a no-objection certificate from their current sponsor.",
        evaluate: (p) => (p.currentStatus === "residence-visa" ? "unknown" : "met"),
      },
    ],
  },
];

export function getRoute(id: string): RouteDefinition | undefined {
  return routes.find((r) => r.id === id);
}
