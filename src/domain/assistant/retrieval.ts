import { buildSearchIndex, searchEntries, type SearchEntry } from "@/domain/search";
import { getService } from "@/domain/catalog/services";
import { buildQuote } from "@/domain/pricing/quote";
import {
  attestationSummary,
  countries,
  entryRuleSummary,
} from "@/domain/geography/countries";
import { formatAed } from "@/lib/utils";

/**
 * Retrieval for the assistant.
 *
 * The model is never asked what it knows about UAE visas. It is handed the relevant slice
 * of our own catalog and told to answer from that and nothing else — which is what stops
 * it inventing a fee or a threshold. A hallucinated number here sends someone toward a
 * non-refundable government payment.
 */

export interface RetrievedContext {
  entries: SearchEntry[];
  /** Fully-resolved facts, so the model never has to compute a price itself. */
  facts: string[];
  /** Links offered alongside the answer. */
  sources: { title: string; href: string }[];
}

const index = buildSearchIndex();

export function retrieveContext(question: string): RetrievedContext {
  const entries = searchEntries(index, question, 6);
  const facts: string[] = [];

  for (const entry of entries) {
    if (entry.kind === "service") {
      const service = getService(entry.id.replace("service-", ""));
      if (!service) continue;

      const quote = buildQuote(service);
      facts.push(
        [
          `SERVICE "${service.name}" (/services/${service.slug}):`,
          `  Summary: ${service.summary}`,
          `  Total including VAT: ${formatAed(quote.total)}`,
          `  Of which our service fee: ${formatAed(quote.serviceFee)}; passed through to government and third parties: ${formatAed(quote.passThrough)}`,
          `  Fee lines: ${quote.lines.map((line) => `${line.label} ${formatAed(line.amount)} (${line.kind})`).join("; ")}`,
          `  Processing: ${service.processingDays.min}-${service.processingDays.max} working days`,
          `  Documents needed: ${service.documents.map((doc) => doc.label).join("; ")}`,
          `  Common rejection reasons: ${service.commonRejectionReasons.join("; ")}`,
        ].join("\n"),
      );
    }

    if (entry.kind === "country") {
      const country = countries.find(
        (item) => item.code === entry.id.replace("country-", ""),
      );
      if (!country) continue;

      facts.push(
        [
          `COUNTRY ${country.name} (${country.demonym}):`,
          `  Entry: ${entryRuleSummary(country)}`,
          `  Attestation: ${attestationSummary(country)}`,
          `  Chain in order: ${country.attestationSteps.join(" -> ")}`,
          `  Origin-country stages take ${country.attestationDays.min}-${country.attestationDays.max} working days.`,
          country.notes ? `  Note: ${country.notes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    if (entry.kind === "free-zone" || entry.kind === "guide" || entry.kind === "faq") {
      facts.push(
        `${entry.kind.toUpperCase()} "${entry.title}" (${entry.href}): ${entry.description}`,
      );
    }
  }

  return {
    entries,
    facts,
    sources: entries.slice(0, 4).map((entry) => ({
      title: entry.title,
      href: entry.href,
    })),
  };
}

/**
 * The answer given when no model is configured.
 *
 * Deliberately not an apology. Retrieval alone still finds the right page, the exact price
 * and the exact requirement — which for most questions is the whole answer. The model adds
 * phrasing, not facts.
 */
export function fallbackAnswer(context: RetrievedContext): string {
  if (context.entries.length === 0) {
    return "I couldn't find anything on that. Try naming a specific visa, a country, or a free zone — or use the contact page and a person will answer.";
  }

  const lines: string[] = ["Here's what we publish on that:"];

  for (const entry of context.entries.slice(0, 3)) {
    lines.push(
      `• ${entry.title}${entry.meta ? ` — ${entry.meta}` : ""}. ${entry.description}`,
    );
  }

  lines.push(
    "These figures are complete totals including government fees, third-party costs and VAT. Nothing here is an approval, and no visa outcome can be guaranteed.",
  );

  return lines.join("\n");
}
