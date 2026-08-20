import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  hashVisitor,
  isPrivatePath,
  recordEvent,
  referrerHost,
} from "@/server/services/analytics";
import { rateLimit } from "@/server/services/rate-limit";

/**
 * Page-view collection.
 *
 * First-party, cookieless, and it stores nothing that can identify anyone. See
 * `src/server/services/analytics.ts` for why the visitor hash is deliberately unlinkable
 * across days.
 */

const schema = z.object({
  path: z.string().min(1).max(300),
  locale: z.string().max(10).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const limit = rateLimit(`analytics:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) {
    // Silently accepted: a rate-limited pageview is not worth telling a browser about.
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 204 });

  // Never record an authenticated path. Which application someone is looking at is
  // exactly the sort of thing analytics has no business knowing.
  if (isPrivatePath(parsed.data.path)) {
    return new NextResponse(null, { status: 204 });
  }

  recordEvent({
    path: parsed.data.path,
    visitor: hashVisitor(ip, request.headers.get("user-agent") ?? ""),
    referrerHost: referrerHost(request.headers.get("referer")),
    locale: parsed.data.locale,
  });

  return new NextResponse(null, { status: 204 });
}
