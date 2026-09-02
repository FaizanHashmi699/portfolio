import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/admin/ui";
import { TestimonialEditor } from "./testimonial-editor";
import type { Testimonial } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order");
  const testimonials = (data ?? []) as Testimonial[];

  return (
    <>
      <PageTitle
        title="Testimonials"
        note="Real words from people who use the masjid and the academy. The homepage section stays hidden until at least one is published — nothing invented ever appears there."
      />

      <div className="space-y-5">
        {testimonials.map((t) => (
          <TestimonialEditor key={t.id} testimonial={t} />
        ))}
        <TestimonialEditor testimonial={null} />
      </div>
    </>
  );
}
