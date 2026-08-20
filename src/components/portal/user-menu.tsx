import Link from "next/link";
import { ChevronDown, LogOut, Settings, ShieldCheck, User } from "lucide-react";
import { signOut } from "@/server/actions/auth";
import { switchDemoRoleAction } from "@/server/actions/session";
import type { SessionUser } from "@/server/auth";

/**
 * Account menu.
 *
 * Built on native <details> so it needs no client JavaScript, works before hydration and
 * is keyboard accessible for free. The actions are plain forms posting to Server Actions.
 */
export function UserMenu({ user }: { user: SessionUser }) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <details className="relative [&_summary::-webkit-details-marker]:hidden">
      <summary className="hover:bg-surface flex cursor-pointer list-none items-center gap-2 rounded-full py-1.5 pr-2.5 pl-1.5 transition-colors">
        <span className="bg-ink-600 text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
          {initials || "?"}
        </span>
        <span className="hidden text-sm font-medium sm:block">{user.name}</span>
        <ChevronDown className="text-muted-foreground size-4" aria-hidden="true" />
      </summary>

      <div className="border-border bg-surface-raised absolute right-0 z-50 mt-2 w-64 rounded-xl border p-1.5 shadow-lg">
        <div className="border-border border-b px-3 py-2.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
        </div>

        <Link
          href="/portal"
          className="hover:bg-surface flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <User className="size-4" />
          My applications
        </Link>
        <Link
          href="/portal/account"
          className="hover:bg-surface flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm"
        >
          <Settings className="size-4" />
          Account settings
        </Link>

        {user.isDemo && (
          <form
            action={switchDemoRoleAction}
            className="border-border mt-1.5 border-t pt-1.5"
          >
            <input
              type="hidden"
              name="role"
              value={user.role === "customer" ? "admin" : "customer"}
            />
            <button
              type="submit"
              className="hover:bg-surface flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm"
            >
              <ShieldCheck className="size-4" />
              {user.role === "customer"
                ? "Switch to the staff console"
                : "Switch to the customer portal"}
            </button>
          </form>
        )}

        <form action={signOut} className="border-border mt-1.5 border-t pt-1.5">
          <button
            type="submit"
            className="hover:bg-surface text-danger-600 dark:text-danger-500 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
