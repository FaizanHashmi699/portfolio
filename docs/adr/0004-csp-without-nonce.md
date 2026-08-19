# ADR-0004 — `script-src 'unsafe-inline'` instead of a nonce

**Status:** Accepted · **Date:** August 2026 · **Supersedes:** the original nonce-based CSP

## Context

The application handles passports, Emirates IDs and salary certificates, so a strong
Content Security Policy is warranted. The strongest practical option for a Next.js app is a
per-request nonce with `'strict-dynamic'`, and that is what was implemented first.

It did not work, in a way worth recording.

## What happened

The nonce policy shipped a site that **rendered perfectly and was completely
non-interactive.** Every server-rendered page looked correct. Content assertions passed.
Metadata, structured data and copy were all fine. But every Next.js script was refused, so
nothing hydrated: no theme toggle, no mobile menu, no eligibility wizard, no forms.

Two causes:

1. Setting only the `x-nonce` request header is insufficient. Next.js reads the nonce from
   the `Content-Security-Policy` header on the **request** in order to stamp it onto the
   script tags it emits. Without that, the header advertises a nonce that no script carries.

2. More fundamentally, **a per-request nonce is incompatible with route caching.** Once
   fixed, `/admin` still failed with `x-nextjs-cache: HIT` — the cached HTML retained the
   nonce it was rendered with while the response header carried a freshly generated one.
   Every script mismatched. This is not a bug to work around; it is what per-request values
   and cached responses mean together.

It was caught by one end-to-end test that clicked the mobile menu. Nothing else in the suite
— including the accessibility sweep across eleven pages — noticed.

## Decision

Use a single policy with `script-src 'self' 'unsafe-inline'`. Keep every other directive
strict. Add `e2e/security.spec.ts`, which fails the build if any console or CSP error
appears on any key page, and which asserts that React actually hydrates by toggling a
client component and observing the result.

Additionally, mark the portal and admin layouts `force-dynamic`, since authenticated HTML
being eligible for the full-route cache is wrong independently of CSP.

## Why this is acceptable here

`'unsafe-inline'` matters when an attacker can get script into the page. In this
application:

- **No user-generated content is rendered as HTML.** React escapes everything. The only
  `dangerouslySetInnerHTML` is `JSON.stringify`'d JSON-LD built from our own catalog
  modules, never from request input.
- **There are no third-party scripts at all** — no analytics, tag manager or chat widget.
  `'self'` therefore means only our own code.
- **Authorization is in Postgres row-level security**, so injected script alone cannot read
  another customer's documents.
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` and `form-action 'self'`
  close the paths that make an inline-script XSS most damaging.

## The general principle

**A control that fails silently is worse than a weaker control that is continuously
verified.** The nonce policy was strictly stronger on paper and catastrophically worse in
practice, because its failure mode was invisible to every check we had except one. Prefer
the security posture you can prove is working on every commit.

## When to revisit

- If we ever render user-supplied rich content — then a nonce becomes worth the cost, scoped
  to the affected routes only, and must land together with a test proving those pages still
  hydrate.
- If Next.js gains per-route CSP that composes correctly with the full-route cache.
