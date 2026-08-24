# Step 2 — Tech Stack Decision & Architecture

**Date:** 24 August 2026
**Decides:** app vs website · the stack · the v1 architecture
**Depends on:** Step 1 research (`saudi-home-services-research.md`) — especially §11, which established that the first paying customer is a **licensed service company**, not a consumer.

---

## 1. The decision, in one line

> **Build a website — an Arabic-first Next.js PWA — with WhatsApp as the delivery channel. No native app. No in-app payments in v1.**

Running cost at zero revenue: **USD 0–26/month.**

---

## 2. The reference stack does not survive contact with Saudi Arabia

The stack in the screenshot (Next.js · Vercel · Supabase · **Stripe** · Cloudflare · Sentry · PostHog · Resend · n8n) is a good **US SaaS** stack. Three of its layers are unavailable, illegal, or useless here, and it is missing three layers that are mandatory.

| Reference stack | Verdict for Saudi Arabia | What replaces it |
|---|---|---|
| **Stripe** — payments | ❌ **Does not work.** Stripe is **not SAMA-licensed for Mada acquiring**, and Mada is used by **70%+ of Saudi customers** ✅ | **Moyasar** (SAMA-licensed, Mada + Apple Pay + STC Pay, ~2.2% + SAR 1) — but **not in v1**, see §5.5 |
| **Supabase Cloud** — default region | ⚠️ **Compliance risk.** Supabase has **no Middle East region** ✅, and Saudi PDPL requires personal data of residents to stay in the Kingdom by default | **Keep Supabase** — precisely *because* it is self-hostable Postgres. See the portability hedge, §6.2 |
| **Vercel** — hosting | ⚠️ Two problems: **no Middle East region** ✅, and **Hobby prohibits commercial use** ✅ | Vercel while pre-revenue, then Pro ($20/mo) or a VPS. Architecture stays Docker-portable |
| **Intercom** — live chat | ❌ Wrong channel. Nobody in Saudi opens a web chat widget | **WhatsApp** — this is *the* channel |
| — missing — | **ZATCA e-invoicing** is legally mandatory for a Saudi entity | Buy, don't build (§5.7). Not needed until you have a CR |
| — missing — | **Wathq** — Ministry of Commerce CR-verification API | Free. This is your "licensed vendor" badge, automated (§5.8) |
| — missing — | **Arabic / RTL** | `next-intl`, RTL-first from commit #1 (§5.2) |

**One sentence:** copying that stack verbatim would leave you unable to take a payment, non-compliant on data residency, missing the invoicing the law requires, and talking to customers on a channel they don't use.

---

## 3. Website, not an app — the five reasons

**1. You legally cannot ship a native app right now.** ✅
Apple and Google **organization** developer accounts require a **D-U-N-S number and a verified legal entity**. You have no entity, by your own decision to defer registration. An *individual* Apple account publishes under a personal name — bad for B2B trust, and awkward against the E-Commerce Law's commercial-identity disclosure duty.

**2. Your first customer is a business owner, not a consumer.** A cleaning-company owner will not install an app for a vendor he met yesterday. He will open a WhatsApp link. Native apps earn their place on *consumer repeat frequency* — which Step 1 says you should not chase in v1 anyway.

**3. Cost and cycle time.** Apple is **$99/year**, Google **$25 one-off** ✅, plus review cycles on every release. Web ships in seconds, free, with no gatekeeper.

**4. A PWA already covers what you'd actually use.** Installable to home screen, offline shell, and push notifications on **iOS 16.4+** — with the real constraint that push works **only once installed to the home screen**, never from a browser tab ✅. Fine for partner staff who use the tool daily.

**5. Distribution is WhatsApp, not the App Store.** Saudi has ~96% smartphone ownership and ~98% internet penetration ✅. That reach is already yours through a link — an app store listing adds nothing when your entire go-to-market is your brother sending messages to twenty companies.

**When to revisit:** consumer repeat-booking volume, or partner technicians needing GPS/background location. Then wrap the same codebase with Expo/React Native — the web app is not thrown away.

---

## 4. What v1 actually is

A **partner operations tool**, not a marketplace. Three surfaces:

