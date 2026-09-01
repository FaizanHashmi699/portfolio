import { NextResponse } from "next/server";
import { gatewayById } from "@/lib/payments";
import { applyGatewayEvent } from "@/lib/payments/service";

export const runtime = "nodejs";
// The raw body is required for signature verification, so this route must
// never be cached or statically optimised.
export const dynamic = "force-dynamic";

/**
 * Stripe webhook.
 *
 * This is the only path that can mark a donation paid. The signature is
 * verified before the payload is parsed, and an unverified body is discarded.
 */
export async function POST(request: Request) {
  const gateway = gatewayById("stripe");
  if (!gateway || !gateway.isConfigured()) {
    return NextResponse.json({ error: "Gateway not configured." }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = await gateway.verifyWebhook(raw, signature);
  } catch (err) {
    // 400, not 500 — Stripe should not retry a payload that will never verify.
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signature verification failed." },
      { status: 400 },
    );
  }

  try {
    const result = await applyGatewayEvent("stripe", event);
    // Always 200 once verified, so Stripe stops retrying. The outcome is in
    // the payment_events log either way.
    return NextResponse.json({ received: true, ...result });
  } catch {
    // A genuine server fault — let Stripe retry this one.
    return NextResponse.json({ error: "Could not process event." }, { status: 500 });
  }
}
