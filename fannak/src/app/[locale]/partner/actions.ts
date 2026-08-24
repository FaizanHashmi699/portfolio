"use server";

import { revalidatePath } from "next/cache";
import { currentPartnerId } from "@/lib/auth";
import { respondToAssignment } from "@/lib/store";

export interface PartnerActionState {
  status: "idle" | "ok" | "error";
  /** A translation key, never prose. */
  message?: string;
}

export async function respondAction(
  _prev: PartnerActionState,
  formData: FormData,
): Promise<PartnerActionState> {
  const tenantId = await currentPartnerId();
  if (!tenantId) return { status: "error", message: "not_authorised" };

  const assignmentId = String(formData.get("assignment_id") ?? "");
  const action = String(formData.get("response") ?? "") as
    | "accept"
    | "decline"
    | "complete";

  if (!assignmentId || !["accept", "decline", "complete"].includes(action)) {
    return { status: "error", message: "invalid_request" };
  }

  // Scoped to the caller's own tenant, so one partner can never act on
  // another partner's assignment even with a guessed id.
  const result = await respondToAssignment(assignmentId, tenantId, action);
  if (!result.ok) return { status: "error", message: result.code };

  revalidatePath("/[locale]/partner", "page");
  return { status: "ok" };
}
