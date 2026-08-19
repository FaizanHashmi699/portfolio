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
