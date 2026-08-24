"use server";

import { z } from "zod";
import { createLead } from "@/lib/data";

/** Saudi mobile: 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX all accepted. */
const saudiMobile = /^(?:\+?966|0)?5\d{8}$/;

const schema = z.object({
  customer_name: z.string().trim().min(2),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => saudiMobile.test(v)),
  service_slug: z.string().trim().min(1),
  district_slug: z.string().trim().optional(),
  address: z.string().trim().optional(),
  notes: z.string().trim().max(2000).optional(),
  preferred_provider_slug: z.string().trim().optional(),
});

export interface RequestState {
  status: "idle" | "success" | "error";
  /** Increments per submission; the form keys off it to remount cleanly. */
  attempt?: number;
  ref?: string;
  persisted?: boolean;
  fieldErrors?: Partial<Record<"customer_name" | "phone" | "service_slug", true>>;
  message?: string;
}

export async function submitRequest(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const parsed = schema.safeParse({
    customer_name: formData.get("customer_name"),
    phone: formData.get("phone"),
    service_slug: formData.get("service_slug"),
    district_slug: formData.get("district_slug") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
    preferred_provider_slug: formData.get("preferred_provider_slug") || undefined,
  });

  const attempt = (_prev.attempt ?? 0) + 1;

  if (!parsed.success) {
    const fieldErrors: RequestState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "customer_name" || key === "phone" || key === "service_slug") {
        fieldErrors[key] = true;
      }
    }
    return { status: "error", attempt, fieldErrors };
  }

  const result = await createLead(parsed.data);

  if (!result.ok) {
    return { status: "error", attempt, message: result.error };
  }

  // `persisted` is surfaced to the user: while no database is connected the
  // form still works, but it must not pretend the lead was stored.
  return { status: "success", attempt, ref: result.ref, persisted: result.persisted };
}
