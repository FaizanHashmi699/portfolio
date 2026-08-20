import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { getRepositories } from "@/server/repositories";
import { requireUser } from "@/server/auth";
import { getService } from "@/domain/catalog/services";
import { validateDocuments } from "@/domain/documents/validation";
import { isTerminal } from "@/server/repositories/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const user = await requireUser();
  const { applications } = await getRepositories();
  const list = await applications.listForUser(user.id);

  const rows = list.flatMap((application) => {
    const service = getService(application.serviceSlug);
    const closed = isTerminal(application.status);
    const risk = validateDocuments(application.documents, {
      requirements: closed ? undefined : service?.documents,
    });

    return application.documents.map((document) => ({
      application,
      document,
      serviceName: service?.name ?? application.serviceSlug,
      issues: risk.findings.filter((finding) => finding.documentId === document.id),
    }));
  });

  const withIssues = rows.filter((row) => row.issues.length > 0);

  return (
    <Section className="py-10">
      <h1 className="text-h1">Documents</h1>
      <p className="text-muted-foreground mt-2">
        {rows.length} document{rows.length === 1 ? "" : "s"} across {list.length}{" "}
        application{list.length === 1 ? "" : "s"}
        {withIssues.length > 0 && ` · ${withIssues.length} needing attention`}
      </p>

      {rows.length === 0 ? (
        <Card className="mt-8 max-w-3xl">
          <CardContent className="py-14 text-center">
            <FileText className="text-muted-foreground mx-auto size-10" />
            <p className="mt-4 font-medium">Nothing uploaded yet</p>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Documents are uploaded against a specific application, so we can check
              them against that service&apos;s requirements.
            </p>
            <Link
              href="/portal"
              className="text-primary mt-5 inline-block hover:underline"
            >
              Go to your applications
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-8 max-w-3xl space-y-3">
          {rows.map((row) => (
            <li key={`${row.application.id}-${row.document.id}`}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.document.fileName}</p>
                      <p className="text-muted-foreground mt-0.5 text-sm">
                        {row.document.kind} · uploaded{" "}
                        {formatDate(row.document.uploadedAt)}
                      </p>
                      <Link
                        href={`/portal/applications/${row.application.id}`}
                        className="text-primary mt-1.5 inline-block text-sm hover:underline"
                      >
                        {row.serviceName} · {row.application.reference}
                      </Link>
                    </div>

                    {row.issues.length === 0 ? (
                      <Badge tone="success">
                        <CheckCircle2 /> Passed
                      </Badge>
                    ) : (
                      <Badge tone="danger">
                        <AlertTriangle /> {row.issues.length} issue
                        {row.issues.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>

                  {row.issues.length > 0 && (
                    <ul className="border-border mt-4 space-y-2 border-t pt-4">
                      {row.issues.map((issue, index) => (
                        <li key={index} className="text-sm">
                          <p className="font-medium">{issue.message}</p>
                          <p className="text-muted-foreground mt-0.5">{issue.fix}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
