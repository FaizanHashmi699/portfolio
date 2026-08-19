"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/eligibility", label: "Check eligibility" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Adjusting state during render is React's recommended alternative to a
  // setState-in-effect here: navigating closes the menu without an extra render pass.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that traps the page behind it must not let the page scroll away underneath.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-border bg-background/85 border-b backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only-focusable bg-primary text-primary-foreground absolute top-2 left-2 z-50 rounded-full px-4 py-2 text-sm"
      >
        Skip to content
      </a>

      <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink
            href="/portal"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Sign in
          </ButtonLink>
          <ButtonLink href="/eligibility" variant="primary" size="sm">
            Check eligibility
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="text-foreground hover:bg-surface rounded-full p-2 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-border bg-background border-t lg:hidden"
        >
          <ul className="container-page flex flex-col py-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:bg-surface block rounded-xl px-3 py-3.5 text-base font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/portal"
                className="hover:bg-surface block rounded-xl px-3 py-3.5 text-base font-medium"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
