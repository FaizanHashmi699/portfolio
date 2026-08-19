import { describe, expect, it } from "vitest";
import {
  ATTESTATION_CHAIN,
  PASSPORT_VALIDITY_MONTHS,
  namesMatch,
  riskBandLabel,
  validateDocuments,
} from "../validation";
import type { DocumentRecord, ExtractedFields } from "../types";
import { getService } from "@/domain/catalog/services";

const NOW = new Date("2026-08-19T00:00:00.000Z");

function doc(
  kind: DocumentRecord["kind"],
  fields: ExtractedFields = {},
  overrides: Partial<DocumentRecord> = {},
): DocumentRecord {
  return {
    id: `${kind}-1`,
    kind,
    fileName: `${kind}.pdf`,
    uploadedAt: NOW.toISOString(),
    sizeBytes: 500_000,
    mimeType: "application/pdf",
    fields,
    ...overrides,
  };
}

const validPassport = doc("passport", {
  fullName: "Faizan Ahmed Hashmi",
  expiryDate: "2030-01-01",
  blankPages: 6,
});

describe("passport validity", () => {
  it("passes a passport with years of validity left", () => {
    const result = validateDocuments([validPassport], { now: NOW });
    expect(result.findings.filter((f) => f.code.startsWith("PASSPORT_"))).toHaveLength(0);
  });

  it("blocks an expired passport", () => {
    const result = validateDocuments(
      [doc("passport", { expiryDate: "2026-01-01" })],
      { now: NOW },
    );
    expect(result.blockers.map((b) => b.code)).toContain("PASSPORT_EXPIRED");
    expect(result.readyToSubmit).toBe(false);
  });

  it(`blocks a passport with under ${PASSPORT_VALIDITY_MONTHS} months validity`, () => {
    const result = validateDocuments(
      [doc("passport", { expiryDate: "2026-11-01" })],
      { now: NOW },
    );
    const finding = result.blockers.find((b) => b.code === "PASSPORT_VALIDITY_SHORT");
    expect(finding).toBeDefined();
    expect(finding!.message).toMatch(/2 months/);
  });

  it("measures validity from the intended entry date, not today", () => {
    const passport = doc("passport", { expiryDate: "2027-06-01" });
    // Today there are 9 months of validity left, so the file is clean.
    expect(validateDocuments([passport], { now: NOW }).readyToSubmit).toBe(true);
    // But entering in January 2027 leaves under 6 months of validity at entry.
    const later = validateDocuments([passport], {
      now: NOW,
      referenceDate: new Date("2027-01-15T00:00:00.000Z"),
    });
    expect(later.blockers.map((b) => b.code)).toContain("PASSPORT_VALIDITY_SHORT");
  });

  it("warns about insufficient blank pages without blocking", () => {
    const result = validateDocuments(
      [doc("passport", { expiryDate: "2030-01-01", blankPages: 1 })],
      { now: NOW },
    );
    expect(result.warnings.map((w) => w.code)).toContain("PASSPORT_BLANK_PAGES");
    expect(result.readyToSubmit).toBe(true);
  });
});

describe("photograph specification", () => {
  it("blocks a non-white background", () => {
    const result = validateDocuments(
      [doc("photo", { backgroundIsWhite: false }, { mimeType: "image/jpeg" })],
      { now: NOW },
    );
    expect(result.blockers.map((b) => b.code)).toContain("PHOTO_BACKGROUND");
  });

  it("accepts a face filling 70-80% of the frame", () => {
    for (const ratio of [0.7, 0.75, 0.8]) {
      const result = validateDocuments(
        [doc("photo", { backgroundIsWhite: true, faceRatio: ratio }, { mimeType: "image/jpeg" })],
        { now: NOW },
      );
      expect(result.findings.filter((f) => f.code === "PHOTO_FACE_RATIO")).toHaveLength(0);
    }
  });

  it("blocks a face outside the permitted range and says by how much", () => {
    const result = validateDocuments(
      [doc("photo", { backgroundIsWhite: true, faceRatio: 0.5 }, { mimeType: "image/jpeg" })],
      { now: NOW },
    );
    const finding = result.blockers.find((b) => b.code === "PHOTO_FACE_RATIO");
    expect(finding!.message).toMatch(/50%/);
  });
});

