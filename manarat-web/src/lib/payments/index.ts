import { StripeGateway } from "./stripe-gateway";
import type { PaymentGateway } from "./types";

export * from "./types";

/**
 * Every gateway the application knows about, in preference order.
 *
 * Adding a bank API later means writing one adapter and adding it here.
 * Nothing else in the codebase changes.
 */
const GATEWAYS: PaymentGateway[] = [new StripeGateway()];

/** The first configured gateway, or null when none has credentials yet. */
export function activeGateway(): PaymentGateway | null {
  return GATEWAYS.find((g) => g.isConfigured()) ?? null;
}

export function gatewayById(id: string): PaymentGateway | null {
  return GATEWAYS.find((g) => g.id === id) ?? null;
}

/**
 * Whether the site can currently take a payment.
 *
 * The donate page reads this to decide between a live checkout and pledge
 * mode. It never guesses, and it never shows a payment button that cannot work.
 */
export function paymentsEnabled(): boolean {
  return activeGateway() !== null;
}
