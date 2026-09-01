import type {
  CheckoutRequest,
  CheckoutSession,
  GatewayEvent,
  PaymentGateway,
} from "./types";
import { PaymentGatewayError, PaymentNotConfiguredError } from "./types";

/**
 * Stripe adapter.
 *
 * Talks to Stripe's REST API directly rather than pulling in the SDK, so the
 * serverless bundle stays small and there is no dependency to keep patched.
 *
 * Credentials come from the environment and are read only on the server:
 *   STRIPE_SECRET_KEY      sk_live_… or sk_test_…
 *   STRIPE_WEBHOOK_SECRET  whsec_…
 *
 * Neither is ever sent to the browser.
 */
export class StripeGateway implements PaymentGateway {
  readonly id = "stripe";
  readonly label = "Card, Apple Pay & Google Pay";

  private get secretKey(): string | undefined {
    return process.env.STRIPE_SECRET_KEY;
  }

  private get webhookSecret(): string | undefined {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }

  isConfigured(): boolean {
    return Boolean(this.secretKey && this.webhookSecret);
  }

  supportsRecurring(): boolean {
    return true;
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const key = this.secretKey;
    if (!key) throw new PaymentNotConfiguredError("Stripe");

    const recurring = req.frequency === "monthly";

    // Stripe takes form-encoded bodies with bracketed nesting.
    const form = new URLSearchParams();
    form.set("mode", recurring ? "subscription" : "payment");
    form.set("success_url", req.successUrl);
    form.set("cancel_url", req.cancelUrl);
    form.set("client_reference_id", req.reference);
    form.set("line_items[0][quantity]", "1");
    form.set("line_items[0][price_data][currency]", req.currency.toLowerCase());
    form.set("line_items[0][price_data][unit_amount]", String(req.amountPence));
    form.set("line_items[0][price_data][product_data][name]", req.description);
    if (recurring) {
      form.set("line_items[0][price_data][recurring][interval]", "month");
    }

    // Echoed back on the webhook so we can match the donation row.
    form.set("metadata[reference]", req.reference);
    form.set("metadata[gift_aid]", req.giftAid ? "yes" : "no");
    if (req.campaignId) form.set("metadata[campaign_id]", req.campaignId);
    if (req.donorEmail) form.set("customer_email", req.donorEmail);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
        // Replaying the same reference cannot create a second charge.
        "Idempotency-Key": req.reference,
      },
      body: form,
    });

    const body = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };

    if (!res.ok || !body.url || !body.id) {
      throw new PaymentGatewayError(
        body.error?.message ?? `Stripe returned ${res.status}`,
        body,
      );
    }

    return { url: body.url, providerRef: body.id };
  }

  async verifyWebhook(rawBody: string, signature: string | null): Promise<GatewayEvent> {
    const secret = this.webhookSecret;
    if (!secret) throw new PaymentNotConfiguredError("Stripe");
    if (!signature) throw new PaymentGatewayError("Missing Stripe-Signature header.");

    await this.assertSignature(rawBody, signature, secret);

    const event = JSON.parse(rawBody) as {
      id: string;
      type: string;
      data: { object: Record<string, unknown> };
    };

    const obj = event.data.object;
    const metadata = (obj.metadata ?? {}) as Record<string, string>;
    const reference =
      metadata.reference ?? (typeof obj.client_reference_id === "string" ? obj.client_reference_id : null);

    const amount =
      typeof obj.amount_total === "number"
        ? obj.amount_total
        : typeof obj.amount_paid === "number"
          ? obj.amount_paid
          : null;

    const map: Record<string, GatewayEvent["type"]> = {
      "checkout.session.completed": "paid",
      "checkout.session.async_payment_succeeded": "paid",
      "invoice.paid": "paid",
      "checkout.session.async_payment_failed": "failed",
      "invoice.payment_failed": "failed",
      "checkout.session.expired": "cancelled",
      "charge.refunded": "refunded",
    };

    return {
      id: event.id,
      type: map[event.type] ?? "ignored",
      providerRef: String(obj.id ?? ""),
      reference,
      amountPence: amount,
      raw: event,
    };
  }

  /**
   * Stripe's signature scheme: HMAC-SHA256 over "<timestamp>.<body>".
   *
   * Uses WebCrypto and a timing-safe comparison, and rejects anything older
   * than five minutes so a captured payload cannot be replayed later.
   */
  private async assertSignature(body: string, header: string, secret: string): Promise<void> {
    const parts = Object.fromEntries(
      header.split(",").map((kv) => {
        const [k, v] = kv.split("=");
        return [k?.trim(), v?.trim()];
      }),
    ) as { t?: string; v1?: string };

    if (!parts.t || !parts.v1) {
      throw new PaymentGatewayError("Malformed Stripe-Signature header.");
    }

    const age = Math.abs(Date.now() / 1000 - Number(parts.t));
    if (!Number.isFinite(age) || age > 300) {
      throw new PaymentGatewayError("Stripe signature timestamp is outside the tolerance window.");
    }

    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const mac = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(`${parts.t}.${body}`));
    const expected = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!timingSafeEqual(expected, parts.v1)) {
      throw new PaymentGatewayError("Stripe signature did not verify.");
    }
  }
}

/** Constant-time string compare, so a bad signature leaks no timing signal. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
