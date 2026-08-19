import type {
  ApplicantProfile,
  EligibilityReport,
  RouteAssessment,
  RouteDefinition,
  RuleOutcome,
  Verdict,
} from "./types";
import { RULES_VERSION, routes as allRoutes } from "./rules/routes";

/**
 * The eligibility rules engine.
 *
 * Pure. Deterministic. No I/O, no randomness, no clock except the caller-supplied one.
 * Given the same profile it always produces the same report, which is what makes it
 * auditable — and auditability is a regulatory requirement, not a nicety.
 *
 * The engine never says "you will be approved". It says "your profile matches N% of the
 * published criteria for this route, and here is precisely what is missing". Every
 * downstream surface — UI copy, PDF report, LLM narration — inherits that framing.
 */

const VERDICT_RANK: Record<Verdict, number> = {
  strong: 0,
  possible: 1,
  "not-yet": 2,
  ineligible: 3,
};

/** Score at or above which a route with no unmet blockers is called "strong". */
export const STRONG_THRESHOLD = 75;

function evaluateRoute(
  route: RouteDefinition,
  profile: ApplicantProfile,
): RouteAssessment {
  const outcomes: RuleOutcome[] = route.rules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    status: rule.evaluate(profile),
    weight: rule.weight,
    blocker: rule.blocker ?? false,
    fix: rule.fix,
  }));

  const met = outcomes.filter((o) => o.status === "met");
  const unmet = outcomes.filter((o) => o.status === "unmet");
  const unknown = outcomes.filter((o) => o.status === "unknown");
  const blockers = unmet.filter((o) => o.blocker);

  // `unknown` criteria are excluded from scoring rather than guessed at. A criterion we
  // cannot evaluate from the questionnaire is a thing to verify, not a thing to penalise.
  const decidedWeight =
    met.reduce((s, o) => s + o.weight, 0) + unmet.reduce((s, o) => s + o.weight, 0);

  const score =
    decidedWeight === 0
      ? 50 // nothing decidable from the questionnaire alone
      : Math.round((met.reduce((s, o) => s + o.weight, 0) / decidedWeight) * 100);

  let verdict: Verdict;
  if (blockers.length === 0) {
    verdict = score >= STRONG_THRESHOLD ? "strong" : "possible";
  } else if (blockers.length === 1) {
    verdict = "not-yet";
  } else {
    verdict = "ineligible";
  }

  const nextSteps: string[] = [
    ...blockers.map((o) => o.fix).filter((f): f is string => Boolean(f)),
    ...unmet
      .filter((o) => !o.blocker)
      .map((o) => o.fix)
      .filter((f): f is string => Boolean(f)),
    ...unknown.map((o) => o.fix).filter((f): f is string => Boolean(f)),
  ];

  return {
    routeId: route.id,
    name: route.name,
    serviceSlug: route.serviceSlug,
    summary: route.summary,
    score,
    verdict,
    outcomes,
    met,
    unmet,
    blockers,
    // De-duplicate while preserving priority order.
    nextSteps: [...new Set(nextSteps)],
  };
}

export interface AssessOptions {
  /** Injected for deterministic tests. */
  now?: Date;
  /** Assess every route regardless of stated purpose. */
  includeAllRoutes?: boolean;
  routes?: RouteDefinition[];
}

export function assessEligibility(
  profile: ApplicantProfile,
  options: AssessOptions = {},
): EligibilityReport {
  const { now = new Date(), includeAllRoutes = false } = options;
  const source = options.routes ?? allRoutes;

  const relevant = includeAllRoutes
    ? source
    : (() => {
        const matched = source.filter((r) => r.purposes.includes(profile.purpose));
        // Never return an empty report: if the stated purpose matches nothing,
        // fall back to assessing everything rather than showing a dead end.
        return matched.length > 0 ? matched : source;
      })();

  const assessments = relevant
    .map((route) => evaluateRoute(route, profile))
    .sort((a, b) => {
      const rank = VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict];
      return rank !== 0 ? rank : b.score - a.score;
    });

  const recommended = assessments.find((a) => a.blockers.length === 0);

  return {
    generatedAt: now.toISOString(),
    rulesVersion: RULES_VERSION,
    profile,
    routes: assessments,
    recommended,
  };
}

/** Human-readable label for a verdict. Kept in the domain so every surface agrees. */
export function verdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case "strong":
      return "Strong match";
    case "possible":
      return "Possible with preparation";
    case "not-yet":
      return "Not yet — one thing to fix";
    case "ineligible":
      return "Not available on this route";
  }
}

export function verdictDescription(verdict: Verdict): string {
  switch (verdict) {
    case "strong":
      return "Your profile meets the published criteria for this route. This is where we would start.";
    case "possible":
      return "Nothing blocks this route, but strengthening the gaps below will materially improve your file.";
    case "not-yet":
      return "One requirement is not met today. It is fixable — here is exactly what it takes.";
    case "ineligible":
      return "Several core requirements are not met, so another route is likely to serve you better.";
  }
}
