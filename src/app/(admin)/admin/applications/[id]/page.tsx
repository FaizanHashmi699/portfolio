import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/portal/status-badge";
import { RiskPanel } from "@/components/portal/risk-panel";
import { StatusForm } from "@/components/admin/status-form";
import { DocumentReview } from "@/components/admin/document-review";
import { MessageThread } from "@/components/portal/message-thread";
import { InvoiceList } from "@/components/portal/invoice-list";
import { createDownloadUrl } from "@/server/services/storage";
import { getRepositories } from "@/server/repositories";
import { isTerminal } from "@/server/repositories/types";
import { requireStaff } from "@/server/auth";
import { getService } from "@/domain/catalog/services";
import { validateDocuments } from "@/domain/documents/validation";
import { formatAed, formatDate } from "@/lib/utils";

export default async function AdminApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStaff();

  const { applications, messages, invoices } = await getRepositories();
  const application = await applications.get(id);
  if (!application) notFound();

  const [thread, applicationInvoices, downloadUrls] = await Promise.all([
    messages.listForApplication(application.id),
    invoices.listForApplication(application.id),
    // Signed URLs are minted per render and expire in minutes, so a screenshot of this
    // page does not become a durable link to someone's passport.
    Promise.all(
      application.documents.map(async (document) => [
        document.id,
        document.storagePath ? await createDownloadUrl(document.storagePath) : null,
      ]),
    ).then((entries) => Object.fromEntries(entries) as Record<string, string | null>),
  ]);
  await messages.markRead(application.id, "staff");

  const service = getService(application.serviceSlug);
  const closed = isTerminal(application.status);
  const risk = validateDocuments(application.documents, {
    requirements: closed ? undefined : service?.documents,
  });

  return (
    <Section className="py-10">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
        <Link href="/admin/applications" className="hover:text-foreground">
          ← All applications
        </Link>
      </nav>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">{application.reference}</h1>
          <p className="text-muted-foreground mt-2">
            {application.applicantName} · {application.applicantEmail} ·{" "}
            {service?.name ?? application.serviceSlug}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-8">
          {!closed && <RiskPanel risk={risk} />}

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3">Timeline</h2>
              <ol className="divide-border mt-4 divide-y">
                {[...application.events].reverse().map((event) => (
                  <li key={event.id} className="py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(event.at)} · {event.actor}
                      </p>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {event.description}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3">Documents</h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Automated checks are above. This is where a person confirms the scan is
                legible and the stamps look right.
              </p>

              {application.documents.length === 0 ? (
                <p className="text-muted-foreground mt-4 text-sm">Nothing uploaded.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {application.documents.map((document) => (
                    <li key={document.id}>
                      <DocumentReview
                        applicationId={application.id}
                        document={document}
                        downloadUrl={downloadUrls[document.id]}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <MessageThread
            applicationId={application.id}
            messages={thread}
            viewerRole="staff"
          />

          {applicationInvoices.length > 0 && (
            <div>
              <h2 className="text-h2 mb-4">Invoices</h2>
              <InvoiceList invoices={applicationInvoices} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3">Update status</h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                This is written to the customer&apos;s timeline immediately.
              </p>
              <div className="mt-5">
                <StatusForm
                  applicationId={application.id}
                  currentStatus={application.status}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3">Details</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Quoted</dt>
                  <dd className="tabular-nums">{formatAed(application.quotedTotal)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(application.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd>{formatDate(application.updatedAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Documents</dt>
                  <dd>{application.documents.length}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
