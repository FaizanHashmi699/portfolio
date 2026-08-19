import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatAed } from "@/lib/utils";
import type { Quote } from "@/domain/catalog/types";

const KIND_LABEL = {
  government: "Government",
  "third-party": "Third party",
  service: "Our fee",
} as const;

const KIND_TONE = {
  government: "neutral",
  "third-party": "neutral",
  service: "accent",
} as const;

/**
 * The itemised quote.
 *
 * This component is the product's central claim rendered as UI. Every line names who
 * receives the money, so nothing can hide inside a total. If this ever becomes a single
 * "AED X" figure, we have become the thing we set out to replace.
 */
export function FeeTable({ quote }: { quote: Quote }) {
  return (
    <div className="overflow-hidden rounded-card border border-border">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Itemised fee breakdown showing government fees, third-party costs, our service
          fee and VAT
        </caption>
        <thead className="bg-surface">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              What you&apos;re paying for
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              Paid to
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {quote.lines.map((line, index) => (
            <tr key={`${line.label}-${index}`}>
              <td className="px-4 py-3">
                <span className="font-medium">{line.label}</span>
                {line.estimated && (
                  <Badge tone="warning" className="ml-2">
                    Estimate
                  </Badge>
                )}
                {line.note && (
                  <span className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-3 shrink-0" />
                    {line.note}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                <Badge tone={KIND_TONE[line.kind]}>{KIND_LABEL[line.kind]}</Badge>
              </td>
              <td className="px-4 py-3 text-right align-top tabular-nums">
                {formatAed(line.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-surface">
          <tr className="border-t border-border">
            <td colSpan={2} className="px-4 py-2.5 text-muted-foreground">
              Subtotal
            </td>
            <td className="px-4 py-2.5 text-right tabular-nums">
              {formatAed(quote.subtotal)}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="px-4 py-2.5 text-muted-foreground">
              VAT (5%, on taxable supplies only)
            </td>
            <td className="px-4 py-2.5 text-right tabular-nums">
              {formatAed(quote.vat)}
            </td>
          </tr>
          <tr className="border-t border-border-strong">
            <td colSpan={2} className="px-4 py-3.5 font-display text-base font-semibold">
              Total
            </td>
            <td className="px-4 py-3.5 text-right font-display text-base font-semibold tabular-nums">
              {formatAed(quote.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="border-t border-border bg-background px-4 py-3 text-xs text-muted-foreground">
        Of this total, {formatAed(quote.passThrough)} passes straight through to
        government bodies and mandated third parties. {formatAed(quote.serviceFee)} is
        our fee — the only part we earn.
      </p>
    </div>
  );
}
