import "server-only";
import { cookies } from "next/headers";
import { features, env } from "@/server/env";
import { DEMO_USER_ID } from "@/server/repositories/seed";

/**
 * Session resolution.
 *
 * With Supabase configured, the session comes from the Supabase auth cookie. Without it,
 * the app runs in demo mode against a fixed local user so the portal and admin console are
 * fully explorable on a laptop with no accounts.
 *
 * Demo mode is deliberately loud: `isDemo` is surfaced in the UI on every authenticated
 * page, so it is never possible to mistake seeded data for real customer data.
 */

export type Role = "customer" | "staff" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isDemo: boolean;
}

const DEMO_CUSTOMER: SessionUser = {
  id: DEMO_USER_ID,
  email: "amina@example.com",
  name: "Amina Yusuf",
  role: "customer",
  isDemo: true,
};

const DEMO_ADMIN: SessionUser = {
  id: "demo-admin-1",
  email: "ops@example.com",
  name: "Operations (demo)",
  role: "admin",
  isDemo: true,
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!features.database) {
    // Demo mode. A cookie lets you flip between the two consoles while exploring.
    const store = await cookies();
    return store.get("maqam-demo-role")?.value === "admin" ? DEMO_ADMIN : DEMO_CUSTOMER;
  }

  const { createServerClient } = await import("@supabase/ssr");
  const store = await cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (items) => {
          // Server Components cannot set cookies; middleware refreshes the session instead.
          try {
            for (const item of items) {
              store.set(item.name, item.value, item.options);
            }
          } catch {
            /* no-op in a Server Component render */
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const role = (user.app_metadata?.role as Role | undefined) ?? "customer";

  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "",
    role,
    isDemo: false,
  };
}

/** Throws if there is no session. Use at the top of every authenticated page. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

/**
 * Throws unless the session holds a staff or admin role.
 *
 * In demo mode there is no authentication at all, so this resolves to the demo operator
 * rather than refusing: the console has to be explorable on a fresh checkout, and the
 * demo banner makes it unmistakable that none of the data is real. The moment Supabase
 * is configured, this becomes a genuine role check with no special case.
 */
export async function requireStaff(): Promise<SessionUser> {
  if (!features.database) return DEMO_ADMIN;

  const user = await requireUser();
  if (user.role !== "staff" && user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
