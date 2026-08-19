import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/portal/status-badge";
import { getRepositories } from "@/server/repositories";
import { isTerminal } from "@/server/repositories/types";
import { requireStaff } from "@/server/auth";
import { getService } from "@/domain/catalog/services";
import { validateDocuments } from "@/domain/documents/validation";
import { formatAed, formatDate } from "@/lib/utils";

export default async function AdminApplicationsPage() {
  await requireStaff();
  const { applications } = await getRepositories();
  const all = await applications.listAll();

  return (
    <Section className="py-10">
      <h1 className="text-h1">Applications</h1>
      <p className="text-muted-foreground mt-2">{all.length} total</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[52rem] text-sm">
          <thead>
            <tr className="border-border-strong border-b text-left">
              <th scope="col" className="py-3 pr-4 font-medium">
                Reference
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Applicant
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Service
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Status
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Risk
              </th>
              <th scope="col" className="py-3 pr-4 text-right font-medium">
                Value
              </th>
              <th scope="col" className="py-3 text-right font-medium">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {all.map((application) => {
              const service = getService(application.serviceSlug);
              const closed = isTerminal(application.status);
              const risk = validateDocuments(application.documents, {
                requirements: closed ? undefined : service?.documents,
              });
              return (
                <tr key={application.id} className="hover:bg-surface">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/applications/${application.id}`}
                      className="hover:text-primary font-medium"
                    >
                      {application.reference}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{application.applicantName}</td>
                  <td className="text-muted-foreground py-3 pr-4">
                    {service?.name ?? application.serviceSlug}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={application.status} />
                  </td>
                  <td className="py-3 pr-4">
                    {closed ? (
                      <Badge tone="neutral">Closed</Badge>
                    ) : risk.readyToSubmit ? (
                      <Badge tone="success">Clear</Badge>
                    ) : (
                      <Badge tone="danger">{risk.blockers.length} blocker</Badge>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {formatAed(application.quotedTotal)}
                  </td>
                  <td className="text-muted-foreground py-3 text-right">
                    {formatDate(application.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
