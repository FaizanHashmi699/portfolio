import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { brand } from "@/config/brand";
import { ThemeProvider } from "@/components/theme-provider";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: `${brand.name} — UAE Visas & Business Setup, Priced Honestly`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  keywords: [
    "UAE visa",
    "Dubai visa consultant",
    "Golden Visa UAE",
    "Dubai business setup",
    "free zone company formation",
    "employment visa Dubai",
    "family sponsorship UAE",
    "document attestation Dubai",
  ],
  authors: [{ name: brand.legalName }],
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: brand.url,
    siteName: brand.name,
    title: `${brand.name} — UAE Visas & Business Setup, Priced Honestly`,
    description: brand.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — UAE Visas & Business Setup`,
    description: brand.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          // JSON-LD is emitted server-side so crawlers see it without executing JS.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
