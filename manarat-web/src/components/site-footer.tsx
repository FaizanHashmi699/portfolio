import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-display text-lg font-medium">Manarat Foundation</p>
          <p className="text-sm leading-relaxed text-ink-soft">
            155 Coventry Road
            <br />
            Sheldon, Birmingham
          </p>
          <p className="text-xs text-ink-mute">Registered charity 1148223</p>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-mute">Explore</p>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/prayer-times", label: "Prayer times" },
              { href: "/programmes", label: "Programmes" },
              { href: "/appeal", label: "The Manarat Expansion" },
              { href: "/donate", label: "Donate" },
              { href: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink-soft hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink-mute">Keep in touch</p>
          <p className="text-sm text-ink-soft">
            Prayer time changes, Janazah notices and class announcements.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-rule-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-2 px-5 py-5 text-xs text-ink-mute sm:px-8">
          <p>© {new Date().getFullYear()} Manarat Foundation. Registered charity 1148223.</p>
          <Link href="/admin" className="ml-auto hover:text-brand">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
