import { brand } from "@/config/brand";
import { Logo } from "@/components/logo";
import type { Dictionary } from "@/i18n";

export function LocalisedFooter({ dictionary }: { dictionary: Dictionary }) {
  return (
    <footer className="border-border bg-surface mt-auto border-t">
      <div className="container-page py-12">
        <Logo />

        <div className="border-border bg-background text-muted-foreground rounded-card mt-8 border p-5 text-sm">
          <p>
            <strong className="text-foreground">{brand.legalName}</strong>{" "}
            {dictionary.footer.notGovernment}
          </p>
          <p className="mt-3">
            {dictionary.footer.licence} {brand.licenceNumber} ·{" "}
            {dictionary.footer.feesNote}
          </p>
        </div>

        <p className="text-muted-foreground mt-8 text-sm">
          © {new Date().getFullYear()} {brand.legalName}.{" "}
          {dictionary.footer.rightsReserved}
        </p>
      </div>
    </footer>
  );
}
