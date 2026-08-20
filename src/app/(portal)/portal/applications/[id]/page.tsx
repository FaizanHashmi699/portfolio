import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Building2, FileText, Upload, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/portal/status-badge";
import { RiskPanel } from "@/components/portal/risk-panel";
import { getRepositories } from "@/server/repositories";
import { DocumentUploader } from "@/components/portal/document-uploader";
import { MessageThread } from "@/components/portal/message-thread";
import { InvoiceList } from "@/components/portal/invoice-list";
import { isTerminal } from "@/server/repositories/types";
import { requireUser } from "@/server/auth";
import { getService } from "@/domain/catalog/services";
import { validateDocuments } from "@/domain/documents/validation";
import { formatAed, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ACTOR_ICON = {
  customer: User,
  maqam: Building2,
  government: FileText,
  system: FileText,
} as const;

const ACTOR_LABEL = {
  customer: "You",
  maqam: "Maqam",
  government: "Authority",
  system: "Automated check",
} as const;

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const { applications, messages, invoices } = await getRepositories();
  const application = await applications.get(id);

  // Ownership is enforced here as well as in the database. Defence in depth: an
  // authorization bug in one layer should not be sufficient to leak a passport.
  if (!application || application.userId !== user.id) notFound();

  const service = getService(application.serviceSlug);
  // A decided application has nothing left to de-risk. Showing "3 blockers" on a visa
  // that was issued three weeks ago is alarming and meaningless.
  const closed = isTerminal(application.status);
  const risk = validateDocuments(application.documents, {
    requirements: closed ? undefined : service?.documents,
  });

  const [thread, applicationInvoices] = await Promise.all([
    messages.listForApplication(application.id),
    invoices.listForApplication(application.id),
  ]);
  // Opening the application is the moment the customer has actually seen the thread.
  await messages.markRead(application.id, "customer");

  return (
    <Section className="py-10">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
        <Link href="/portal" className="hover:text-foreground">
          ← All applications
        </Link>
      </nav>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">{service?.name ?? application.serviceSlug}</h1>
          <p className="text-muted-foreground mt-2">
            {application.reference} · {application.applicantName} · started{" "}
            {formatDate(application.createdAt)}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-8">
          {!closed && <RiskPanel risk={risk} />}

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3">Progress</h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Every stage, when it happened, and whose turn it is. You should never
                have to ask for an update.
              </p>

              <ol className="mt-6">
                {[...application.events].reverse().map((event, index, all) => {
                  const Icon = ACTOR_ICON[event.actor];
                  const last = index === all.length - 1;
                  return (
                    <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {!last && (
                        <span
                          aria-hidden="true"
                          className="bg-border absolute top-10 bottom-0 left-[1.125rem] w-px"
                        />
                      )}
                      <span className="border-border bg-surface-raised relative flex size-9 shrink-0 items-center justify-center rounded-full border">
                        <Icon className="text-primary size-4" />
                      </span>
                      <div className="pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge tone="neutral">{ACTOR_LABEL[event.actor]}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {event.description}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {formatDate(event.at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-display text-h3">Documents</h2>

              {application.documents.length === 0 ? (
                <p className="text-muted-foreground mt-4 text-sm">
                  Nothing uploaded yet.
                </p>
              ) : (
                <ul className="divide-border mt-4 divide-y">
                  {application.documents.map((document) => {
                    const issues = risk.findings.filter(
                      (finding) => finding.documentId === document.id,
                    );
                    return (
                      <li key={document.id} className="flex items-start gap-3 py-3.5">
                        <FileText className="text-muted-foreground mt-0.5 size-5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{document.fileName}</p>
                          <p className="text-muted-foreground text-xs">
                            {document.kind} · uploaded {formatDate(document.uploadedAt)}
                          </p>
                        </div>
                        {issues.length === 0 ? (
                          <Badge tone="success">Passed</Badge>
                        ) : (
                          <Badge tone="danger">
                            {issues.length} issue{issues.length === 1 ? "" : "s"}
                          </Badge>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {service && !closed && risk.missing.length > 0 && (
                <div className="border-border bg-surface mt-5 rounded-xl border p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Upload className="size-4" />
                    Still needed
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {risk.missing.map((id) => {
                      const requirement = service.documents.find((d) => d.id === id);
                      return (
                        <li key={id} className="text-muted-foreground text-sm">
                          {requirement?.label ?? id}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
          {!closed && service && (
            <DocumentUploader
              applicationId={application.id}
              requirements={service.documents}
            />
          )}

          <MessageThread
            applicationId={application.id}
            messages={thread}
            viewerRole="customer"
          />

          {applicationInvoices.length > 0 && (
            <div>
              <h2 className="text-h2 mb-4">Invoices</h2>
              <InvoiceList invoices={applicationInvoices} />
            </div>
          )}
        </div>

        <Card className="lg:sticky lg:top-24">
          <CardContent className="pt-6">
            <h2 className="font-display text-h3">Your quote</h2>
            <p className="font-display mt-3 text-3xl font-semibold tabular-nums">
              {formatAed(application.quotedTotal)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Fixed at the time you started. We honour it.
            </p>

            {service && (
              <dl className="border-border mt-5 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Typical processing</dt>
                  <dd>
                    {service.processingDays.min}–{service.processingDays.max} days
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Stage</dt>
                  <dd>
                    {Math.min(application.currentStage + 1, service.stages.length)} of{" "}
                    {service.stages.length}
                  </dd>
                </div>
              </dl>
            )}

            {service && (
              <Link
                href={`/services/${service.slug}`}
                className="text-primary mt-5 inline-block text-sm font-medium hover:underline"
              >
                See the full fee breakdown
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
