import type { ApplicantProfile } from "./types";

/**
 * The questionnaire.
 *
 * Ten questions is a deliberate ceiling. Every additional question costs completions, and
 * the marginal accuracy after ten is small — the rules engine reports `unknown` rather
 * than guessing for anything it cannot determine, so an unasked question degrades the
 * report gracefully instead of corrupting it.
 *
 * Questions are declared as data so the wizard UI, validation and tests all read from one
 * definition rather than drifting apart.
 */

export type QuestionType = "single" | "number" | "boolean";

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
}

export interface Question {
  id: keyof ApplicantProfile | "hasRecognisedAchievements" | "hasAttestedDegree";
  type: QuestionType;
  title: string;
  hint?: string;
  options?: QuestionOption[];
  /** Only asked when this predicate passes. Keeps the flow short and relevant. */
  when?: (answers: Partial<ApplicantProfile>) => boolean;
  optional?: boolean;
  min?: number;
  max?: number;
  unit?: string;
}

export const questions: Question[] = [
  {
    id: "purpose",
    type: "single",
    title: "What brings you to the UAE?",
    hint: "This decides which routes we assess. You can change it afterwards.",
    options: [
      {
        value: "work",
        label: "A job",
        hint: "Employment visa, sponsored by a company",
      },
      {
        value: "long-term-residence",
        label: "Long-term residence",
        hint: "Golden Visa — 10 years, no sponsor",
      },
      {
        value: "business",
        label: "Starting a business",
        hint: "Company setup with an investor visa",
      },
      {
        value: "freelance",
        label: "Freelancing",
        hint: "Freelance permit or the creators route",
      },
      {
        value: "family",
        label: "Joining or sponsoring family",
        hint: "Spouse, children or parents",
      },
      {
        value: "visit",
        label: "Visiting",
        hint: "Tourism, family visit or business meetings",
      },
    ],
  },
  {
    id: "currentStatus",
    type: "single",
    title: "Where are you right now?",
    options: [
      { value: "outside-uae", label: "Outside the UAE" },
      { value: "visit-visa", label: "In the UAE on a visit visa" },
      { value: "residence-visa", label: "In the UAE with a residence visa" },
      { value: "cancelled-visa", label: "In the UAE, visa recently cancelled" },
    ],
  },
  {
    id: "age",
    type: "number",
    title: "How old are you?",
    min: 0,
    max: 100,
    unit: "years",
  },
  {
    id: "education",
    type: "single",
    title: "What's your highest qualification?",
    options: [
      { value: "doctorate", label: "Doctorate" },
      { value: "masters", label: "Master's degree" },
      { value: "bachelors", label: "Bachelor's degree" },
      { value: "diploma", label: "Diploma" },
      { value: "secondary", label: "Secondary school" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "hasAttestedDegree",
    type: "boolean",
    title: "Is your certificate attested for UAE use?",
    hint: "The full chain: notary, your country's MOFA, the UAE embassy there, then UAE MOFA. If you're not sure, answer no — we'll tell you what it takes.",
    when: (a) =>
      a.education !== undefined &&
      a.education !== "none" &&
      a.education !== "secondary",
  },
  {
    id: "yearsExperience",
    type: "number",
    title: "How many years of professional experience do you have?",
    min: 0,
    max: 60,
    unit: "years",
  },
  {
    id: "monthlySalaryAed",
    type: "number",
    title: "What's your monthly salary, in AED?",
    hint: "Your current or offered salary. Several routes have salary thresholds — leave this blank if it doesn't apply.",
    optional: true,
    min: 0,
    max: 1_000_000,
    unit: "AED / month",
  },
  {
    id: "hasJobOffer",
    type: "boolean",
    title: "Do you have a UAE job offer?",
    when: (a) => a.purpose === "work" || a.purpose === "long-term-residence",
  },
  {
    id: "propertyValueAed",
    type: "number",
    title: "Do you own UAE property? What's it worth?",
    hint: "Leave blank if not. The Golden Visa property route starts at AED 2,000,000.",
    optional: true,
    min: 0,
    max: 500_000_000,
    unit: "AED",
    when: (a) => a.purpose === "long-term-residence" || a.purpose === "business",
  },
  {
    id: "businessValueAed",
    type: "number",
    title: "If you have a business or project, what's it valued at?",
    hint: "Leave blank if not applicable. The entrepreneur route starts at AED 500,000.",
    optional: true,
    min: 0,
    max: 500_000_000,
    unit: "AED",
    when: (a) => a.purpose === "business" || a.purpose === "long-term-residence",
  },
  {
    id: "hasRecognisedAchievements",
    type: "boolean",
    title: "Do you have documented professional recognition?",
    hint: "Awards, patents, publications, media coverage, a verified audience, or an official nomination.",
    when: (a) => a.purpose === "long-term-residence" || a.purpose === "freelance",
  },
  {
    id: "savingsAed",
    type: "number",
    title: "Roughly how much do you have available to invest in setup costs?",
    hint: "Leave blank if unsure. A free zone licence typically starts around AED 14,000.",
    optional: true,
    min: 0,
    max: 100_000_000,
    unit: "AED",
    when: (a) => a.purpose === "business" || a.purpose === "freelance",
  },
];

/** Questions applicable given the answers so far. Drives the progress indicator. */
export function applicableQuestions(answers: Partial<ApplicantProfile>): Question[] {
  return questions.filter((q) => !q.when || q.when(answers));
}
