import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

/**
 * Header for localised pages.
 *
 * Navigation links point at the English pages deliberately: those pages are not translated
 * yet, and sending someone to a `/ar/services` route that renders English would be worse
 * than sending them somewhere the language is at least consistent with the URL.
 */
export function LocalisedHeader({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const navigation = [
    { href: "/services", label: dictionary.nav.services },
    { href: "/pricing", label: dictionary.nav.pricing },
    { href: "/eligibility", label: dictionary.nav.eligibility },
    { href: "/guides", label: dictionary.nav.guides },
  ];

  return (
    <header className="bg-background/85 border-border sticky top-0 z-50 border-b backdrop-blur-xl">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only-focusable absolute start-2 top-2 z-50 rounded-full px-4 py-2 text-sm"
      >
        {dictionary.nav.skipToContent}
      </a>

      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              hrefLang="en"
              className="text-muted-foreground hover:text-foreground rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher current={locale} />
          <ThemeToggle />
          <ButtonLink href="/eligibility" variant="primary" size="sm">
            {dictionary.nav.eligibility}
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
