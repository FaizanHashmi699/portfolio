import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { env, features } from "@/server/env";
import { rateLimit } from "@/server/services/rate-limit";
import { fallbackAnswer, retrieveContext } from "@/domain/assistant/retrieval";
import { brand } from "@/config/brand";

/**
 * The assistant endpoint.
 *
 * Streams a plain-language answer grounded strictly in our own catalog. Three properties
 * are load-bearing:
 *
 *   1. The model answers only from retrieved facts. It is never asked what it knows about
 *      UAE immigration, because an invented fee or threshold sends someone toward a
 *      non-refundable government payment.
 *   2. It cannot promise an outcome. The system prompt forbids it and the response is
 *      checked before it is returned.
 *   3. With no API key it still works, using retrieval alone. The model contributes
 *      phrasing, not facts, so losing it degrades the answer rather than breaking it.
 */

const MODEL = "claude-sonnet-5";

const requestSchema = z.object({
  question: z.string().trim().min(2).max(500),
});

const SYSTEM_PROMPT = `You are the assistant for ${brand.name}, a private UAE visa and business-setup consultancy.

Answer ONLY from the FACTS provided in the user message. They come from the company's own service catalog and country data.

Absolute rules:
- If the facts do not contain the answer, say so and point the reader at /contact. Never fill a gap from your own knowledge of UAE immigration — a wrong fee or threshold can cost someone a non-refundable government payment.
- Never state or imply that a visa will be approved. Never use "guarantee", "guaranteed", "assured", or "100%" about an outcome.
- Never claim any government affiliation. ${brand.name} is a private consultancy.
- Quote prices exactly as given in the facts, including the currency. Do not compute, convert, estimate or round them.
- Prefer the specific over the general. If the reader named a country, use that country's attestation chain.
- 80-150 words. Plain language for a reader whose first language may not be English. No markdown headings, no bullet characters other than a simple hyphen.
- Close by naming the most relevant page path from the facts.`;

const PROHIBITED =
  /\b(we guarantee|guaranteed approval|will be approved|100% success|assured approval)\b/i;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = rateLimit(`assistant:${ip}`, { limit: 15, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many questions at once. Please wait a moment." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ask a question between 2 and 500 characters." },
      { status: 400 },
    );
  }

  const context = retrieveContext(parsed.data.question);

  if (!features.ai || context.facts.length === 0) {
    return NextResponse.json({
      answer: fallbackAnswer(context),
      sources: context.sources,
      source: "retrieval" as const,
    });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `QUESTION: ${parsed.data.question}\n\nFACTS:\n${context.facts.join("\n\n")}`,
        },
      ],
    });

    const answer = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    // Belt and braces. The system prompt forbids assurances; this makes it impossible
    // for one to reach a customer even if the model ignores it.
    if (!answer || PROHIBITED.test(answer)) {
      if (answer) {
        console.warn(
          "[assistant] response contained a prohibited assurance; using retrieval",
        );
      }
      return NextResponse.json({
        answer: fallbackAnswer(context),
        sources: context.sources,
        source: "retrieval" as const,
      });
    }

    return NextResponse.json({
      answer,
      sources: context.sources,
      source: "model" as const,
    });
  } catch (error) {
    console.error("[assistant] failed, using retrieval", error);
    return NextResponse.json({
      answer: fallbackAnswer(context),
      sources: context.sources,
      source: "retrieval" as const,
    });
  }
}
