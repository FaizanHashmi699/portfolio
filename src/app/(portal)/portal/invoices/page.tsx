import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { InvoiceList } from "@/components/portal/invoice-list";
import { getRepositories } from "@/server/repositories";
import { requireUser } from "@/server/auth";
import { formatAed } from "@/lib/utils";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const user = await requireUser();
  const { invoices, applications } = await getRepositories();

  const [list, applicationList] = await Promise.all([
    invoices.listForUser(user.id),
    applications.listForUser(user.id),
  ]);

  const hrefs = Object.fromEntries(
    applicationList.map((application) => [
      application.id,
      `/portal/applications/${application.id}`,
    ]),
  );

  const outstanding = list
    .filter((invoice) => invoice.status === "sent" || invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <Section className="py-10">
      <h1 className="text-h1">Invoices</h1>
      <p className="text-muted-foreground mt-2">
        {list.length} invoice{list.length === 1 ? "" : "s"}
        {outstanding > 0 && ` · ${formatAed(outstanding)} outstanding`}
      </p>

      <p className="border-border bg-surface text-muted-foreground mt-6 max-w-2xl rounded-xl border p-4 text-sm">
        Every invoice carries the same itemised lines as the quote it came from, so you
        can always reconcile the two. Government and third-party fees are passed through
        at cost; our service fee is the only line we earn.
      </p>

      <div className="mt-8 max-w-3xl">
        <InvoiceList invoices={list} applicationHrefs={hrefs} />
      </div>
    </Section>
  );
}
