import type { DocumentRequirement } from "@/domain/catalog/types";
import type { DocumentRecord, Finding, RiskAssessment, Severity } from "./types";

/**
 * Document validation and rejection-risk scoring.
 *
 * These checks are modelled on the criteria the UAE's own ICP/MoHRE AI screening applies to
 * work-permit and residence applications since May 2026 — passport validity, photo
 * specification, name consistency and document authenticity. The commercial point is
 * ordering: we run them at upload time, before the applicant has paid any government fee.
 *
 * Pure functions. No I/O, no model calls. Deterministic and fully unit-testable.
 */

/** Months of passport validity the UAE requires beyond the intended entry date. */
export const PASSPORT_VALIDITY_MONTHS = 6;
/** Maximum age of a bank statement, in days, before it is considered stale. */
export const BANK_STATEMENT_MAX_AGE_DAYS = 90;
/** Legalisation steps that constitute a complete attestation chain for UAE use. */
export const ATTESTATION_CHAIN = [
  "notary",
  "home-mofa",
  "uae-embassy",
  "uae-mofa",
] as const;

const SEVERITY_WEIGHT: Record<Severity, number> = {
  blocker: 34,
  warning: 8,
  info: 0,
};

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    (to.getDate() >= from.getDate() ? 0 : -1)
  );
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}

/** Compare names ignoring case, punctuation, ordering and extra whitespace. */
export function namesMatch(a?: string, b?: string): boolean {
  if (!a || !b) return true; // cannot disprove a match with missing data
  const normalise = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .sort()
      .join(" ");
  return normalise(a) === normalise(b);
}

export interface ValidationContext {
  /** Requirements from the chosen service. Drives the `missing` list. */
  requirements?: DocumentRequirement[];
  /** Intended date of entry or submission. Passport validity is measured from here. */
  referenceDate?: Date;
  /** Evaluation clock, injected for deterministic tests. */
  now?: Date;
}

