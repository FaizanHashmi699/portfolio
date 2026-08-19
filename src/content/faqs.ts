export interface Faq {
  question: string;
  answer: string;
}

/**
 * FAQ content is real answers, not keyword bait. These are also emitted as FAQPage
 * structured data, which is the cheapest route to rich results in a category where the
 * incumbents have an eight-year content head start on us.
 */
export const homeFaqs: Faq[] = [
  {
    question: "Do I have to give my phone number to check if I'm eligible?",
    answer:
      "No. The eligibility check runs entirely in your browser session and shows your result on screen with no sign-up. You can optionally give us an email address to save a copy, but nothing is required to see the answer.",
  },
  {
    question: "Are the prices on this site the real, final prices?",
    answer:
      "They are complete totals at today's published rates, itemised into government fees, third-party costs (medical, insurance, typing centres), our service fee, and 5% VAT. Some costs genuinely vary — health insurance by age, free zone licences by activity — and we label those as estimates rather than pretending to a precision we don't have. Government fees are set by the authorities and can change without notice; if one changes between your quote and submission, we show you the difference and you decide.",
  },
  {
    question: "Can you guarantee my visa will be approved?",
    answer:
      "No, and neither can anyone else. Visa decisions are made by UAE government authorities, not by consultants. Any firm promising a guaranteed approval is either misleading you or planning to. What we can do is check your file against the published criteria and the same automated checks the government now applies, so you know your readiness before you spend anything.",
  },
  {
    question: "What does the AI actually do?",
    answer:
      "Two things. It checks your uploaded documents for the problems that cause rejections — passport validity, photo specification, name consistency across your file, incomplete attestation chains — and it explains your eligibility result in plain language. The eligibility decision itself is made by a deterministic rules engine, not by the AI: the rules are versioned data with effective dates, so every result can be reproduced and audited. The AI explains the outcome; it never decides it.",
  },
  {
    question: "Why did the UAE's AI screening change anything?",
    answer:
      "Since May 2026 the ICP and MoHRE have screened work permit applications with an automated system that scores skills, education and experience against live labour-market data and verifies documents automatically. Clean files now move much faster, and weak ones get flagged earlier. The practical consequence is that preparing a file correctly the first time matters more than it ever did, and knowing in advance how it will score is worth more than knowing someone at a counter.",
  },
  {
    question: "How long does a UAE visa actually take?",
    answer:
      "A tourist visa is typically 2–4 working days. A free zone employment visa runs 1–3 weeks end to end, and a mainland employment visa 2–4 weeks because MoHRE steps are involved. A Golden Visa is 3 weeks to 2 months depending on the route and how quickly your evidence pack comes together. Every service page publishes its own realistic window, including the stages where the delay is on the government's side rather than ours.",
  },
  {
    question: "What's the most common reason applications get rejected?",
    answer:
      "For employment visas it is an incomplete degree attestation chain — legalisation must run notary, home country MOFA, UAE embassy, then UAE MOFA, and skipping a step invalidates the ones after it. For tourist visas it is passport validity under six months and photographs with a non-white background. All three are entirely preventable, which is exactly why we check for them at upload rather than after submission.",
  },
  {
    question: "Are you a government office?",
    answer:
      "No. We are a private consultancy and have no affiliation with the ICP, GDRFA, MoHRE or any embassy. We prepare and submit applications on your behalf through the official channels. Any company implying government affiliation is worth walking away from.",
  },
];
