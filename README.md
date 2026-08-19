<div align="center">

# Maqam

**UAE visas and business setup, priced honestly.**

Transparent all-in pricing · AI document checks · Live application tracking

</div>

---

## What this is

A production-shaped platform for a Dubai visa and business-setup consultancy. It has three
surfaces in one Next.js application:

| Surface             | Route     | Who it's for                                   |
| ------------------- | --------- | ---------------------------------------------- |
| **Marketing site**  | `/`       | Prospects — statically generated, SEO-critical |
| **Customer portal** | `/portal` | Clients tracking their applications            |
| **Admin console**   | `/admin`  | Staff running operations                       |

It runs completely, with realistic seeded data, on a laptop with **no accounts, no API keys
and no database**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. That's the whole setup.

---

## The strategy this is built on

Before any code, five competitors were studied — Virtuzone, Shuraa, Creative Zone,
Emirabiz and Insta Dubai Visa. The full analysis is in
[`docs/research/competitor-analysis.md`](docs/research/competitor-analysis.md). Two findings
shaped everything:

**1. The category's business model runs on withholding information.** Every competitor
routes "am I eligible?" and "what does it cost?" through a lead form. Fee surprise is the
single largest driver of the industry's poor consumer reviews. Our wedge is doing the
opposite — both answers are free, immediate, and require no phone number.

**2. In May 2026 the UAE government began screening applications with AI.** The ICP and
MoHRE now score skills, education and experience against live labour-market data and verify
documents automatically. That quietly changes what a consultancy is _for_: when a machine
makes the first assessment, the value moves from knowing someone at the counter to
**predicting the machine's verdict before the customer pays**. No competitor's product
reflects this yet.

Everything in this codebase follows from those two facts.

---

## Running it

### Requirements

- Node.js 20.9+ (22 recommended)
- npm 10+

### Commands

| Command                 | What it does                                    |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Development server on :3000                     |
| `npm run build`         | Production build                                |
| `npm start`             | Serve the production build                      |
| `npm test`              | Unit tests (Vitest)                             |
| `npm run test:coverage` | Unit tests with coverage thresholds             |
| `npm run test:e2e`      | End-to-end tests (Playwright, desktop + mobile) |
| `npm run typecheck`     | TypeScript, no emit                             |
| `npm run lint`          | ESLint                                          |
| `npm run format`        | Prettier, write                                 |
| `npm run verify`        | typecheck → lint → unit tests → build           |

First time running e2e tests, install the browsers:

```bash
npx playwright install --with-deps chromium
```

### Demo mode

With no `.env.local`, the app uses in-memory repositories seeded with three realistic
applications — one progressing normally, one blocked on document problems, one approved.
A banner makes demo mode unmistakable on every authenticated page, because seeded data that
looks like production data is how someone ends up making a real decision from a fixture.

The seeded portal user is Amina Yusuf. The admin console is open in demo mode (there is no
authentication to enforce yet) and becomes a genuine role check the moment Supabase is
configured.

---

## Going live

Everything below is optional and additive. Copy `.env.example` to `.env.local` and fill in
only what you want.

### 1. Database, auth and storage — Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is enough to start).
2. **Project Settings → API** gives you three values for `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe in the browser; row-level security is what
     protects the data
   - `SUPABASE_SERVICE_ROLE_KEY` — **bypasses row-level security**. Server-only. Never
     prefix it `NEXT_PUBLIC_`.
3. Apply the migrations:
   ```bash
   npx supabase link --project-ref <your-ref>
   npx supabase db push
   ```
   This creates the tables, the row-level security policies, the private `documents`
   storage bucket, and the trigger that provisions a profile on signup.
4. Restart. The app switches from in-memory to Supabase automatically — the admin console's
   "Storage driver" tile confirms which one is live.

To make yourself staff, set `role` to `admin` on your row in `public.profiles`.

### 2. AI narration — Anthropic

Set `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com).

Without it, eligibility explanations fall back to deterministic template text. **The rules
engine decides eligibility either way** — the model only ever explains a verdict that has
already been reached. See [Architecture §5](docs/architecture.md).

