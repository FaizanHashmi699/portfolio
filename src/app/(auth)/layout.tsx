import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: { default: "Sign in", template: "%s | " + brand.name },
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border border-b">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="border-border text-muted-foreground border-t py-6 text-center text-sm">
        <p>
          <Link href="/" className="hover:text-foreground">
            Back to {brand.name}
          </Link>
          {" · "}
          <Link href="/legal/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          {" · "}
          <Link href="/legal/terms" className="hover:text-foreground">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  );
}
