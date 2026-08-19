import "server-only";
import { features } from "@/server/env";
import type { Repositories } from "./types";
import { inMemoryApplications, inMemoryAudit, inMemoryLeads } from "./in-memory";

/**
 * Repository selection.
 *
 * The single place in the application that knows whether we are running against Supabase
 * or against the seeded in-memory store. Everything above this line codes against the
 * interfaces in ./types and is oblivious to the difference.
 */

let cached: Repositories | null = null;

export async function getRepositories(): Promise<Repositories> {
  if (cached) return cached;

  if (features.database) {
    // Imported lazily so the Supabase client never enters the bundle when unused.
    const supabase = await import("./supabase");
    cached = {
      leads: supabase.supabaseLeads,
      applications: supabase.supabaseApplications,
      audit: supabase.supabaseAudit,
      driver: "supabase",
    };
    return cached;
  }

  cached = {
    leads: inMemoryLeads,
    applications: inMemoryApplications,
    audit: inMemoryAudit,
    driver: "in-memory",
  };
  return cached;
}

/** Test helper: forces re-selection after environment changes. */
export function resetRepositoryCache(): void {
  cached = null;
}

export type { Repositories } from "./types";
