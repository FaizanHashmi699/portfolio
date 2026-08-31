import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/admin/ui";
import { ProgrammeEditor } from "./programme-editor";
import type { Programme } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProgrammesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("programmes").select("*").order("sort_order");
  const programmes = (data ?? []) as Programme[];

  return (
    <>
      <PageTitle
        title="Programmes"
        note="Fees, times and age ranges shown on the public programme pages. Keeping these current is what lets a parent decide without phoning."
      />

      <div className="space-y-4">
        {programmes.map((p) => (
          <ProgrammeEditor key={p.id} programme={p} />
        ))}
        <ProgrammeEditor programme={null} />
      </div>
    </>
  );
}
