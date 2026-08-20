# ADR-0006 — Cookieless, first-party analytics

**Status:** Accepted · **Date:** August 2026

## Context

We need to know which guides are read and which pages convert, or content decisions are
guesswork. The default answer is Google Analytics or Plausible plus a consent banner.

Our visitors are largely migrants, many from countries where being identified as seeking to
leave carries real risk. "Which pages did this person read on a UAE visa site" is not
neutral data about them.

## Decision

**First-party, cookieless, in-process analytics. No third-party script, no consent banner,
and no identifier that survives a process restart.**

The visitor hash is `sha256(ip + user-agent + salt)` truncated to 16 hex characters. The
salt is generated on every process start and never persisted. Referrers are reduced to
their host. Authenticated paths are never recorded at all.

## Why

**The privacy property is structural, not a policy.** Once the salt rotates, yesterday's
hashes cannot be matched to today's — not by us, not by anyone who obtains the data, not
under a subpoena. A promise not to track can be broken; an inability to is not. There are
unit tests asserting exactly this.

**No consent banner, honestly.** We do not set anything requiring consent, so we do not ask
for it. That is a better outcome than a banner: banners are friction, they are widely
ignored, and a "reject" button that does nothing is worse than no button.

**No third-party scripts at all.** This also lets the content security policy stay tight —
there is no analytics domain to allow, no tag manager to trust.

**Full referrer URLs carry search terms.** Keeping only the host answers the only question
we actually have ("did they come from Google?") and discards the rest.

## Consequences

**Good.** No banner. No third-party data sharing. A genuinely defensible privacy page. Zero
performance cost from an external script.

**Bad, and significant.** No cross-day funnels, no cohorts, no returning-visitor rate, no
attribution beyond referrer host. We cannot answer "did the people who read the attestation
guide convert later". That is a real analytical loss.

**Bad.** Events live in memory on a single serverless instance, bounded at 5,000. Numbers
are approximate and reset on deploy — fine for "which guides are read", useless for
reporting to an investor.

**Accepted.** The lost analysis is worth less than the property we get in exchange, for this
audience.

## When to revisit

If durable aggregate numbers become necessary, write the _aggregates_ to Postgres on a
schedule — counts per path per day, never the events. That keeps the unlinkability property
while surviving deploys. Adding a third-party tracker would forfeit it entirely, and would
require the banner and the consent record that go with it.
