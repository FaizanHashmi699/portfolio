import { describe, expect, it } from "vitest";
import { cn, formatAed, formatDate, slugify } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("lets a later Tailwind class win over a conflicting earlier one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });
});

describe("formatAed", () => {
  it("formats a total as AED with no stray decimals", () => {
    expect(formatAed(13410)).toMatch(/13,410/);
    expect(formatAed(13410)).toMatch(/AED/);
  });

  it("rounds rather than showing fractional fils", () => {
    expect(formatAed(406.5)).not.toMatch(/\.5/);
  });

  it("handles zero", () => {
    expect(formatAed(0)).toMatch(/0/);
  });
});

describe("formatDate", () => {
  it("formats an ISO string readably", () => {
    expect(formatDate("2026-08-19T00:00:00.000Z")).toMatch(/2026/);
  });

  it("accepts a Date as well as a string", () => {
    expect(formatDate(new Date("2026-08-19T00:00:00.000Z"))).toMatch(/2026/);
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Golden Visa — Salary Route")).toBe("golden-visa-salary-route");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  !!Hello World!!  ")).toBe("hello-world");
  });

  it("collapses runs of separators", () => {
    expect(slugify("a---b   c")).toBe("a-b-c");
  });
});
