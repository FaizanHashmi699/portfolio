# ADR-0005 — Locales are additive; English stays at the root

**Status:** Accepted · **Date:** August 2026

## Context

Our customers are overwhelmingly non-native English speakers: Indian, Pakistani, Filipino,
Egyptian and Russian communities make up the bulk of the UAE expatriate population, and
Arabic is the official language. Translating the site is not a nice-to-have.

The standard App Router approach is a `[locale]` segment wrapping every route, with the
default locale either prefixed (`/en/pricing`) or served through a rewrite.

## Decision

**English is served unprefixed at the root, exactly where it already was. The other four
locales are additive routes under `/ar`, `/hi`, `/ur`, `/ru`.**

Only genuinely translated pages exist in those locales, and each carries a visible notice
saying it is machine-assisted with a link back to English.

## Why

**Moving English would have broken every URL.** Restructuring to `/en/...` invalidates every
inbound link, every indexed page and every share. That is a large, permanent cost paid for
architectural tidiness.

**Partial translation is the honest state.** We have translated the navigation, the
homepage and the disclosures. We have not translated 14 service pages, 48 nationality
pages or the legal text, and we are not going to machine-translate them: a mistranslated
eligibility criterion can send someone toward a non-refundable government fee. Serving
English content under an `/ar` path would be worse than not having the path — it invites a
duplicate-content penalty and misleads the reader about what has been checked.

**Only translated pages enter the sitemap.** Same reasoning.

**`dir` is set on a wrapper, not on `<html>`.** Only the root layout renders `<html>`, and
making it locale-aware means reading request headers there — which forces every page,
including the statically generated English marketing site, to render on demand. Trading
the entire static build for scrollbar placement is a bad deal. `dir` on a container is
valid HTML and gives correct direction, mirroring and logical-property behaviour for
everything inside it.

## Consequences

**Good.** No URL moved. Static generation is preserved. hreflang and x-default are correct.
The dictionaries are typed against the English source, so a missing key is a build error.

**Bad.** Two header and footer implementations exist — one localised, one not. They will
drift if nobody watches.

**Bad.** A visitor on `/ar` who clicks into a service page lands in English. The notice
warns them, but it is a discontinuity.

**Accepted.** Both are worth less than the cost of either breaking every URL or shipping
machine-translated immigration criteria.

## When to revisit

When there is budget for professional translation of the service catalog and legal text. At
that point the notice comes down, the translated pages enter the sitemap, and moving to a
full `[locale]` tree becomes worth reconsidering.
