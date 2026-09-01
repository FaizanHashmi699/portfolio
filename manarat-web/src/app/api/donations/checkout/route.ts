import { NextResponse } from "next/server";
import { startCheckout } from "@/lib/payments/service";
import { paymentsEnabled } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Start a payment for a donation that already exists as "pending".
 *
 * The client sends only a reference — never an amount. The amount is read back
 * from the database, so a tampered request cannot change what is charged.
 */
export async function POST(request: Request) {
  if (!paymentsEnabled()) {
    return NextResponse.json(
      { error: "Card payments are not switched on for this site yet." },
      { status: 503 },
    );
  }

  let body: { reference?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  if (!/^[a-f0-9]{6,64}$/i.test(reference)) {
    return NextResponse.json({ error: "Invalid reference." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  // The amount, frequency and appeal are read from the donation row inside the
  // service — the client sends nothing that can affect what is charged.
  const result = await startCheckout({ reference, origin });

  if (!result.ok) {
    const status =
      result.reason === "not_configured" ? 503 : result.reason === "not_found" ? 404 : 502;
    return NextResponse.json({ error: result.message }, { status });
  }

  return NextResponse.json({ url: result.url });
}
