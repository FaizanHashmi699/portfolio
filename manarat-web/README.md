# Manarat Foundation — website & admin panel

A Next.js rebuild of manaratfoundation.org.uk that implements the top
recommendations from `../manarat-competitor-research`.

| Research finding | What this app does about it |
|---|---|
| F5 — education offer has no shop window | A page per programme with ages, schedule, fees, teacher notes and an enquiry form |
| F3 — prayer times are a 2020 PDF | Times calculated astronomically every day, with a full month table and jama'ah offsets |
| F2 — the site cannot take a donation | One-off and monthly giving with Gift Aid capture |
| F4 — £660k reserve has no public name | A named appeal with a live progress total |
| F10 — discoverability is rented | Newsletter capture into the masjid's own list |

## Stack

- **Next.js 15** (App Router, React 19, Server Components + Server Actions)
- **TypeScript**, strict
- **Tailwind CSS v4**
- **Supabase** — Postgres with row-level security, and Supabase Auth for the admin panel
- **Vercel** for hosting

No external prayer-time API: `src/lib/prayer-times.ts` is a self-contained
astronomical implementation, so the timetable cannot go stale.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project values
npm run dev
```

## Routes

**Public** — `/`, `/prayer-times`, `/programmes`, `/programmes/[slug]`,
`/appeal`, `/donate`, `/about`, `/contact`

**Admin** (`/admin`, behind Supabase Auth) — dashboard, enquiries, donations,
subscribers, programmes, appeals, prayer settings.

## Security model

Row-level security is the boundary, not the middleware:

- Anonymous visitors can **read** only published programmes, campaigns,
  announcements and prayer settings.
- Anonymous visitors can **insert** donations, enquiries and subscribers, with
  database-level guards — a donation can only be created as `pending` with no
  payment provider attached, so a `paid` row cannot be forged.
- Donations, enquiries and subscribers are **never readable** anonymously.
  Verified: an anonymous read returns 0 rows from all three.
- The Supabase **service-role key is not used anywhere** in this app.

`.env.production` therefore contains only publishable values, which ship in the
browser bundle regardless.

## Payments

**Card payments are deliberately not wired up.** The donate form records a
pledge and a reference; no card details are collected and no money moves. The
donation row is stored as `pending` so a Stripe webhook can later advance the
same record to `paid`.

To switch on live collection, set both `STRIPE_SECRET_KEY` and
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. The donate page reads those to decide
whether to show the pledge-mode notice. You will also need to complete Stripe's
charity onboarding before taking real donations.

## Before going live

1. Replace the placeholder phone number and email on `/contact`.
2. Replace the appeal copy in the admin panel with the real project scope, costings and timeline.
3. Check the jama'ah offsets and Jumu'ah times against the masjid's actual practice.
4. Connect Stripe (above), and register for Gift Aid with HMRC if not already.
