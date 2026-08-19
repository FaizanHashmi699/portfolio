/**
 * Single source of truth for brand identity.
 *
 * Renaming the entire product — site, portal, admin, emails, metadata, JSON-LD —
 * is an edit to this file and nothing else. Nothing may hard-code the brand name.
 */
export const brand = {
  name: "Maqam",
  legalName: "Maqam Consultancy FZ-LLC",
  tagline: "Know before you owe.",
  description:
    "UAE visas, business setup, attestation and outbound visas — with transparent all-in pricing, AI document checks and live application tracking.",
  domain: "maqam.ae",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maqam.ae",
  email: {
    general: "hello@maqam.ae",
    support: "support@maqam.ae",
    security: "security@maqam.ae",
  },
  phone: {
    display: "+971 4 000 0000",
    e164: "+97140000000",
  },
  whatsapp: {
    display: "+971 50 000 0000",
    e164: "971500000000",
  },
  address: {
    street: "Sheikh Zayed Road",
    locality: "Dubai",
    region: "Dubai",
    country: "AE",
    postalCode: "00000",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/maqam",
    instagram: "https://www.instagram.com/maqam",
  },
  /** Trade licence number. Displayed in the footer for verifiability. */
  licenceNumber: "TBD-000000",
  vatRate: 0.05,
  currency: "AED",
} as const;

export type Brand = typeof brand;
