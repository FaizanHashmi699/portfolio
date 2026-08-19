# SEO Strategy

**The problem:** Shuraa, Virtuzone and Emirabiz have an eight-year content head start and
hundreds of pages targeting "cost of X visa in Dubai 2026". We will not out-publish them,
and trying would waste the only advantage we have.

**The strategy:** compete on the queries where their business model stops them from
answering honestly, and let the product itself generate the content moat over time.

## 1. Where we can actually win

| Query class                 | Example                              | Why we win                                                    | Our asset                                        |
| --------------------------- | ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------ |
| **Cost, answered**          | "uae golden visa cost breakdown"     | They publish "from AED 9,000". We publish the itemised total. | Service pages + `/pricing`                       |
| **Eligibility, self-serve** | "am i eligible for uae golden visa"  | They route this to a form. We answer it on the page.          | `/eligibility`                                   |
| **Rejection reasons**       | "why was my uae visa rejected"       | Answering costs them a lead. It costs us nothing.             | Every service page publishes its refusal reasons |
| **Process mechanics**       | "degree attestation chain uae order" | Genuinely hard to find, high intent, low competition          | `/guides`                                        |
| **Comparison**              | "free zone vs mainland dubai"        | They can't be neutral — free zones pay referral fees          | Guides written against the incentive             |
| **AI screening**            | "uae ai work permit screening 2026"  | Brand new since May 2026, and nobody has adapted              | Homepage + about + guides                        |

That last row is the timing advantage. The UAE's ICP/MoHRE AI screening went live in May
2026 and no incumbent's content reflects it. That window closes, so it should be worked
hard now.

## 2. Technical foundations (implemented)

- **Server-rendered content.** Marketing routes are statically generated. Every word a
  crawler needs is in the HTML with no JavaScript execution required — including FAQ
  answers, which sit in native `<details>` elements rather than a JS accordion.
- **Structured data**, emitted server-side in the document head:
  - `ProfessionalService` and `WebSite` on every page
  - `Service` with `Offer` and a real price on all 14 service pages
  - `FAQPage` on the homepage and pricing page
  - `Article` on every guide
  - `BreadcrumbList` on service and guide pages
- **Metadata** per route: unique title, description built from real data (including the
  actual total and processing window), canonical URL, Open Graph and Twitter cards.
- **`sitemap.xml`** generated from the catalog, guides and legal content, with
  change frequencies and priorities that reflect reality.
- **`robots.txt`** allowing the marketing site and disallowing `/portal`, `/admin` and
  `/api`.
- **Core Web Vitals.** Server Components by default; the 3D hero is lazy, motion-gated and
  device-gated so it can never block LCP; fonts use `display: swap`; no third-party
  scripts at all.
- **Internal linking.** Services link to related services, guides link to the services they
  discuss, and the footer exposes every service. No orphan pages.

## 3. Content plan

**Principle:** every page must answer the question a competitor's equivalent page dodges.

**Phase 1 — done.** Four cornerstone guides on attestation, Golden Visa route selection,
rejection reasons and free zone vs mainland. All four are written against our own
commercial interest in at least one place, because that is what makes them credible and
linkable.

**Phase 2 — nationality landing pages.** "UAE employment visa for Indian citizens",
"…Pakistani citizens", "…Filipino citizens". Attestation chains differ materially by
country, which makes these genuinely distinct pages rather than spun duplicates. This is
the highest-volume opportunity in the category.

**Phase 3 — free zone comparison pages.** One per major zone with real activity lists and
real costs. Nobody publishes honest comparisons, for an obvious reason.

**Phase 4 — programmatic, from the product.** Combinations of service × nationality ×
circumstance, generated from the catalog and the rules engine. Only worth doing once the
rule data is authoritative — otherwise it is exactly the thin content mill we are
positioning against.

## 4. Off-page

- **Independent reviews only.** Trustpilot and Google, with the bad ones left in place.
  Self-hosted five-star walls now read as a scam signal in this category — the research is
  explicit about it — so hosting one would cost more trust than it buys.
- **Digital PR angle:** we are the only consultancy that publishes complete fee breakdowns
  and refusal reasons. That is a story UAE business press and expat communities will run,
  and it earns links no content mill can.
- **Community presence** in expat forums, answering questions properly rather than dropping
  links.
- **Google Business Profile** with the real trade licence number displayed, which is itself
  a differentiator in a category with a verification problem.

## 5. What we will not do

- Spinning near-duplicate "cost in 2026" posts. It is the incumbents' game, we would lose,
  and it degrades the thing that makes us worth linking to.
- Buying links.
- Gating content behind a form to manufacture leads — the entire product argues against it.
- Publishing fee figures we have not verified, to rank sooner.

## 6. Measurement

| Metric                                        | Target by month 6       |
| --------------------------------------------- | ----------------------- |
| Indexed pages                                 | 40+ (all substantive)   |
| Organic sessions / month                      | 5,000                   |
| Eligibility checks started from organic       | 400 / month             |
| Top-10 rankings on "cost breakdown" long-tail | 15 queries              |
| Referring domains                             | 25 (earned, not bought) |
| LCP on mobile, 75th percentile                | < 2.0s                  |

The metric that matters most is **eligibility checks started from organic traffic**, not
sessions. Traffic that does not reach the tool has not tested the thesis.
