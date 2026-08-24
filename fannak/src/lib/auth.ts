import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Access control for the operator surfaces.
 *
 * v1 deliberately does not use email or SMS login:
 *  - phone OTP needs a CITC-approved sender ID, which needs a local entity
 *  - email magic links need a verified sending domain
 *
 * So the two operator surfaces are reached the way this business already
 * communicates — a link sent over WhatsApp:
 *
 *  ADMIN   one shared access key, held by the two operators.
 *  PARTNER a signed per-tenant link. The admin generates it, your brother
 *          sends it on WhatsApp, and the partner's browser keeps the cookie.
 *
 * Both are HMAC-signed with FANNAK_SECRET. When Supabase Auth is introduced
 * this module is the only thing that changes.
 */

const ADMIN_COOKIE = "fannak_admin";
const PARTNER_COOKIE = "fannak_partner";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string | null {
  return process.env.FANNAK_SECRET || null;
}

export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_ACCESS_KEY && secret());
}

function sign(value: string): string {
  const key = secret();
  if (!key) throw new Error("FANNAK_SECRET is not set");
  return createHmac("sha256", key).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Token handed to a partner as a portal link. */
export function partnerToken(tenantId: string): string {
  return `${tenantId}.${sign(tenantId)}`;
}

export function verifyPartnerToken(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const tenantId = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  try {
    return safeEqual(mac, sign(tenantId)) ? tenantId : null;
  } catch {
    return null;
  }
}

export async function signInAdmin(key: string): Promise<boolean> {
  const expected = process.env.ADMIN_ACCESS_KEY;
  if (!expected || !secret()) return false;
  if (!safeEqual(key, expected)) return false;

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sign("admin"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  try {
    return safeEqual(value, sign("admin"));
  } catch {
    return false;
  }
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  jar.delete(PARTNER_COOKIE);
}

export async function signInPartner(token: string): Promise<string | null> {
  const tenantId = verifyPartnerToken(token);
  if (!tenantId) return null;

  const jar = await cookies();
  jar.set(PARTNER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return tenantId;
}

export async function currentPartnerId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(PARTNER_COOKIE)?.value;
  return token ? verifyPartnerToken(token) : null;
}
