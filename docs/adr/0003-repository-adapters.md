# ADR-0003 — Repository interfaces with an in-memory adapter

**Status:** Accepted · **Date:** August 2026

## Context

The product needs persistent storage. Supabase is the choice. But requiring a Supabase
project before `npm run dev` produces anything imposes a real cost: the founder cannot open
the project on a new machine without provisioning accounts, contributors cannot evaluate it,
CI needs credentials, and tests need fixture management.

## Decision

Every data operation goes through an **interface** defined in the domain layer, with two
implementations: an in-memory adapter seeded with realistic demo data, and a Supabase
adapter. Selection happens once, in `src/server/repositories/index.ts`, based on whether
Supabase environment variables are present.

## Why

**`npm install && npm run dev` must produce the whole product.** No accounts, no keys, no
database. That is the difference between a repository someone can evaluate in five minutes
and one they abandon.

**The seed is not a stub.** It contains three applications exercising genuinely different
states — one progressing, one blocked on real document problems the validator detects, one
approved. The in-memory adapter implements the same interface with the same semantics, so a
bug caught against it is a real bug.

**Tests get determinism for free.** No database to spin up, no fixtures to reset, no
ordering dependencies between test files.

**It keeps the seam honest.** Because two implementations must satisfy the same interface,
Supabase-specific concepts cannot leak upward into application code. That is what makes the
"extract a service later" story in ADR-0001 credible rather than aspirational.

## Consequences

**Good.** Zero-friction onboarding. Fast, deterministic tests. CI needs no secrets. A
genuinely portable data layer.

**Bad.** Two implementations to keep in sync. A feature landing in one and not the other is
a real failure mode — mitigated by the shared interface and by the admin console displaying
which driver is active.

**Bad.** In-memory state lives on `globalThis` to survive dev-mode module reloading, which
means it is shared process-wide. End-to-end tests running in parallel can observe each
other's writes, so tests that mutate must use unique values rather than fixed strings.

**Mitigated.** Demo mode is displayed prominently on every authenticated page. Seeded data
that looks like production data is how someone makes a real decision from a fixture.
