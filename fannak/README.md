# Fannak (فنّك)

Arabic-first services marketplace for Riyadh. A **technology intermediary**:
customers find and request work, licensed providers deliver it. The platform
never employs labour and never handles the provider's own invoicing.

Decisions behind this build are in `../research/step-2-tech-stack.md`.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000  → redirects to /ar
```

**No configuration is required.** With no Supabase credentials the data layer
serves seed data and the UI says so, so the app is always runnable and
demoable. Copy `.env.example` to `.env.local` when you have real services.

```bash
npm run build        # production build (also emits a standalone server)
npm run typecheck
npm start &          # then, against a running server:
npm run smoke        # end-to-end checks in Chromium
```

## What exists

| Route | Purpose |
|---|---|
| `/[locale]` | Landing page; the search box is the entry point |
| `/[locale]/providers` | **Directory + search** — filter by service, district, free text |
| `/[locale]/providers/[slug]` | Provider profile: services, prices, districts served |
| `/[locale]/request` | Customer request form → creates a lead |

Locales: `ar` (default, RTL) and `en`. Every directory search is a plain `GET`,
so each filter combination is a shareable, indexable URL — that is what makes
"AC repair in Al Olaya" a landing page rather than an app state.

## Database

```
supabase/migrations/0001_init.sql   schema, RLS, assign_lead(), add_credits()
supabase/seed.sql                   Riyadh districts + AC service taxonomy
```

Two invariants worth knowing before changing anything:

- **`credit_ledger` is append-only**, enforced by trigger. Balances are always
  reconstructable, because the first partner dispute will be about credits.
- **`assign_lead()` does assign + debit in one transaction**, locking the
  tenant row. Never reimplement this across two application calls.

## Integrations

| Module | Service | State |
|---|---|---|
| `src/lib/wathq.ts` | Wathq CR verification | Needs `WATHQ_API_KEY` (free tier) |
| `src/lib/whatsapp.ts` | WhatsApp Cloud API | Works unverified to 250 conversations/24h |
| `src/lib/supabase/` | Supabase | Optional; seed fallback without it |

Each reports honestly when unconfigured rather than pretending to succeed.

## Conventions

- **RTL is not a feature flag.** Use logical properties (`ms-`, `me-`, `ps-`,
  `pe-`, `text-start`) — never `ml-`/`mr-`/`text-left`.
- **Arabic is the source locale**; English is the translation.
- Colours come from tokens in `globals.css`. Both themes are defined; never
  hardcode a colour inside a media query.
- The green `pill-verified` style is reserved for **verified registration
  only**, so trust never reads as decoration.

## Not built yet

Partner portal, admin console, payments, ZATCA invoicing. See the "Deferred"
table in `../research/step-2-tech-stack.md` for what triggers each.
