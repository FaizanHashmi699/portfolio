# Maqam — System Architecture

**Status:** v1.0 · **Owner:** Engineering · **Last reviewed:** August 2026

---

## 1. Design goals (and the constraints that produced them)

| Goal | Why | Consequence |
|---|---|---|
| **Ship a real product on a free tier** | Pre-revenue. Hosting cost must be ~0 until traffic justifies spend. | Vercel Hobby + Supabase Free. No always-on containers. |
| **Zero-key local run** | The founder must be able to `npm install && npm run dev` on a laptop with no accounts. | Repository pattern with an in-memory seeded adapter. Supabase is opt-in via env. |
| **Deterministic legal logic** | Visa eligibility is regulated. An LLM must never be the decider. | Rules engine in pure TypeScript; LLM only narrates its output. |
| **Mobile-first, sub-2s LCP on 4G** | Our users are expats on phones. 1s delay ≈ 7% conversion loss. | Server Components by default; 3D and animation lazy-loaded and motion-gated. |
| **Handle passports safely** | UAE PDPL; catastrophic breach risk. | RLS on every table, private buckets, signed short-TTL URLs, audit log. |

## 2. Why this stack

**Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4, deployed on Vercel, with
Supabase for Postgres + Auth + Storage.**

The single most consequential decision was **rejecting a separate backend service**.

