export interface GuideSection {
  heading: string;
  body: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated: string;
  readingMinutes: number;
  category: string;
  /** Linked service slugs, for internal linking and conversion. */
  services: string[];
  intro: string;
  sections: GuideSection[];
}

/**
 * The guide library.
 *
 * This is our long-term organic moat. Competitors run content mills producing hundreds of
 * near-duplicate "cost of X in 2026" posts; we cannot out-publish them and are not going
 * to try. What we can do is answer the questions their posts avoid — the ones where the
 * honest answer costs the writer a lead.
 */
export const guides: Guide[] = [
  {
    slug: "degree-attestation-uae-complete-guide",
    title: "Degree Attestation for the UAE: The Complete Chain, In Order",
    description:
      "The single most common cause of UAE employment visa delay is an incomplete attestation chain. Here is every step, in the order it must happen, and what goes wrong at each one.",
    published: "2026-08-19",
    updated: "2026-08-19",
    readingMinutes: 8,
    category: "Attestation",
    services: ["degree-attestation", "employment-visa-mainland", "mofa-attestation"],
    intro:
      "If your UAE employment visa is stuck, there is roughly a 60% chance the reason is your degree certificate. Attestation is a chain, and a chain has an order — skip a link and every link after it is void, no matter how many stamps you have collected.",
    sections: [
      {
        heading: "The chain, in the only order that works",
        body: [
          "Each step verifies the step before it. That is why order is not negotiable: the UAE embassy will not legalise a document your own foreign ministry has not yet attested, because there is nothing for them to verify.",
        ],
        list: [
          "Notary or the issuing authority in the country where the certificate was issued. In some countries this is the university itself; in others a designated education department (India's HRD, for example).",
          "The Ministry of Foreign Affairs of that same country. This confirms the previous stamp is genuine.",
          "The UAE embassy or consulate in that country. This is the step that makes the document meaningful to UAE authorities.",
          "The UAE Ministry of Foreign Affairs, once the document is in the UAE. The final link.",
        ],
      },
      {
        heading: "What goes wrong, and how often",
        body: [
          "Sending a photocopy. Attestation is performed on the physical original. A colour scan, a notarised copy and a university-issued duplicate are all refused at step one.",
          "Skipping the home country's foreign ministry. This is by far the most common error — applicants go straight from the university to the UAE embassy, get refused, and lose weeks.",
          "A name mismatch between the certificate and the passport. Even a missing middle name or a different transliteration will stop the file. This needs fixing at source or covering with an official affidavit, and it is much cheaper to discover before you start.",
          "A university not recognised by the UAE Ministry of Education. Worth checking before you spend anything at all, because no amount of attestation fixes it.",
        ],
      },
      {
        heading: "How long it really takes",
        body: [
          "Ten working days is the optimistic case, thirty is realistic, and some countries run longer. The home country steps dominate the timeline; the UAE-side steps are usually two to three days.",
          "Start attestation before you start job hunting if you can. Candidates lose offers waiting for a certificate that could have been attested months earlier, and employers rarely hold a role open for a month.",
        ],
      },
      {
        heading: "If your document is already legalised abroad",
        body: [
          "If the UAE embassy in the issuing country has already stamped it, you only need the final UAE MOFA step. That is fast and inexpensive — usually one to three days.",
          "Before submitting, check the earlier stamps are present and legible. A MOFA submission on a broken chain is refused, and you pay again.",
        ],
      },
    ],
  },
  {
    slug: "uae-golden-visa-which-route",
    title: "UAE Golden Visa: Which Route Actually Applies to You",
    description:
      "There is no single Golden Visa. There are several routes with completely different criteria, and applying under the wrong one is the most expensive mistake in UAE immigration.",
    published: "2026-08-19",
    updated: "2026-08-19",
    readingMinutes: 9,
    category: "Golden Visa",
    services: ["golden-visa", "free-zone-company-setup"],
    intro:
      "Most Golden Visa content treats it as one product with one price. It is not. It is a family of routes — salary, property, specialised talent, entrepreneur, and since 2026 an expanded creators category — each with its own criteria, evidence requirements and government fee. Picking the wrong one wastes both the fee and the months.",
    sections: [
      {
        heading: "The salary route",
        body: [
          "The most straightforward if you qualify: a monthly salary at or above the threshold, evidenced by an attested salary certificate and bank statements that actually corroborate it.",
          "The commonest failure here is a mismatch between the salary certificate and the bank credits. If your certificate says AED 32,000 and your account receives AED 24,000 plus allowances paid separately, expect questions. Prepare the explanation before you are asked.",
        ],
      },
      {
        heading: "The property investment route",
        body: [
          "Requires UAE property at or above the investment threshold, on a title deed in your own name. Multiple properties can be combined.",
          "Company-held property does not qualify on this route. If the property is mortgaged, you need a bank letter confirming the paid-up amount still clears the threshold — the purchase price alone is not the test.",
        ],
      },
      {
        heading: "Specialised talent",
        body: [
          "Covers doctors, scientists, inventors, senior executives and creative professionals. The qualification matters, but documented recognition is what actually decides it: accreditation, patents, publications, awards or an official nomination.",
          "Applicants routinely underestimate this. A strong CV is not recognition. A named award, a granted patent, a peer-reviewed publication or a nominating body's letter is.",
        ],
      },
      {
        heading: "Creators and freelancers — the 2026 expansion",
        body: [
          "In 2026 the UAE expanded Golden Visa eligibility to content creators, influencers, podcasters and visual artists, primarily through the Dubai Creators HQ programme.",
          "Evidence here is portfolio-shaped: published work, verified audience metrics, media coverage, brand partnerships. A sustained multi-year track record counts for considerably more than a recent spike.",
        ],
      },
      {
        heading: "The entrepreneur route",
        body: [
          "Requires an approved technical or innovative project at or above the valuation threshold, endorsed by an accredited UAE incubator or an approved auditor.",
          "The endorsement is the hard part and the part most applicants leave until last. Secure it before assembling anything else, because without it nothing else matters.",
        ],
      },
      {
        heading: "How to choose",
        body: [
          "Assess every route you might satisfy, then apply under the strongest — not the first one that seems plausible. Government fees are non-refundable, so a wrong choice costs both the fee and the elapsed months.",
          "Our eligibility check ranks all of them against your circumstances in about two minutes, with no sign-up. If nothing else, use it to rule routes out before you spend money.",
        ],
      },
    ],
  },
  {
    slug: "uae-visa-rejection-reasons",
    title: "Why UAE Visa Applications Get Rejected — And How to Pre-Empt It",
    description:
      "Most refusals come down to a small set of preventable errors. Here is the list, ranked by how often we see each one, and what to check before you submit.",
    published: "2026-08-19",
    updated: "2026-08-19",
    readingMinutes: 7,
    category: "Applications",
    services: [
      "tourist-visa-30-day",
      "employment-visa-mainland",
      "family-sponsorship-visa",
    ],
    intro:
      "Visa refusals feel arbitrary from the outside. They mostly are not. The overwhelming majority trace back to a handful of document errors that are entirely visible before submission — which is precisely why we check for them at upload rather than after your fees are spent.",
    sections: [
      {
        heading: "Passport validity under six months",
        body: [
          "The UAE requires at least six months of validity beyond your intended entry date. Note what that means: it is measured from your entry, not from today. A passport that looks fine when you apply can be short by the time you travel.",
          "This is the single most common tourist visa refusal, and the easiest to eliminate.",
        ],
      },
      {
        heading: "Photograph specification",
        body: [
          "White background, 43×55mm, face occupying 70–80% of the frame, neutral expression, both ears visible, no glare on glasses.",
          "Phone photos against a cream wall fail. So do photos cropped from a larger image, because the face ratio ends up wrong. Since 2026 the government's automated screening checks the photograph directly, so a marginal photo that a human might once have waved through now gets flagged.",
        ],
      },
      {
        heading: "Name inconsistency across documents",
        body: [
          "Your passport, degree certificate, marriage certificate and employment contract must all show the same name. A missing middle name, a different transliteration or a maiden name on one document is enough to stop the file.",
          "Fix this at source where you can. Where you cannot, an official affidavit explaining the variation, properly attested, is the accepted route.",
        ],
      },
      {
        heading: "Incomplete attestation",
        body: [
          "For employment visas, an unattested or partially attested degree is the dominant cause of delay. The chain must be complete and in order.",
        ],
      },
      {
        heading: "Financial evidence that does not hold up",
        body: [
          "For sponsorship and outbound visas, the question is not only whether the balance is sufficient but whether it is genuinely yours and stable. Large deposits shortly before applying invite scrutiny rather than allaying it.",
          "Statements should be stamped by the bank and recent — within three months.",
        ],
      },
      {
        heading: "Unresolved immigration history",
        body: [
          "A previous overstay, an absconding report or an active labour ban will block a new application until it is settled. Concealing it does not work; the record is checked automatically.",
          "Tell your consultant up front. A disclosed problem is usually solvable. An undisclosed one surfaces at exactly the moment it cannot be.",
        ],
      },
    ],
  },
  {
    slug: "free-zone-vs-mainland-dubai",
    title: "Free Zone or Mainland? Choose on Your Activity, Not on Price",
    description:
      "The free zone versus mainland decision is usually presented as a cost comparison. That is the wrong axis. Here is the question that actually decides it.",
    published: "2026-08-19",
    updated: "2026-08-19",
    readingMinutes: 7,
    category: "Business Setup",
    services: ["free-zone-company-setup", "mainland-company-setup", "golden-visa"],
    intro:
      "Almost every comparison of Dubai free zone and mainland licences leads with price. Price is the least important variable. What decides it is who your customers are and where they are.",
    sections: [
      {
        heading: "The question that actually decides it",
        body: [
          "Will you invoice customers inside the UAE local market, or bid for UAE government contracts? If yes, you need mainland. If your clients are overseas, or other free zone entities, a free zone licence is usually the better instrument.",
          "Everything else — cost, ownership, visa quota — is secondary to that. Choosing a free zone licence and then discovering you cannot invoice your main UAE customer is an expensive way to learn this.",
        ],
      },
      {
        heading: "What free zones are genuinely good at",
        body: [
          "100% foreign ownership, straightforward incorporation, no requirement for physical premises in many zones, and visa quota bundled into the package.",
          "The trade-off is scope: you trade within the zone and internationally, and reach the UAE local market through a distributor or a branch rather than directly.",
        ],
      },
      {
        heading: "What mainland is genuinely good at",
        body: [
          "Unrestricted trading anywhere in the UAE, direct contracting with government entities, and no restriction on where you take an office. Most activities now permit full foreign ownership.",
          "The real cost is premises: mainland licences require physical space with a registered Ejari. That is often the largest single line in a mainland setup and it is frequently understated in comparison articles, which is how a 'from AED 14,999' figure becomes AED 25,000 in practice.",
        ],
      },
      {
        heading: "Choosing between free zones",
        body: [
          "Free zones are not interchangeable. Each publishes its own permitted activity list, its own visa quota rules, and its own fee structure. A consultancy licence is cheap in some zones and impossible in others.",
          "Ask any consultant which zones they compared and why they recommend one. If the answer is vague, the recommendation is probably commission-driven — free zones pay agents referral fees, and that is exactly where a consultant's incentives and yours diverge.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