| Surface | Who | Purpose |
|---|---|---|
| **Admin console** | You + your brother | Create partners, top up credits, log a lead, assign it, watch outcomes |
| **Partner portal** | Licensed service companies | See assigned leads, accept/decline, mark complete, view credit balance |
| **Public request page** | Customers / B2B prospects | Arabic-first form → creates a lead. No login, no account, no payment |

**Explicitly NOT in v1:** consumer mobile app · in-app payments · ratings/reviews · vendor self-signup · ZATCA invoicing · SMS OTP.

---

## 5. The stack, layer by layer

### 5.1 Build
**Claude Code + Codex** — unchanged from the reference stack. This part of the screenshot is right.

### 5.2 Application
**Next.js 15 (App Router) + TypeScript + Tailwind + `next-intl`.**
- `next-intl` is the current standard for App Router i18n — server-component support, ~2KB ✅.
- **RTL from commit #1, not retrofitted:** `dir` on `<html>` driven by locale, and **CSS logical properties** (`margin-inline-start`, never `margin-left`) throughout ✅. Retrofitting RTL into a 200-component LTR app is a multi-week rewrite; doing it from the start costs nothing.
- **Arabic is the default locale.** English is the translation, not the other way round.

### 5.3 Data & auth
**Supabase** — Postgres, Auth, Storage, Row Level Security.
- Free tier: 500 MB database, 5 GB bandwidth, 50,000 MAU, 2 projects ✅.
- ⚠️ **Free projects pause after 7 days of inactivity** and take ~30s to wake ✅ — irrelevant for a tool in daily use, but do not let a demo instance sleep before a partner meeting.
- **Auth in v1 = email magic link.** Phone OTP needs an SMS provider, and Saudi A2P requires a **CITC-approved sender ID** — Unifonic charges **SAR 299/year and only registers local companies** ✅. That's blocked until you have an entity. Magic link is free and works today.
- Customers never authenticate. They submit a form.

### 5.4 Hosting
**Vercel** while genuinely pre-revenue → **Vercel Pro ($20/mo) the day a partner pays you**, because Hobby's terms prohibit commercial use ✅. The alternative — a €6 VPS running the Docker build — is cheaper and doubles as practice for the eventual move to Riyadh (§6.2).

### 5.5 Payments — deliberately absent from v1
The moment you take card payments you need a **CR** (Moyasar requires CR or a freelance document ✅), which you have decided to defer. So:
- **v1: partners buy lead credits by bank transfer.** You mark the credits in the admin console. Ten partners × one transfer a month is a two-minute job, not a system.
- This is not a compromise — it is exactly the Step 1 §11.3 model: **prepaid credits, paid to a foreign software supplier**, which is what keeps you clean with no entity.
- **v2 (post-CR): Moyasar.** ⚠️ Confirm marketplace/split-settlement support before committing — no source verified it.

### 5.6 Messaging — the real product surface
**WhatsApp Cloud API (direct from Meta).**
- **You can start unverified**: capped at **250 business-initiated conversations per rolling 24 hours**, 2 phone numbers ✅. Your v1 target is ~20 conversations. No business verification, no entity, no blocker.
- Cost: **utility messages ≈ USD 0.0115 each** ✅. 250 lead notifications ≈ **USD 3/month**.
- Customer-initiated service replies are free inside the 24-hour window — ⚠️ **but from 1 October 2026 every message a business sends in that window becomes chargeable, including bot replies** ✅. Budget for it.
- Needs: a published privacy policy URL, a dedicated number, an approved display name, approved templates, explicit opt-in.

### 5.7 Invoicing — the problem you don't have yet
**ZATCA Phase 2 is real engineering**: ECDSA `secp256k1` CSR, Compliance then Production CSID, **UBL 2.1 XML**, B2B **clearance** before issue, B2C **reporting within 24 hours** ✅.
**But it does not apply to you in v1** — with no Saudi entity, you invoice from Pakistan as a software export. When you do register: **buy, don't build.** Providers run **SAR 99–299/month under 100 invoices** ✅ — far cheaper than the weeks it would take to build and certify.

