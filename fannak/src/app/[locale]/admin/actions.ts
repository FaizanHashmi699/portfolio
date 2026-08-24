"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdmin, signInAdmin, signOut } from "@/lib/auth";
import {
  addCredits,
  assignLead,
  createPartner,
  getPartner,
  listLeads,
  logMessage,
} from "@/lib/store";
import { verifyCommercialRegistration } from "@/lib/wathq";
import { isWhatsappConfigured, sendTemplate, whatsappLink } from "@/lib/whatsapp";

export interface ActionState {
  status: "idle" | "ok" | "error";
  message?: string;
  detail?: string;
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("not authorised");
}

/* ------------------------------------------------------------------ */
/* Sign in / out                                                       */
/* ------------------------------------------------------------------ */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const key = String(formData.get("key") ?? "");
  const ok = await signInAdmin(key);
  return ok
    ? { status: "ok" }
    : { status: "error", message: "invalid_key" };
}

export async function logoutAction(): Promise<void> {
  await signOut();
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ */
/* Partners                                                            */
/* ------------------------------------------------------------------ */

const partnerSchema = z.object({
  name_ar: z.string().trim().min(2),
  name_en: z.string().trim().min(2),
  phone: z.string().trim().optional(),
  cr_number: z.string().trim().optional(),
  service_slugs: z.array(z.string()).default([]),
  district_slugs: z.array(z.string()).default([]),
});

export async function createPartnerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = partnerSchema.safeParse({
    name_ar: formData.get("name_ar"),
    name_en: formData.get("name_en"),
    phone: formData.get("phone") || undefined,
    cr_number: formData.get("cr_number") || undefined,
    service_slugs: formData.getAll("service_slugs").map(String),
    district_slugs: formData.getAll("district_slugs").map(String),
  });

  if (!parsed.success) {
    return { status: "error", message: "invalid_partner" };
  }

  // Verification is attempted, never assumed. A provider is only marked
  // verified when Wathq actually confirms an active registration.
  let verifiedAt: string | null = null;
  let detail: string | undefined;

  if (parsed.data.cr_number) {
    const result = await verifyCommercialRegistration(parsed.data.cr_number);
    if (result.ok && result.isActive) {
      verifiedAt = new Date().toISOString();
      detail = `wathq_verified:${result.name ?? parsed.data.cr_number}`;
    } else {
      detail = `wathq_unverified:${result.error ?? result.status ?? "not active"}`;
    }
  }

  const created = await createPartner({ ...parsed.data, cr_verified_at: verifiedAt });
  if (!created.ok) return { status: "error", message: created.error };

  revalidatePath("/[locale]/admin/partners", "page");
  return { status: "ok", message: "partner_created", detail };
}

const creditsSchema = z.object({
  tenant_id: z.string().min(1),
  credits: z.coerce.number().int().positive(),
  ref: z.string().trim().optional(),
});

export async function addCreditsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = creditsSchema.safeParse({
    tenant_id: formData.get("tenant_id"),
    credits: formData.get("credits"),
    ref: formData.get("ref") || undefined,
  });

  if (!parsed.success) return { status: "error", message: "invalid_credits" };

  const result = await addCredits(
    parsed.data.tenant_id,
    parsed.data.credits,
    "bank_transfer",
    parsed.data.ref,
  );
  if (!result.ok) return { status: "error", message: result.error };

  revalidatePath("/[locale]/admin/partners", "page");
  return { status: "ok", message: "credits_added", detail: String(result.value) };
}

/* ------------------------------------------------------------------ */
/* Assignment — the core operator action                               */
/* ------------------------------------------------------------------ */

export async function assignLeadAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const leadId = String(formData.get("lead_id") ?? "");
  const tenantId = String(formData.get("tenant_id") ?? "");
  const credits = Number(formData.get("credits") ?? 1);

  if (!leadId || !tenantId) return { status: "error", message: "missing_fields" };

  // Charge first. If the partner cannot pay for the lead, nothing is sent —
  // the debit and the assignment are one transaction in the database.
  const assigned = await assignLead(leadId, tenantId, credits);
  if (!assigned.ok) return { status: "error", message: assigned.error };

  const [partner, leads] = await Promise.all([getPartner(tenantId), listLeads()]);
  const lead = leads.find((l) => l.id === leadId);
  const recipient = partner?.phone ?? "";

  // Notify. A failed send is logged and surfaced, never swallowed: the
  // partner has already been charged, so the operator must know to follow up.
  if (recipient && isWhatsappConfigured) {
    const sent = await sendTemplate(
      recipient,
      process.env.WHATSAPP_TEMPLATE_NEW_LEAD ?? "fannak_new_lead",
      [lead?.customer_name ?? "", lead?.ref ?? "", lead?.phone ?? ""],
    );
    await logMessage({
      tenant_id: tenantId,
      lead_id: leadId,
      recipient,
      template: process.env.WHATSAPP_TEMPLATE_NEW_LEAD ?? "fannak_new_lead",
      status: sent.ok ? "sent" : "failed",
      error: sent.error,
    });
    if (!sent.ok) {
      return { status: "error", message: "assigned_but_not_sent", detail: sent.error };
    }
  } else {
    // No WhatsApp API yet: log the intent and hand the operator a click-to-chat
    // link so the lead still reaches the partner today.
    await logMessage({
      tenant_id: tenantId,
      lead_id: leadId,
      recipient: recipient || "unknown",
      template: "manual",
      status: "queued",
      error: recipient ? undefined : "partner has no phone number",
    });
    const text = `طلب جديد ${lead?.ref ?? ""} — ${lead?.customer_name ?? ""} — ${lead?.phone ?? ""}`;
    return {
      status: "ok",
      message: "assigned_manual",
      detail: recipient ? whatsappLink(recipient, text) : undefined,
    };
  }

  revalidatePath("/[locale]/admin/leads", "page");
  return { status: "ok", message: "assigned" };
}
