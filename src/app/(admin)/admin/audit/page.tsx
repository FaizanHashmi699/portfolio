import { FileClock, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { getRepositories } from "@/server/repositories";
import { requireStaff } from "@/server/auth";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Audit log" };

const ACTION_TONE: Record<string, "neutral" | "brand" | "warning" | "danger"> = {
  "application.created": "brand",
  "application.status_changed": "brand",
  "document.uploaded": "neutral",
  "invoice.status_changed": "brand",
  "person.role_changed": "danger",
};

export default async function AuditPage() {
  await requireStaff();
  const { audit } = await getRepositories();
  const entries = await audit.list(200);

  return (
    <Section className="py-10">
      <h1 className="text-h1">Audit log</h1>
      <p className="text-muted-foreground mt-2">
        Every status change, document upload and role change, in order.
      </p>

      <Card className="mt-8 max-w-3xl">
        <CardContent className="flex items-start gap-3 pt-6">
          <Lock className="text-primary mt-0.5 size-5 shrink-0" />
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">This log is append-only.</strong> No
            update or delete policy is granted to anyone, including admins. That is
            deliberate: the most likely insider risk in this business is carelessness
            rather than malice, and an operator who knows their access is recorded
            behaves differently from one who does not.
          </p>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <Card className="mt-6 max-w-3xl">
          <CardContent className="py-14 text-center">
            <FileClock className="text-muted-foreground mx-auto size-10" />
            <p className="mt-4 font-medium">Nothing recorded yet</p>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Entries appear as soon as anything is changed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 max-w-4xl overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-border-strong border-b text-left">
                <th scope="col" className="py-3 pr-4 font-medium">
                  When
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Action
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Subject
                </th>
                <th scope="col" className="py-3 pr-4 font-medium">
                  Detail
                </th>
                <th scope="col" className="py-3 font-medium">
                  Actor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-muted-foreground py-3 pr-4 whitespace-nowrap">
                    {formatDate(entry.at)}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={ACTION_TONE[entry.action] ?? "neutral"}>
                      {entry.action}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{entry.subject}</td>
                  <td className="text-muted-foreground py-3 pr-4">
                    {entry.detail ?? "—"}
                  </td>
                  <td className="py-3 font-mono text-xs">{entry.actorId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
