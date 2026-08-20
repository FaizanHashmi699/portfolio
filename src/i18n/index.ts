import { defaultLocale, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";
import { hi } from "./dictionaries/hi";
import { ur } from "./dictionaries/ur";
import { ru } from "./dictionaries/ru";

/**
 * Dictionaries are plain modules rather than dynamically imported JSON.
 *
 * They are small, they need to be type-checked against the English source of truth, and
 * bundling them avoids a network round trip on a page whose entire promise is speed for
 * users on mid-range phones.
 */
const dictionaries: Record<Locale, Dictionary> = { en, ar, hi, ur, ru };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export type { Dictionary } from "./dictionaries/en";
export * from "./config";
