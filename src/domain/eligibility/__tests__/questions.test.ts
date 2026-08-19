import { describe, expect, it } from "vitest";
import { applicableQuestions, questions } from "../questions";
import type { ApplicantProfile } from "../types";

describe("questionnaire definition", () => {
  it("uses a unique id per question", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every single-choice question at least two options", () => {
    for (const question of questions.filter((q) => q.type === "single")) {
      expect(question.options?.length, question.id as string).toBeGreaterThan(1);
    }
  });

  it("bounds every numeric question so a typo cannot produce nonsense", () => {
    for (const question of questions.filter((q) => q.type === "number")) {
      expect(question.min, question.id as string).toBeDefined();
      expect(question.max, question.id as string).toBeDefined();
      expect(question.max!).toBeGreaterThan(question.min!);
    }
  });

  it("stays within the ten-question ceiling for any single path", () => {
    const purposes: ApplicantProfile["purpose"][] = [
      "visit",
      "work",
      "family",
      "long-term-residence",
      "business",
      "freelance",
    ];
    for (const purpose of purposes) {
      const visible = applicableQuestions({ purpose, education: "bachelors" });
      expect(visible.length, purpose).toBeLessThanOrEqual(12);
    }
  });
});

describe("applicableQuestions", () => {
  it("asks nothing conditional before the answers that gate it exist", () => {
    const visible = applicableQuestions({});
    expect(visible.map((q) => q.id)).not.toContain("hasAttestedDegree");
    expect(visible.map((q) => q.id)).not.toContain("propertyValueAed");
  });

  it("asks about attestation only when there is a certificate to attest", () => {
    expect(applicableQuestions({ education: "bachelors" }).map((q) => q.id)).toContain(
      "hasAttestedDegree",
    );

    for (const education of ["none", "secondary"] as const) {
      expect(applicableQuestions({ education }).map((q) => q.id)).not.toContain(
        "hasAttestedDegree",
      );
    }
  });

  it("asks about a job offer only when the purpose involves work", () => {
    expect(applicableQuestions({ purpose: "work" }).map((q) => q.id)).toContain(
      "hasJobOffer",
    );
    expect(applicableQuestions({ purpose: "visit" }).map((q) => q.id)).not.toContain(
      "hasJobOffer",
    );
  });

  it("asks about property and business value only where a route uses them", () => {
    const longTerm = applicableQuestions({ purpose: "long-term-residence" }).map(
      (q) => q.id,
    );
    expect(longTerm).toContain("propertyValueAed");
    expect(longTerm).toContain("businessValueAed");

    const visiting = applicableQuestions({ purpose: "visit" }).map((q) => q.id);
    expect(visiting).not.toContain("propertyValueAed");
  });

  it("always asks the unconditional questions", () => {
    const ids = applicableQuestions({}).map((q) => q.id);
    for (const required of ["purpose", "currentStatus", "age", "education"]) {
      expect(ids).toContain(required);
    }
  });

  it("marks questions optional wherever a blank answer is legitimate", () => {
    const optionalIds = questions.filter((q) => q.optional).map((q) => q.id);
    expect(optionalIds).toContain("monthlySalaryAed");
    expect(optionalIds).toContain("propertyValueAed");
  });
});