### 5.8 Trust — the layer nobody else has
**Wathq** (Ministry of Commerce) — CR verification API, **free basic package**, live in minutes ✅.
Paste a partner's CR number, get back trade name, status, capital, owners. This turns "licensed vendors" from a marketing claim into a **verified field in your database** — Dari markets that badge manually; you can automate it. Cheapest credibility available.

### 5.9 Everything else
| Need | Choice | Cost |
|---|---|---|
| Repo + CI | GitHub + Actions | Free |
| Errors | Sentry | Free tier |
| Product analytics | PostHog | Free tier |
| Transactional email | Resend | Free tier |
| DNS + WAF | Cloudflare | Free |
| Background jobs | Vercel Cron / pg_cron | Free |
| Automation | n8n — **self-host later**, ~$5–7/mo VPS ✅ | Deferred |

**n8n is deferred on purpose.** At ten partners, a cron job and three database queries beat a workflow engine you have to operate.

---

## 6. Architecture

### 6.1 Multi-tenant from commit #1
Step 1 §11.3(D) says white-label is how you convert rivals into customers. That is an architecture decision, not a later feature.

- **Every business table carries `tenant_id`.** No exceptions.
- **Row Level Security on every table**, policy keyed to the JWT's tenant claim. Admin access via the service role only, server-side.
- **Tenant → branding** (name, logo, colors, locale) and later **tenant → custom domain**. Build the theming indirection now even while every tenant renders identically; retrofitting it means touching every component.

### 6.2 The portability hedge — your PDPL answer
PDPL requires resident personal data to stay in the Kingdom by default; SDAIA has **published no adequacy list**, so cross-border transfers need approved SCCs ✅, and fines reach **SAR 5 million** ✅.

You are pre-revenue with no entity and a handful of B2B contacts, so the practical exposure today is small — but the architecture must be able to **relocate to AWS `me-central-2` (Riyadh)** ✅ on demand. Rules:

1. **No proprietary vendor primitives.** Supabase = plain Postgres + PostgREST + GoTrue, all self-hostable. Avoid Vercel KV/Blob/Postgres entirely.
2. **`output: 'standalone'` + a Dockerfile from day one**, even while deploying to Vercel. Prove it builds.
3. **No edge-only runtime dependencies** — nothing that only runs on Vercel's edge.
4. **Secrets in env vars**, never only in a vendor dashboard.
5. **Store PII in Postgres only** — never scattered across third-party tools — so relocation is one database move.

**Rule of thumb: any layer holding personal data must be one you can host yourself.** That single rule chose Supabase over Firebase.

### 6.3 Data model (v1)

```
tenants           id · name · cr_number · cr_verified_at · wathq_payload
                  city · status · branding_json
users             id · tenant_id · role(admin|owner|staff) · email · locale
services          id · name_ar · name_en · category
partner_services  tenant_id · service_id · price_sar · capacity_note
leads             id · customer_name · phone · service_id · city · address
                  scheduled_for · status · source · notes
lead_assignments  lead_id · tenant_id · credits_charged · sent_at
                  accepted_at · outcome(won|lost|no_show)
credit_ledger     tenant_id · delta · reason · ref · balance_after   [append-only]
jobs              lead_id · tenant_id · status · completed_at
messages          tenant_id · channel · template · payload · status  [outbound log]
audit_log         actor · action · entity · before · after · at
```

Two non-negotiables:
- **`credit_ledger` is append-only.** Never `UPDATE` a balance. Money-adjacent state must be reconstructable, because the first partner dispute will be about credits.
- **`messages` logs every outbound send.** When a partner says "you never sent me that lead", the log settles it.

### 6.4 Request flow

```
Customer ──form──▶ Next.js ──▶ Supabase (lead created)
                                   │
                          admin assigns lead
                                   │
                         debit credit_ledger  (atomic)
                                   │
                    WhatsApp Cloud API ──▶ Partner's phone
                                   │
                     Partner opens portal link
                          accept / decline / complete
                                   │
                            outcome recorded
```

The only thing that must be transactional is **assign + debit**: do both in one Postgres transaction, never in application code across two calls.

---

## 7. Build order

