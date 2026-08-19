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
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
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
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {service.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
          <nav aria-label="Company">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
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
                    className="text-sm text-muted-foreground hover:text-foreground"
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
        <div className="mt-8 rounded-card border border-border bg-background p-5 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">{brand.legalName}</strong> is a
            private consultancy. We are not a government entity and are not affiliated
            with the ICP, GDRFA, MoHRE or any embassy. We prepare and submit
            applications on your behalf — we do not decide them, and no one can
            guarantee a visa outcome.
          </p>
          <p className="mt-3">
            Trade licence {brand.licenceNumber} · Fees shown are indicative and
            confirmed in writing before any payment is taken.
          </p>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
