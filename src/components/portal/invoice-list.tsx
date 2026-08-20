import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FeeTable } from "@/components/marketing/fee-table";
import type { Invoice, InvoiceStatus } from "@/server/repositories/types";
import { formatAed, formatDate } from "@/lib/utils";

const STATUS_TONE: Record<
  InvoiceStatus,
  "neutral" | "brand" | "success" | "warning" | "danger"
> = {
  draft: "neutral",
  sent: "brand",
  paid: "success",
  overdue: "danger",
  void: "neutral",
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Awaiting payment",
  paid: "Paid",
  overdue: "Overdue",
  void: "Cancelled",
};

/**
 * Invoices show the same itemised lines the quote did.
 *
 * An invoice a customer cannot reconcile against the price they were quoted would undo the
 * entire positioning, so the same FeeTable renders both.
 */
export function InvoiceList({
  invoices,
  applicationHrefs,
}: {
  invoices: Invoice[];
  applicationHrefs?: Record<string, string>;
}) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-12 text-center">
          No invoices yet. Nothing is charged until an application is under way.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-5">
      {invoices.map((invoice) => (
        <li key={invoice.id}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-h3">{invoice.reference}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {invoice.description}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Issued {formatDate(invoice.issuedAt)} · Due{" "}
                    {formatDate(invoice.dueAt)}
                    {invoice.paidAt && ` · Paid ${formatDate(invoice.paidAt)}`}
                  </p>
                </div>
                <div className="text-right">
                  <Badge tone={STATUS_TONE[invoice.status]}>
                    {STATUS_LABEL[invoice.status]}
                  </Badge>
                  <p className="font-display mt-2 text-2xl font-semibold tabular-nums">
                    {formatAed(invoice.total)}
                  </p>
                </div>
              </div>

              <details className="mt-5">
                <summary className="text-primary cursor-pointer text-sm font-medium">
                  See every line
                </summary>
                <div className="mt-3">
                  <FeeTable
                    quote={{
                      lines: invoice.lines,
                      subtotal: invoice.subtotal,
                      vat: invoice.vat,
                      total: invoice.total,
                      serviceFee: invoice.lines
                        .filter((line) => line.kind === "service")
                        .reduce((sum, line) => sum + line.amount, 0),
                      passThrough: invoice.lines
                        .filter((line) => line.kind !== "service")
                        .reduce((sum, line) => sum + line.amount, 0),
                    }}
                  />
                </div>
              </details>

              {applicationHrefs?.[invoice.applicationId] && (
                <Link
                  href={applicationHrefs[invoice.applicationId]}
                  className="text-primary mt-4 inline-block text-sm hover:underline"
                >
                  View the application
                </Link>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
