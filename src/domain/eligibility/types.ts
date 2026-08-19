/**
 * Eligibility domain types.
 *
 * Deliberately free of I/O and framework imports. The rules engine is the *only* thing
 * permitted to decide whether someone is eligible for a route; the LLM narrator downstream
 * may explain this output but must never contradict or replace it.
 */

export type Purpose =
  | "visit"
  | "work"
  | "family"
  | "long-term-residence"
  | "business"
  | "freelance";

export type EducationLevel =
  | "none"
  | "secondary"
  | "diploma"
  | "bachelors"
  | "masters"
  | "doctorate";

export type CurrentStatus =
  | "outside-uae"
  | "visit-visa"
  | "residence-visa"
  | "cancelled-visa";

export interface ApplicantProfile {
  /** ISO 3166-1 alpha-2 country code. */
  nationality: string;
  age: number;
  purpose: Purpose;
  currentStatus: CurrentStatus;
  education: EducationLevel;
  yearsExperience: number;
  monthlySalaryAed?: number;
  propertyValueAed?: number;
  savingsAed?: number;
  businessValueAed?: number;
  hasJobOffer?: boolean;
  /** Awards, publications, verified audience, or an official nomination. */
  hasRecognisedAchievements?: boolean;
  /** Degree already legalised through the full chain for UAE use. */
  hasAttestedDegree?: boolean;
  profession?: string;
  dependants?: number;
}

export type RuleStatus = "met" | "unmet" | "unknown";

export interface RuleOutcome {
  id: string;
  label: string;
  status: RuleStatus;
  weight: number;
  /** A blocker that is unmet makes the route unavailable regardless of score. */
  blocker: boolean;
  /** Concrete, actionable remedy shown to the applicant when unmet. */
  fix?: string;
}

export interface Rule {
  id: string;
  label: string;
  weight: number;
  blocker?: boolean;
  fix?: string;
  evaluate: (profile: ApplicantProfile) => RuleStatus;
}

export type Verdict =
  /** All blockers cleared and a high weighted score. Apply now. */
  | "strong"
  /** All blockers cleared but gaps remain. Worth applying with preparation. */
  | "possible"
  /** A blocker is unmet but is fixable (attestation, a document, a threshold). */
  | "not-yet"
  /** A blocker is unmet and not realistically fixable on this route today. */
  | "ineligible";

export interface RouteDefinition {
  id: string;
  name: string;
  /** The catalog service this route converts into. */
  serviceSlug: string;
  summary: string;
  /** Date this rule set took effect. Rules are data, so policy changes are auditable. */
  effectiveFrom: string;
  purposes: Purpose[];
  rules: Rule[];
}

export interface RouteAssessment {
  routeId: string;
  name: string;
  serviceSlug: string;
  summary: string;
  /** 0–100, weighted proportion of satisfied criteria. */
  score: number;
  verdict: Verdict;
  outcomes: RuleOutcome[];
  met: RuleOutcome[];
  unmet: RuleOutcome[];
  blockers: RuleOutcome[];
  nextSteps: string[];
}

export interface EligibilityReport {
  generatedAt: string;
  /** Version of the rule set used, for reproducibility and audit. */
  rulesVersion: string;
  profile: ApplicantProfile;
  routes: RouteAssessment[];
  /** Highest-scoring route with no unmet blockers, if any. */
  recommended?: RouteAssessment;
}