| Week | Ship | Proves |
|---|---|---|
| **A** | Repo, Next.js + TS + Tailwind, `next-intl` with `ar` default and RTL, Supabase schema + RLS, magic-link auth | Foundation is right before anything is built on it |
| **B** | Admin console: create partner, top up credits, log lead, assign lead → WhatsApp fires | **The whole business works end to end, for one operator** |
| **C** | Partner portal: assigned leads, accept/decline/complete, credit balance | Partner sees value without you in the loop |
| **D** | Public request page (Arabic), landing page, Wathq CR verification on onboarding | You can send a link to a stranger |
| **E** | Metrics: leads per partner, accept rate, **partner repeat-purchase rate** | The one number from Step 1 §11.7 that says whether this is a business |

**Week B is the milestone that matters.** After Week B the business is operable — everything after is removing your brother from the loop.

---

## 8. Cost at zero revenue

| Item | Monthly |
|---|---|
| GitHub, Sentry, PostHog, Resend, Cloudflare, Wathq | **$0** |
| Supabase free tier | **$0** |
| Vercel (Hobby pre-revenue → Pro on first payment) | **$0 → $20** |
| WhatsApp Cloud API (~250 utility messages) | **~$3** |
| Domain (amortised) | **~$1** |
| **Total** | **$4 → $24 / month** |

Roughly **SAR 15–90 a month** to run the entire operation. Nothing here requires an entity, a bank account, or capital.

---

## 9. Deferred — and what triggers each

| Deferred | Trigger |
|---|---|
| Moyasar payments | First CR issued |
| ZATCA e-invoicing (buy) | First VAT registration |
| SMS / phone OTP | Local entity for CITC sender ID |
| Native app (Expo) | Consumer repeat bookings, or technician GPS needs |
| n8n | More than ~15 partners, or workflows outside the app |
| Move to AWS Riyadh | Entity registered, or first enterprise/FM client asks about residency |
| Custom domains per tenant | First white-label partner |

---

## 10. Open decisions for you

1. **Vercel Pro ($20/mo) or a €6 VPS from day one?** VPS is cheaper and rehearses the Riyadh move; Vercel is faster and saves ops time. My lean: **Vercel now, VPS when you register** — don't spend the early weeks on ops.
2. **One vertical for the v1 schema?** AC/AMC, SME cleaning, or car/fleet — Step 1 §04 ranked them. The schema is generic, but seed data and copy should be one vertical.
3. **Brand name and domain** — needed before the WhatsApp display name and the public page.

---

*Sources: [Stripe/Mada gateway comparison](https://logiolegion.com/blogs/payment-gateway-integration-saudi-arabia-developer-guide) · [Saudi PDPL data residency](https://www.nexconn.ai/blog/mena-data-residency-saudi-pdpl-guide) · [SDAIA transfer regulation](https://www.kslaw.com/news-and-insights/international-personal-data-transfers-under-saudi-arabias-data-protection-law) · [Supabase Middle East region discussion](https://github.com/orgs/supabase/discussions/35716) · [AWS me-central-2 Riyadh](https://a9it.com/aws-me-central-2-saudi-arabia-region/) · [Vercel Hobby commercial terms](https://www.promptstoproduct.com/vercel-free-tier-limits) · [Supabase free tier limits](https://automationatlas.io/answers/supabase-free-tier-limits-2026/) · [WhatsApp Cloud API unverified limits](https://blueticks.co/blog/whatsapp-api-without-meta-verification) · [WhatsApp KSA pricing](https://ominiflow.com/whatsapp-api-pricing/saudi-arabia) · [ZATCA Phase 2 developer guide](https://www.jibrid.com/blog/zatca-phase2-api-integration-guide) · [ZATCA provider pricing](https://asoft.sa/en/blog/zatca-implementation-cost-in-saudi-arabia-a-complete-budgeting-guide/) · [Wathq developer portal](https://developer.wathq.sa/en/apis) · [next-intl App Router guide](https://next-intl.dev/docs/getting-started/app-router) · [PWA iOS limits 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) · [Apple/Google developer fees](https://www.iconikai.com/blog/how-much-does-it-cost-to-publish-an-app-2026) · [Unifonic SMS/CITC sender ID](https://www.kftelsms.com/blog/saudi-arabia-a2p-sms-regulations-sender-id) · [Digital 2026 Saudi Arabia](https://datareportal.com/reports/digital-2026-saudi-arabia)*
