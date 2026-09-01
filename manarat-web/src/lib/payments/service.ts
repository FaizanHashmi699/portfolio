import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { activeGateway, type GatewayEvent } from "./index";
import type { CheckoutRequest, DonationStatus } from "./types";

/**
 * Donation lifecycle.
 *
 * The one rule this file exists to enforce: a donation becomes "paid" only
 * from a gateway event whose signature has already been verified. Nothing the
 * browser sends can reach this path.
 */

export interface StartCheckoutInput {
  /** The donation's own reference. Everything else is read from the row. */
  reference: string;
  origin: string;
}

export type StartCheckoutResult =
  | { ok: true; url: string }
  | {
      ok: false;
      reason: "not_configured" | "gateway_error" | "storage_error" | "not_found" | "already_paid";
      message: string;
    };

/**
 * Hand an existing pending donation to the gateway and return where to send
 * the donor. The row is moved to "processing" so the admin list distinguishes
 * "abandoned at the payment page" from "never started".
 */
export async function startCheckout(input: StartCheckoutInput): Promise<StartCheckoutResult> {
  const gateway = activeGateway();
  if (!gateway) {
    return {
      ok: false,
      reason: "not_configured",
      message: "No payment gateway is configured yet.",
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      reason: "storage_error",
      message: "The server is missing its database service key.",
    };
  }

  /**
   * Read the donation back from the database. The amount charged comes from
   * here and never from the request body, so a tampered client cannot change
   * what the donor is billed.
   */
  const { data: donation, error: readError } = await admin
    .from("donations")
    .select("amount_pence,frequency,donor_name,donor_email,gift_aid,campaign_id,status")
    .eq("reference", input.reference)
    .maybeSingle();

  if (readError) {
    return { ok: false, reason: "storage_error", message: "Could not read the donation." };
  }
  if (!donation) {
    return { ok: false, reason: "not_found", message: "That donation could not be found." };
  }
  if (donation.status === "paid") {
    return { ok: false, reason: "already_paid", message: "This donation has already been paid." };
  }

  // Look up the appeal name so the donor sees what they are giving to.
  let campaignTitle: string | null = null;
  if (donation.campaign_id) {
    const { data: campaign } = await admin
      .from("campaigns")
      .select("title")
      .eq("id", donation.campaign_id)
      .maybeSingle();
    campaignTitle = campaign?.title ?? null;
  }

  const req: CheckoutRequest = {
    reference: input.reference,
    amountPence: donation.amount_pence,
    currency: "GBP",
    frequency: donation.frequency === "monthly" ? "monthly" : "one_off",
    description: campaignTitle
      ? `${campaignTitle} — Manarat Foundation`
      : "Donation to Manarat Foundation",
    donorName: donation.donor_name,
    donorEmail: donation.donor_email,
    giftAid: Boolean(donation.gift_aid),
    campaignId: donation.campaign_id,
    successUrl: `${input.origin}/donate/thank-you?ref=${encodeURIComponent(input.reference)}`,
    cancelUrl: `${input.origin}/donate?cancelled=${encodeURIComponent(input.reference)}`,
  };

  let session;
  try {
    session = await gateway.createCheckout(req);
  } catch (err) {
    await admin
      .from("donations")
      .update({
        status: "failed" satisfies DonationStatus,
        failure_reason: err instanceof Error ? err.message : "Gateway error",
      })
      .eq("reference", input.reference);

    return {
      ok: false,
      reason: "gateway_error",
      message: "We could not start the payment. Please try again.",
    };
  }

  const { error } = await admin
    .from("donations")
    .update({
      status: "processing" satisfies DonationStatus,
      gateway: gateway.id,
      provider: gateway.id,
      provider_ref: session.providerRef,
      checkout_url: session.url,
    })
    .eq("reference", input.reference);

  if (error) {
    return { ok: false, reason: "storage_error", message: "Could not record the payment attempt." };
  }

  return { ok: true, url: session.url };
}

export type ApplyResult =
  | { applied: true; status: DonationStatus }
  | { applied: false; reason: "duplicate" | "unknown_donation" | "ignored" | "amount_mismatch" };

/**
 * Apply a verified gateway event.
 *
 * Idempotent by construction: the event is inserted into payment_events first,
 * and the unique (gateway, event_id) index makes a replay a no-op. Stripe
 * retries failed webhooks for days, so this matters.
 */
export async function applyGatewayEvent(
  gatewayId: string,
  event: GatewayEvent,
): Promise<ApplyResult> {
  const admin = createAdminClient();
  if (!admin) return { applied: false, reason: "unknown_donation" };

  // 1. Claim the event. A duplicate insert means we have seen it already.
  const { error: claimError } = await admin.from("payment_events").insert({
    gateway: gatewayId,
    event_id: event.id,
    event_type: event.type,
    reference: event.reference,
    provider_ref: event.providerRef,
    amount_pence: event.amountPence,
    payload: event.raw as Record<string, unknown>,
    status: "received",
  });

  if (claimError) {
    // 23505 = unique violation = this webhook has already been processed.
    if (claimError.code === "23505") return { applied: false, reason: "duplicate" };
    throw claimError;
  }

  const finish = async (status: string, extra: Record<string, unknown> = {}) => {
    await admin
      .from("payment_events")
      .update({ status, ...extra })
      .eq("gateway", gatewayId)
      .eq("event_id", event.id);
  };

  if (event.type === "ignored") {
    await finish("ignored");
    return { applied: false, reason: "ignored" };
  }

  // 2. Find the donation, by our reference first and the provider ref second.
  const query = admin.from("donations").select("id,amount_pence,status");
  const { data: donation } = event.reference
    ? await query.eq("reference", event.reference).maybeSingle()
    : await query.eq("provider_ref", event.providerRef).maybeSingle();

  if (!donation) {
    await finish("error", { error: "No matching donation." });
    return { applied: false, reason: "unknown_donation" };
  }

  // 3. Never trust an amount that disagrees with what we recorded.
  if (
    event.type === "paid" &&
    event.amountPence !== null &&
    event.amountPence !== donation.amount_pence
  ) {
    await finish("error", {
      donation_id: donation.id,
      error: `Amount mismatch: gateway ${event.amountPence}, donation ${donation.amount_pence}.`,
    });
    return { applied: false, reason: "amount_mismatch" };
  }

  const status: DonationStatus =
    event.type === "paid"
      ? "paid"
      : event.type === "refunded"
        ? "refunded"
        : event.type === "cancelled"
          ? "cancelled"
          : "failed";

  await admin.from("donations").update({ status }).eq("id", donation.id);
  await finish("applied", { donation_id: donation.id });

  return { applied: true, status };
}
