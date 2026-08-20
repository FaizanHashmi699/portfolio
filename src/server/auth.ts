import "server-only";
import { cookies } from "next/headers";
import { env, features } from "@/server/env";
import { DEMO_USER_ID } from "@/server/repositories/seed";

/**
 * Session resolution.
 *
 * With Supabase configured this reads the real auth session. Without it, the app runs in
 * demo mode against a fixed local identity so the portal and console are fully explorable
 * on a laptop with no accounts.
 *
 * Demo mode is deliberately signed in by default — requiring a login to see seeded data
 * would be friction with nothing behind it. The sign-in, sign-up and password flows are
 * still fully present and become real the moment Supabase credentials appear; in demo they
 * act as a role switcher. `isDemo` is surfaced on every authenticated page so seeded data
 * can never be mistaken for the real thing.
 */

export type Role = "customer" | "staff" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isDemo: boolean;
}

export const DEMO_ROLE_COOKIE = "maqam-demo-role";
export const DEMO_SIGNED_OUT_COOKIE = "maqam-demo-signed-out";

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

export function demoUserForRole(role: string | undefined): SessionUser {
  return role === "admin" || role === "staff" ? DEMO_ADMIN : DEMO_CUSTOMER;
}

/** Creates a Supabase client bound to the request's cookies. */
export async function getSupabaseServerClient() {
  const { createServerClient } = await import("@supabase/ssr");
  const store = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (items) => {
          // Server Components cannot set cookies. Server Actions and Route Handlers can,
          // which is where sign-in and sign-out run.
          try {
            for (const item of items) {
              store.set(item.name, item.value, item.options);
            }
          } catch {
            /* no-op during a Server Component render */
          }
        },
      },
    },
  );
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();

  if (!features.database) {
    if (store.get(DEMO_SIGNED_OUT_COOKIE)?.value === "1") return null;
    return demoUserForRole(store.get(DEMO_ROLE_COOKIE)?.value);
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // The role is read from the profiles table, never from user-editable metadata —
  // a role a user can set on themselves is not a role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    name:
      (profile?.full_name as string | undefined) ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email ??
      "",
    role: ((profile?.role as Role | undefined) ?? "customer") satisfies Role,
    isDemo: false,
  };
}

/** Returns the session or null. Pages should redirect rather than throw. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

/**
 * Throws unless the session holds a staff or admin role.
 *
 * In demo mode there is no authentication to enforce, so this resolves to the demo
 * operator rather than refusing — the console has to be explorable on a fresh checkout,
 * and the demo banner makes it unmistakable that no data is real. With Supabase
 * configured this becomes a genuine role check with no special case.
 */
export async function requireStaff(): Promise<SessionUser> {
  if (!features.database) {
    const store = await cookies();
    if (store.get(DEMO_SIGNED_OUT_COOKIE)?.value === "1") {
      throw new Error("UNAUTHENTICATED");
    }
    return DEMO_ADMIN;
  }

  const user = await requireUser();
  if (user.role !== "staff" && user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function isStaff(user: SessionUser | null): boolean {
  return user?.role === "staff" || user?.role === "admin";
}
