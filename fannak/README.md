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
npm run smoke        # public flow: directory, search, request form, RTL

# Operator flow needs the admin env vars set on the SERVER:
ADMIN_ACCESS_KEY=dev-key FANNAK_SECRET=dev-secret npm start &
ADMIN_ACCESS_KEY=dev-key npm run smoke:admin
ADMIN_ACCESS_KEY=dev-key npm run smoke:i18n   # language purity + switching
```

## What exists

| Route | Purpose |
|---|---|
| `/[locale]` | Landing page; the search box is the entry point |
| `/[locale]/providers` | **Directory + search** — filter by service, district, free text |
| `/[locale]/providers/[slug]` | Provider profile: services, prices, districts served |
| `/[locale]/request` | Customer request form → creates a lead |
| `/[locale]/admin` | Operator console — overview, partners, leads, message log |
| `/[locale]/partner` | Partner portal — assigned leads, accept/decline, credit history |

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

## One language at a time

Each locale renders in one language only — no mixed Arabic and English on a
page. Three rules keep it that way:

1. **Servers return translation keys, never prose.** A store that returns
   `"insufficient credits"` puts English on an Arabic page; it returns
   `insufficient_credits` plus params, and the UI renders it in the viewer's
   language. The same applies to status enums and the message log.
2. **Switching language keeps you where you are**, filters and all. Sending
   the viewer home is not a language switch — it is a switch plus losing your
   place.
3. **User-entered content is exempt.** A customer called زبون is Arabic
   whatever language the operator reads in. Those elements are marked
   `data-user-content` so the audit can exclude them.

`npm run smoke:i18n` walks every surface in both locales and fails if the
wrong script appears, which catches leaks a reviewer would miss.

## Conventions

- **RTL is not a feature flag.** Use logical properties (`ms-`, `me-`, `ps-`,
  `pe-`, `text-start`) — never `ml-`/`mr-`/`text-left`.
- **Arabic is the source locale**; English is the translation.
- Colours come from tokens in `globals.css`. Both themes are defined; never
  hardcode a colour inside a media query.
- The green `pill-verified` style is reserved for **verified registration
  only**, so trust never reads as decoration.

## Operator access

There is no email or SMS login: phone OTP needs a CITC-approved sender ID
(which needs a local entity) and magic links need a verified sending domain.
So both operator surfaces are reached the way this business already
communicates — a link sent over WhatsApp:

- **Admin** — one shared access key (`ADMIN_ACCESS_KEY`). **Admin routes 404
  entirely unless both `ADMIN_ACCESS_KEY` and `FANNAK_SECRET` are set**, so an
  unconfigured deployment never exposes an open console.
- **Partner** — a signed per-tenant link generated in the admin console.
  Your brother sends it on WhatsApp; the partner's browser keeps the session.
  Tokens are HMAC-signed, so a forged one is rejected.

Admin and partner routes are `force-dynamic`. They must never be
prerendered — a statically generated admin page freezes a build-time
authentication answer into every response.

## Not built yet

Payments (Moyasar), ZATCA invoicing, ratings, vendor self-signup. See the
"Deferred" table in `../research/step-2-tech-stack.md` for what triggers each.


