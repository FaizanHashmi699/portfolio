import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/marketing/contact-form";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${brand.name} about UAE visas, business setup, outbound visas or attestation. We reply within one working day.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  const channels = [
    { icon: MessageCircle, label: "WhatsApp", value: brand.whatsapp.display, href: `https://wa.me/${brand.whatsapp.e164}` },
    { icon: Phone, label: "Phone", value: brand.phone.display, href: `tel:${brand.phone.e164}` },
    { icon: Mail, label: "Email", value: brand.email.general, href: `mailto:${brand.email.general}` },
  ];

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div>
          <h1 className="text-h1">Talk to a human</h1>
          <p className="mt-4 max-w-2xl text-lead text-muted-foreground">
            You don&apos;t have to contact us to find out whether you qualify or what it
            costs — both are on this site already. But if you have a situation that
            doesn&apos;t fit a form, we&apos;d genuinely like to hear it.
          </p>

          <div className="mt-10">
            <ContactForm initialService={service} />
          </div>
        </div>

        <div className="space-y-4">
          {channels.map((channel) => (
            <Card key={channel.label}>
              <CardContent className="flex items-center gap-3.5 pt-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-600 dark:bg-ink-950 dark:text-ink-300">
                  <channel.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{channel.label}</p>
                  <a
                    href={channel.href}
                    className="block truncate font-medium hover:text-primary"
                  >
                    {channel.value}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="flex items-start gap-3.5 pt-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-600 dark:bg-ink-950 dark:text-ink-300">
                <MapPin className="size-5" />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">Office</p>
                <address className="mt-0.5 text-sm not-italic">
                  {brand.address.street}
                  <br />
                  {brand.address.locality}, {brand.address.country}
                </address>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sunday–Thursday, 9am–6pm GST
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
