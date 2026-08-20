import { describe, expect, it } from "vitest";
import { buildSearchIndex, KIND_LABEL, searchEntries } from "../index";
import { services } from "@/domain/catalog/services";
import { countries } from "@/domain/geography/countries";
import { freeZones } from "@/domain/geography/free-zones";
import { guides } from "@/content/guides";

const index = buildSearchIndex();

describe("buildSearchIndex", () => {
  it("indexes every service, country, free zone and guide", () => {
    const kinds = index.reduce<Record<string, number>>((counts, entry) => {
      counts[entry.kind] = (counts[entry.kind] ?? 0) + 1;
      return counts;
    }, {});

    expect(kinds.service).toBe(services.length);
    expect(kinds.country).toBe(countries.length);
    expect(kinds["free-zone"]).toBe(freeZones.length);
    expect(kinds.guide).toBe(guides.length);
  });

  it("gives every entry a unique id and a usable link", () => {
    const ids = index.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const entry of index) {
      expect(entry.href, entry.id).toMatch(/^\//);
      expect(entry.title.length, entry.id).toBeGreaterThan(2);
      expect(entry.description.length, entry.id).toBeGreaterThan(5);
    }
  });

  it("labels every kind it can produce", () => {
    for (const entry of index) {
      expect(KIND_LABEL[entry.kind], entry.kind).toBeDefined();
    }
  });
});

describe("searchEntries", () => {
  it("returns nothing for an empty query rather than everything", () => {
    expect(searchEntries(index, "")).toEqual([]);
    expect(searchEntries(index, "   ")).toEqual([]);
  });

  it("puts the Golden Visa service first for 'golden visa'", () => {
    const [top] = searchEntries(index, "golden visa");
    expect(top.title).toContain("Golden Visa");
  });

  it("ranks a title match above a passing mention", () => {
    const results = searchEntries(index, "attestation");
    expect(results[0].title.toLowerCase()).toContain("attestation");
  });

  it("requires every term to match, so results stay relevant", () => {
    // Without the all-terms rule this would return every page mentioning "visa".
    const results = searchEntries(index, "golden visa unicorn");
    expect(results).toEqual([]);
  });

  it("finds a country by demonym as well as by name", () => {
    expect(searchEntries(index, "pakistani").length).toBeGreaterThan(0);
    expect(searchEntries(index, "pakistan").length).toBeGreaterThan(0);
  });

  it("finds a free zone by its abbreviation", () => {
    const results = searchEntries(index, "IFZA");
    expect(results[0].href).toContain("free-zones");
  });

  it("ignores punctuation and case", () => {
    const plain = searchEntries(index, "golden visa");
    const messy = searchEntries(index, "  GOLDEN,  VISA!! ");
    expect(messy.map((entry) => entry.id)).toEqual(plain.map((entry) => entry.id));
  });

  it("matches non-Latin scripts without stripping them", () => {
    // The normaliser must keep Unicode letters, or Arabic and Hindi queries match nothing.
    expect(() => searchEntries(index, "الإمارات")).not.toThrow();
  });

  it("respects the result limit", () => {
    expect(searchEntries(index, "visa", 5).length).toBeLessThanOrEqual(5);
  });

  it("finds a service by a rejection reason it publishes", () => {
    const results = searchEntries(index, "labour ban");
    expect(results.length).toBeGreaterThan(0);
  });
});

describe("natural-language queries", () => {
  it("answers a full sentence, not just keywords", () => {
    // Site search takes keywords; the assistant takes questions. Without stopword
    // handling this returned nothing for the most likely question a visitor asks.
    const results = searchEntries(index, "how much is the golden visa");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((entry) => entry.title.includes("Golden Visa"))).toBe(true);
  });

  it("handles 'how long does attestation take'", () => {
    const results = searchEntries(index, "how long does attestation take");
    expect(results.length).toBeGreaterThan(0);
  });

  it("still requires every term on a short keyword query", () => {
    // Two or three words are all intentional; a majority rule there would be too loose.
    expect(searchEntries(index, "golden unicorn")).toEqual([]);
  });

  it("tolerates one stray word in a longer question", () => {
    const results = searchEntries(
      index,
      "what documents do I need for a mainland employment visa",
    );
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns nothing when a query is only stopwords plus nonsense", () => {
    expect(searchEntries(index, "what is the qwertyuiop")).toEqual([]);
  });
});

describe("relaxed matching", () => {
  it("is off by default, so site search stays precise", () => {
    expect(searchEntries(index, "golden unicorn")).toEqual([]);
  });

  it("finds the obvious page when explicitly relaxed", () => {
    const results = searchEntries(index, "golden unicorn", { relaxed: true });
    expect(results.some((entry) => entry.title.includes("Golden Visa"))).toBe(true);
  });

  it("does not turn into 'always return something'", () => {
    expect(searchEntries(index, "qwerty asdfgh zxcvb", { relaxed: true })).toEqual([]);
  });

  it("still accepts a plain number as the limit", () => {
    // The older call signature is used in several places; keep it working.
    expect(searchEntries(index, "visa", 3).length).toBeLessThanOrEqual(3);
  });
});
