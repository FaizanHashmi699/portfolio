import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/admin";
import { AdminNav } from "@/components/admin/nav";
import { adminButtonQuiet } from "@/components/admin/ui";

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
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-6 py-24">
        <div className="w-full rounded-card border border-rule bg-surface p-9 text-center shadow-sm">
          <h1 className="font-display text-[1.6rem] font-extrabold tracking-tight text-brand-deep">
            Not authorised
          </h1>
          <p className="mt-3 text-[0.95rem] leading-[1.7] text-ink-soft">
            Your account <strong className="text-ink">{user.email}</strong> is signed in but has not
            been granted admin access. Ask an existing administrator to add you.
          </p>
          <form action={signOut} className="mt-7">
            <button className={adminButtonQuiet}>Sign out</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-3 px-6 py-4 sm:px-8">
          <Link href="/admin" className="group flex items-center gap-3">
            <span
              aria-hidden
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-brand to-brand-deep shadow-[0_6px_18px_-8px_rgba(21,145,220,.9)] transition-transform duration-[400ms] group-hover:-rotate-6"
            >
              <svg viewBox="0 0 32 32" className="h-[19px] w-[19px] fill-white">
                <path d="M16 2.5 19.9 12.1 29.5 16 19.9 19.9 16 29.5 12.1 19.9 2.5 16 12.1 12.1Z" />
                <circle cx="16" cy="16" r="2.6" className="fill-brand-deep" />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[0.98rem] font-extrabold tracking-tight text-brand-deep">
                Manarat admin
              </span>
              <span className="block text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                Foundation control room
              </span>
            </span>
          </Link>

          <span className="ml-auto hidden rounded-chip bg-brand-wash px-3.5 py-1.5 text-xs font-bold text-brand-deep sm:inline-block">
            {user.email}
          </span>
          <Link
            href="/"
            className="text-xs font-bold text-ink-mute transition-colors hover:text-brand"
          >
            View site ↗
          </Link>
          <form action={signOut}>
            <button className="text-xs font-bold text-ink-mute transition-colors hover:text-brand">
              Sign out
            </button>
          </form>
        </div>

        <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8 sm:py-12">{children}</main>
    </div>
  );
}
