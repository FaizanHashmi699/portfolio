"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { switchDemoRole } from "./auth";

/** Form-friendly wrapper so the demo role switch can live in a plain <form>. */
export async function switchDemoRoleAction(formData: FormData): Promise<void> {
  const role = formData.get("role") === "admin" ? "admin" : "customer";
  await switchDemoRole(role);
  revalidatePath("/", "layout");
  redirect(role === "admin" ? "/admin" : "/portal");
}
