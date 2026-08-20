# Product Requirements

**Status:** v1.0 · **Last reviewed:** August 2026

## 1. The problem

A person who wants to move to, work in, or start a business in the UAE cannot currently
find out two basic things without surrendering their phone number to a salesperson:

1. **Am I eligible?**
2. **What will it actually cost?**

Both answers are public information. The industry withholds them because controlling
information is how it converts leads. The cost of that model is visible in its consumer
reviews: fee surprise is the dominant complaint across the category, and the largest
transactional player in the space sits at 1.2 stars.

## 2. Who we serve

### Primary — "The relocating professional"

Mid-career, 28–45, from India, Pakistan, the Philippines, Egypt, Nigeria or the UK. Has a
job offer or is looking. On a phone, in a second language, comparing four consultancies at
once. **Fears:** paying for the wrong thing, hidden fees, an unexplained rejection.
**Wants:** a number they can trust and a process they can see.

### Primary — "The Golden Visa candidate"

High earner, property owner, or recognised creative. Often already in the UAE. Assumes the
Golden Visa is one product with one price; it is actually five routes with different
criteria. **Fears:** applying under the wrong route and losing a non-refundable fee.
**Wants:** to know which route is genuinely theirs before committing.

### Primary — "The founder"

Setting up a company, comparing free zones. Being steered toward whichever zone pays the
consultant the best commission. **Fears:** a licence that turns out not to permit their
actual activity. **Wants:** a comparison made on their requirements, not on referral fees.

### Secondary — "The HR manager"

Sponsors 10–50 employment visas a year. Currently managed over WhatsApp and spreadsheets.
**Wants:** one dashboard, predictable timelines, no chasing. Highest LTV, lowest CAC, and
served by nobody in this market with real software.

### Internal — "The case handler"

Runs 30–60 concurrent applications. Spends a large share of the day answering "any update?"
**Wants:** the status question to stop being asked, and to know which files are stuck.

## 3. Scope

### v1 — shipped in this repository

| #   | Capability                                          | Why it's in v1                                     |
| --- | --------------------------------------------------- | -------------------------------------------------- |
| 1   | Free eligibility check, no sign-up                  | The traffic magnet and the whole positioning       |
| 2   | Transparent itemised pricing, published             | The conversion event and the trust wedge           |
| 3   | Public cost calculator, no form gate                | Removes the last reason to call a competitor       |
| 4   | 14 services with full fee, stage and rejection data | Substance behind the promise; also the SEO surface |
| 5   | Customer portal with glass-box tracking             | Removes the #1 support-ticket driver               |
| 6   | Document validation and rejection-risk scoring      | The moat — nobody else does this                   |
| 7   | Admin console with mandatory explanations           | Makes operations possible without opacity          |
| 8   | Guide library                                       | The compounding organic asset                      |
| 9   | Legal and disclosure surfaces                       | Non-negotiable in a regulated category             |

### v2 — next, not now

- **OCR extraction** feeding the existing validation rules. Upload works today and the
  rules run on the fields; we ask for those fields rather than reading them, because
  inventing a passport expiry would be far worse than asking for one.
- **Payments** (Stripe or Telr) with staged collection matching when fees actually fall due
- **Translated service and legal content**, professionally reviewed. Navigation and the
  homepage are translated; the detail is not, deliberately.
- **WhatsApp Business API** for status notifications on the channel this market uses
- **Corporate dashboard** for HR-managed bulk visas — the highest-LTV segment, served by
  nobody here with real software
- **Automated expiry monitoring** and renewal prompts
- **Durable analytics aggregates** written on a schedule, preserving unlinkability

### Explicitly out of scope

- Anything that implies government affiliation
- Any guarantee of an outcome
- Self-hosted review walls
- Selling or sharing customer data

## 4. Key journeys

### J1 — Anonymous eligibility check _(the flagship)_

Land → answer ~10 adaptive questions → see ranked routes with scores, met/unmet criteria,
and concrete next steps → optionally email it to yourself.

**Requirements:** no sign-up, no phone number, under 2 minutes, works on a mid-range phone,
and the assessment runs client-side so answers genuinely never leave the browser unless the
visitor asks.

**Success:** ≥60% of starters reach a result. ≥25% of finishers view a service page.

### J2 — Price discovery

Land on a service page or the calculator → see a complete total split into government /
third-party / our fee / VAT → adjust applicants and speed → totals update live.

**Requirements:** no form gate; every varying line labelled as an estimate; the same
pricing engine that renders the page renders the invoice.

**Success:** pricing pages rank for "cost of X in Dubai" terms; support enquiries about
price composition trend to zero.

### J3 — Application tracking

Sign in → see every application with status and what's outstanding → open one → see the
full timeline with dates and whose turn it is → see document risk with fixes.

**Requirements:** the customer never needs to ask for an update; every status change
carries a human explanation.

**Success:** "any update?" messages drop by ≥70% per application.

### J4 — Operations

Staff open the console → see what's blocked → open a file → change status with a mandatory
customer-visible explanation → the customer's timeline updates immediately.

**Requirements:** explanations are mandatory, not optional; every change is audited.

## 5. Non-functional requirements

| Area          | Requirement                                   | Where it's enforced                             |
| ------------- | --------------------------------------------- | ----------------------------------------------- |
| Performance   | LCP < 2.0s on 4G mid-range mobile             | Server Components by default; 3D lazy and gated |
| Accessibility | WCAG 2.1 AA, zero serious axe violations      | `e2e/accessibility.spec.ts` across 11 pages     |
| Security      | Tenant isolation at the database              | Postgres RLS; see `docs/security.md`            |
| Reliability   | Product functions with no third-party API     | Repository adapters; AI falls back to templates |
| SEO           | Server-rendered content, structured data      | SSG marketing routes, JSON-LD, sitemap          |
| Correctness   | Business rules unit-tested without mocks      | Pure `domain/` layer, 90 tests                  |
| Compliance    | No outcome guarantees, no implied affiliation | Copy review + an e2e test asserting it          |

## 6. Success metrics

**Leading (weeks 1–8)**

- Eligibility check completion rate ≥ 60%
- Eligibility → service page rate ≥ 25%
- Bounce on pricing pages < 45%
- Organic impressions on "cost of" and "eligibility" long-tail

**Lagging (months 3–12)**

- Cost per qualified lead vs. the category's paid-lead benchmark
- Applications reaching submission without a document blocker (target ≥ 85%)
- Support messages per application (target < 2)
- Independent-platform review score ≥ 4.5 with reviews left intact

**The one that decides whether the thesis is right:** conversion rate of visitors who
complete the eligibility check versus those who don't. If giving the answer away doesn't
convert better than withholding it, the strategy is wrong and we should know quickly.

## 7. Constraints and assumptions

- **Regulatory.** A UAE trade licence is required before taking a single fee. Nothing ships
  to customers before that.
- **Fee accuracy.** Published figures are researched 2026 indicators and must be reconciled
  against authority rates before quoting.
- **Government process volatility.** Rules are versioned, effective-dated data so a policy
  change is a content edit, not a deployment.
- **Solo operator at launch.** Every feature must reduce manual work, not add to it. This is
  why explanations are mandatory: they remove the follow-up message that would otherwise
  cost more time than writing them.
