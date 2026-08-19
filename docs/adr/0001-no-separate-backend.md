# ADR-0001 — No separate backend service

**Status:** Accepted · **Date:** August 2026

## Context

The initial instinct was a split deployment: a Next.js frontend on Vercel and a NestJS API
on Render. This is a common and respectable shape, and it is what most "production
architecture" guidance describes.

We need: HTTP endpoints, database access, file handling, scheduled work, and the ability to
add a mobile client later.

## Decision

**One Next.js application. No separate backend service.** Route Handlers and Server Actions
run as serverless functions and are the backend. Supabase provides Postgres, auth and
storage.

The `src/server` boundary is kept clean and the `src/domain` layer performs no I/O at all,
so extracting a standalone service later is a refactor rather than a rewrite.

## Why

**Cold starts would land on the conversion path.** Render's free tier sleeps and can take
tens of seconds to wake. The first request after idle is disproportionately likely to be a
real prospect submitting the eligibility form — the single most important interaction in
the product. Paying to avoid this at pre-revenue is the wrong trade; accepting it is worse.

**Two services is real, recurring cost for a solo operator.** Two deploys, two secret
stores, two CI pipelines, a CORS surface, and version skew between client and API. That
overhead is justified when team boundaries or independent scaling demand it. Neither
applies here.

**Route Handlers are a real backend.** Full Node APIs, streaming, middleware, typed
end-to-end. The distinction between "frontend framework" and "backend" stopped being
architecturally meaningful for this class of application.

**Supabase supplies the parts that are genuinely hard.** Row-level security enforced in the
database, a working auth system, and object storage with signed URLs would each take weeks
to build correctly. RLS in particular is the right place for authorization in a product
where a leak means leaked passports.

## Consequences

**Good.** One deploy. No CORS. No cold starts on the critical path. Types shared without a
client package. Zero hosting cost until traffic justifies spend.

**Bad.** We inherit Vercel's serverless constraints: execution time limits and request body
size limits. The body limit is why document uploads go browser-to-storage directly rather
than through our functions — which turned out to be better for security anyway.

**Accepted risk.** Vendor concentration on Vercel and Supabase. Mitigated by the fact that
Next.js self-hosts on any Node runtime and Supabase is Postgres — both have real exits, and
the layering keeps our own code portable.

## When to revisit

- Long-running work exceeding serverless limits (bulk document processing, large exports)
- A second consumer of the API that is not our own web client
- A team large enough that deployment coupling is slowing people down