### 3. Email — Resend

Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` from [resend.com](https://resend.com). Without
them, emails are logged to the server console — which is what you want locally and in CI,
and stops you emailing real people by accident.

### 4. Deploy

**Frontend and backend together, on Vercel.** There is no separate backend service to
deploy: Next.js Route Handlers and Server Actions _are_ the backend. See
[ADR-0001](docs/adr/0001-no-separate-backend.md) for why a NestJS-on-Render split was
considered and rejected.

1. Push this branch to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new). Framework and build
   settings are detected automatically.
3. Add your environment variables in **Project Settings → Environment Variables**. Set
   `NEXT_PUBLIC_SITE_URL` to your production domain so metadata, sitemap and JSON-LD
   resolve correctly.
4. Deploy. Every branch gets a preview URL; `main` goes to production.

Cost at launch: **zero**. Vercel Hobby and Supabase Free cover it until real traffic
justifies spend.

---

## How the code is organised

Dependencies point **inward only**. The `domain` layer knows nothing about React, Next.js
or Supabase — which is exactly why it is testable with no mocks, no database and no
environment variables.

```
src/
├── app/            Next.js routes — thin; render and delegate
│   ├── (marketing)/    public site: statically generated, SEO-critical
│   ├── (portal)/       customer app: auth-gated, never cached
│   └── (admin)/        staff console: role-gated
├── components/     presentation and client interactivity
│   ├── ui/             design-system primitives
│   └── three/          the 3D hero — lazy, motion-gated, never blocking
├── server/         the only layer permitted to perform I/O
│   ├── actions/        Server Actions, Zod-validated at the boundary
│   ├── repositories/   data access behind interfaces (in-memory | Supabase)
│   └── services/       AI, email, rate limiting
├── domain/         pure TypeScript. No I/O. Fully unit-tested.
│   ├── eligibility/    the rules engine
│   ├── pricing/        fee computation
│   ├── documents/      validation and rejection-risk scoring
│   └── catalog/        services, fees, requirements
└── content/        guides, FAQs, legal copy
```

### Three decisions worth knowing about

**Pricing cannot produce an opaque total.** `buildQuote` always returns itemised lines
alongside the total, split into government / third-party / our fee, with VAT applied per
line rather than to the subtotal. There is no code path that yields a single unexplained
number — the architecture makes a bait-and-switch impossible rather than merely
discouraged.

**The rules engine decides; the AI explains.** Eligibility is computed by pure functions
over versioned, effective-dated rule data. A policy change is a reviewable content edit
with an audit trail, not a code change. The language model receives the verdict and is
instructed to explain it, never to reach it. If the API is down, unkeyed, or returns
something odd, the product degrades to template text rather than to a wrong answer.

**Authorization lives in Postgres.** Row-level security means a customer can only ever read
rows where `user_id = auth.uid()`. A bug in a route handler is not sufficient to leak a
passport, because the database refuses the read regardless of what the application asks
for.

---

## Testing

```
npm test          90 unit tests  — domain logic: pricing, eligibility, documents
npm run test:e2e  108 e2e tests  — real journeys in a real browser, desktop + mobile
```

The end-to-end suite covers the marketing site, the full eligibility journey, the portal,
the admin console, accessibility (axe, WCAG 2.1 AA, zero serious violations across 11
pages), and security headers.

`e2e/security.spec.ts` exists because of a real bug. An earlier nonce-based CSP blocked
every Next.js script: the HTML rendered perfectly, every content assertion passed, and the
site shipped completely non-interactive. Only a test that clicked something caught it.
Those tests now fail the build if a single console or CSP error appears on any key page.

---

## Documentation

| Document                                                    | What's in it                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| [Competitor analysis](docs/research/competitor-analysis.md) | Five competitors, shared blind spots, our wedge, business model |
| [Research sources](docs/research/sources.md)                | Every source, linked                                            |
| [Architecture](docs/architecture.md)                        | Stack rationale, layering, request lifecycles, performance      |
| [Product requirements](docs/product-requirements.md)        | Personas, journeys, scope, success metrics                      |
| [Security](docs/security.md)                                | Threat model, data protection, PDPL posture                     |
| [SEO strategy](docs/seo-strategy.md)                        | How we compete with an eight-year content head start            |
| [Deployment](docs/deployment.md)                            | Vercel, Supabase, DNS, launch checklist                         |
| [ADRs](docs/adr/)                                           | Decisions, with the reasoning and the trade-offs                |

---

## Legal position

This is a private consultancy product. It is not affiliated with the ICP, GDRFA, MoHRE, any
free zone authority, or any embassy, and the site says so on every page. It never promises
an approval — all AI and rules-engine output is framed as readiness against published
criteria.

**Before trading:** obtain the correct UAE trade licence, have a qualified UAE practitioner
review `src/content/legal.ts`, and reconcile every fee in `src/domain/catalog/services.ts`
against the authorities' current published rates. The figures in this repository are
researched 2026 market indicators, not quotations.

---

## Licence

[MIT](LICENSE)
