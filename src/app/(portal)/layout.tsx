import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { DemoBanner } from "@/components/portal/demo-banner";
import { UserMenu } from "@/components/portal/user-menu";
import { NotificationBell } from "@/components/portal/notification-bell";
import { getRepositories } from "@/server/repositories";
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

const navigation = [
  { href: "/portal", label: "Applications" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/services", label: "Start something new" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { notifications } = await getRepositories();
  const [recent, unreadCount] = await Promise.all([
    notifications.listForUser(user.id, 12),
    notifications.unreadCount(user.id),
  ]);

  return (
    <>
      {user.isDemo && <DemoBanner />}
      <header className="bg-background/85 border-border sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            <nav aria-label="Portal" className="hidden gap-1 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground rounded-full px-3.5 py-2 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell notifications={recent} unreadCount={unreadCount} />
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <nav aria-label="Portal sections" className="border-border border-b md:hidden">
        <ul className="container-page flex gap-1 overflow-x-auto py-2">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground block rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap"
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
