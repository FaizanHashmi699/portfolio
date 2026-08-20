import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";
import { AssistantWidget } from "@/components/marketing/assistant-widget";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <AssistantWidget />
      <WhatsAppButton />
    </>
  );
}
