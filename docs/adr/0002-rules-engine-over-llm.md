# ADR-0002 — A deterministic rules engine decides eligibility; the LLM only explains

**Status:** Accepted · **Date:** August 2026

## Context

The product's headline capability is telling someone which UAE visa routes they qualify
for. The obvious implementation in 2026 is to give a language model the applicant's profile
and the published criteria and ask it. It would be quick to build and would handle nuance
well.

We are also marketing this as an AI-forward product, so there is commercial pull toward
"the AI decides".

## Decision

**Eligibility is computed by pure, deterministic TypeScript over versioned rule data. The
language model receives the finished verdict and explains it in plain language. It is never
asked whether someone is eligible.**

Rules live in `src/domain/eligibility/rules/routes.ts` as data with `effectiveFrom` dates
and a `RULES_VERSION` stamp carried on every report.

## Why

**Reproducibility is a regulatory requirement here.** If an applicant disputes an
assessment, or a regulator asks how we reached it, "the model said so" is not an answer.
Every report can be regenerated exactly from its profile and rules version.

**Auditability.** A policy change becomes a reviewable data edit with a date and a diff,
not a prompt tweak whose effects nobody can bound.

**Hallucination here has real cost.** An invented threshold or a fabricated route sends
someone toward a non-refundable government fee for an application that cannot succeed. That
is material harm to a person, not a bad customer experience.

**Non-engineers must be able to review the rules.** An operations lead can read the rule
data and check it against the ICP's published criteria. Nobody can review a prompt that
way.

**The product must work without the model.** With no API key, unreachable API, or malformed
response, the report degrades to template text — still correct, still complete. Eligibility
never depends on a third party being up.

## What the model is genuinely good for

Explaining a structured verdict warmly and clearly, in the reader's language, at the
reader's level. That is real value and it is where the model is used. It also summarises
document validation findings.

Guardrails: the system prompt forbids contradicting the verdict and forbids any assurance
of approval, only the engine's _conclusions_ are sent (never the raw profile with salary
data), and the output is scanned for prohibited assurances before display — falling back to
the template if any appear.

## Consequences

**Good.** Reproducible, auditable, reviewable, and functional offline. Legally defensible.
Unit-testable with no mocks — the 29 eligibility tests need no model and no network.

**Bad.** The rules must be written and maintained by hand, and they cannot reason about
genuinely novel circumstances. Unusual cases surface as `unknown` — "needs checking" —
rather than being resolved, and route to a human.

**Accepted.** `unknown` is the honest answer for something a ten-question form cannot
determine, and it is a better one than a confident guess.
