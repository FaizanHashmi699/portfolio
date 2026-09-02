import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
import { Container, KhatimPattern } from "./ui";

const COLUMNS = [
  {
    heading: "Worship",
    links: [
      { href: "/prayer-times", label: "Prayer times" },
      { href: "/calendar", label: "Islamic calendar" },
      { href: "/qibla", label: "Qibla finder" },
      { href: "/live", label: "Masjid display" },
    ],
  },
  {
    heading: "Academy",
    links: [
      { href: "/programmes/hifz", label: "Hifz ul-Qur'an" },
      { href: "/programmes/arabic", label: "Arabic language" },
      { href: "/programmes/islamic-studies", label: "Qur'an & Tajweed" },
      { href: "/programmes/nikah", label: "Nikah & marriage" },
    ],
  },
  {
    heading: "Support us",
    links: [
      { href: "/donate", label: "Donate" },
      { href: "/appeal", label: "The Manarat Expansion" },
      { href: "/about", label: "About Manarat" },
      { href: "/contact", label: "Contact & directions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <span aria-hidden className="absolute inset-0 text-blue-300">
        <KhatimPattern id="footer" opacity={0.05} size={72} />
      </span>
      <span
        aria-hidden
        className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(21,145,220,.28), transparent 68%)" }}
      />

      <Container className="relative">
        {/* Newsletter — the masjid's own channel to supporters */}
        <div className="grid gap-8 border-b border-white/12 py-14 lg:grid-cols-[1.1fr_minmax(0,440px)] lg:items-center lg:gap-16">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-blue-300">
              Keep in touch
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold leading-tight text-white">
              Prayer time changes, Janazah notices and class announcements.
            </h2>
            <p className="mt-3 max-w-[46ch] text-[0.95rem] leading-relaxed text-white/60">
              One email when something matters. Never shared, and you can leave any time.
            </p>
          </div>
          <NewsletterForm onNavy />
        </div>

        {/* Links */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-11 w-11 place-items-center rounded-card bg-gradient-to-br from-blue-600 to-navy-800"
              >
                <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white">
                  <path d="M16 2.5 19.9 12.1 29.5 16 19.9 19.9 16 29.5 12.1 19.9 2.5 16 12.1 12.1Z" />
                  <circle cx="16" cy="16" r="2.6" className="fill-navy-950" />
                </svg>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-lg font-extrabold text-white">
                    Manarat Foundation
                  </span>
                  <span aria-hidden className="font-arabic text-lg text-blue-300">
                    منارة
                  </span>
                </span>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-white/45">
                  Masjid · Islamic Centre · Academy
                </span>
              </span>
            </Link>

            <address className="mt-6 not-italic text-[0.95rem] leading-relaxed text-white/65">
              155 Coventry Road
              <br />
              Sheldon, Birmingham
            </address>

            <p className="mt-5 inline-flex items-center gap-2 rounded-chip border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[0.72rem] font-semibold text-white/70">
              <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-none stroke-blue-300 stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8.5 6 12l7.5-8" />
              </svg>
              Registered charity 1148223
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-blue-300">
                {col.heading}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.93rem] text-white/65 transition-colors duration-200 hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Legal */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/12 py-7 text-[0.8rem] text-white/45">
          <p>© {new Date().getFullYear()} Manarat Foundation. Registered charity 1148223.</p>
          <p className="hidden sm:block">
            Donations are handled securely. Gift Aid adds 25% at no cost to you.
          </p>
          <Link href="/admin" className="ml-auto transition-colors hover:text-white/80">
            Staff login
          </Link>
        </div>
      </Container>
    </footer>
  );
}
