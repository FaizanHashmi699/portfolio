import Link from "next/link";
import { Globe } from "lucide-react";
import { localeMeta, locales, localePath, type Locale } from "@/i18n/config";

/**
 * Language switcher.
 *
 * Native <details> so it works without client JavaScript. Each language is listed in its
 * own script — nobody looking for Urdu scans a list for the word "Urdu".
 */
export function LanguageSwitcher({ current }: { current: Locale }) {
  return (
    <details className="relative [&_summary::-webkit-details-marker]:hidden">
      <summary
        className="hover:bg-surface text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-1.5 rounded-full px-2.5 py-2 text-sm transition-colors"
        aria-label={`Language: ${localeMeta[current].englishName}`}
      >
        <Globe className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{localeMeta[current].nativeName}</span>
      </summary>

      <ul className="border-border bg-surface-raised absolute end-0 z-50 mt-2 w-48 rounded-xl border p-1.5 shadow-lg">
        {locales.map((locale) => {
          const meta = localeMeta[locale];
          return (
            <li key={locale}>
              <Link
                href={localePath(locale)}
                hrefLang={meta.htmlLang}
                lang={meta.htmlLang}
                dir={meta.dir}
                aria-current={locale === current ? "true" : undefined}
                className={`hover:bg-surface flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  locale === current ? "bg-surface font-medium" : ""
                }`}
              >
                <span>{meta.nativeName}</span>
                <span className="text-muted-foreground text-xs" dir="ltr">
                  {meta.englishName}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
