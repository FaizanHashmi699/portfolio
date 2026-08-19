import Link from "next/link";
import { AlertTriangle, Database, Inbox, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/portal/status-badge";
import { getRepositories } from "@/server/repositories";
import { isTerminal } from "@/server/repositories/types";
import { requireStaff } from "@/server/auth";
import { getService } from "@/domain/catalog/services";
import { validateDocuments } from "@/domain/documents/validation";
import { formatAed, formatDate } from "@/lib/utils";

export default async function AdminOverviewPage() {
  await requireStaff();
  const { applications, leads, driver } = await getRepositories();

  const [all, recentLeads] = await Promise.all([applications.listAll(), leads.list(5)]);

  const open = all.filter((a) => !isTerminal(a.status));
  const blocked = open.filter((application) => {
    const service = getService(application.serviceSlug);
    return !validateDocuments(application.documents, {
      requirements: service?.documents,
    }).readyToSubmit;
  });
  const pipelineValue = open.reduce((sum, a) => sum + a.quotedTotal, 0);

  const stats = [
    { label: "Open applications", value: String(open.length), icon: Inbox },
    {
      label: "Blocked on documents",
      value: String(blocked.length),
      icon: AlertTriangle,
    },
    { label: "Pipeline value", value: formatAed(pipelineValue), icon: TrendingUp },
    { label: "Storage driver", value: driver, icon: Database },
  ];

  return (
    <Section className="py-10">
      <h1 className="text-h1">Overview</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <stat.icon className="text-muted-foreground size-4" />
              </div>
              <p className="font-display mt-2 text-2xl font-semibold tabular-nums">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {blocked.length > 0 && (
        <Card className="border-warning-500/50 mt-8">
          <CardContent className="pt-6">
            <h2 className="font-display text-h3 flex items-center gap-2.5">
              <AlertTriangle className="text-warning-600 size-5" />
              Blocked on documents
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              These cannot be submitted until the customer resolves a blocker. Chasing
              these is the highest-value thing anyone can do today.
            </p>
            <ul className="mt-4 space-y-2.5">
              {blocked.map((application) => {
                const service = getService(application.serviceSlug);
                const risk = validateDocuments(application.documents, {
                  requirements: service?.documents,
                });
                return (
                  <li key={application.id}>
                    <Link
                      href={`/admin/applications/${application.id}`}
                      className="border-border hover:bg-surface flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 text-sm"
                    >
                      <span>
                        <span className="font-medium">{application.reference}</span>
                        <span className="text-muted-foreground block">
                          {application.applicantName} ·{" "}
                          {service?.name ?? application.serviceSlug}
                        </span>
                      </span>
                      <Badge tone="danger">
                        {risk.blockers.length} blocker
                        {risk.blockers.length === 1 ? "" : "s"}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-h2">Recent applications</h2>
            <Link
              href="/admin/applications"
              className="text-primary text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="mt-5 space-y-3">
            {all.slice(0, 6).map((application) => (
              <li key={application.id}>
                <Link
                  href={`/admin/applications/${application.id}`}
                  className="border-border hover:bg-surface flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                >
                  <span>
                    <span className="font-medium">{application.reference}</span>
                    <span className="text-muted-foreground block text-sm">
                      {application.applicantName} · {formatAed(application.quotedTotal)}
                    </span>
                  </span>
                  <StatusBadge status={application.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-h2">Recent leads</h2>
            <Link href="/admin/leads" className="text-primary text-sm hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-5 space-y-3">
            {recentLeads.length === 0 && (
              <li className="border-border text-muted-foreground rounded-xl border p-4 text-sm">
                No leads yet.
              </li>
            )}
            {recentLeads.map((lead) => (
              <li key={lead.id} className="border-border rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{lead.name ?? lead.email}</span>
                  <Badge tone="neutral">{lead.source}</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {lead.email} · {formatDate(lead.createdAt)}
                </p>
                {lead.message && (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                    {lead.message}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
