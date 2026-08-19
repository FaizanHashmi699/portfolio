import type { ServiceDefinition } from "./types";

/**
 * The service catalog.
 *
 * Every fee below is split into government / third-party / service so the customer can
 * verify each line independently. Figures are indicative 2026 market rates and MUST be
 * reconciled against official sources (ICP, GDRFA, MoHRE, free-zone authorities) before
 * being presented as a binding quote. `estimated: true` marks any line that genuinely varies.
 *
 * See docs/research/sources.md for the benchmarks these were derived from.
 */

const MEDICAL = {
  kind: "third-party" as const,
  label: "Medical fitness test",
  amount: 320,
  vatable: true,
  note: "Paid to an approved DHA medical centre. Required for all residence visas.",
};

const TYPING = {
  kind: "third-party" as const,
  label: "Typing centre & e-service charges",
  amount: 120,
  vatable: true,
  note: "Mandatory Amer/Tasheel channel charges for electronic submission.",
};

export const services: ServiceDefinition[] = [
  // ────────────────────────────────── UAE VISAS ──────────────────────────────────
  {
    slug: "tourist-visa-30-day",
    pillar: "uae-visas",
    name: "UAE Tourist Visa — 30 days",
    summary: "Single-entry 30-day tourist visa, approved in 2–4 working days.",
    description:
      "A single-entry visit visa valid for 30 days from entry, suitable for tourism and family visits. We validate your passport, photo and supporting bookings against ICP requirements before submission, which is where the overwhelming majority of tourist visa rejections originate.",
    audience: "Visitors from countries not eligible for visa on arrival.",
    fees: [
      {
        kind: "government",
        label: "ICP entry permit fee",
        amount: 250,
        vatable: false,
        note: "Paid directly to the Federal Authority for Identity and Citizenship.",
      },
      { ...TYPING, amount: 30, note: "Electronic submission charge." },
      {
        kind: "service",
        label: "Maqam service fee",
        amount: 120,
        vatable: true,
        note: "Document validation, submission and tracking until the visa issues.",
      },
    ],
    expressSurcharge: 150,
    processingDays: { min: 2, max: 4 },
    expressDays: { min: 1, max: 2 },
    stages: [
      { title: "Documents uploaded", description: "You upload your passport and photo. We validate both instantly.", days: 0, actor: "customer" },
      { title: "Pre-submission check", description: "We confirm photo spec, passport validity and supporting bookings.", days: 1, actor: "maqam" },
      { title: "Submitted to ICP", description: "Application lodged through the official channel.", days: 0, actor: "maqam" },
      { title: "Government processing", description: "ICP reviews and issues the entry permit.", days: 3, actor: "government" },
      { title: "Visa issued", description: "Your e-visa is delivered to your portal and email.", days: 0, actor: "maqam" },
    ],
    documents: [
      { id: "passport", label: "Passport bio page", description: "Colour scan, valid at least 6 months beyond your intended entry date." },
      { id: "photo", label: "Passport photograph", description: "White background, 43×55mm, face occupying 70–80% of the frame." },
      { id: "ticket", label: "Return flight booking", description: "Confirmed onward or return ticket." },
      { id: "accommodation", label: "Accommodation proof", description: "Hotel booking or a host's Emirates ID and tenancy contract.", conditional: "Required if staying with a resident host." },
    ],
    commonRejectionReasons: [
      "Passport with less than 6 months validity remaining at entry",
      "Photograph with a non-white or patterned background",
      "Name spelling inconsistent between passport and application",
      "No confirmed return ticket or accommodation proof",
      "A previous UAE visa overstay or unresolved absconding record",
    ],
    related: ["tourist-visa-60-day", "status-change", "visa-renewal"],
    popular: true,
  },
  {
    slug: "tourist-visa-60-day",
    pillar: "uae-visas",
    name: "UAE Tourist Visa — 60 days",
    summary: "Single-entry 60-day visa for longer stays and job-seeking visits.",
    description:
      "A 60-day single-entry visit visa, commonly used by visitors staying with family or exploring the market before relocating. Extendable in-country subject to ICP approval.",
    audience: "Longer-stay visitors, job seekers and family visiting UAE residents.",
    fees: [
      { kind: "government", label: "ICP entry permit fee", amount: 450, vatable: false, note: "Paid directly to the ICP." },
      { ...TYPING, amount: 30, note: "Electronic submission charge." },
      { kind: "service", label: "Maqam service fee", amount: 150, vatable: true, note: "Document validation, submission and tracking." },
    ],
    expressSurcharge: 150,
    processingDays: { min: 2, max: 4 },
    expressDays: { min: 1, max: 2 },
    stages: [
      { title: "Documents uploaded", description: "Passport and photo validated on upload.", days: 0, actor: "customer" },
      { title: "Pre-submission check", description: "We verify eligibility and supporting documents.", days: 1, actor: "maqam" },
      { title: "Submitted to ICP", description: "Application lodged officially.", days: 0, actor: "maqam" },
      { title: "Government processing", description: "ICP reviews and issues.", days: 3, actor: "government" },
      { title: "Visa issued", description: "E-visa delivered to your portal.", days: 0, actor: "maqam" },
    ],
    documents: [
      { id: "passport", label: "Passport bio page", description: "Valid at least 6 months beyond intended entry." },
      { id: "photo", label: "Passport photograph", description: "White background, 43×55mm." },
      { id: "ticket", label: "Return flight booking", description: "Confirmed onward or return ticket." },
      { id: "accommodation", label: "Accommodation proof", description: "Hotel booking or host documents." },
    ],
    commonRejectionReasons: [
      "Insufficient passport validity",
      "Photo failing the white-background specification",
      "Previous overstay on a UAE visit visa",
      "Insufficient evidence of intent to depart",
    ],
    related: ["tourist-visa-30-day", "status-change"],
  },
  {
    slug: "employment-visa-free-zone",
    pillar: "uae-visas",
    name: "Employment Visa — Free Zone",
    summary: "Full free-zone residence visa including medical, Emirates ID and stamping.",
    description:
      "The complete free-zone employment residence process: entry permit, status change or entry, medical fitness, Emirates ID biometrics and residence stamping. Since May 2026 the ICP and MoHRE screen work permits with an AI system that scores skills, education and experience against live labour-market data — we validate your file against those criteria before submission.",
    audience: "Employees hired by a company licensed in a UAE free zone.",
    fees: [
      { kind: "government", label: "Free zone employment entry permit", amount: 1150, vatable: false, note: "Charged by the free-zone authority." },
      { kind: "government", label: "Residence visa stamping", amount: 500, vatable: false },
      { kind: "government", label: "Emirates ID (2 years)", amount: 370, vatable: false, note: "Federal Authority ID card fee." },
      MEDICAL,
      { kind: "third-party", label: "Basic health insurance (1 year)", amount: 850, vatable: true, estimated: true, note: "Mandatory. Cost varies by age and plan; this is a representative basic plan." },
      TYPING,
      { kind: "service", label: "Maqam service fee", amount: 1500, vatable: true, note: "End-to-end handling, document validation, appointments and tracking." },
    ],
    expressSurcharge: 750,
    processingDays: { min: 7, max: 21 },
    expressDays: { min: 5, max: 10 },
    stages: [
      { title: "Offer & documents collected", description: "Employment offer, passport, photo and qualifications uploaded.", days: 0, actor: "customer" },
      { title: "Document validation", description: "We verify attestation, name consistency and eligibility against MoHRE criteria.", days: 1, actor: "maqam" },
      { title: "Entry permit application", description: "Submitted to the free-zone authority.", days: 5, actor: "government" },
      { title: "Status change or entry", description: "You enter on the permit, or change status in-country.", days: 2, actor: "customer" },
      { title: "Medical fitness test", description: "Blood test and chest X-ray at an approved centre.", days: 2, actor: "customer" },
      { title: "Emirates ID biometrics", description: "Fingerprints and photo captured at an ICP centre.", days: 1, actor: "customer" },
      { title: "Residence stamping", description: "Visa endorsed and Emirates ID issued.", days: 5, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Passport bio page", description: "Minimum 6 months validity." },
      { id: "photo", label: "Passport photograph", description: "White background, meeting ICP specification." },
      { id: "offer", label: "Employment offer letter", description: "Signed offer from your free-zone employer." },
      { id: "degree", label: "Educational certificate", description: "Degree certificate, fully attested.", attestationRequired: true, conditional: "Required for skilled and professional categories." },
      { id: "experience", label: "Experience certificates", description: "Previous employment letters supporting the declared role.", conditional: "Strengthens AI screening outcomes for senior roles." },
    ],
    commonRejectionReasons: [
      "Degree certificate not attested through the complete legalisation chain",
      "Declared job title inconsistent with the qualification submitted",
      "Name mismatch between passport and educational certificate",
      "Medical fitness test failure",
      "An active labour ban or unresolved previous employment record",
    ],
    related: ["employment-visa-mainland", "degree-attestation", "visa-renewal"],
    popular: true,
  },
  {
    slug: "employment-visa-mainland",
    pillar: "uae-visas",
    name: "Employment Visa — Mainland",
    summary: "MoHRE work permit and residence visa for mainland employers.",
    description:
      "Mainland employment involves MoHRE in addition to the ICP, adding the work permit and labour contract steps. We handle the full sequence and validate your file against the AI screening criteria MoHRE has applied to every work-permit application since May 2026.",
    audience: "Employees hired by a company holding a DED mainland trade licence.",
    fees: [
      { kind: "government", label: "MoHRE work permit", amount: 2000, vatable: false, estimated: true, note: "Varies by company category and skill level. Category 2, skill level 3 shown." },
      { kind: "government", label: "Entry permit", amount: 500, vatable: false },
      { kind: "government", label: "Residence visa stamping", amount: 650, vatable: false },
      { kind: "government", label: "Emirates ID (2 years)", amount: 370, vatable: false },
      MEDICAL,
      { kind: "third-party", label: "Basic health insurance (1 year)", amount: 900, vatable: true, estimated: true, note: "Mandatory under Dubai health insurance law." },
      { ...TYPING, amount: 150 },
      { kind: "service", label: "Maqam service fee", amount: 1800, vatable: true, note: "MoHRE and ICP handling, document validation, appointment coordination." },
    ],
    expressSurcharge: 900,
    processingDays: { min: 14, max: 28 },
    expressDays: { min: 7, max: 14 },
    stages: [
      { title: "Documents collected", description: "Offer, passport, photo and attested qualifications uploaded.", days: 0, actor: "customer" },
      { title: "Document validation", description: "Attestation chain and MoHRE eligibility verified.", days: 1, actor: "maqam" },
      { title: "MoHRE work permit", description: "Quota check, offer letter and work permit approval.", days: 7, actor: "government" },
      { title: "Entry permit issued", description: "ICP entry permit granted.", days: 3, actor: "government" },
      { title: "Medical & biometrics", description: "Medical fitness test and Emirates ID capture.", days: 3, actor: "customer" },
      { title: "Labour contract signed", description: "Contract registered with MoHRE.", days: 2, actor: "customer" },
      { title: "Residence stamping", description: "Visa endorsed and Emirates ID issued.", days: 7, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Passport bio page", description: "Minimum 6 months validity." },
      { id: "photo", label: "Passport photograph", description: "White background, ICP specification." },
      { id: "offer", label: "Signed employment offer", description: "MoHRE-format offer letter from your employer." },
      { id: "degree", label: "Attested degree certificate", description: "Full chain: notary, home MOFA, UAE embassy, UAE MOFA.", attestationRequired: true },
      { id: "experience", label: "Experience certificates", description: "Supporting the declared job title and skill level." },
    ],
    commonRejectionReasons: [
      "Employer quota unavailable for the requested skill category",
      "Degree attestation chain incomplete — the single most common cause",
      "Job title not matching the qualification under MoHRE skill classification",
      "Active labour ban from a previous employer",
      "Salary below the threshold for the declared skill level",
    ],
    related: ["employment-visa-free-zone", "degree-attestation", "mainland-company-setup"],
  },
  {
    slug: "golden-visa",
    pillar: "uae-visas",
    name: "UAE Golden Visa — 10 Year",
    summary: "Long-term residence for investors, talent, specialists and high earners.",
    description:
      "The Golden Visa grants 10-year renewable residence without a sponsor, with the right to sponsor family and staff. Eligibility runs through several distinct routes — salary, property investment, specialised talent, and since 2026 the expanded creators and freelancers category under the Dubai Creators HQ programme. Choosing the wrong route is the most expensive mistake in this process; our eligibility engine ranks every route you qualify for before you apply.",
    audience: "High earners, property investors, specialised talent, entrepreneurs and content creators.",
    fees: [
      { kind: "government", label: "ICP Golden Visa fee", amount: 4695, vatable: false, estimated: true, note: "Salary and talent routes. The property investment route carries a materially higher fee." },
      { kind: "government", label: "Emirates ID (10 years)", amount: 1150, vatable: false },
      { kind: "third-party", label: "Medical fitness test (premium)", amount: 750, vatable: true },
      { kind: "third-party", label: "Health insurance (1 year)", amount: 1200, vatable: true, estimated: true },
      { ...TYPING, amount: 200 },
      { kind: "service", label: "Maqam service fee", amount: 5000, vatable: true, note: "Route selection, nomination handling, evidence pack preparation and full case management." },
    ],
    expressSurcharge: 2500,
    processingDays: { min: 21, max: 60 },
    expressDays: { min: 14, max: 30 },
    stages: [
      { title: "Eligibility assessment", description: "We rank every Golden Visa route you qualify for and recommend the strongest.", days: 1, actor: "maqam" },
      { title: "Evidence pack assembled", description: "Salary certificates, title deeds, portfolio or nomination evidence prepared.", days: 5, actor: "customer" },
      { title: "Nomination submitted", description: "Application lodged with the relevant nominating authority.", days: 2, actor: "maqam" },
      { title: "Authority review", description: "The nominating body assesses your evidence.", days: 21, actor: "government" },
      { title: "Approval & entry permit", description: "Golden Visa pre-approval and entry permit issued.", days: 7, actor: "government" },
      { title: "Medical & Emirates ID", description: "Medical fitness and biometric capture.", days: 3, actor: "customer" },
      { title: "Residence issued", description: "10-year residence stamped and Emirates ID delivered.", days: 7, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Passport bio page", description: "Minimum 6 months validity." },
      { id: "photo", label: "Passport photograph", description: "White background, ICP specification." },
      { id: "salary", label: "Salary certificate & payslips", description: "Attested salary certificate plus 6 months of payslips.", conditional: "Salary route only." },
      { id: "bank", label: "Bank statements", description: "6 months, stamped by the bank.", conditional: "Salary and investor routes." },
      { id: "titledeed", label: "Property title deed", description: "DLD title deed meeting the investment threshold.", conditional: "Property investment route only." },
      { id: "portfolio", label: "Portfolio & recognition evidence", description: "Published work, audience metrics, awards or media coverage.", conditional: "Creators and specialised talent routes." },
      { id: "degree", label: "Attested degree certificate", description: "Required for most talent and specialist routes.", attestationRequired: true },
    ],
    commonRejectionReasons: [
      "Applying under a route the applicant does not actually satisfy",
      "Salary certificate not attested or inconsistent with bank credits",
      "Property below the investment threshold, or mortgaged beyond the permitted ratio",
      "Insufficient evidence of recognition for the talent or creator routes",
      "Gaps or inconsistencies across the supporting evidence pack",
    ],
    related: ["employment-visa-mainland", "free-zone-company-setup", "degree-attestation"],
    popular: true,
  },
  {
    slug: "family-sponsorship-visa",
    pillar: "uae-visas",
    name: "Family Sponsorship Visa",
    summary: "Sponsor your spouse, children or parents for UAE residence.",
    description:
      "UAE residents meeting the salary and accommodation thresholds can sponsor immediate family. The requirements differ significantly for spouses, sons over 18, daughters, and parents — and the accommodation evidence is where most applications stall.",
    audience: "UAE residents sponsoring a spouse, children or parents.",
    fees: [
      { kind: "government", label: "Entry permit", amount: 500, vatable: false },
      { kind: "government", label: "Residence visa stamping", amount: 650, vatable: false },
      { kind: "government", label: "Emirates ID (2 years)", amount: 370, vatable: false },
      MEDICAL,
      { kind: "third-party", label: "Health insurance (1 year)", amount: 1000, vatable: true, estimated: true },
      { ...TYPING, amount: 150 },
      { kind: "service", label: "Maqam service fee", amount: 1200, vatable: true, note: "Per dependant. Eligibility check, document preparation and submission." },
    ],
    processingDays: { min: 10, max: 21 },
    stages: [
      { title: "Sponsor eligibility check", description: "We verify your salary, tenancy and visa category meet the threshold.", days: 1, actor: "maqam" },
      { title: "Documents collected", description: "Attested marriage or birth certificate, Ejari, salary certificate.", days: 0, actor: "customer" },
      { title: "Entry permit application", description: "Submitted to GDRFA or ICP.", days: 5, actor: "government" },
      { title: "Medical & biometrics", description: "Medical fitness and Emirates ID capture for the dependant.", days: 3, actor: "customer" },
      { title: "Residence stamping", description: "Visa endorsed and Emirates ID issued.", days: 7, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Dependant's passport", description: "Minimum 6 months validity." },
      { id: "sponsor-eid", label: "Sponsor's Emirates ID & visa", description: "Valid residence visa with sufficient remaining validity." },
      { id: "salary-cert", label: "Salary certificate", description: "Attested by your employer, meeting the sponsorship threshold." },
      { id: "ejari", label: "Ejari tenancy contract", description: "Registered tenancy with an adequate number of bedrooms." },
      { id: "marriage", label: "Marriage certificate", description: "Fully attested for UAE use.", attestationRequired: true, conditional: "Spouse sponsorship only." },
      { id: "birth", label: "Birth certificate", description: "Fully attested for UAE use.", attestationRequired: true, conditional: "Child sponsorship only." },
    ],
    commonRejectionReasons: [
      "Sponsor's salary below the category threshold",
      "Marriage or birth certificate not attested for UAE use",
      "Tenancy contract not registered with Ejari, or too few bedrooms",
      "Sponsoring a son over 18 without a valid exemption",
      "Sponsor's own residence visa expiring within the required window",
    ],
    related: ["employment-visa-mainland", "visa-renewal", "degree-attestation"],
  },
  {
    slug: "visa-renewal",
    pillar: "uae-visas",
    name: "Residence Visa Renewal",
    summary: "Renew an expiring UAE residence visa without a lapse in status.",
    description:
      "Residence renewal must complete before expiry, or overstay fines begin accruing daily. We track your expiry date and start the process with enough runway to absorb a medical retest if one is needed.",
    audience: "UAE residents whose visa expires within the next 90 days.",
    fees: [
      { kind: "government", label: "Residence renewal", amount: 650, vatable: false },
      { kind: "government", label: "Emirates ID renewal (2 years)", amount: 370, vatable: false },
      MEDICAL,
      { kind: "third-party", label: "Health insurance renewal (1 year)", amount: 900, vatable: true, estimated: true },
      TYPING,
      { kind: "service", label: "Maqam service fee", amount: 900, vatable: true, note: "Expiry monitoring, appointment booking and submission." },
    ],
    processingDays: { min: 5, max: 12 },
    stages: [
      { title: "Renewal window opens", description: "We alert you 90 days before expiry.", days: 0, actor: "maqam" },
      { title: "Documents refreshed", description: "Updated passport, photo and insurance collected.", days: 0, actor: "customer" },
      { title: "Medical fitness test", description: "Repeat medical at an approved centre.", days: 2, actor: "customer" },
      { title: "Submitted for renewal", description: "Application lodged with the ICP.", days: 1, actor: "maqam" },
      { title: "Renewed & stamped", description: "New residence and Emirates ID issued.", days: 7, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Passport bio page", description: "Must have at least 6 months validity." },
      { id: "eid", label: "Current Emirates ID", description: "Front and back." },
      { id: "photo", label: "Recent passport photograph", description: "White background, ICP specification." },
      { id: "insurance", label: "Valid health insurance", description: "Active policy covering the renewal period." },
    ],
    commonRejectionReasons: [
      "Starting the renewal after the visa has already expired",
      "Passport validity insufficient to support a full renewal term",
      "Health insurance lapsed or not meeting minimum benefit requirements",
      "Unpaid fines or traffic violations blocking the file",
    ],
    related: ["employment-visa-free-zone", "family-sponsorship-visa", "status-change"],
  },
  {
    slug: "status-change",
    pillar: "uae-visas",
    name: "Status Change (In-Country)",
    summary: "Convert a visit visa to residence without leaving the UAE.",
    description:
      "An in-country status change avoids the cost and disruption of an exit-and-return border run when moving from a visit visa to residence. Availability depends on your nationality and current visa type.",
    audience: "Visitors in the UAE transitioning to a residence visa.",
    fees: [
      { kind: "government", label: "Status change fee", amount: 640, vatable: false },
      { ...TYPING, amount: 150 },
      { kind: "service", label: "Maqam service fee", amount: 450, vatable: true, note: "Eligibility confirmation and same-day submission." },
    ],
    processingDays: { min: 1, max: 3 },
    stages: [
      { title: "Eligibility confirmed", description: "We verify your nationality and current visa permit an in-country change.", days: 0, actor: "maqam" },
      { title: "Submitted", description: "Status change lodged with the ICP.", days: 1, actor: "maqam" },
      { title: "Status changed", description: "You are now on a residence track without exiting.", days: 1, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Passport bio page", description: "With the current visit visa or entry stamp." },
      { id: "entry-permit", label: "New residence entry permit", description: "The approved entry permit you are converting onto." },
    ],
    commonRejectionReasons: [
      "Nationality not eligible for in-country status change",
      "Current visit visa already expired or in the grace period",
      "Residence entry permit not yet approved at the time of application",
    ],
    related: ["tourist-visa-30-day", "employment-visa-free-zone"],
  },

  // ───────────────────────────────── BUSINESS SETUP ─────────────────────────────────
  {
    slug: "free-zone-company-setup",
    pillar: "business-setup",
    name: "Free Zone Company Setup",
    summary: "100% foreign-owned company with trade licence and investor visa eligibility.",
    description:
      "A free-zone licence gives full foreign ownership, straightforward banking and visa quota tied to your package. The right free zone depends entirely on your activity, visa needs and whether you require a physical office — we compare zones on your actual requirements rather than steering you to whichever pays the highest commission.",
    audience: "Founders, consultants and freelancers wanting full ownership and a fast setup.",
    fees: [
      { kind: "government", label: "Free zone trade licence (1 year)", amount: 8500, vatable: false, estimated: true, note: "Varies substantially by free zone and activity. Representative mid-tier zone shown." },
      { kind: "government", label: "Establishment card", amount: 1200, vatable: false },
      { kind: "government", label: "Trade name reservation & initial approval", amount: 620, vatable: false },
      { kind: "service", label: "Maqam service fee", amount: 3500, vatable: true, note: "Zone comparison, activity selection, incorporation and bank account introduction." },
    ],
    expressSurcharge: 1500,
    processingDays: { min: 5, max: 15 },
    expressDays: { min: 3, max: 7 },
    stages: [
      { title: "Zone & activity selection", description: "We compare free zones against your activity, visa quota and budget.", days: 1, actor: "maqam" },
      { title: "Trade name reservation", description: "Name checked and reserved with the authority.", days: 2, actor: "government" },
      { title: "Initial approval", description: "Activity and shareholder structure approved.", days: 3, actor: "government" },
      { title: "Documents signed", description: "Incorporation documents executed.", days: 1, actor: "customer" },
      { title: "Licence issued", description: "Trade licence and establishment card released.", days: 5, actor: "government" },
      { title: "Bank account introduction", description: "We introduce you to banks matched to your profile.", days: 3, actor: "maqam" },
    ],
    documents: [
      { id: "passport", label: "Shareholder passports", description: "Colour copies for every shareholder." },
      { id: "photo", label: "Shareholder photographs", description: "White background, passport specification." },
      { id: "business-plan", label: "Business plan", description: "Brief activity description.", conditional: "Required by some zones and for regulated activities." },
      { id: "noc", label: "NOC from current sponsor", description: "If you hold a UAE residence visa under another sponsor.", conditional: "Existing UAE residents only." },
    ],
    commonRejectionReasons: [
      "Chosen activity not permitted under the selected free zone's licence list",
      "Trade name breaching UAE naming rules (religious, political or unrelated terms)",
      "Missing NOC from an existing UAE sponsor",
      "Shareholder passport validity insufficient",
    ],
    related: ["mainland-company-setup", "golden-visa", "employment-visa-free-zone"],
    popular: true,
  },
  {
    slug: "mainland-company-setup",
    pillar: "business-setup",
    name: "Mainland Company Setup",
    summary: "DED trade licence with unrestricted trading across the UAE market.",
    description:
      "A mainland licence lets you trade anywhere in the UAE and contract directly with government entities — commercially decisive for many activities. Most sectors now permit 100% foreign ownership. Note that mainland setup requires physical premises with a registered Ejari, which is a genuine and often understated cost.",
    audience: "Businesses trading with the UAE local market or bidding for government work.",
    fees: [
      { kind: "government", label: "DED trade licence (1 year)", amount: 9200, vatable: false, estimated: true, note: "Varies by activity and legal form." },
      { kind: "government", label: "Initial approval & trade name", amount: 855, vatable: false },
      { kind: "third-party", label: "MoA notarisation & typing", amount: 800, vatable: true },
      { kind: "service", label: "Maqam service fee", amount: 4500, vatable: true, note: "Structuring, DED liaison, MoA drafting and licence issuance." },
    ],
    expressSurcharge: 2000,
    processingDays: { min: 7, max: 21 },
    expressDays: { min: 5, max: 10 },
    stages: [
      { title: "Structure & activity advice", description: "Legal form, ownership and activity codes decided.", days: 2, actor: "maqam" },
      { title: "Initial approval", description: "DED approves the activity and structure.", days: 3, actor: "government" },
      { title: "Premises & Ejari", description: "Office secured and tenancy registered.", days: 5, actor: "customer" },
      { title: "MoA notarised", description: "Memorandum of association executed before a notary.", days: 2, actor: "customer" },
      { title: "Licence issued", description: "DED trade licence released.", days: 5, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Shareholder passports", description: "Colour copies for every shareholder." },
      { id: "ejari", label: "Registered Ejari tenancy", description: "Physical premises are mandatory for mainland licences." },
      { id: "noc", label: "NOC from current sponsor", description: "For existing UAE residence visa holders.", conditional: "Existing UAE residents only." },
      { id: "approvals", label: "External approvals", description: "Sector regulator approval.", conditional: "Required for regulated activities such as healthcare, education or legal services." },
    ],
    commonRejectionReasons: [
      "No registered Ejari — mainland licences cannot issue without premises",
      "Activity requiring an external regulator approval that was not obtained",
      "Trade name conflicting with an existing registration",
      "Shareholder documents not attested where a corporate shareholder is involved",
    ],
    related: ["free-zone-company-setup", "employment-visa-mainland", "golden-visa"],
  },

  // ───────────────────────────────── OUTBOUND VISAS ─────────────────────────────────
  {
    slug: "schengen-visa",
    pillar: "outbound-visas",
    name: "Schengen Visa (from UAE)",
    summary: "Short-stay Schengen visa for UAE residents, prepared to consulate standard.",
    description:
      "Schengen refusals from the UAE are overwhelmingly driven by weak evidence of ties and inconsistent financials, not by the traveller being genuinely ineligible. We build the file the consulate expects: a coherent itinerary, verifiable funds and clear residence ties.",
    audience: "UAE residents travelling to Europe for tourism or business.",
    fees: [
      { kind: "government", label: "Consulate visa fee", amount: 360, vatable: false, estimated: true, note: "Set in euro by the Schengen states; the dirham amount moves with the exchange rate." },
      { kind: "third-party", label: "VFS / TLScontact service fee", amount: 145, vatable: true, estimated: true },
      { kind: "third-party", label: "Travel insurance", amount: 120, vatable: true, estimated: true, note: "Minimum €30,000 medical cover is mandatory." },
      { kind: "third-party", label: "Courier return of passport", amount: 60, vatable: true },
      { kind: "service", label: "Maqam service fee", amount: 600, vatable: true, note: "Itinerary construction, financial review, cover letter and appointment booking." },
    ],
    processingDays: { min: 10, max: 21 },
    stages: [
      { title: "Country & consulate determined", description: "We identify the correct consulate based on your main destination.", days: 1, actor: "maqam" },
      { title: "Financial review", description: "Bank statements assessed against the consulate's expectations.", days: 1, actor: "maqam" },
      { title: "Appointment booked", description: "VFS or TLScontact slot secured.", days: 3, actor: "maqam" },
      { title: "Biometrics submitted", description: "You attend the appointment.", days: 1, actor: "customer" },
      { title: "Consulate decision", description: "Application assessed and decided.", days: 14, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Passport", description: "Valid 3 months beyond return, issued within the last 10 years, 2 blank pages." },
      { id: "eid", label: "Emirates ID & residence visa", description: "Residence must be valid at least 3 months beyond return." },
      { id: "bank", label: "Bank statements", description: "3–6 months, stamped, showing consistent balance." },
      { id: "noc", label: "Employer NOC & salary certificate", description: "Confirming employment, salary and approved leave." },
      { id: "itinerary", label: "Flight & hotel bookings", description: "Confirmed reservations covering the full stay." },
      { id: "insurance", label: "Travel insurance", description: "Minimum €30,000 medical cover across the Schengen area." },
    ],
    commonRejectionReasons: [
      "Insufficient or unexplained funds in the bank statements",
      "Weak evidence of ties to the UAE prompting overstay concerns",
      "Itinerary inconsistent with the stated purpose or booked dates",
      "Applying at the wrong consulate for the main destination",
      "Residence visa expiring too soon after the intended return",
    ],
    related: ["uk-visitor-visa", "tourist-visa-30-day"],
  },
  {
    slug: "uk-visitor-visa",
    pillar: "outbound-visas",
    name: "UK Standard Visitor Visa",
    summary: "Six-month UK visitor visa for UAE residents.",
    description:
      "UK visitor applications are decided on the balance of probabilities from a written case. The supporting statement matters more than most applicants realise — we write it to address the specific credibility questions the caseworker is trained to ask.",
    audience: "UAE residents visiting the UK for tourism, family or business.",
    fees: [
      { kind: "government", label: "UKVI application fee", amount: 550, vatable: false, estimated: true, note: "Set in sterling; the dirham amount moves with the exchange rate." },
      { kind: "third-party", label: "VFS service & biometrics", amount: 120, vatable: true, estimated: true },
      { kind: "third-party", label: "Courier return of passport", amount: 60, vatable: true },
      { kind: "service", label: "Maqam service fee", amount: 700, vatable: true, note: "Case assessment, supporting statement, document pack and appointment booking." },
    ],
    processingDays: { min: 15, max: 25 },
    stages: [
      { title: "Case assessment", description: "We evaluate credibility factors and identify weaknesses.", days: 1, actor: "maqam" },
      { title: "Online application", description: "UKVI form completed and fee paid.", days: 1, actor: "maqam" },
      { title: "Supporting statement", description: "Written case addressing ties, funds and purpose.", days: 2, actor: "maqam" },
      { title: "Biometrics appointment", description: "You attend VFS for fingerprints and photo.", days: 1, actor: "customer" },
      { title: "UKVI decision", description: "Application decided and passport returned.", days: 15, actor: "government" },
    ],
    documents: [
      { id: "passport", label: "Passport", description: "Valid for the duration of the intended stay." },
      { id: "eid", label: "Emirates ID & residence visa", description: "Proof of lawful UAE residence." },
      { id: "bank", label: "Bank statements", description: "6 months, stamped, demonstrating funds are genuinely available." },
      { id: "employment", label: "Employer letter", description: "Role, salary, length of service and approved leave dates." },
      { id: "accommodation", label: "Accommodation & travel plan", description: "Bookings or a host's invitation with their status documents." },
    ],
    commonRejectionReasons: [
      "Funds appearing shortly before the application without explanation",
      "Insufficient evidence the applicant will leave the UK",
      "Discrepancies between the stated purpose and the supporting documents",
      "Previous immigration breach in the UK or elsewhere",
    ],
    related: ["schengen-visa"],
  },

  // ──────────────────────────────── ATTESTATION & PRO ────────────────────────────────
  {
    slug: "degree-attestation",
    pillar: "attestation-pro",
    name: "Degree Certificate Attestation",
    summary: "Full legalisation chain so your qualification is accepted in the UAE.",
    description:
      "An unattested degree is the single most common cause of employment visa delay in the UAE. Legalisation is a chain — home country notary or HRD, home country MOFA, the UAE embassy in that country, then UAE MOFA — and skipping any link invalidates the rest. We manage the entire sequence including overseas steps.",
    audience: "Anyone taking up skilled employment in the UAE with a foreign qualification.",
    fees: [
      { kind: "government", label: "UAE MOFA attestation", amount: 150, vatable: false, note: "Per document, paid to the UAE Ministry of Foreign Affairs." },
      { kind: "third-party", label: "Home country attestation & embassy legalisation", amount: 700, vatable: true, estimated: true, note: "Varies significantly by country. India, Pakistan and the Philippines differ materially." },
      { kind: "third-party", label: "International courier", amount: 150, vatable: true },
      { kind: "service", label: "Maqam service fee", amount: 450, vatable: true, note: "Chain management, overseas agent coordination and tracking." },
    ],
    processingDays: { min: 10, max: 30 },
    stages: [
      { title: "Document received", description: "Original certificate collected or couriered.", days: 1, actor: "customer" },
      { title: "Home country attestation", description: "Notary or HRD, then home country MOFA.", days: 10, actor: "government" },
      { title: "UAE embassy legalisation", description: "Legalised by the UAE embassy in the issuing country.", days: 5, actor: "government" },
      { title: "UAE MOFA attestation", description: "Final attestation in the UAE.", days: 2, actor: "maqam" },
      { title: "Delivered", description: "Attested original returned to you.", days: 1, actor: "maqam" },
    ],
    documents: [
      { id: "degree", label: "Original degree certificate", description: "The physical original — copies are not accepted." },
      { id: "transcript", label: "Academic transcript", description: "Often required alongside the certificate.", conditional: "Required by some authorities." },
      { id: "passport", label: "Passport copy", description: "For identity verification through the chain." },
    ],
    commonRejectionReasons: [
      "Submitting a photocopy where the original is required",
      "Skipping the home-country MOFA step before embassy legalisation",
      "Name on the certificate not matching the passport",
      "University not recognised by the UAE Ministry of Education",
    ],
    related: ["employment-visa-mainland", "mofa-attestation", "employment-visa-free-zone"],
    popular: true,
  },
  {
    slug: "mofa-attestation",
    pillar: "attestation-pro",
    name: "UAE MOFA Attestation",
    summary: "Final-step MOFA attestation for documents already legalised abroad.",
    description:
      "If your document has already been legalised by the UAE embassy in its country of origin, the remaining step is UAE MOFA attestation. Fast and inexpensive — provided the earlier chain was completed correctly, which we verify before submitting.",
    audience: "Anyone holding a document already legalised by a UAE embassy abroad.",
    fees: [
      { kind: "government", label: "MOFA attestation", amount: 150, vatable: false, note: "Per document." },
      { ...TYPING, amount: 60 },
      { kind: "service", label: "Maqam service fee", amount: 200, vatable: true, note: "Chain verification, submission and collection." },
    ],
    processingDays: { min: 1, max: 3 },
    stages: [
      { title: "Chain verified", description: "We confirm the prior legalisation steps are valid.", days: 1, actor: "maqam" },
      { title: "Submitted to MOFA", description: "Document lodged for attestation.", days: 1, actor: "maqam" },
      { title: "Attested & returned", description: "Document collected and delivered.", days: 1, actor: "maqam" },
    ],
    documents: [
      { id: "document", label: "Original legalised document", description: "Already attested by the UAE embassy in the issuing country." },
      { id: "passport", label: "Passport copy", description: "For identity verification." },
    ],
    commonRejectionReasons: [
      "UAE embassy legalisation missing from the chain",
      "Document damaged or the attestation stamp illegible",
      "Arabic legal translation missing where required",
    ],
    related: ["degree-attestation", "family-sponsorship-visa"],
  },
];

export function getService(slug: string): ServiceDefinition | undefined {
  return services.find((s) => s.slug === slug);
}

export function servicesByPillar(pillar: string): ServiceDefinition[] {
  return services.filter((s) => s.pillar === pillar);
}

export function popularServices(): ServiceDefinition[] {
  return services.filter((s) => s.popular);
}
