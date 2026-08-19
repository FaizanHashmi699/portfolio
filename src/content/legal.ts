import { brand } from "@/config/brand";

export interface LegalDocument {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}

/**
 * Legal pages, kept as structured content rather than prose components so they render
 * consistently and can be reviewed by a lawyer without touching code.
 *
 * These are drafted as a starting point and are NOT a substitute for review by a UAE
 * qualified lawyer before the business trades.
 */
export const legalDocuments: LegalDocument[] = [
  {
    slug: "disclaimer",
    title: "Disclaimer",
    description: `What ${brand.name} can and cannot do, stated plainly.`,
    updated: "2026-08-19",
    sections: [
      {
        heading: "We are not a government entity",
        body: [
          `${brand.legalName} is a private consultancy. We have no affiliation with, and do not act on behalf of, the Federal Authority for Identity and Citizenship (ICP), the General Directorate of Residency and Foreigners Affairs (GDRFA), the Ministry of Human Resources and Emiratisation (MoHRE), any free zone authority, or any embassy or consulate.`,
          "We prepare and submit applications through official channels on your behalf. We do not decide them.",
        ],
      },
      {
        heading: "No guarantee of outcome",
        body: [
          "No visa, permit or licence outcome can be guaranteed by us or by any consultancy. Decisions rest entirely with the relevant authority and may be refused for reasons that are never disclosed to the applicant or to us.",
          "Where this site refers to eligibility, readiness, scores or likelihood, those are assessments of how closely your circumstances match published criteria. They are not predictions of approval and must not be relied on as such.",
        ],
      },
      {
        heading: "Automated assessments",
        body: [
          "Our eligibility engine applies published criteria using deterministic rules. Our document checks apply published document requirements. Both may be incomplete, out of date, or inapplicable to your specific circumstances.",
          "Artificial intelligence is used to explain results in plain language and to assist with document review. It does not determine eligibility. You should not treat any automated output as legal or immigration advice.",
        ],
      },
      {
        heading: "Fees and figures",
        body: [
          "Government and third-party fees shown on this site are indicative and are set by parties other than us. They change without notice. Lines marked as an estimate vary by individual circumstances.",
          "Only a written quotation issued to you directly is binding, and only for the period stated in it.",
        ],
      },
      {
        heading: "Information, not advice",
        body: [
          "Guides and articles on this site are general information about UAE immigration and company formation processes. They are not legal advice and do not create a client relationship. For advice on your circumstances, contact us or consult a qualified UAE legal practitioner.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: `How ${brand.name} collects, uses, stores and deletes your personal data.`,
    updated: "2026-08-19",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Enquiry details you give us: name, email address, phone number and the content of your message.",
          "Application data where you engage us: identity documents, passports, certificates, salary and financial evidence, and other documents required for the specific application.",
          "Technical data: IP address and basic request metadata, used for security and rate limiting only.",
          "The eligibility check runs in your browser. Your answers are not transmitted to us unless you explicitly choose to save or email your report.",
        ],
      },
      {
        heading: "Why we hold it",
        body: [
          "To prepare and submit your application to the relevant authority.",
          "To respond to your enquiry.",
          "To meet our legal, licensing and record-keeping obligations in the UAE.",
          "We do not sell your personal data, and we do not share it with third parties for their own marketing.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "Government authorities and typing centres, strictly as required to process your application.",
          "Mandated third parties in your process: medical centres, insurers, attestation agents and couriers.",
          "Our infrastructure providers, who process data on our instructions under contract.",
        ],
      },
      {
        heading: "How we protect it",
        body: [
          "Documents are stored in private, encrypted storage and are never publicly accessible. Access is granted through short-lived signed links issued only after an authorisation check.",
          "Access to application data is restricted at the database level, so a customer can only ever read their own records.",
          "Every access to and change of an application record is written to an append-only audit log.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Application records are retained for the period required by UAE record-keeping obligations, then deleted.",
          "Enquiries that do not become engagements are deleted within 24 months.",
          "You may request deletion of your data at any time by writing to " + brand.email.support + ". Where a legal obligation requires us to retain a record, we will tell you which, and delete the rest.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request a copy of the personal data we hold about you, ask us to correct it, ask us to delete it, or withdraw consent to marketing at any time.",
          `Write to ${brand.email.support} and we will respond within 30 days.`,
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    description: `The terms on which ${brand.name} provides its services.`,
    updated: "2026-08-19",
    sections: [
      {
        heading: "Our service",
        body: [
          "We provide consultancy, document preparation and submission services in relation to UAE visas, company formation, outbound visa applications and document attestation.",
          "We act as your agent in dealing with authorities and third parties. We do not make decisions on applications and cannot influence them.",
        ],
      },
      {
        heading: "Your responsibilities",
        body: [
          "You must provide accurate, complete and genuine information and documents. Submitting a false or altered document to a UAE authority is a serious offence and we will not do it under any circumstances.",
          "You must respond to requests for information promptly. Delays on your side extend the process and are outside our control.",
          "You must tell us about any previous visa refusal, overstay, immigration record or ban. These materially affect your application, and concealing them is the fastest way to have it refused.",
        ],
      },
      {
        heading: "Fees and payment",
        body: [
          "Our service fee is payable when we begin work. Government and third-party fees are payable as they fall due, and we tell you before each one is incurred.",
          "Government and third-party fees are non-refundable once paid to the receiving party, including where an application is refused. This is the authority's rule, not ours, and no consultancy can change it.",
          "Refund terms for our own service fee are set out in your service agreement and are provided to you in writing before you pay.",
        ],
      },
      {
        heading: "Timelines",
        body: [
          "Processing times shown are typical ranges based on recent experience. They are not commitments. Government processing times vary with volume, policy changes and the specifics of your file.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "We are liable for our own negligence in preparing and submitting your application. We are not liable for the outcome of an application, for government fees lost on a refusal, or for delays caused by an authority or by information you did not disclose.",
          "Nothing in these terms excludes liability that cannot lawfully be excluded.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of the United Arab Emirates and the Emirate of Dubai, and the courts of Dubai have exclusive jurisdiction.",
        ],
      },
    ],
  },
];

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return legalDocuments.find((doc) => doc.slug === slug);
}
