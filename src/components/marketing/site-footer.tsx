import Link from "next/link";
import { brand } from "@/config/brand";
import { Logo } from "@/components/logo";
import { pillars } from "@/domain/catalog/pillars";
import { servicesByPillar } from "@/domain/catalog/services";

const company = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Transparent pricing" },
  { href: "/guides", label: "Guides" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/terms", label: "Terms of service" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-surface mt-auto border-t">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">
              {brand.description}
            </p>
            <dl className="mt-6 space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd>
                  <a
                    className="hover:text-primary"
                    href={`mailto:${brand.email.general}`}
                  >
                    {brand.email.general}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  <a className="hover:text-primary" href={`tel:${brand.phone.e164}`}>
                    {brand.phone.display}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {pillars.map((pillar) => (
            <div key={pillar.slug}>
              <h2 className="text-sm font-semibold">{pillar.name}</h2>
              <ul className="mt-3 space-y-2">
                {servicesByPillar(pillar.slug)
                  .slice(0, 5)
                  .map((service) => (
                    <li key={service.slug}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="text-muted-foreground hover:text-foreground text-sm"
                      >
                        {service.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border mt-10 grid gap-8 border-t pt-8 sm:grid-cols-2">
          <nav aria-label="Company">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Legal" className="sm:text-right">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/*
          Two things stated plainly, because the category's biggest trust problem is
          consultancies implying government affiliation and guaranteeing outcomes.
        */}
        <div className="rounded-card border-border bg-background text-muted-foreground mt-8 border p-5 text-sm">
          <p>
            <strong className="text-foreground">{brand.legalName}</strong> is a private
            consultancy. We are not a government entity and are not affiliated with the
            ICP, GDRFA, MoHRE or any embassy. We prepare and submit applications on your
            behalf — we do not decide them, and no one can guarantee a visa outcome.
          </p>
          <p className="mt-3">
            Trade licence {brand.licenceNumber} · Fees shown are indicative and
            confirmed in writing before any payment is taken.
          </p>
        </div>

        <p className="text-muted-foreground mt-8 text-sm">
          © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
