"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRepositories } from "@/server/repositories";
import { requireStaff } from "@/server/auth";
import type { ApplicationStatus } from "@/server/repositories/types";

const STATUSES = [
  "draft",
  "documents-pending",
  "in-review",
  "submitted",
  "with-authority",
  "approved",
  "rejected",
  "cancelled",
] as const satisfies readonly ApplicationStatus[];

const updateStatusSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(STATUSES),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(2000),
  actor: z.enum(["customer", "maqam", "government", "system"]).default("maqam"),
});

export interface AdminActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

/**
 * Advance an application's status.
 *
 * Every call authorises the staff role, writes a timeline event the customer can see, and
 * appends an audit entry. The customer-visible event is not optional: a status that
 * changes with no explanation is precisely the opacity this product exists to remove.
 */
export async function updateApplicationStatus(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let staff;
  try {
    staff = await requireStaff();
  } catch {
    return { status: "error", message: "You don't have permission to do that." };
  }

  const parsed = updateStatusSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
    title: formData.get("title"),
    description: formData.get("description"),
    actor: formData.get("actor") ?? "maqam",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please provide a status, a short title and a description.",
    };
  }

  const { applicationId, status, title, description, actor } = parsed.data;
  const { applications, audit } = await getRepositories();

  const updated = await applications.updateStatus(applicationId, status, {
    title,
    description,
    actor,
  });

  if (!updated) {
    return { status: "error", message: "That application no longer exists." };
  }

  await audit.record({
    actorId: staff.id,
    action: "application.status_changed",
    subject: applicationId,
    detail: `→ ${status}`,
  });

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin");
  revalidatePath(`/portal/applications/${applicationId}`);

  return { status: "success", message: `Status updated to ${status}.` };
}

const roleSchema = z.object({
  personId: z.string().min(1),
  role: z.enum(["customer", "staff", "admin"]),
});

/**
 * Change someone's role.
 *
 * Admin-only, and deliberately refuses to let the acting admin change their own role —
 * the realistic failure here is not malice but an admin demoting themselves and locking
 * the console. Every change is audited.
 */
export async function updatePersonRole(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let actor;
  try {
    actor = await requireStaff();
  } catch {
    return { status: "error", message: "You don't have permission to do that." };
  }

  if (actor.role !== "admin") {
    return { status: "error", message: "Only an admin can change roles." };
  }

  const parsed = roleSchema.safeParse({
    personId: formData.get("personId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { status: "error", message: "Invalid role change." };

  if (parsed.data.personId === actor.id) {
    return { status: "error", message: "You can't change your own role." };
  }

  const { people, audit } = await getRepositories();
  const updated = await people.updateRole(parsed.data.personId, parsed.data.role);
  if (!updated) return { status: "error", message: "That person no longer exists." };

  await audit.record({
    actorId: actor.id,
    action: "person.role_changed",
    subject: parsed.data.personId,
    detail: `→ ${parsed.data.role}`,
  });

  revalidatePath("/admin/team");

  return { status: "success", message: "Saved." };
}

const reviewSchema = z.object({
  applicationId: z.string().min(1),
  documentId: z.string().min(1),
  decision: z.enum(["accepted", "rejected"]),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

/**
 * Record a human review of a single document.
 *
 * Automated validation catches the mechanical failures — validity dates, photo spec, name
 * consistency, attestation chains. It cannot tell whether a scan is legible or whether a
 * stamp looks genuine. This is where a person says so, and the customer sees the reason.
 */
export async function reviewDocument(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let staff;
  try {
    staff = await requireStaff();
  } catch {
    return { status: "error", message: "You don't have permission to do that." };
  }

  const parsed = reviewSchema.safeParse({
    applicationId: formData.get("applicationId"),
    documentId: formData.get("documentId"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: "Please choose a decision." };
  }

  if (parsed.data.decision === "rejected" && !parsed.data.note) {
    // Rejecting without a reason is how customers end up in the dark, which is the exact
    // failure mode this product exists to remove.
    return {
      status: "error",
      message:
        "Say why it was rejected — the customer sees this and needs to act on it.",
    };
  }

  const { applications, notifications, audit } = await getRepositories();
  const application = await applications.get(parsed.data.applicationId);
  if (!application)
    return { status: "error", message: "That application no longer exists." };

  const document = application.documents.find((d) => d.id === parsed.data.documentId);
  if (!document) return { status: "error", message: "That document no longer exists." };

  const reviewed = await applications.reviewDocument(
    application.id,
    parsed.data.documentId,
    {
      reviewedAt: new Date().toISOString(),
      reviewedBy: staff.name,
      reviewNote: parsed.data.note || undefined,
      reviewDecision: parsed.data.decision,
    },
  );
  if (!reviewed) return { status: "error", message: "Couldn't record that review." };

  await audit.record({
    actorId: staff.id,
    action: "document.reviewed",
    subject: application.id,
    detail: `${document.fileName} → ${parsed.data.decision}`,
  });

  await notifications.create({
    userId: application.userId,
    title:
      parsed.data.decision === "accepted"
        ? `${document.fileName} accepted`
        : `${document.fileName} needs replacing`,
    body: parsed.data.note || "Reviewed by our team. Open the application for details.",
    href: `/portal/applications/${application.id}`,
    kind: "document",
  });

  revalidatePath(`/admin/applications/${application.id}`);
  revalidatePath(`/portal/applications/${application.id}`);

  return {
    status: "success",
    message: `Recorded as ${parsed.data.decision}. The customer has been told.`,
  };
}
