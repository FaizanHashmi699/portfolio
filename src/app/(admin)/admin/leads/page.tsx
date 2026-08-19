import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { getRepositories } from "@/server/repositories";
import { requireStaff } from "@/server/auth";
import { getService } from "@/domain/catalog/services";
import { formatDate } from "@/lib/utils";

export default async function AdminLeadsPage() {
  await requireStaff();
  const { leads } = await getRepositories();
  const all = await leads.list(100);

  return (
    <Section className="py-10">
      <h1 className="text-h1">Leads</h1>
      <p className="text-muted-foreground mt-2">{all.length} total</p>

      {all.length === 0 ? (
        <p className="rounded-card border-border text-muted-foreground mt-8 border p-8 text-center">
          No leads yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {all.map((lead) => (
            <li key={lead.id} className="rounded-card border-border border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{lead.name ?? "Not given"}</p>
                  <p className="text-muted-foreground text-sm">
                    <a href={`mailto:${lead.email}`} className="hover:text-primary">
                      {lead.email}
                    </a>
                    {lead.phone && ` · ${lead.phone}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{lead.source}</Badge>
                  {lead.marketingConsent && <Badge tone="success">Opted in</Badge>}
                </div>
              </div>

              {lead.serviceSlug && (
                <p className="mt-3 text-sm">
                  Interested in{" "}
                  <span className="font-medium">
                    {getService(lead.serviceSlug)?.name ?? lead.serviceSlug}
                  </span>
                </p>
              )}

              {lead.message && (
                <p className="bg-surface text-muted-foreground mt-3 rounded-xl p-3.5 text-sm">
                  {lead.message}
                </p>
              )}

              <p className="text-muted-foreground mt-3 text-xs">
                {formatDate(lead.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
