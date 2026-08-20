import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { RoleForm } from "@/components/admin/role-form";
import { getRepositories } from "@/server/repositories";
import { requireStaff } from "@/server/auth";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const viewer = await requireStaff();
  const { people } = await getRepositories();
  const everyone = await people.list();

  const staff = everyone.filter((person) => person.role !== "customer");
  const customers = everyone.filter((person) => person.role === "customer");

  return (
    <Section className="py-10">
      <h1 className="text-h1">Team</h1>
      <p className="text-muted-foreground mt-2">
        {staff.length} with console access · {customers.length} customer accounts
      </p>

      <Card className="border-warning-500/50 mt-8 max-w-3xl">
        <CardContent className="flex items-start gap-3 pt-6">
          <ShieldAlert className="text-warning-600 mt-0.5 size-5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Console access sees customer documents.</p>
            <p className="text-muted-foreground mt-1.5">
              Anyone with the staff or admin role can read passports, salary
              certificates and identity documents belonging to real people. Grant it
              deliberately, remove it the day someone leaves, and require multi-factor
              authentication on every account that has it. Every role change is written
              to the audit log.
            </p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-h2 mt-10">Console access</h2>
      <ul className="mt-5 max-w-3xl space-y-3">
        {staff.map((person) => (
          <li key={person.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-medium">{person.fullName}</p>
                  <p className="text-muted-foreground text-sm">{person.email}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Since {formatDate(person.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={person.role === "admin" ? "accent" : "brand"}>
                    {person.role}
                  </Badge>
                  {person.id !== viewer.id && (
                    <RoleForm personId={person.id} currentRole={person.role} />
                  )}
                  {person.id === viewer.id && (
                    <span className="text-muted-foreground text-xs">You</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <h2 className="text-h2 mt-10">Customer accounts</h2>
      {customers.length === 0 ? (
        <p className="text-muted-foreground mt-4">No customer accounts yet.</p>
      ) : (
        <ul className="mt-5 max-w-3xl space-y-3">
          {customers.map((person) => (
            <li key={person.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                  <div>
                    <p className="font-medium">{person.fullName}</p>
                    <p className="text-muted-foreground text-sm">{person.email}</p>
                  </div>
                  <RoleForm personId={person.id} currentRole={person.role} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
