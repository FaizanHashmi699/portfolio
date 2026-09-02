"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/programmes", label: "Programmes" },
  { href: "/admin/campaigns", label: "Appeals" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/prayer-settings", label: "Prayer times" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="overflow-x-auto">
      <ul className="flex min-w-max gap-1.5 pb-3">
        {ADMIN_NAV.map((n) => {
          // Exact match for the dashboard, prefix match for everything else,
          // so /admin/enquiries doesn't also light up the dashboard tab.
          const active = n.href === "/admin" ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block rounded-chip px-4 py-2 text-[0.85rem] font-bold transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                  active
                    ? "bg-brand text-white shadow-brand"
                    : "text-ink-soft hover:bg-brand-wash hover:text-brand-deep"
                }`}
              >
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