describe("name consistency", () => {
  it("accepts names differing only by ordering, case and punctuation", () => {
    expect(namesMatch("Faizan Ahmed Hashmi", "HASHMI, Faizan Ahmed")).toBe(true);
    expect(namesMatch("Ali  Al-Mansoori", "ali al mansoori")).toBe(true);
  });

  it("rejects genuinely different names", () => {
    expect(namesMatch("Faizan Hashmi", "Faizan Khan")).toBe(false);
  });

  it("does not claim a mismatch when a name is missing", () => {
    expect(namesMatch(undefined, "Faizan Hashmi")).toBe(true);
    expect(namesMatch("Faizan Hashmi", undefined)).toBe(true);
  });

  it("blocks when a certificate name disagrees with the passport", () => {
    const result = validateDocuments(
      [
        validPassport,
        doc("degree", {
          fullName: "Faizan A. Qureshi",
          attestationStamps: [...ATTESTATION_CHAIN],
        }),
      ],
      { now: NOW },
    );
    const finding = result.blockers.find((b) => b.code === "NAME_MISMATCH");
    expect(finding).toBeDefined();
    expect(finding!.message).toContain("Faizan A. Qureshi");
  });
});

describe("attestation chain", () => {
  it("accepts a complete chain", () => {
    const result = validateDocuments(
      [doc("degree", { attestationStamps: [...ATTESTATION_CHAIN] })],
      { now: NOW },
    );
    expect(result.findings.filter((f) => f.code === "ATTESTATION_INCOMPLETE")).toHaveLength(0);
  });

  it("blocks and names the missing steps", () => {
    const result = validateDocuments(
      [doc("degree", { attestationStamps: ["notary", "home-mofa"] })],
      { now: NOW },
    );
    const finding = result.blockers.find((f) => f.code === "ATTESTATION_INCOMPLETE");
    expect(finding!.message).toContain("uae-embassy");
    expect(finding!.message).toContain("uae-mofa");
  });

  it("stays silent when attestation data was never extracted", () => {
    const result = validateDocuments([doc("degree", {})], { now: NOW });
    expect(result.findings.filter((f) => f.code === "ATTESTATION_INCOMPLETE")).toHaveLength(0);
  });

  it("checks marriage and birth certificates too", () => {
    const result = validateDocuments(
      [doc("marriage-certificate", { attestationStamps: ["notary"] })],
      { now: NOW },
    );
    expect(result.blockers.map((b) => b.code)).toContain("ATTESTATION_INCOMPLETE");
  });
});

describe("freshness and file hygiene", () => {
  it("warns about a stale bank statement", () => {
    const result = validateDocuments(
      [doc("bank-statement", { issueDate: "2026-01-01" })],
      { now: NOW },
    );
    expect(result.warnings.map((w) => w.code)).toContain("STATEMENT_STALE");
  });

  it("accepts a recent bank statement", () => {
    const result = validateDocuments(
      [doc("bank-statement", { issueDate: "2026-08-01" })],
      { now: NOW },
    );
    expect(result.findings.filter((f) => f.code === "STATEMENT_STALE")).toHaveLength(0);
  });

  it("warns about a suspiciously small file", () => {
    const result = validateDocuments(
      [doc("passport", { expiryDate: "2030-01-01" }, { sizeBytes: 4_000 })],
      { now: NOW },
    );
    expect(result.warnings.map((w) => w.code)).toContain("FILE_LOW_QUALITY");
  });

  it("warns about formats government portals reject", () => {
    const result = validateDocuments(
      [doc("passport", { expiryDate: "2030-01-01" }, { mimeType: "image/heic" })],
      { now: NOW },
    );
    expect(result.warnings.map((w) => w.code)).toContain("FILE_FORMAT");
  });

  it("blocks an expired supporting document", () => {
    const result = validateDocuments(
      [validPassport, doc("insurance", { expiryDate: "2026-05-01" })],
      { now: NOW },
    );
    expect(result.blockers.map((b) => b.code)).toContain("DOCUMENT_EXPIRED");
  });
});

