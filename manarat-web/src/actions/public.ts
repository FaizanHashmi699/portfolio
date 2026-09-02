"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findGivingOption } from "@/lib/giving";

export interface ActionResult {
  ok: boolean;
  message: string;
  reference?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Newsletter signup — the only owned channel to a supporter. */
export async function subscribe(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const email = str(form, "email").toLowerCase();
  const name = str(form, "name") || null;

  if (!EMAIL.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").insert({ email, name, unsubscribed: false });

  // A duplicate means they are already on the list — not an error worth showing.
  if (error && error.code !== "23505") {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  return { ok: true, message: "Thank you — you are on the list." };
}

/** Programme enquiry — replaces the phone call currently needed to learn basic details. */
export async function submitEnquiry(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const parent_name = str(form, "parent_name");
  const email = str(form, "email").toLowerCase();
  const phone = str(form, "phone") || null;
  const child_name = str(form, "child_name") || null;
  const ageRaw = str(form, "child_age");
  const child_age = ageRaw ? Number(ageRaw) : null;
  const message = str(form, "message") || null;
  const programme_id = str(form, "programme_id") || null;

  if (!parent_name) return { ok: false, message: "Please tell us your name." };
  if (!EMAIL.test(email)) return { ok: false, message: "Please enter a valid email address." };
  if (child_age !== null && (Number.isNaN(child_age) || child_age < 3 || child_age > 25)) {
    return { ok: false, message: "Please enter an age between 3 and 25." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert({
    programme_id,
    parent_name,
    email,
    phone,
    child_name,
    child_age,
    message,
    status: "new",
  });

  if (error) return { ok: false, message: "Something went wrong. Please try again." };

  return { ok: true, message: "Thank you. We will be in touch within a few days, insha'Allah." };
}

/**
 * Record a donation.
 *
 * Payment collection is intentionally not wired up: no card is taken and no
 * money moves. The row is stored as `pending` so that when Stripe keys are
 * added the same record can be advanced to `paid` by the webhook.
 */
export async function recordDonation(
  _prev: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const amountRaw = str(form, "amount_pounds");
  const amount = Number(amountRaw);
  const frequency = str(form, "frequency") === "monthly" ? "monthly" : "one_off";
  const donor_name = str(form, "donor_name") || null;
  const donor_email = str(form, "donor_email").toLowerCase() || null;
  const donor_postcode = str(form, "donor_postcode") || null;
  const gift_aid = form.get("gift_aid") === "on";
  const campaign_id = str(form, "campaign_id") || null;

  // The giving category the donor picked on the homepage. Kept with the
  // message so the treasurer can see what a gift was given as; the value is
  // matched against our own list rather than trusted from the query string.
  const designation = findGivingOption(str(form, "designation"))?.label ?? null;
  const note = str(form, "message") || null;
  const message = designation
    ? `[${designation}]${note ? ` ${note}` : ""}`
    : note;

  if (!amountRaw || Number.isNaN(amount) || amount < 1) {
    return { ok: false, message: "Please choose an amount of £1 or more." };
  }
  if (amount > 100000) {
    return { ok: false, message: "For gifts above £100,000 please contact us directly." };
  }
  if (donor_email && !EMAIL.test(donor_email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (gift_aid && (!donor_name || !donor_postcode)) {
    return { ok: false, message: "Gift Aid needs your name and postcode to be claimed." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations")
    .insert({
      campaign_id,
      amount_pence: Math.round(amount * 100),
      frequency,
      donor_name,
      donor_email,
      donor_postcode,
      gift_aid,
      message,
      status: "pending",
    })
    .select("reference")
    .single();

  if (error || !data) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/appeal");
  return { ok: true, message: "Pledge recorded.", reference: data.reference as string };
}