export function validateDocuments(
  documents: DocumentRecord[],
  context: ValidationContext = {},
): RiskAssessment {
  const now = context.now ?? new Date();
  const reference = context.referenceDate ?? now;
  const findings: Finding[] = [];

  const add = (f: Finding) => findings.push(f);

  // ── Passports ──────────────────────────────────────────────────────────────
  // A file may legitimately carry several passports (family applications), so every
  // one is checked rather than only the first match.
  const passports = documents.filter((d) => d.kind === "passport");
  const passport = passports[0];
  for (const passport of passports) {
    if (!passport.fields?.expiryDate) continue;
    const expiry = new Date(passport.fields.expiryDate);
    const months = monthsBetween(reference, expiry);
    if (months < 0) {
      add({
        documentId: passport.id,
        kind: "passport",
        severity: "blocker",
        code: "PASSPORT_EXPIRED",
        message: "Your passport has already expired.",
        fix: "Renew your passport before applying. No UAE visa can issue against an expired passport.",
      });
    } else if (months < PASSPORT_VALIDITY_MONTHS) {
      add({
        documentId: passport.id,
        kind: "passport",
        severity: "blocker",
        code: "PASSPORT_VALIDITY_SHORT",
        message: `Your passport has ${months} month${months === 1 ? "" : "s"} validity remaining — the UAE requires at least ${PASSPORT_VALIDITY_MONTHS}.`,
        fix: `Renew your passport so that at least ${PASSPORT_VALIDITY_MONTHS} months remain beyond your intended entry date.`,
      });
    }
  }
  for (const passport of passports) {
    const blankPages = passport.fields?.blankPages;
    if (blankPages === undefined || blankPages >= 2) continue;
    add({
      documentId: passport.id,
      kind: "passport",
      severity: "warning",
      code: "PASSPORT_BLANK_PAGES",
      message: "Fewer than two blank facing pages remain in your passport.",
      fix: "Some authorities require two facing blank pages for stamping. Consider renewing early.",
    });
  }

  // ── Photographs ────────────────────────────────────────────────────────────
  for (const photo of documents.filter((d) => d.kind === "photo")) {
    if (!photo.fields) continue;
    if (photo.fields.backgroundIsWhite === false) {
      add({
        documentId: photo.id,
        kind: "photo",
        severity: "blocker",
        code: "PHOTO_BACKGROUND",
        message: "Your photograph does not have a plain white background.",
        fix: "Retake the photo against a plain white background. This is one of the most frequent causes of rejection.",
      });
    }
    const ratio = photo.fields.faceRatio;
    if (ratio !== undefined && (ratio < 0.7 || ratio > 0.8)) {
      add({
        documentId: photo.id,
        kind: "photo",
        severity: "blocker",
        code: "PHOTO_FACE_RATIO",
        message: `Your face occupies ${Math.round(ratio * 100)}% of the frame — the specification is 70–80%.`,
        fix: "Recrop or retake the photograph so your face fills 70–80% of the frame height.",
      });
    }
  }

  // ── Name consistency across the whole file ─────────────────────────────────
  const passportName = passport?.fields?.fullName;
  if (passportName) {
    for (const doc of documents) {
      if (doc.id === passport?.id) continue;
      const name = doc.fields?.fullName;
      if (name && !namesMatch(passportName, name)) {
        add({
          documentId: doc.id,
          kind: doc.kind,
          severity: "blocker",
          code: "NAME_MISMATCH",
          message: `The name on this document ("${name}") does not match your passport ("${passportName}").`,
          fix: "Names must match exactly across every document. Obtain a corrected document or an official affidavit explaining the variation.",
        });
      }
    }
  }

  // ── Attestation chain ──────────────────────────────────────────────────────
  const attestable = documents.filter(
    (d) =>
      d.kind === "degree" ||
      d.kind === "marriage-certificate" ||
      d.kind === "birth-certificate",
  );
  for (const doc of attestable) {
    const stamps = doc.fields?.attestationStamps;
    if (stamps === undefined) continue;
    const missingSteps = ATTESTATION_CHAIN.filter((s) => !stamps.includes(s));
    if (missingSteps.length > 0) {
      add({
        documentId: doc.id,
        kind: doc.kind,
        severity: "blocker",
        code: "ATTESTATION_INCOMPLETE",
        message: `The attestation chain is incomplete — missing: ${missingSteps.join(", ")}.`,
        fix: "Legalisation must be completed in order: notary, home country MOFA, UAE embassy, then UAE MOFA. Skipping a step invalidates the ones after it.",
      });
    }
  }

  // ── Document freshness ─────────────────────────────────────────────────────
  for (const doc of documents.filter((d) => d.kind === "bank-statement")) {
    const issued = doc.fields?.issueDate;
    if (!issued) continue;
    const age = daysBetween(new Date(issued), now);
    if (age > BANK_STATEMENT_MAX_AGE_DAYS) {
      add({
        documentId: doc.id,
        kind: "bank-statement",
        severity: "warning",
        code: "STATEMENT_STALE",
        message: `This bank statement is ${age} days old.`,
        fix: `Provide statements issued within the last ${BANK_STATEMENT_MAX_AGE_DAYS} days, stamped by your bank.`,
      });
    }
  }

  // ── Expiring supporting documents ──────────────────────────────────────────
  for (const doc of documents) {
    if (doc.kind === "passport") continue;
    const expiry = doc.fields?.expiryDate;
    if (!expiry) continue;
    if (new Date(expiry) < reference) {
      add({
        documentId: doc.id,
        kind: doc.kind,
        severity: "blocker",
        code: "DOCUMENT_EXPIRED",
        message: "This document has expired.",
        fix: "Upload a current version of this document.",
      });
    }
  }

  // ── File hygiene ───────────────────────────────────────────────────────────
  for (const doc of documents) {
    if (doc.sizeBytes < 20_000) {
      add({
        documentId: doc.id,
        kind: doc.kind,
        severity: "warning",
        code: "FILE_LOW_QUALITY",
        message: "This file is very small and may be too low-resolution to be legible.",
        fix: "Upload a clear colour scan of at least 300 DPI rather than a compressed screenshot.",
      });
    }
    if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(doc.mimeType)) {
      add({
        documentId: doc.id,
        kind: doc.kind,
        severity: "warning",
        code: "FILE_FORMAT",
        message: `${doc.mimeType} is not a format government portals reliably accept.`,
        fix: "Convert the file to PDF or JPEG before submission.",
      });
    }
  }

  // ── Missing requirements ───────────────────────────────────────────────────
  const missing = (context.requirements ?? [])
    .filter((req) => !req.conditional)
    .filter((req) => !documents.some((d) => d.kind === req.id || d.id === req.id))
    .map((req) => req.id);

  for (const id of missing) {
    const req = context.requirements?.find((r) => r.id === id);
    add({
      kind: "application",
      severity: "blocker",
      code: "DOCUMENT_MISSING",
      message: `${req?.label ?? id} has not been uploaded.`,
      fix: req?.description ?? "Upload this document to continue.",
    });
  }

  const blockers = findings.filter((f) => f.severity === "blocker");
  const warnings = findings.filter((f) => f.severity === "warning");

  const raw = findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  const score = Math.min(100, raw);

  const band: RiskAssessment["band"] =
    score >= 75 ? "critical" : score >= 40 ? "high" : score >= 15 ? "moderate" : "low";

  return {
    score,
    band,
    findings,
    blockers,
    warnings,
    missing,
    readyToSubmit: blockers.length === 0,
  };
}

/** Copy for the risk band. Kept in the domain so every surface says the same thing. */
export function riskBandLabel(band: RiskAssessment["band"]): string {
  switch (band) {
    case "low":
      return "Low risk — ready to submit";
    case "moderate":
      return "Moderate risk — worth tidying up";
    case "high":
      return "High risk — fix before submitting";
    case "critical":
      return "Critical — this will be rejected as it stands";
  }
}
