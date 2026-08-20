export type DocumentKind =
  | "passport"
  | "photo"
  | "emirates-id"
  | "degree"
  | "marriage-certificate"
  | "birth-certificate"
  | "salary-certificate"
  | "bank-statement"
  | "employment-offer"
  | "tenancy-ejari"
  | "title-deed"
  | "insurance"
  | "other";

export type Severity = "blocker" | "warning" | "info";

/**
 * Fields extracted from an uploaded document.
 *
 * In production these are produced by OCR plus a vision model. In development and in tests
 * they are supplied directly. Validation operates only on this structure, so the rules are
 * identical either way and are testable with no model in the loop.
 */
export interface ExtractedFields {
  fullName?: string;
  documentNumber?: string;
  /** ISO date string. */
  issueDate?: string;
  /** ISO date string. */
  expiryDate?: string;
  nationality?: string;
  dateOfBirth?: string;
  /** Monthly amount in AED, for salary certificates. */
  monthlySalaryAed?: number;
  /** For photos: whether the background reads as plain white. */
  backgroundIsWhite?: boolean;
  /** For photos: proportion of frame height occupied by the face, 0–1. */
  faceRatio?: number;
  /** For attestable documents: legalisation stamps detected in the chain. */
  attestationStamps?: string[];
  /** Blank facing pages remaining in a passport. */
  blankPages?: number;
}

export interface DocumentRecord {
  id: string;
  kind: DocumentKind;
  fileName: string;
  uploadedAt: string;
  sizeBytes: number;
  mimeType: string;
  /** Object key in private storage. Never a public URL — reads go through signed URLs. */
  storagePath?: string;
  fields?: ExtractedFields;
  /** Set once a staff member has reviewed the document by eye. */
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  reviewDecision?: "accepted" | "rejected";
}

export interface Finding {
  documentId?: string;
  kind: DocumentKind | "application";
  severity: Severity;
  code: string;
  message: string;
  /** What the applicant should actually do. Never a bare "invalid". */
  fix: string;
}

export interface RiskAssessment {
  /** 0–100. Higher means more likely to be rejected. */
  score: number;
  band: "low" | "moderate" | "high" | "critical";
  findings: Finding[];
  blockers: Finding[];
  warnings: Finding[];
  /** Requirement ids from the service definition with no document uploaded. */
  missing: string[];
  readyToSubmit: boolean;
}
