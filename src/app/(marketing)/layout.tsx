import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";
import { AssistantWidget } from "@/components/marketing/assistant-widget";
import { PageView } from "@/components/analytics/page-view";
import { ServiceWorkerRegistration } from "@/components/analytics/service-worker";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageView />
      <ServiceWorkerRegistration />
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
