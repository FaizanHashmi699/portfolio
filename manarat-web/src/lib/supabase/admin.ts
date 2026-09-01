import "server-only";
import { createClient as createSupabase } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses row-level security, so it is used in exactly
 * one place: the payment webhook, which must be able to mark a donation paid
 * without a logged-in user.
 *
 * Never import this into a Client Component. The "server-only" import above
 * turns that into a build error rather than a leaked key.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createSupabase(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
