import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/admin";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/programmes", label: "Programmes" },
  { href: "/admin/campaigns", label: "Appeals" },
  { href: "/admin/prayer-settings", label: "Prayer times" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The login page renders inside this layout but without the chrome.
  if (!user) return <>{children}</>;

  const { data: admin } = await supabase.from("admins").select("*").eq("id", user.id).maybeSingle();

  if (!admin) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-medium">Not authorised</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Your account <strong>{user.email}</strong> is signed in but has not been granted admin
          access. Ask an existing administrator to add you.
        </p>
        <form action={signOut} className="mt-6">
          <button className="rounded-sm border border-rule px-4 py-2 text-sm hover:border-brand">
            Sign out
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span aria-hidden className="flex flex-col items-center">
              <span className="block h-1.5 w-1.5 bg-brand" />
              <span className="block h-4 w-[2px] bg-brand/35" />
            </span>
            <span className="font-display text-base font-medium">Manarat admin</span>
          </Link>
          <span className="ml-auto text-xs text-ink-mute">{user.email}</span>
          <Link href="/" className="text-xs text-ink-mute hover:text-brand">
            View site ↗
          </Link>
          <form action={signOut}>
            <button className="text-xs text-ink-mute hover:text-brand">Sign out</button>
          </form>
        </div>
        <nav className="mx-auto max-w-6xl px-5 sm:px-8">
          <ul className="-mb-px flex flex-wrap gap-x-5 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="inline-block border-b-2 border-transparent py-2.5 text-ink-soft hover:border-brand hover:text-brand"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
