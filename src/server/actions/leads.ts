"use server";

import { headers } from "next/headers";
import { contactSchema, saveReportSchema } from "./schemas";
import { getRepositories } from "@/server/repositories";
import { rateLimit } from "@/server/services/rate-limit";
import { sendEmail } from "@/server/services/email";
import { brand } from "@/config/brand";
import { getService } from "@/domain/catalog/services";

export interface ActionState {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors, keyed by field name. */
  errors?: Record<string, string[]>;
}

/** Best-effort client identity for rate limiting. Never used for anything else. */
async function clientKey(prefix: string): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return `${prefix}:${ip}`;
}

export async function saveEligibilityReport(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = rateLimit(await clientKey("save-report"), {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return {
      status: "error",
      message: "That's a few too many in a row. Please try again in a minute.",
    };
  }

  const parsed = saveReportSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    serviceSlug: formData.get("serviceSlug") || undefined,
    marketingConsent: formData.get("marketingConsent") === "on",
    report: formData.get("report") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, name, serviceSlug, marketingConsent } = parsed.data;
  const repositories = await getRepositories();

  await repositories.leads.create({
    email,
    name: name || undefined,
    serviceSlug,
    source: "eligibility",
    marketingConsent,
  });

  await sendEmail({
    to: email,
    subject: `Your ${brand.name} eligibility report`,
    text: [
      `Hi${name ? ` ${name}` : ""},`,
      "",
      "Your eligibility report is attached to your account and stays available at any time.",
      serviceSlug
        ? `You looked at: ${getService(serviceSlug)?.name ?? serviceSlug}.`
        : "",
      "",
      "This is a readiness assessment against published criteria. It is not an approval,",
      "and no consultancy can guarantee a visa outcome.",
      "",
      `— ${brand.name}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return {
    status: "success",
    message: "Sent. Check your inbox — your report is on its way.",
  };
}

export async function submitContact(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limit = rateLimit(await clientKey("contact"), { limit: 3, windowMs: 60_000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: "That's a few too many in a row. Please try again in a minute.",
    };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    serviceSlug: formData.get("serviceSlug"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // The honeypot was filled, so this is a bot. Return success so it learns nothing.
  if (parsed.data.website) {
    return { status: "success", message: "Thanks — we'll be in touch shortly." };
  }

  const { name, email, phone, serviceSlug, message } = parsed.data;
  const repositories = await getRepositories();

  await repositories.leads.create({
    email,
    name,
    phone: phone || undefined,
    serviceSlug: serviceSlug || undefined,
    message,
    source: "contact",
  });

  await sendEmail({
    to: brand.email.general,
    subject: `New enquiry from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      serviceSlug ? `Service: ${serviceSlug}` : "",
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return {
    status: "success",
    message: "Thanks — we'll be in touch within one working day.",
  };
}
