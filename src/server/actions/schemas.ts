import { z } from "zod";
import { services } from "@/domain/catalog/services";

/**
 * Validation schemas for every Server Action boundary.
 *
 * Anything arriving from a client is untrusted, including data our own forms produced —
 * a Server Action is a public HTTP endpoint, and treating it as anything else is how
 * mass-assignment bugs happen. These schemas are the trust boundary.
 */

const serviceSlugs = services.map((s) => s.slug) as [string, ...string[]];

export const emailSchema = z
  .string()
  .trim()
  .min(3, "Please enter your email address")
  .max(254)
  .email("That doesn't look like a valid email address");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your name")
  .max(120)
  // Deny angle brackets outright: nothing legitimate needs them and they are the
  // first thing an injection attempt reaches for.
  .regex(/^[^<>]*$/, "Please use letters only");

export const phoneSchema = z
  .string()
  .trim()
  .max(24)
  .regex(/^[+0-9 ()-]*$/, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""));

export const saveReportSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional().or(z.literal("")),
  serviceSlug: z.enum(serviceSlugs).optional(),
  marketingConsent: z.coerce.boolean().default(false),
  /** Serialised eligibility report. Bounded so a single POST cannot exhaust memory. */
  report: z.string().max(60_000).optional(),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  serviceSlug: z.enum(serviceSlugs).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more — at least 10 characters")
    .max(4000, "Please keep your message under 4000 characters"),
  /** Honeypot. Bots fill every field; humans never see this one. */
  website: z.string().max(0).optional(),
});

export type SaveReportInput = z.infer<typeof saveReportSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
