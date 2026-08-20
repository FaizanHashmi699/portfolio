import type { Faq } from "./faqs";

export const processFaqs: Faq[] = [
  {
    question: "What happens if my documents have a problem?",
    answer:
      "We tell you at upload, before any government fee is spent. Every finding comes with the specific fix — not a generic 'invalid document' message. We will not submit an application while a blocker is outstanding, because submitting anyway would spend your money on a file we expect to be refused.",
  },
  {
    question: "Do I need to attest my degree before applying for a job?",
    answer:
      "If you can, yes. Attestation takes ten to thirty-five working days depending on the country, and it is the most common cause of employment visa delay. Candidates lose offers waiting for a certificate that could have been attested months earlier. Which route applies depends on your nationality — apostille countries have a materially shorter chain than the rest since the UAE joined the Hague Convention in 2022.",
  },
  {
    question: "What is a 'conditional' visa on arrival?",
    answer:
      "For several nationalities, the visa on arrival depends on you also holding a valid residence permit or visa from an approved country — the US, UK, an EU state, Canada, Australia, New Zealand, Japan, Singapore or South Korea. Your passport alone is not enough. This is the single most misunderstood rule in UAE entry and it strands people at airline check-in.",
  },
  {
    question: "Can I change my visa status without leaving the UAE?",
    answer:
      "Often, yes. An in-country status change avoids the cost and disruption of an exit-and-return border run when moving from a visit visa to residence. Availability depends on your nationality and your current visa type, and your visit visa must still be valid — not in its grace period.",
  },
  {
    question: "What if a government fee changes after you quote me?",
    answer:
      "We show you the difference and you decide whether to proceed. We never silently adjust a quote upward. If the change is in your favour, you get the reduction.",
  },
  {
    question: "Who can see my passport and documents?",
    answer:
      "Only you and the staff handling your file. Access is enforced at the database, not just in application code, so a bug in our software is not sufficient to expose your documents to another customer. Files live in private storage reached only through short-lived signed links, and every access and status change is written to an append-only audit log.",
  },
  {
    question: "Can you help if I've already been rejected once?",
    answer:
      "Usually. A previous refusal is not automatically fatal, but it does have to be disclosed and addressed rather than hidden — the record is checked automatically, and an undisclosed refusal surfaces at exactly the moment it cannot be fixed. Tell us up front and we will tell you honestly whether a fresh application is realistic.",
  },
  {
    question: "Do you handle applications from outside the UAE?",
    answer:
      "Yes. Most employment and Golden Visa applications begin while the applicant is still abroad. Document attestation happens in your country of origin, which is why the timeline depends heavily on your nationality — see the page for your country for the specific chain and how long it takes.",
  },
];
