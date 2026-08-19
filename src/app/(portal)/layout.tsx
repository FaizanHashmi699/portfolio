import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { DemoBanner } from "@/components/portal/demo-banner";
import { getCurrentUser } from "@/server/auth";

/**
 * Never prerender or cache authenticated HTML. In demo mode the auth helpers can resolve
 * without touching cookies(), which is enough for Next to treat these routes as static
 * and serve one visitor's render to another.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Your applications", template: "%s | Portal" },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <>
      {user?.isDemo && <DemoBanner />}
      <header className="border-border bg-background/85 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            <nav aria-label="Portal" className="hidden gap-1 sm:flex">
              <Link
                href="/portal"
                className="text-muted-foreground hover:text-foreground rounded-full px-3.5 py-2 text-sm font-medium"
              >
                Applications
              </Link>
              <Link
                href="/services"
                className="text-muted-foreground hover:text-foreground rounded-full px-3.5 py-2 text-sm font-medium"
              >
                Start something new
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <span className="text-muted-foreground hidden text-sm sm:block">
                {user.name}
              </span>
            )}
          </div>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
