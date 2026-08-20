"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getRepositories } from "@/server/repositories";
import { requireUser, requireStaff } from "@/server/auth";
import { getService, services } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import { validateDocuments } from "@/domain/documents/validation";
import type { DocumentKind, DocumentRecord } from "@/domain/documents/types";
import { createUploadTarget, validateUpload } from "@/server/services/storage";
import { rateLimit } from "@/server/services/rate-limit";
import { sendEmail } from "@/server/services/email";
import { brand } from "@/config/brand";

export interface PortalState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
}

const serviceSlugs = services.map((s) => s.slug) as [string, ...string[]];

const DOCUMENT_KINDS = [
  "passport",
  "photo",
  "emirates-id",
  "degree",
  "marriage-certificate",
  "birth-certificate",
  "salary-certificate",
  "bank-statement",
  "employment-offer",
  "tenancy-ejari",
  "title-deed",
  "insurance",
  "other",
] as const satisfies readonly DocumentKind[];

/** Human-readable, sortable reference. Sequence comes from a random suffix in demo. */
function newReference(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `MQ-${year}-${suffix}`;
}

// ── Starting an application ────────────────────────────────────────────────

const startSchema = z.object({
  serviceSlug: z.enum(serviceSlugs),
  applicantName: z
    .string()
    .trim()
    .min(2, "Enter the applicant's full name as it appears on their passport")
    .max(120)
    .regex(/^[^<>]*$/, "Please use letters only"),
  applicantEmail: z.string().trim().email("Enter a valid email address").max(254),
  speed: z.enum(["standard", "express"]).default("standard"),
  applicants: z.coerce.number().int().min(1).max(50).default(1),
});

