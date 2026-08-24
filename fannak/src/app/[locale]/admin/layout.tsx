import { notFound, redirect } from "next/navigation";
import { adminEnabled, isAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";

/**
 * Admin must never be prerendered. These pages decide what to show from the
 * request's cookies and the runtime environment; statically generating them
 * freezes a build-time answer (an unconfigured 404) into every response.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Admin does not exist unless it has been deliberately configured. An
  // unconfigured deployment must not expose an open console.
  if (!adminEnabled()) notFound();

  const authed = await isAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {authed ? <AdminNav locale={locale} /> : null}
      {children}
    </div>
  );
}

export async function requireAdminOrRedirect(locale: string) {
  if (!(await isAdmin())) redirect(`/${locale}/admin/login`);
}
