import { describe, expect, it } from "vitest";
import {
  alternateLanguages,
  defaultLocale,
  directionFor,
  isLocale,
  localeMeta,
  localePath,
  locales,
  prefixedLocales,
} from "../config";
import { getDictionary } from "../index";
import { en } from "../dictionaries/en";

/** Every key path in an object, e.g. "nav.services". */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("locale configuration", () => {
  it("keeps English as the unprefixed default so existing URLs never moved", () => {
    expect(defaultLocale).toBe("en");
    expect(localePath("en", "/pricing")).toBe("/pricing");
    expect(localePath("en")).toBe("/");
  });

  it("prefixes every other locale", () => {
    expect(localePath("ar")).toBe("/ar");
    expect(localePath("ru", "/pricing")).toBe("/ru/pricing");
  });

  it("normalises a path without a leading slash", () => {
    expect(localePath("ar", "pricing")).toBe("/ar/pricing");
  });

  it("excludes the default locale from the prefixed set", () => {
    expect(prefixedLocales).not.toContain("en");
    expect(prefixedLocales).toHaveLength(locales.length - 1);
  });

  it("marks Arabic and Urdu right-to-left, and the rest left-to-right", () => {
    expect(directionFor("ar")).toBe("rtl");
    expect(directionFor("ur")).toBe("rtl");
    for (const locale of ["en", "hi", "ru"] as const) {
      expect(directionFor(locale)).toBe("ltr");
    }
  });

  it("names every language in its own script", () => {
    // Nobody searching for Urdu scans a list for the word "Urdu".
    expect(localeMeta.ar.nativeName).toBe("العربية");
    expect(localeMeta.ur.nativeName).toBe("اردو");
    expect(localeMeta.hi.nativeName).toBe("हिन्दी");
    expect(localeMeta.ru.nativeName).toBe("Русский");
  });

  it("gives every locale a valid BCP 47 tag", () => {
    for (const locale of locales) {
      expect(localeMeta[locale].htmlLang, locale).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    }
  });

  it("recognises only real locales", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("zz")).toBe(false);
    expect(isLocale("services")).toBe(false);
  });
});

describe("alternateLanguages", () => {
  it("lists every locale plus an x-default", () => {
    const alternates = alternateLanguages();
    for (const locale of locales) {
      expect(alternates[localeMeta[locale].htmlLang]).toBeDefined();
    }
    expect(alternates["x-default"]).toBe("/");
  });

  it("points x-default at the unprefixed English page", () => {
    expect(alternateLanguages("/pricing")["x-default"]).toBe("/pricing");
  });
});

describe("dictionaries", () => {
  it("returns a dictionary for every locale", () => {
    for (const locale of locales) {
      expect(getDictionary(locale)).toBeDefined();
    }
  });

  it("has no missing or empty keys in any translation", () => {
    const expected = keyPaths(en).sort();

    for (const locale of locales) {
      const dictionary = getDictionary(locale);
      expect(keyPaths(dictionary).sort(), locale).toEqual(expected);

      for (const path of expected) {
        const value = path
          .split(".")
          .reduce<unknown>(
            (node, key) => (node as Record<string, unknown>)[key],
            dictionary,
          );
        expect(typeof value, `${locale}.${path}`).toBe("string");
        expect((value as string).trim().length, `${locale}.${path}`).toBeGreaterThan(0);
      }
    }
  });

  it("actually translates rather than falling back to English", () => {
    for (const locale of prefixedLocales) {
      const dictionary = getDictionary(locale);
      expect(dictionary.nav.services, locale).not.toBe(en.nav.services);
      expect(dictionary.hero.primaryCta, locale).not.toBe(en.hero.primaryCta);
    }
  });

  it("never promises an outcome in any language", () => {
    // The English copy is tested for this elsewhere; a translation must not quietly
    // reintroduce a guarantee.
    for (const locale of locales) {
      const dictionary = getDictionary(locale);
      const serialised = JSON.stringify(dictionary).toLowerCase();
      expect(serialised, locale).not.toMatch(/we guarantee|guaranteed approval/);
      // Each locale must carry an explicit no-guarantee line in the hero.
      expect(dictionary.hero.disclaimer.length, locale).toBeGreaterThan(10);
    }
  });

  it("keeps the non-government disclosure in every language", () => {
    for (const locale of locales) {
      expect(getDictionary(locale).footer.notGovernment.length, locale).toBeGreaterThan(
        80,
      );
    }
  });

  it("carries the machine-translation notice in every prefixed locale", () => {
    for (const locale of prefixedLocales) {
      const dictionary = getDictionary(locale);
      expect(dictionary.translation.noticeBody.length, locale).toBeGreaterThan(60);
      expect(dictionary.translation.viewInEnglish.length, locale).toBeGreaterThan(3);
    }
  });
});
