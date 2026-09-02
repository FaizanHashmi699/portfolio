import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/admin/ui";
import { CampaignEditor } from "./campaign-editor";
import type { Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("campaigns").select("*").order("created_at");
  const campaigns = (data ?? []) as Campaign[];

  return (
    <>
      <PageTitle
        title="Appeals"
        note="A named project with a visible total raises money. An unnamed reserve does not. The total below updates itself as donations are confirmed."
      />

      <div className="space-y-5">
        {campaigns.map((c) => (
          <CampaignEditor key={c.id} campaign={c} />
        ))}
        <CampaignEditor campaign={null} />
      </div>
    </>
  );
}
