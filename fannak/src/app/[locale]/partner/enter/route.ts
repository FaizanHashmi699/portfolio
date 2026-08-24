import { NextResponse, type NextRequest } from "next/server";
import { signInPartner } from "@/lib/auth";

/**
 * Partner portal entry.
 *
 * The signed link a partner receives on WhatsApp lands here. A cookie can
 * only be set from a Route Handler or Server Action — never during a page
 * render — so the token is exchanged for a session here, then the partner is
 * redirected to the portal itself.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const token = request.nextUrl.searchParams.get("token") ?? "";

  const tenantId = await signInPartner(token);

  // An invalid token still lands on the portal, which shows "no access"
  // rather than confirming whether the token merely expired or never existed.
  const destination = new URL(`/${locale}/partner`, request.nextUrl.origin);
  if (!tenantId) destination.searchParams.set("denied", "1");

  return NextResponse.redirect(destination);
}
