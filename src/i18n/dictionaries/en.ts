/**
 * The English dictionary is the source of truth. Every other locale is typed against
 * `Dictionary`, so a missing key is a build error rather than a blank space on a page.
 */
export const en = {
  meta: {
    homeTitle: "UAE Visas & Business Setup, Priced Honestly",
    homeDescription:
      "Check which UAE visa you qualify for in two minutes — no phone number required. Then see the full cost broken down to the dirham.",
  },
  nav: {
    services: "Services",
    pricing: "Pricing",
    eligibility: "Check eligibility",
    guides: "Guides",
    about: "About",
    contact: "Contact",
    signIn: "Sign in",
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },
  hero: {
    badge: "The UAE now screens applications with AI.",
    badgeMuted: "So do we — first.",
    titleLine1: "Know before",
    titleLine2: "you owe.",
    subtitle:
      "Check which UAE visa you qualify for in about two minutes — no phone number, no sales call, no obligation. Then see the full cost broken down to the dirham, before you commit to anything.",
    primaryCta: "Check my eligibility",
    secondaryCta: "See every fee",
    reassurance: "Free, and you keep the result.",
    disclaimer: "No outcome is ever guaranteed.",
  },
  common: {
    allIn: "All-in total",
    ourFee: "Our fee",
    governmentAndThirdParty: "Government & third party",
    vat: "VAT (5%)",
    total: "Total",
    workingDays: "working days",
    readMore: "Read more",
    startApplication: "Start this application",
    fullBreakdown: "Full breakdown",
  },
  footer: {
    notGovernment:
      "is a private consultancy. We are not a government entity and are not affiliated with the ICP, GDRFA, MoHRE or any embassy. We prepare and submit applications on your behalf — we do not decide them, and no one can guarantee a visa outcome.",
    licence: "Trade licence",
    feesNote:
      "Fees shown are indicative and confirmed in writing before any payment is taken.",
    rightsReserved: "All rights reserved.",
  },
  translation: {
    noticeTitle: "This page is machine-assisted",
    noticeBody:
      "Navigation and key pages are translated. Service details, fees and legal text remain in English until professionally reviewed — a mistranslated eligibility criterion could cost you a non-refundable government fee, and we are not willing to risk that for convenience.",
    viewInEnglish: "View in English",
  },
};

export type Dictionary = typeof en;
