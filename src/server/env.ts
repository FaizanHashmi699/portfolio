import { z } from "zod";

/**
 * Environment configuration.
 *
 * Every integration is optional by design. The product must run — fully, not in a
 * degraded demo mode — with an empty .env, because that is what makes the repository
 * clonable and reviewable by someone who has no accounts yet.
 *
 * Anything not prefixed NEXT_PUBLIC_ is server-only and must never be imported into a
 * Client Component.
 */

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Supabase. When absent, the in-memory repositories are used instead.
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Anthropic. When absent, AI narration falls back to deterministic templates.
  ANTHROPIC_API_KEY: z.string().min(1).optional(),

  // Resend. When absent, emails are logged to the server console instead of sent.
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Fail loudly at boot rather than mysteriously at request time.
  console.error(
    "Invalid environment configuration:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export const features = {
  /** Persistent storage is available. */
  database: Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  /** Server-side privileged database access is available. */
  serviceRole: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
  /** LLM narration is available. */
  ai: Boolean(env.ANTHROPIC_API_KEY),
  /** Transactional email can actually be delivered. */
  email: Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL),
} as const;
