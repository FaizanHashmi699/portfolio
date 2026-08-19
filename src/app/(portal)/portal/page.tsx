import Link from "next/link";
import { AlertTriangle, ArrowRight, FileText, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/portal/status-badge";
import { getRepositories } from "@/server/repositories";
import { isTerminal } from "@/server/repositories/types";
import { requireUser } from "@/server/auth";
import { getService } from "@/domain/catalog/services";
import { validateDocuments } from "@/domain/documents/validation";
import { formatAed, formatDate } from "@/lib/utils";

export default async function PortalPage() {
  const user = await requireUser();
  const { applications } = await getRepositories();
  const list = await applications.listForUser(user.id);

  const needingAttention = list.filter((application) => {
    if (isTerminal(application.status)) return false;
    const service = getService(application.serviceSlug);
    return !validateDocuments(application.documents, {
      requirements: service?.documents,
    }).readyToSubmit;
  });

  return (
    <Section className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1">Hello, {user.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground mt-2">
            {list.length} application{list.length === 1 ? "" : "s"} ·{" "}
            {needingAttention.length} needing your attention
          </p>
        </div>
        <ButtonLink href="/services" variant="primary">
          <Plus className="size-4" />
          Start something new
        </ButtonLink>
      </div>

      {needingAttention.length > 0 && (
        <Card className="border-warning-500/50 mt-8">
          <CardContent className="pt-6">
            <h2 className="font-display text-h3 flex items-center gap-2.5">
              <AlertTriangle className="text-warning-600 size-5" />
              {needingAttention.length} thing
              {needingAttention.length === 1 ? "" : "s"} to fix
            </h2>
            <ul className="mt-4 space-y-2.5">
              {needingAttention.map((application) => (
                <li key={application.id}>
                  <Link
                    href={`/portal/applications/${application.id}`}
                    className="border-border hover:bg-surface flex items-center justify-between gap-3 rounded-xl border p-3.5 text-sm"
                  >
                    <span>
                      <span className="font-medium">
                        {getService(application.serviceSlug)?.name ??
                          application.serviceSlug}
                      </span>
                      <span className="text-muted-foreground block">
                        {application.reference} · {application.applicantName}
                      </span>
                    </span>
                    <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <h2 className="text-h2 mt-12">All applications</h2>

      {list.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="py-14 text-center">
            <FileText className="text-muted-foreground mx-auto size-10" />
            <p className="mt-4 font-medium">Nothing here yet</p>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Check what you qualify for, then start your first application.
            </p>
            <ButtonLink href="/eligibility" variant="primary" className="mt-6">
              Check my eligibility
            </ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {list.map((application) => {
            const service = getService(application.serviceSlug);
            const latest = application.events.at(-1);
            return (
              <li key={application.id}>
                <Card className="relative h-full transition-shadow hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-h3">
                          <Link
                            href={`/portal/applications/${application.id}`}
                            className="hover:text-primary after:absolute after:inset-0"
                          >
                            {service?.name ?? application.serviceSlug}
                          </Link>
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {application.reference} · {application.applicantName}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>

                    {latest && (
                      <p className="border-border text-muted-foreground mt-4 border-t pt-4 text-sm">
                        <span className="text-foreground font-medium">
                          {latest.title}
                        </span>{" "}
                        · {formatDate(latest.at)}
                      </p>
                    )}

                    <p className="text-muted-foreground mt-3 text-sm tabular-nums">
                      Quoted {formatAed(application.quotedTotal)}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
