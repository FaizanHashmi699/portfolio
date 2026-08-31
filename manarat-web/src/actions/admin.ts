"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AdminResult {
  ok: boolean;
  message: string;
}

function str(f: FormData, k: string): string {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
}
function num(f: FormData, k: string, fallback = 0): number {
  const n = Number(str(f, k));
  return Number.isFinite(n) ? n : fallback;
}
function bool(f: FormData, k: string): boolean {
  return f.get(k) === "on" || f.get(k) === "true";
}

/** True when the signed-in user is on the admins table. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("*").eq("id", user.id).maybeSingle();
  return { supabase, user, admin };
}

export async function signIn(_prev: AdminResult | null, form: FormData): Promise<AdminResult> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  if (!email || !password) return { ok: false, message: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ---------------- programmes ---------------- */

export async function saveProgramme(_prev: AdminResult | null, form: FormData): Promise<AdminResult> {
  const supabase = await createClient();
  const id = str(form, "id");

  const payload = {
    slug: str(form, "slug"),
    title: str(form, "title"),
    summary: str(form, "summary"),
    body: str(form, "body") || null,
    age_range: str(form, "age_range") || null,
    schedule: str(form, "schedule") || null,
    fee_text: str(form, "fee_text") || null,
    teacher_note: str(form, "teacher_note") || null,
    sort_order: num(form, "sort_order"),
    published: bool(form, "published"),
  };

  if (!payload.slug || !payload.title || !payload.summary) {
    return { ok: false, message: "Slug, title and summary are required." };
  }

  const { error } = id
    ? await supabase.from("programmes").update(payload).eq("id", id)
    : await supabase.from("programmes").insert(payload);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/programmes");
  revalidatePath("/programmes");
  revalidatePath("/");
  return { ok: true, message: id ? "Programme updated." : "Programme created." };
}

export async function deleteProgramme(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("programmes").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/programmes");
  revalidatePath("/programmes");
}

/* ---------------- campaigns ---------------- */

export async function saveCampaign(_prev: AdminResult | null, form: FormData): Promise<AdminResult> {
  const supabase = await createClient();
  const id = str(form, "id");

  const payload = {
    slug: str(form, "slug"),
    title: str(form, "title"),
    summary: str(form, "summary"),
    body: str(form, "body") || null,
    target_pence: Math.round(num(form, "target_pounds") * 100),
    is_primary: bool(form, "is_primary"),
    published: bool(form, "published"),
  };

  if (!payload.slug || !payload.title || !payload.summary) {
    return { ok: false, message: "Slug, title and summary are required." };
  }

  // Only one appeal can be primary.
  if (payload.is_primary) {
    await supabase.from("campaigns").update({ is_primary: false }).neq("id", id || "00000000-0000-0000-0000-000000000000");
  }

  const { error } = id
    ? await supabase.from("campaigns").update(payload).eq("id", id)
    : await supabase.from("campaigns").insert(payload);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/campaigns");
  revalidatePath("/appeal");
  revalidatePath("/donate");
  revalidatePath("/");
  return { ok: true, message: id ? "Appeal updated." : "Appeal created." };
}

/* ---------------- status updates ---------------- */

export async function setEnquiryStatus(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("enquiries")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

/**
 * Marking a donation paid is what moves the appeal total — the database
 * trigger keeps campaigns.raised_pence in step.
 */
export async function setDonationStatus(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("donations")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/donations");
  revalidatePath("/admin");
  revalidatePath("/appeal");
  revalidatePath("/donate");
  revalidatePath("/");
}

/* ---------------- prayer settings ---------------- */

export async function savePrayerSettings(
  _prev: AdminResult | null,
  form: FormData,
): Promise<AdminResult> {
  const supabase = await createClient();

  const payload = {
    masjid_name: str(form, "masjid_name") || "Manarat Foundation",
    latitude: num(form, "latitude", 52.4569),
    longitude: num(form, "longitude", -1.809),
    timezone: str(form, "timezone") || "Europe/London",
    method: str(form, "method") || "MWL",
    asr_method: str(form, "asr_method") || "standard",
    fajr_offset: num(form, "fajr_offset"),
    dhuhr_offset: num(form, "dhuhr_offset"),
    asr_offset: num(form, "asr_offset"),
    maghrib_offset: num(form, "maghrib_offset"),
    isha_offset: num(form, "isha_offset"),
    jumuah_times: str(form, "jumuah_times") || "13:15, 14:15",
    updated_at: new Date().toISOString(),
  };

  if (Math.abs(payload.latitude) > 90 || Math.abs(payload.longitude) > 180) {
    return { ok: false, message: "Latitude must be within ±90 and longitude within ±180." };
  }

  const { error } = await supabase.from("prayer_settings").update(payload).eq("id", 1);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/prayer-settings");
  revalidatePath("/prayer-times");
  revalidatePath("/");
  return { ok: true, message: "Prayer settings saved. The timetable updates immediately." };
}
