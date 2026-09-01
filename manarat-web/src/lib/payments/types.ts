/**
 * Payment abstraction.
 *
 * Nothing outside this folder knows which provider is in use. Swapping Stripe
 * for a bank API later means writing one new adapter — no changes to the
 * donation form, the service layer, or the database.
 */

export type Currency = "GBP";

export type DonationFrequency = "one_off" | "monthly";

/**
 * The lifecycle of a donation. Only a verified server-side signal may move a
 * donation to "paid" — never a redirect back from the browser.
 */
export type DonationStatus =
  | "pending" // created, no payment attempt yet
  | "processing" // sent to the gateway, awaiting confirmation
  | "paid" // confirmed by webhook or a server-side fetch
  | "failed"
  | "cancelled"
  | "refunded";

export interface CheckoutRequest {
  /** Our own reference. Doubles as the idempotency key. */
  reference: string;
  amountPence: number;
  currency: Currency;
  frequency: DonationFrequency;
  description: string;
  donorName?: string | null;
  donorEmail?: string | null;
  giftAid: boolean;
  campaignId?: string | null;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  /** Where to send the donor to complete payment. */
  url: string;
  /** The provider's own id, stored so webhooks can be matched back. */
  providerRef: string;
}

/** A payment event after the gateway has verified it. */
export interface GatewayEvent {
  id: string;
  type: "paid" | "failed" | "cancelled" | "refunded" | "ignored";
  providerRef: string;
  /** Our reference, echoed back through the gateway's metadata. */
  reference: string | null;
  amountPence: number | null;
  raw: unknown;
}

export class PaymentNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`The ${provider} gateway has no credentials configured.`);
    this.name = "PaymentNotConfiguredError";
  }
}

export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "PaymentGatewayError";
  }
}

/**
 * Every gateway implements exactly this.
 *
 * Deliberately narrow: create a session, verify a webhook. Anything a specific
 * provider needs beyond that stays inside its own adapter.
 */
export interface PaymentGateway {
  readonly id: string;
  readonly label: string;

  /** False when credentials are missing — the UI must then not offer payment. */
  isConfigured(): boolean;

  /** Supports taking a recurring donation, not just a single one. */
  supportsRecurring(): boolean;

  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;

  /**
   * Verify a webhook's signature and normalise it.
   *
   * Must throw if the signature does not verify. An unverified payload is
   * never allowed to change a donation's status.
   */
  verifyWebhook(rawBody: string, signature: string | null): Promise<GatewayEvent>;
}
