import Link from "next/link";

const NAV = [
  { href: "/prayer-times", label: "Prayer times" },
  { href: "/programmes", label: "Programmes" },
  { href: "/appeal", label: "Our appeal" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-4 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span aria-hidden className="flex flex-col items-center">
            <span className="block h-2 w-2 bg-brand" />
            <span className="block h-6 w-[3px] bg-brand/35" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-medium tracking-tight text-ink">
              Manarat Foundation
            </span>
            <span className="block text-[11px] uppercase tracking-[0.14em] text-ink-mute">
              Masjid &amp; Islamic Centre · Sheldon
            </span>
          </span>
        </Link>

        <nav className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink-soft transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/donate"
            className="rounded-sm bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-deep"
          >
            Donate
          </Link>
        </nav>
      </div>
    </header>
  );
}
