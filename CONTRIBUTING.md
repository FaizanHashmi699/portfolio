# Contributing

## Getting set up

```bash
npm install
npm run dev
```

That's it. No `.env`, no database, no accounts — the app runs against seeded in-memory data.
See the [README](README.md) if you want to connect real services.

For end-to-end tests, install browsers once:

```bash
npx playwright install --with-deps chromium
```

## Before you push

```bash
npm run verify     # typecheck → lint → unit tests → build
npm run test:e2e   # real browser, desktop and mobile
```

CI runs both. Please don't make it find things you could have.

## How this codebase is organised

The rule that matters: **dependencies point inward.**

```
app/  →  components/  →  server/  →  domain/
```

`domain/` must never import from `server/`, `app/`, or anything that performs I/O. That is
what lets the business rules be tested with no mocks, no database and no environment. If you
find yourself wanting to fetch something inside `domain/`, the fetch belongs in `server/` and
the pure logic belongs where it is.

## Things that are not negotiable

These aren't style preferences — each one is load-bearing for either the product's promise
or its legal position.

**1. Never produce an opaque price.** Quotes are always itemised into government /
third-party / our fee, with VAT per line. If you add a fee, it gets a `kind` and a `note`
explaining what it is. A single unexplained total is the thing this product exists to
replace.

**2. Never promise an outcome.** No "guaranteed", "assured", "you will be approved".
Eligibility output is readiness against published criteria. There is a test asserting this
and it should stay passing.

**3. The rules engine decides; the AI explains.** Don't ask a model whether someone is
eligible. See [ADR-0002](docs/adr/0002-rules-engine-over-llm.md).

**4. Never imply government affiliation.** We are a private consultancy. Copy must not blur
this.

**5. Validate at the Server Action boundary.** A Server Action is a public HTTP endpoint.
Zod-parse everything, including data our own forms produced.

**6. Secrets stay server-side.** Nothing sensitive gets a `NEXT_PUBLIC_` prefix. Server-only
modules import `server-only`.

## Changing rules or fees

Eligibility thresholds live in `src/domain/eligibility/rules/routes.ts` as data. When you
change one:

1. Update the value and its `effectiveFrom` date.
2. Bump `RULES_VERSION`.
3. Cite the source in your PR — a link to the authority's published criteria.
4. Update or add a test asserting the new boundary, including the inclusive edge.

Same for fees in `src/domain/catalog/services.ts`. If a figure genuinely varies, mark it
`estimated: true` rather than implying a precision we don't have.

## Tests

- **Domain logic:** always. These encode rules that, if wrong, cost someone a rejected
  application. Test the boundaries, not just the happy path.
- **Server Actions:** test validation and authorization.
- **UI:** end-to-end for real journeys. Don't unit-test that a `<div>` renders.
- **Anything a user clicks:** must have at least one test that clicks it. We shipped a
  completely non-interactive site once because every test only checked server-rendered
  content — see [ADR-0004](docs/adr/0004-csp-without-nonce.md).

Prefer tests that describe behaviour (`blocks a AED 18,000 earner on the salary route`) over
tests that describe implementation.

## Accessibility

WCAG 2.1 AA, enforced by axe on eleven pages in CI. In practice:

- Every interactive element is reachable and operable by keyboard, with a visible focus ring
- Colour contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text — check both themes
- Form controls have real labels; errors use `role="alert"`
- Decorative visuals are `aria-hidden`, and motion respects `prefers-reduced-motion`

Our users are frequently reading in a second language on a small screen. These failures hurt
them first.

## Commit messages and PRs

Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Explain
_why_ in the body, not just what — the diff already says what.

In a PR, tell us what you changed, how you verified it, and anything you deliberately left
out.
