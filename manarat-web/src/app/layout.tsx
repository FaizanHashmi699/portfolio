import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600"],
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  display: "swap",
  weight: ["400", "500", "600"],
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manaratfoundation.org.uk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Manarat Foundation — Masjid & Islamic Centre, Sheldon",
    template: "%s · Manarat Foundation",
  },
  description:
    "The first purpose-established masjid and Islamic centre for the Muslims of Sheldon, Solihull and the surrounding areas. Live prayer times, Islamic calendar, Qibla finder. Registered charity 1148223.",
  keywords: [
    "masjid Sheldon", "mosque Solihull", "prayer times Birmingham",
    "Hifz class Birmingham", "Arabic classes Solihull", "Nikah Birmingham",
    "Islamic centre Coventry Road", "Qibla direction UK", "Ramadan Birmingham",
  ],
  openGraph: {
    type: "website",
    siteName: "Manarat Foundation",
    locale: "en_GB",
    title: "Manarat Foundation — Masjid & Islamic Centre, Sheldon",
    description:
      "Live prayer times, the Islamic calendar, Qibla direction and our classes — for Sheldon, Solihull and east Birmingham.",
  },
  alternates: { canonical: "/" },
};

/**
 * Structured data. A Mosque is a recognised schema.org type, and the
 * geo/openingHours block is what puts prayer-time results in local search.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Mosque",
  name: "Manarat Foundation",
  alternateName: "Manarat Masjid Sheldon",
  url: SITE,
  description:
    "The first purpose-established masjid and Islamic centre for the Muslims of Sheldon, Solihull and the surrounding areas, founded by scholars in 2012.",
  foundingDate: "2012",
  address: {
    "@type": "PostalAddress",
    streetAddress: "155 Coventry Road",
    addressLocality: "Sheldon, Birmingham",
    addressRegion: "West Midlands",
    addressCountry: "GB",
  },
  geo: { "@type": "GeoCoordinates", latitude: 52.4569, longitude: -1.809 },
  areaServed: ["Sheldon", "Solihull", "Yardley", "Acocks Green", "Birmingham"],
  publicAccess: true,
  isAccessibleForFree: true,
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Car park", value: true },
    { "@type": "LocationFeatureSpecification", name: "Women's prayer area", value: true },
  ],
  subjectOf: {
    "@type": "Organization",
    name: "Manarat Foundation",
    identifier: "1148223",
    description: "Registered charity in England and Wales",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plex.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          // Static, author-controlled object — not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
