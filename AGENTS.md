<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Maqam — project rules for agents

A UAE visa and business-setup consultancy platform. Read `README.md` first, then
`docs/architecture.md`.

## Run it

`npm install && npm run dev` — no `.env`, no database, no keys. The app runs against seeded
in-memory data. Verify with `npm run verify`, and `npm run test:e2e` for browser tests.

## Layering — dependencies point inward

`app/ → components/ → server/ → domain/`

`src/domain/` performs **no I/O** and imports nothing from `server/` or `app/`. That is what
makes the business rules testable without mocks, a database, or environment variables. If
you need to fetch something inside `domain/`, the fetch belongs in `server/`.

## Non-negotiable product rules

These are load-bearing for the product's promise and its legal position, not style
preferences:

1. **Never produce an opaque price.** Quotes are always itemised into government /
   third-party / our fee, with VAT per line.
2. **Never promise an outcome.** No "guaranteed" or "will be approved" anywhere. Output is
   readiness against published criteria. There is a test asserting this.
3. **The rules engine decides eligibility; the LLM only explains it.** See
   `docs/adr/0002-rules-engine-over-llm.md`.
4. **Never imply government affiliation.** We are a private consultancy.
5. **Zod-validate every Server Action input.** A Server Action is a public HTTP endpoint.
6. **No secrets behind `NEXT_PUBLIC_`.** Server-only modules import `server-only`.

## Changing rules or fees

Thresholds live as data in `src/domain/eligibility/rules/routes.ts`; fees in
`src/domain/catalog/services.ts`. When changing one: update `effectiveFrom`, bump
`RULES_VERSION`, cite the authority's published source, and add a boundary test including
the inclusive edge. Mark genuinely varying figures `estimated: true`.

## Testing expectation

Anything a user clicks needs a test that clicks it. This codebase once shipped a completely
non-interactive site because every test only asserted server-rendered content — see
`docs/adr/0004-csp-without-nonce.md`.