describe("missing requirements", () => {
  it("flags mandatory documents that were never uploaded", () => {
    const service = getService("tourist-visa-30-day")!;
    const result = validateDocuments([validPassport], {
      now: NOW,
      requirements: service.documents,
    });
    expect(result.missing).toContain("photo");
    expect(result.missing).toContain("ticket");
    expect(result.readyToSubmit).toBe(false);
  });

  it("does not demand conditional documents", () => {
    const service = getService("tourist-visa-30-day")!;
    const result = validateDocuments([validPassport], {
      now: NOW,
      requirements: service.documents,
    });
    // "accommodation" is conditional on staying with a resident host
    expect(result.missing).not.toContain("accommodation");
  });

  it("reports nothing missing once every mandatory document is present", () => {
    const service = getService("tourist-visa-30-day")!;
    const result = validateDocuments(
      [
        validPassport,
        doc("photo", { backgroundIsWhite: true, faceRatio: 0.75 }, { mimeType: "image/jpeg" }),
        doc("other", {}, { id: "ticket" }),
      ],
      { now: NOW, requirements: service.documents },
    );
    expect(result.missing).toHaveLength(0);
  });
});

describe("risk scoring", () => {
  it("scores a clean file as low risk and ready", () => {
    const result = validateDocuments([validPassport], { now: NOW });
    expect(result.score).toBe(0);
    expect(result.band).toBe("low");
    expect(result.readyToSubmit).toBe(true);
  });

  it("escalates the band as blockers accumulate", () => {
    const one = validateDocuments(
      [doc("passport", { expiryDate: "2026-01-01" })],
      { now: NOW },
    );
    const three = validateDocuments(
      [
        doc("passport", { expiryDate: "2026-01-01", fullName: "A B" }),
        doc("photo", { backgroundIsWhite: false }, { mimeType: "image/jpeg" }),
        doc("degree", { fullName: "C D", attestationStamps: ["notary"] }),
      ],
      { now: NOW },
    );
    expect(three.score).toBeGreaterThan(one.score);
    expect(three.band).toBe("critical");
  });

  it("caps the score at 100 however many things are wrong", () => {
    const result = validateDocuments(
      [
        doc("passport", { expiryDate: "2026-01-01", fullName: "A B" }),
        doc("photo", { backgroundIsWhite: false, faceRatio: 0.3 }, { mimeType: "image/jpeg" }),
        doc("degree", { fullName: "C D", attestationStamps: ["notary"] }),
        doc("insurance", { expiryDate: "2026-05-01" }, { id: "ins" }),
      ],
      { now: NOW },
    );
    expect(result.blockers.length).toBeGreaterThan(3);
    expect(result.score).toBe(100);
  });

  it("checks every photograph, not only the first", () => {
    const result = validateDocuments(
      [
        doc("photo", { backgroundIsWhite: true, faceRatio: 0.75 }, { id: "p1", mimeType: "image/jpeg" }),
        doc("photo", { backgroundIsWhite: false }, { id: "p2", mimeType: "image/jpeg" }),
      ],
      { now: NOW },
    );
    expect(result.blockers.map((b) => b.documentId)).toContain("p2");
  });

  it("never blocks submission on warnings alone", () => {
    const result = validateDocuments(
      [doc("passport", { expiryDate: "2030-01-01", blankPages: 1 })],
      { now: NOW },
    );
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.blockers).toHaveLength(0);
    expect(result.readyToSubmit).toBe(true);
  });

  it("gives every finding an actionable fix rather than a bare error", () => {
    const result = validateDocuments(
      [
        doc("passport", { expiryDate: "2026-01-01", blankPages: 0 }),
        doc("photo", { backgroundIsWhite: false, faceRatio: 0.4 }, { mimeType: "image/heic" }),
      ],
      { now: NOW },
    );
    expect(result.findings.length).toBeGreaterThan(0);
    for (const f of result.findings) {
      expect(f.fix.length).toBeGreaterThan(20);
      expect(f.message.length).toBeGreaterThan(10);
    }
  });

  it("handles an empty upload set without throwing", () => {
    const result = validateDocuments([], { now: NOW });
    expect(result.score).toBe(0);
    expect(result.readyToSubmit).toBe(true);
  });

  it("labels every risk band", () => {
    for (const band of ["low", "moderate", "high", "critical"] as const) {
      expect(riskBandLabel(band)).toBeTruthy();
    }
  });
});