export async function startApplication(
  _previous: PortalState,
  formData: FormData,
): Promise<PortalState> {
  const user = await requireUser();

  const parsed = startSchema.safeParse({
    serviceSlug: formData.get("serviceSlug"),
    applicantName: formData.get("applicantName"),
    applicantEmail: formData.get("applicantEmail"),
    speed: formData.get("speed") ?? "standard",
    applicants: formData.get("applicants") ?? 1,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const service = getService(parsed.data.serviceSlug);
  if (!service) return { status: "error", message: "That service no longer exists." };

  // The quote is computed server-side from the catalog, never accepted from the client.
  // A price the browser can influence is not a price.
  const quote = buildQuote(service, {
    speed: parsed.data.speed,
    applicants: parsed.data.applicants,
  });

  const { applications, notifications, audit } = await getRepositories();

  const application = await applications.create({
    reference: newReference(),
    userId: user.id,
    serviceSlug: service.slug,
    status: "documents-pending",
    applicantName: parsed.data.applicantName,
    applicantEmail: parsed.data.applicantEmail,
    quotedTotal: quote.total,
    currentStage: 0,
  });

  await notifications.create({
    userId: user.id,
    title: `${service.name} started`,
    body: `Reference ${application.reference}. Upload your documents and we'll check them before anything is submitted.`,
    href: `/portal/applications/${application.id}`,
    kind: "status",
  });

  await audit.record({
    actorId: user.id,
    action: "application.created",
    subject: application.id,
    detail: service.slug,
  });

  await sendEmail({
    to: parsed.data.applicantEmail,
    subject: `${brand.name}: ${service.name} started (${application.reference})`,
    text: [
      `Your application has been created.`,
      ``,
      `Reference: ${application.reference}`,
      `Service: ${service.name}`,
      `Quoted total: AED ${quote.total.toLocaleString()} including VAT`,
      ``,
      `Next step: upload your documents. We check them against the same criteria the`,
      `authorities apply, before any government fee is spent.`,
      ``,
      `This is not an approval, and no visa outcome can be guaranteed.`,
      ``,
      `— ${brand.name}`,
    ].join("\n"),
  });

  revalidatePath("/portal");
  redirect(`/portal/applications/${application.id}`);
}

// ── Documents ──────────────────────────────────────────────────────────────

const uploadTargetSchema = z.object({
  applicationId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  size: z.coerce.number().int().min(1),
  contentType: z.string().min(1).max(120),
});

/** Step one of an upload: authorise, then mint a direct-to-storage target. */
export async function prepareDocumentUpload(input: {
  applicationId: string;
  fileName: string;
  size: number;
  contentType: string;
}): Promise<
  | { ok: true; path: string; uploadUrl?: string; token?: string }
  | { ok: false; reason: string }
> {
  const user = await requireUser();

  const parsed = uploadTargetSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, reason: "That upload request wasn't valid." };

  const check = validateUpload({
    size: parsed.data.size,
    type: parsed.data.contentType,
  });
  if (!check.ok) return { ok: false, reason: check.reason };

  const { applications } = await getRepositories();
  const application = await applications.get(parsed.data.applicationId);
  if (!application || application.userId !== user.id) {
    return { ok: false, reason: "That application could not be found." };
  }

  const target = await createUploadTarget(
    user.id,
    application.id,
    parsed.data.fileName,
  );

  return {
    ok: true,
    path: target.path,
    uploadUrl: target.uploadUrl,
    token: target.token,
  };
}

const attachSchema = z.object({
  applicationId: z.string().min(1),
  kind: z.enum(DOCUMENT_KINDS),
  fileName: z.string().min(1).max(255),
  storagePath: z.string().min(1).max(512),
  sizeBytes: z.coerce.number().int().min(0),
  mimeType: z.string().min(1).max(120),
  fullName: z.string().trim().max(160).optional().or(z.literal("")),
  expiryDate: z.string().trim().max(20).optional().or(z.literal("")),
  issueDate: z.string().trim().max(20).optional().or(z.literal("")),
  documentNumber: z.string().trim().max(60).optional().or(z.literal("")),
  attestationStamps: z.string().max(200).optional().or(z.literal("")),
  backgroundIsWhite: z.string().optional(),
  blankPages: z.string().optional(),
});

/** Step two: record the document and run validation against it immediately. */
export async function attachDocument(
  _previous: PortalState,
  formData: FormData,
): Promise<PortalState> {
  const user = await requireUser();

  const limit = rateLimit(`attach:${user.id}`, { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many uploads at once. Please pause a moment.",
    };
  }

  const parsed = attachSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { applications, notifications, audit } = await getRepositories();
  const application = await applications.get(parsed.data.applicationId);
  if (!application || application.userId !== user.id) {
    return { status: "error", message: "That application could not be found." };
  }

  const stamps = parsed.data.attestationStamps
    ? parsed.data.attestationStamps
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const document: DocumentRecord = {
    id: randomUUID(),
    kind: parsed.data.kind,
    fileName: parsed.data.fileName,
    uploadedAt: new Date().toISOString(),
    sizeBytes: parsed.data.sizeBytes,
    mimeType: parsed.data.mimeType,
    storagePath: parsed.data.storagePath,
    fields: {
      fullName: parsed.data.fullName || undefined,
      expiryDate: parsed.data.expiryDate || undefined,
      issueDate: parsed.data.issueDate || undefined,
      documentNumber: parsed.data.documentNumber || undefined,
      attestationStamps: stamps,
      backgroundIsWhite:
        parsed.data.backgroundIsWhite === undefined
          ? undefined
          : parsed.data.backgroundIsWhite === "yes",
      blankPages: parsed.data.blankPages ? Number(parsed.data.blankPages) : undefined,
    },
  };

  const updated = await applications.addDocument(application.id, document);
  if (!updated) return { status: "error", message: "Couldn't attach that document." };

  const service = getService(updated.serviceSlug);
  const risk = validateDocuments(updated.documents, {
    requirements: service?.documents,
  });

  await audit.record({
    actorId: user.id,
    action: "document.uploaded",
    subject: application.id,
    detail: `${document.kind} (${document.fileName})`,
  });

  // Tell the customer immediately if this specific document has a problem. Discovering it
  // now is the entire point — after submission it costs a government fee.
  const issues = risk.findings.filter((f) => f.documentId === document.id);
  if (issues.length > 0) {
    await notifications.create({
      userId: user.id,
      title: `${issues.length} issue${issues.length === 1 ? "" : "s"} found in ${document.fileName}`,
      body: issues[0].message,
      href: `/portal/applications/${application.id}`,
      kind: "document",
    });
  }

  revalidatePath(`/portal/applications/${application.id}`);
  revalidatePath("/portal/documents");

  return {
    status: "success",
    message:
      issues.length === 0
        ? "Uploaded and checked — nothing flagged on this document."
        : `Uploaded. We found ${issues.length} issue${issues.length === 1 ? "" : "s"} to fix, listed below.`,
  };
}

// ── Messages ───────────────────────────────────────────────────────────────

const messageSchema = z.object({
  applicationId: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(2, "Write a message first")
    .max(4000, "Please keep messages under 4000 characters"),
});

export async function sendMessage(
  _previous: PortalState,
  formData: FormData,
): Promise<PortalState> {
  const user = await requireUser();

  const limit = rateLimit(`message:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    return { status: "error", message: "Slow down a moment, then try again." };
  }

  const parsed = messageSchema.safeParse({
    applicationId: formData.get("applicationId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.flatten().fieldErrors.body?.[0] ?? "Couldn't send that.",
    };
  }

  const { applications, messages, notifications } = await getRepositories();
  const application = await applications.get(parsed.data.applicationId);
  if (!application)
    return { status: "error", message: "That application no longer exists." };

  const staff = user.role === "staff" || user.role === "admin";
  if (!staff && application.userId !== user.id) {
    return { status: "error", message: "That application could not be found." };
  }

  await messages.create({
    applicationId: application.id,
    authorId: user.id,
    authorName: user.name,
    authorRole: staff ? "staff" : "customer",
    body: parsed.data.body,
    readByCustomer: !staff,
    readByStaff: staff,
  });

  if (staff) {
    await notifications.create({
      userId: application.userId,
      title: `New message about ${application.reference}`,
      body: parsed.data.body.slice(0, 140),
      href: `/portal/applications/${application.id}`,
      kind: "message",
    });
  }

  revalidatePath(`/portal/applications/${application.id}`);
  revalidatePath(`/admin/applications/${application.id}`);

  return { status: "success" };
}

// ── Notifications ──────────────────────────────────────────────────────────

export async function markNotificationsRead(): Promise<void> {
  const user = await requireUser();
  const { notifications } = await getRepositories();
  await notifications.markAllRead(user.id);
  revalidatePath("/portal", "layout");
}

// ── Invoices (staff) ───────────────────────────────────────────────────────

const invoiceStatusSchema = z.object({
  invoiceId: z.string().min(1),
  status: z.enum(["draft", "sent", "paid", "overdue", "void"]),
});

export async function updateInvoiceStatus(
  _previous: PortalState,
  formData: FormData,
): Promise<PortalState> {
  const staff = await requireStaff();

  const parsed = invoiceStatusSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { status: "error", message: "Invalid invoice update." };

  const { invoices, audit, notifications } = await getRepositories();
  const invoice = await invoices.updateStatus(
    parsed.data.invoiceId,
    parsed.data.status,
  );
  if (!invoice) return { status: "error", message: "That invoice no longer exists." };

  await audit.record({
    actorId: staff.id,
    action: "invoice.status_changed",
    subject: invoice.id,
    detail: `→ ${parsed.data.status}`,
  });

  if (parsed.data.status === "paid") {
    await notifications.create({
      userId: invoice.userId,
      title: `Payment received for ${invoice.reference}`,
      body: invoice.description,
      href: "/portal/invoices",
      kind: "invoice",
    });
  }

  revalidatePath("/admin/applications");
  revalidatePath("/portal/invoices");

  return { status: "success", message: `Invoice marked ${parsed.data.status}.` };
}
