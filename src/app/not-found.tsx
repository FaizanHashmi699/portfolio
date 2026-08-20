import Link from "next/link";
import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata = { title: "Page not found" };

/**
 * A 404 should do something useful. The most common way to land here is a stale link to a
 * service or guide, so this offers the routes people were most likely looking for rather
 * than a dead end and an apology.
 */
export default function NotFound() {
  const suggestions = [
    {
      href: "/services",
      label: "All services",
      hint: "Every visa, setup and attestation service with full pricing",
    },
    {
      href: "/eligibility",
      label: "Check eligibility",
      hint: "Which routes you qualify for, in about two minutes",
    },
    {
      href: "/uae-visa-for",
      label: "By nationality",
      hint: "Entry rules and attestation chain for your passport",
    },
    { href: "/search", label: "Search", hint: "Everything we publish, in one place" },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="container-page py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Compass
              className="text-muted-foreground mx-auto size-12"
              aria-hidden="true"
            />
            <p className="text-muted-foreground mt-6 text-sm font-semibold tracking-[0.14em] uppercase">
              404
            </p>
            <h1 className="text-h1 mt-3">That page isn&apos;t here.</h1>
            <p className="text-lead text-muted-foreground mt-4">
              It may have moved, or the link may be out of date. Here&apos;s where most
              people who land here were actually heading.
            </p>
          </div>

          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion.href}>
                <Link
                  href={suggestion.href}
                  className="border-border hover:bg-surface rounded-card block h-full border p-5 transition-colors"
                >
                  <span className="font-display block font-semibold">
                    {suggestion.label}
                  </span>
                  <span className="text-muted-foreground mt-1.5 block text-sm">
                    {suggestion.hint}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <ButtonLink href="/" variant="outline">
              Back to the homepage
            </ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
