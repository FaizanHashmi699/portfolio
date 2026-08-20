/**
 * Internationalisation configuration.
 *
 * Locale choice follows the actual UAE expatriate population rather than a generic
 * "top world languages" list: Arabic for the official language and GCC nationals, Hindi
 * and Urdu for the largest communities by a wide margin, Russian for a fast-growing and
 * high-value segment.
 *
 * English stays unprefixed at the site root. Adding `/en` would have broken every existing
 * URL and every inbound link for no benefit — the other locales are additive.
 */

export const locales = ["en", "ar", "hi", "ur", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Locales that carry a URL prefix. English is served at the root. */
export const prefixedLocales = locales.filter((locale) => locale !== defaultLocale);

export interface LocaleMeta {
  code: Locale;
  /** Name in the language itself — never in English. Nobody looks for "Arabic". */
  nativeName: string;
  englishName: string;
  dir: "ltr" | "rtl";
  /** BCP 47 tag for the html lang attribute and hreflang. */
  htmlLang: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    code: "en",
    nativeName: "English",
    englishName: "English",
    dir: "ltr",
    htmlLang: "en-AE",
  },
  ar: {
    code: "ar",
    nativeName: "العربية",
    englishName: "Arabic",
    dir: "rtl",
    htmlLang: "ar-AE",
  },
  hi: {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    dir: "ltr",
    htmlLang: "hi-IN",
  },
  ur: {
    code: "ur",
    nativeName: "اردو",
    englishName: "Urdu",
    dir: "rtl",
    htmlLang: "ur-PK",
  },
  ru: {
    code: "ru",
    nativeName: "Русский",
    englishName: "Russian",
    dir: "ltr",
    htmlLang: "ru-RU",
  },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function directionFor(locale: Locale): "ltr" | "rtl" {
  return localeMeta[locale].dir;
}

/** Path for a given locale. English has no prefix. */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/**
 * Alternate-language URLs for a page, for the `alternates` metadata field.
 * Search engines need these to understand the pages are translations rather than
 * duplicates competing with each other.
 */
export function alternateLanguages(path = "/"): Record<string, string> {
  const entries = locales.map((locale) => [
    localeMeta[locale].htmlLang,
    localePath(locale, path),
  ]);
  return Object.fromEntries([
    ...entries,
    ["x-default", localePath(defaultLocale, path)],
  ]);
}
