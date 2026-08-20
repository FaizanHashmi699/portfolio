import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/portal/status-badge";
import { getRepositories } from "@/server/repositories";
import { requireStaff } from "@/server/auth";
import {
  medianTimeToDecision,
  openApplications,
  pipelineByStatus,
  revenueSummary,
  servicePerformance,
} from "@/domain/analytics/reports";
import { formatAed } from "@/lib/utils";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  await requireStaff();
  const { applications, invoices } = await getRepositories();

  const [allApplications, allInvoices] = await Promise.all([
    applications.listAll(),
    invoices.listAll(),
  ]);

  const pipeline = pipelineByStatus(allApplications);
  const performance = servicePerformance(allApplications);
  const revenue = revenueSummary(allInvoices);
  const median = medianTimeToDecision(allApplications);
  const open = openApplications(allApplications);

  const maxPipeline = Math.max(1, ...pipeline.map((bucket) => bucket.count));

  return (
    <Section className="py-10">
      <h1 className="text-h1">Reports</h1>
      <p className="text-muted-foreground mt-2">
        Everything here is computed from the same data the portal shows customers.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Collected",
            value: formatAed(revenue.collected),
            hint: "Paid invoices only",
          },
          {
            label: "Outstanding",
            value: formatAed(revenue.outstanding),
            hint: `${formatAed(revenue.overdue)} overdue`,
          },
          {
            label: "Open applications",
            value: String(open.length),
            hint: "Still consuming capacity",
          },
          {
            label: "Median time to decision",
            value: median === null ? "—" : `${median} days`,
            hint: "Median, not mean — one stuck file skews an average",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="font-display mt-2 text-2xl font-semibold tabular-nums">
                {stat.value}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/*
        We earn the service fee. Everything else is money moving through us to a government
        body or a mandated third party. Reporting them together would flatter the numbers
        and make capacity planning meaningless.
      */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h2 className="font-display text-h3">What we actually earned</h2>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Of {formatAed(revenue.collected)} collected, only the service fee is ours.
            The rest passes through to authorities and third parties at cost.
          </p>

          <dl className="mt-5 space-y-3">
            <div>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="font-medium">Service fee earned</dt>
                <dd className="tabular-nums">{formatAed(revenue.serviceFeeEarned)}</dd>
              </div>
              <div className="bg-border mt-1.5 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-accent h-full rounded-full"
                  style={{
                    width: `${revenue.collected === 0 ? 0 : (revenue.serviceFeeEarned / revenue.collected) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="text-muted-foreground">Passed through at cost</dt>
                <dd className="tabular-nums">{formatAed(revenue.passThrough)}</dd>
              </div>
              <div className="bg-border mt-1.5 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-ink-400 h-full rounded-full"
                  style={{
                    width: `${revenue.collected === 0 ? 0 : (revenue.passThrough / revenue.collected) * 100}%`,
                  }}
                />
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-h2">Pipeline</h2>
          <ul className="mt-5 space-y-3">
            {pipeline.map((bucket) => (
              <li key={bucket.status}>
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge status={bucket.status} />
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {bucket.count} · {formatAed(bucket.value)}
                  </span>
                </div>
                <div className="bg-border mt-2 h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-ink-500 h-full rounded-full"
                    style={{ width: `${(bucket.count / maxPipeline) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-h2">By service</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="border-border-strong border-b text-left">
                  <th scope="col" className="py-2.5 pr-3 font-medium">
                    Service
                  </th>
                  <th scope="col" className="py-2.5 pr-3 text-right font-medium">
                    Started
                  </th>
                  <th scope="col" className="py-2.5 pr-3 text-right font-medium">
                    Approved
                  </th>
                  <th scope="col" className="py-2.5 text-right font-medium">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {performance.map((row) => (
                  <tr key={row.serviceSlug}>
                    <td className="py-2.5 pr-3">{row.serviceName}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">
                      {row.started}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {row.approvalRate === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <Badge tone={row.approvalRate >= 0.8 ? "success" : "warning"}>
                          {Math.round(row.approvalRate * 100)}%
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {formatAed(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground mt-4 text-xs">
            Approval rate counts decided applications only. A dash means none have been
            decided yet — showing 0% or 100% off a single case would be worse than
            showing nothing.
          </p>
        </div>
      </div>
    </Section>
  );
}