> **ADR-0001 — No separate backend.** A NestJS API on Render was considered (and was the
> user's initial instinct). Rejected because: (a) Render's free tier cold-starts at ~50s,
> which is fatal for a conversion-critical form; (b) two deploys, two CORS surfaces, two
> secret stores and two CI pipelines is real ongoing cost for a solo operator; (c) Next.js
> Route Handlers + Server Actions *are* a backend — they run as serverless functions with
> full Node APIs. The architecture keeps a clean `src/server` boundary so extracting a
> standalone service later is a refactor, not a rewrite. See `docs/adr/0001-no-separate-backend.md`.

Supabase supplies the three things a hand-rolled backend would otherwise cost weeks to build
correctly: **row-level security enforced at the database**, an auth system with sessions and
password reset, and object storage with signed URLs. Postgres RLS is the right place for
authorization on a product where a leak means leaked passports.

## 3. Layered structure

Dependencies point **inward only**. `domain` knows nothing about React, Next, or Supabase —
which is precisely why it is unit-testable without mocks or a running database.

```
┌────────────────────────────────────────────────────────────┐
│  app/          Next.js routes — thin. Render + call server. │
│   ├─ (marketing)   public site, SSG/ISR, SEO-critical       │
│   ├─ (portal)      customer app, auth-gated                 │
│   ├─ (admin)       staff console, role-gated                │
│   └─ api/          route handlers (webhooks, AI streaming)  │
├────────────────────────────────────────────────────────────┤
│  components/   presentational + client interactivity        │
│   ├─ ui/           design-system primitives                 │
│   ├─ three/        3D scenes (lazy, motion-gated)           │
│   └─ marketing/    page sections                            │
├────────────────────────────────────────────────────────────┤
│  server/       ← the only layer allowed to touch I/O        │
│   ├─ actions/      Server Actions (validated mutations)     │
│   ├─ repositories/ data access behind interfaces            │
│   └─ services/     AI, email, storage, notifications        │
├────────────────────────────────────────────────────────────┤
│  domain/       ← pure TypeScript. No I/O. 100% testable.    │
│   ├─ eligibility/  the rules engine                         │
│   ├─ pricing/      fee computation                          │
│   ├─ documents/    validation rules + risk scoring          │
│   └─ catalog/      services, visa types, requirements       │
└────────────────────────────────────────────────────────────┘
```

**The rule that matters:** `domain/` must never import from `server/`, `app/`, or any
package that performs I/O. This is enforced by lint and by the fact that domain tests run
with no database, no network, and no environment variables.

## 4. The data adapter (how zero-key local dev works)

Every repository is an **interface** in `domain/`, with two implementations:

```
ApplicationRepository (interface)
   ├── InMemoryApplicationRepository   ← seeded demo data, used when Supabase env is absent
   └── SupabaseApplicationRepository   ← used when NEXT_PUBLIC_SUPABASE_URL is set
```

Selection happens once, in `server/repositories/index.ts`, by inspecting env. This means:

- `npm run dev` with no `.env` → fully working app with realistic demo data
- Tests run against the in-memory adapter → fast, deterministic, no fixtures to reset
- Adding real Supabase credentials flips the whole app to persistent storage with no code change

This is not a toy mock. The in-memory adapter implements the same interface with the same
validation, so a bug caught in tests is a real bug.

## 5. The eligibility engine (the product's core IP)

**Deterministic first, AI second.** This ordering is a legal requirement, not a preference.

```
   User answers (~10 questions)
             │
             ▼
   ┌──────────────────────┐
   │  Rules Engine        │   pure functions, versioned rule data
   │  domain/eligibility  │   effective-dated, reviewable by non-engineers
   └──────────┬───────────┘
              │  → { route, score, met[], unmet[], blockers[], documents[] }
              ▼
   ┌──────────────────────┐
   │  LLM Narrator        │   explains the result in plain language,
   │  server/services/ai  │   in the user's language. Cannot change the verdict.
   └──────────┬───────────┘
              ▼
      Eligibility Report
```

The LLM receives the rules engine's structured output and is instructed to explain it. It is
never asked "is this person eligible?" — it is asked "explain why this result says what it
says". If the AI provider is unavailable or unkeyed, the report degrades gracefully to
template-rendered text: **the product never depends on the LLM to function.**

Rules live in `domain/eligibility/rules/` as data with `effectiveFrom` dates, so a policy
change is a data edit with an audit trail — not a code change.

## 6. Document validation & rejection risk

Modelled explicitly on the checks the UAE's own ICP/MoHRE AI screening performs since May 2026:

| Check | Rule | Severity |
|---|---|---|
| Passport validity | ≥ 6 months beyond intended entry | **Blocker** |
| Passport blank pages | ≥ 2 facing pages | Warning |
| Photo specification | white background, 43×55mm, face 70–80% | **Blocker** |
| Name consistency | exact match across passport / certificate / contract | **Blocker** |
| Attestation chain | notary → MOFA origin → UAE embassy → MOFA UAE | **Blocker** for employment |
| Salary threshold | route-dependent (e.g. Golden Visa salary route) | **Blocker** |
| Insurance & medical | present for residence categories | Warning |
| Document freshness | bank statements ≤ 3 months old | Warning |

Output is a **Rejection Risk Score** (0–100) with itemised, actionable fixes. Shown *before*
the customer pays any government fee. This is the single feature no competitor offers.

## 7. Request lifecycles

**Public page (SEO-critical):** Static/ISR at the edge. No client JS required to read content.
Structured data (JSON-LD) emitted server-side.

**Eligibility check:** Client wizard → Server Action → rules engine (pure, ~1ms) → immediate
structured result rendered → LLM narration streamed in progressively. The user sees their
answer before the AI finishes writing about it.

**Document upload:** Client requests a signed upload URL from a Server Action (which
authorizes against the session) → browser uploads directly to Supabase Storage, never through
our serverless function → a Server Action records metadata and runs validation. Files never
transit our compute, which keeps us inside serverless body limits and reduces exposure.

**Admin state change:** Server Action → authorize role → repository write → append audit-log
row → enqueue notification. Every mutation that touches an application is audited.

## 8. Security model

Full detail in `docs/security.md`. The load-bearing decisions:

- **Authorization lives in Postgres RLS**, not only in application code. A customer can read
  only rows where `user_id = auth.uid()`. Even a compromised API route cannot leak across tenants.
- **Storage buckets are private.** Access is exclusively via short-TTL signed URLs generated
  after a server-side authorization check.
- **All input is Zod-validated at the Server Action boundary.** Types from the client are
  never trusted.
- **Secrets are server-only.** Anything prefixed `NEXT_PUBLIC_` is treated as published.
  The Anthropic key, the service-role key and the Resend key are never in that namespace.
- **Strict CSP, HSTS, frame-deny, and `X-Content-Type-Options`** set in middleware.
- **Rate limiting** on all public mutation endpoints (eligibility, contact, quote).
- **Audit log** is append-only and covers every status change and document access.

## 9. Performance strategy

The 3D hero is the obvious risk to our own LCP goal. It is handled by:

1. **Deferred import** — the Three.js bundle is `next/dynamic` with `ssr: false`, so it never
   blocks first paint or the SEO-visible HTML.
2. **A real static fallback** — a CSS/SVG gradient hero renders immediately and is what the
   crawler and the slow-connection user actually see. The 3D layer fades in over it.
3. **`prefers-reduced-motion` gating** — users who request reduced motion get the static hero
   permanently. This is both an accessibility requirement and a performance win.
4. **Device gating** — the scene is skipped on low-core / low-memory devices.

Everything else is Server Components by default; `"use client"` is an exception that must be
justified, not the default.

## 10. Testing strategy

| Layer | Tool | What it proves |
|---|---|---|
| Domain logic | Vitest | Eligibility, pricing and document rules are correct. No mocks needed. |
| Components | Vitest + Testing Library | UI renders correct states from props. |
| Server Actions | Vitest + in-memory repos | Validation and authorization behave. |
| End-to-end | Playwright | The real journeys work in a real browser. |
| Accessibility | axe-core in Playwright | No WCAG violations on key pages. |

Domain tests are the ones that matter most: they encode the business rules that, if wrong,
cost a customer a rejected application.

## 11. Deployment

```
GitHub push
   ├─→ GitHub Actions: typecheck · lint · unit tests · build · e2e · axe
   └─→ Vercel: preview deploy per branch, production on main
```

Supabase migrations are versioned SQL in `supabase/migrations/`, applied via the Supabase CLI.
No hosting spend until traffic requires it.
