import "server-only";
import { env, features } from "@/server/env";
import { verdictLabel } from "@/domain/eligibility/engine";
import type { EligibilityReport } from "@/domain/eligibility/types";
import type { RiskAssessment } from "@/domain/documents/types";
import { brand } from "@/config/brand";

/**
 * AI narration.
 *
 * The single most important property of this module is what it is NOT allowed to do:
 * it never decides eligibility. The deterministic rules engine produces a structured
 * verdict, and the model is handed that verdict and asked to explain it in plain
 * language. The prompt says so explicitly, and the fallback below produces acceptable
 * output with no model at all — so if the API is down, misconfigured, or the response is
 * malformed, the product degrades to template text rather than to a wrong answer.
 *
 * This is a regulatory position as much as an engineering one. Immigration eligibility
 * must be reproducible and auditable; "the model said so" is not a defensible answer when
 * someone's right to live in a country is at stake.
 */

const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `You are a plain-language explainer for ${brand.name}, a UAE visa and business setup consultancy.

You will be given a structured eligibility assessment that was produced by a deterministic rules engine. Your job is ONLY to explain that assessment in clear, warm, plain English.

Rules you must follow without exception:
- Never contradict, override or re-decide the assessment. The verdict and score are already final.
- Never state or imply that a visa will be approved. Approval is decided solely by UAE authorities.
- Never use the words "guarantee", "guaranteed", "certain" or "assured" about an outcome.
- Never invent criteria, fees, timelines or requirements that are not in the data you are given.
- Address the reader as "you". Be direct and concrete, not salesy.
- If something is blocking them, lead with it and say exactly what fixes it.
- Keep to 120-180 words. No headings, no bullet lists, no markdown.`;

function fallbackNarration(report: EligibilityReport): string {
  const top = report.routes[0];
  if (!top) {
    return "We could not assess any routes from the answers given. Try the check again, or get in touch and we will look at your situation directly.";
  }

  const parts: string[] = [];
  parts.push(
    `Based on your answers, your strongest option looks like ${top.name} — we scored it ${top.score} out of 100 against the published criteria, which we rate as "${verdictLabel(top.verdict).toLowerCase()}".`,
  );

  if (top.blockers.length > 0) {
    parts.push(
      `Before this route is open to you, ${top.blockers.length === 1 ? "one requirement needs" : `${top.blockers.length} requirements need`} attention: ${top.blockers.map((b) => b.label.toLowerCase()).join("; ")}.`,
    );
    if (top.nextSteps[0]) parts.push(top.nextSteps[0]);
  } else if (top.unmet.length > 0) {
    parts.push(
      `Nothing blocks you, though strengthening ${top.unmet.map((u) => u.label.toLowerCase()).join(" and ")} would improve your file.`,
    );
  } else {
    parts.push(
      "You meet every criterion we can assess from your answers, so this is where we would start.",
    );
  }

  parts.push(
    "This is a readiness assessment against published criteria, not an approval — decisions rest with the UAE authorities.",
  );

  return parts.join(" ");
}

export async function narrateEligibility(
  report: EligibilityReport,
): Promise<{ text: string; source: "model" | "fallback" }> {
  if (!features.ai) {
    return { text: fallbackNarration(report), source: "fallback" };
  }

  // Only the engine's conclusions are sent — never the raw profile, which may contain
  // salary and other personal data the explanation does not need.
  const payload = {
    routes: report.routes.slice(0, 3).map((route) => ({
      name: route.name,
      score: route.score,
      verdict: route.verdict,
      met: route.met.map((o) => o.label),
      unmet: route.unmet.map((o) => ({ label: o.label, blocker: o.blocker })),
      needsChecking: route.outcomes
        .filter((o) => o.status === "unknown")
        .map((o) => o.label),
      nextSteps: route.nextSteps,
    })),
  };

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Explain this eligibility assessment to the applicant:\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!text) return { text: fallbackNarration(report), source: "fallback" };

    // Belt and braces: even with the system prompt, never ship a promise of approval.
    if (/\bguarantee|guaranteed|will be approved\b/i.test(text)) {
      console.warn("[ai] narration contained a prohibited assurance; using fallback");
      return { text: fallbackNarration(report), source: "fallback" };
    }

    return { text, source: "model" };
  } catch (error) {
    console.error("[ai] narration failed, using fallback", error);
    return { text: fallbackNarration(report), source: "fallback" };
  }
}

function fallbackDocumentSummary(risk: RiskAssessment): string {
  if (risk.findings.length === 0) {
    return "Every document we can check has passed. Nothing is flagged.";
  }
  const blockers = risk.blockers.length;
  const warnings = risk.warnings.length;
  const parts = [
    blockers > 0
      ? `${blockers} issue${blockers === 1 ? "" : "s"} must be fixed before this can be submitted.`
      : "Nothing is blocking submission.",
  ];
  if (warnings > 0) {
    parts.push(
      `${warnings} further point${warnings === 1 ? "" : "s"} would be worth tidying up.`,
    );
  }
  parts.push("Each item below says exactly what to do.");
  return parts.join(" ");
}

export async function summariseDocumentRisk(
  risk: RiskAssessment,
): Promise<{ text: string; source: "model" | "fallback" }> {
  if (!features.ai) {
    return { text: fallbackDocumentSummary(risk), source: "fallback" };
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: `${SYSTEM_PROMPT}\n\nHere you are explaining a document validation result rather than an eligibility assessment. Keep to 60-100 words.`,
      messages: [
        {
          role: "user",
          content: `Summarise this document check for the applicant:\n\n${JSON.stringify(
            {
              score: risk.score,
              band: risk.band,
              readyToSubmit: risk.readyToSubmit,
              findings: risk.findings.map((f) => ({
                severity: f.severity,
                message: f.message,
                fix: f.fix,
              })),
            },
            null,
            2,
          )}`,
        },
      ],
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    return text
      ? { text, source: "model" }
      : { text: fallbackDocumentSummary(risk), source: "fallback" };
  } catch (error) {
    console.error("[ai] document summary failed, using fallback", error);
    return { text: fallbackDocumentSummary(risk), source: "fallback" };
  }
}

export const __testing = { fallbackNarration, fallbackDocumentSummary };
