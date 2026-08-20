import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { DemoBanner } from "@/components/portal/demo-banner";
import { UserMenu } from "@/components/portal/user-menu";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, isStaff } from "@/server/auth";
import { features } from "@/server/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Console", template: "%s | Console" },
  robots: { index: false, follow: false },
};

const navigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/audit", label: "Audit log" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // In demo mode there is no authentication to enforce, so the console stays explorable.
  // Once Supabase is configured this is a real role check.
  if (features.database && !isStaff(user)) redirect("/portal");

  return (
    <>
      {user.isDemo && <DemoBanner />}
      <header className="bg-background/85 border-border sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo />
            <Badge tone="brand">Console</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <nav aria-label="Console" className="border-border border-b">
        <ul className="container-page flex gap-1 overflow-x-auto py-2">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:bg-surface hover:text-foreground block rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
