import { NextResponse, type NextRequest } from "next/server";

/**
 * Security headers (Next.js `proxy` convention, formerly `middleware`).
 *
 * ── Why script-src uses 'unsafe-inline' rather than a nonce ──────────────────
 *
 * A nonce-based policy is strictly stronger in theory, and it was implemented here first.
 * It was removed because it is structurally incompatible with this application:
 *
 *   1. A nonce is per-request, so any page carrying one cannot be prerendered or served
 *      from Next's full-route cache. Our marketing pages are statically generated on
 *      purpose — that is what buys the LCP and crawlability the entire SEO strategy
 *      rests on.
 *   2. Worse, the two silently disagree. When a route *is* cached, the HTML keeps the
 *      nonce it was rendered with while the response header carries a fresh one. Every
 *      script is then refused and the page ships dead: server-rendered content still
 *      looks correct, so it passes a casual review. We hit exactly this, and only the
 *      mobile-menu end-to-end test caught it.
 *
 * A CSP that fails closed in a way nobody notices is worse than a slightly weaker one
 * that is correct and continuously verified. So: 'unsafe-inline' for scripts, every other
 * directive strict, and an end-to-end test (e2e/security.spec.ts) that fails the build if
 * a single CSP violation appears on any key page.
 *
 * The compensating controls that make this an acceptable trade:
 *   - No user-generated content is ever rendered as HTML. React escapes everything, and
 *     the only dangerouslySetInnerHTML in the codebase is JSON.stringify'd JSON-LD built
 *     from our own catalog modules — never from request input.
 *   - There are no third-party scripts at all. No analytics, no tag manager, no chat
 *     widget. 'self' therefore means genuinely only our own code.
 *   - Authorization is enforced in Postgres row-level security, so script injection alone
 *     could not read another customer's documents.
 *   - object-src 'none', base-uri 'self', frame-ancestors 'none' and form-action 'self'
 *     close the escalation paths that make an inline-script XSS most damaging.
 *
 * Revisiting this with a nonce is tracked in docs/security.md; it becomes worthwhile if
 * we ever render user-supplied rich content.
 */

const SENSITIVE_PREFIXES = ["/portal", "/admin"];

export default function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const isSensitive = SENSITIVE_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind and next/font both emit inline style attributes.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https:`,
    // Supabase needs XHR and realtime access when it is configured.
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  // Pages that render customer data must never be cached by an intermediary.
  if (isSensitive) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  return response;
}

export const config = {
  matcher: [
    // Static assets and image optimisation need none of this and would only pay the cost.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
