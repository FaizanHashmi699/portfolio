import { describe, expect, it } from "vitest";
import { fallbackAnswer, retrieveContext } from "../retrieval";

describe("retrieveContext", () => {
  it("resolves a service question into exact, pre-computed facts", () => {
    const context = retrieveContext("how much is the golden visa");
    const joined = context.facts.join("\n");

    expect(joined).toContain("Golden Visa");
    // The price is resolved for the model rather than left to it. A model that has to
    // add up fee lines is a model that can get a price wrong.
    expect(joined).toMatch(/Total including VAT: AED\s[\d,]+/);
    expect(joined).toContain("service fee");
  });

  it("includes the rejection reasons a service publishes", () => {
    const context = retrieveContext("employment visa mainland");
    expect(context.facts.join("\n").toLowerCase()).toContain("rejection reasons");
  });

  it("resolves a country question into that country's own chain", () => {
    const context = retrieveContext("attestation for pakistan");
    const joined = context.facts.join("\n");

    expect(joined).toContain("Pakistan");
    expect(joined).toContain("Chain in order");
    expect(joined.toLowerCase()).toContain("uae embassy");
  });

  it("gives apostille countries the shorter chain, not the embassy one", () => {
    const context = retrieveContext("attestation for india");
    const joined = context.facts.join("\n").toLowerCase();

    expect(joined).toContain("apostille");
    expect(joined).toContain("no longer applies");
  });

  it("returns sources the reader can check", () => {
    const context = retrieveContext("golden visa");
    expect(context.sources.length).toBeGreaterThan(0);
    for (const source of context.sources) {
      expect(source.href).toMatch(/^\//);
      expect(source.title.length).toBeGreaterThan(2);
    }
  });

  it("returns nothing rather than guessing for an unrelated question", () => {
    const context = retrieveContext("what is the weather in reykjavik");
    expect(context.facts).toEqual([]);
    expect(context.entries).toEqual([]);
  });

  it("never leaks anything but published catalog content", () => {
    const joined = retrieveContext("golden visa").facts.join("\n");
    expect(joined).not.toMatch(/SUPABASE|ANTHROPIC|api[_-]?key/i);
  });
});

describe("fallbackAnswer", () => {
  it("still answers usefully with no model configured", () => {
    const context = retrieveContext("golden visa cost");
    const answer = fallbackAnswer(context);

    expect(answer).toContain("Golden Visa");
    // Retrieval alone carries the price, which for most questions is the whole answer.
    expect(answer).toMatch(/AED\s[\d,]+/);
  });

  it("always restates that nothing is guaranteed", () => {
    const answer = fallbackAnswer(retrieveContext("employment visa"));
    expect(answer.toLowerCase()).toContain("no visa outcome can be guaranteed");
  });

  it("never promises an outcome", () => {
    for (const question of ["golden visa", "tourist visa", "employment visa india"]) {
      const answer = fallbackAnswer(retrieveContext(question)).toLowerCase();
      expect(answer, question).not.toMatch(
        /we guarantee|guaranteed approval|will be approved/,
      );
    }
  });

  it("points at a human when it finds nothing, rather than inventing an answer", () => {
    const answer = fallbackAnswer(retrieveContext("qwertyuiop asdfgh"));
    expect(answer).toContain("contact page");
    expect(answer).not.toMatch(/AED/);
  });
});

describe("question phrasing", () => {
  it("finds the right page even when the question uses words we never publish", () => {
    // "approved" appears nowhere in the catalog, but the question is obviously about
    // the Golden Visa and must not come back empty.
    const context = retrieveContext("will my golden visa be approved");
    expect(context.facts.join("\n")).toContain("Golden Visa");
  });

  it("still refuses to guess at genuine nonsense", () => {
    // The relaxed fallback must not turn into "always return something".
    expect(retrieveContext("qwertyuiop asdfghjkl zxcvbnm").facts).toEqual([]);
  });

  it("handles a question with no catalog terms at all", () => {
    expect(retrieveContext("what is the weather like today").facts).toEqual([]);
  });
});
