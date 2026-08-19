# Security Model

**Status:** v1.0 · **Last reviewed:** August 2026

This product stores passports, Emirates IDs, degree certificates, salary certificates and
bank statements for people whose right to live in a country depends on them. A breach here
is not an embarrassment; it is material harm to identifiable individuals. The controls
below are sized to that.

## 1. Threat model

| Threat                                                            | Likelihood | Impact       | Primary control                                                      |
| ----------------------------------------------------------------- | ---------- | ------------ | -------------------------------------------------------------------- |
| Cross-tenant data access (customer A reads customer B's passport) | Medium     | **Critical** | Postgres row-level security                                          |
| Credential leak via client bundle                                 | Medium     | **Critical** | Server-only secrets, enforced by naming + a test                     |
| Document storage enumeration                                      | Medium     | **Critical** | Private bucket, signed short-TTL URLs, path-scoped policies          |
| Injection via form input                                          | High       | High         | Zod validation at every Server Action boundary                       |
| XSS                                                               | Low        | High         | React escaping, no user-generated HTML, CSP                          |
| Automated lead-form abuse                                         | High       | Low          | Honeypot + fixed-window rate limiting                                |
| Privilege escalation (customer → staff)                           | Low        | **Critical** | Role in a table the user cannot update                               |
| Insider access without trace                                      | Medium     | High         | Append-only audit log                                                |
| Phishing using our brand                                          | Medium     | Medium       | Public "we never guarantee outcomes / are not government" disclosure |

## 2. Authorization is in the database

The single most important decision in this system: **authorization is enforced in Postgres
row-level security, not only in application code.**

```sql
create policy "applications_select_own" on public.applications
  for select using (user_id = auth.uid() or public.is_staff());
```

A customer can read only rows where `user_id` matches their session. This holds even if a
route handler is buggy, even if a Server Action forgets a check, even if an attacker finds
an IDOR in our code — the database refuses the read.

Application-level checks still exist (`requireUser`, `requireStaff`, plus an explicit
ownership comparison in the portal's application page). That is defence in depth: two
independent layers must both fail before data crosses a tenant boundary.

**Roles are not user-editable.** `profiles.role` is protected by a policy whose `with check`
clause prevents a user changing their own role. A role a user can edit is not a role.

## 3. Document storage

- The `documents` bucket is **private**. There is no public URL.
- Object keys are namespaced `{user_id}/{application_id}/{filename}`, and storage policies
  key off that first path segment — so the storage layer enforces the same tenancy
  boundary as the applications table.
- Access is via **short-TTL signed URLs**, minted server-side only after an authorization
  check.
- Uploads go **browser → Supabase Storage directly**, never through our serverless
  functions. Files never transit our compute, which avoids body-size limits and reduces
  the surface where a document could be logged or cached by accident.
- MIME types and a 10 MB size limit are enforced at the bucket, not just in the UI.

## 4. Secrets

| Variable                        | Exposure        | Notes                                   |
| ------------------------------- | --------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public          | Safe. Identifies the project only.      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public          | Safe by design — RLS is the protection. |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Server only** | Bypasses RLS entirely.                  |
| `ANTHROPIC_API_KEY`             | **Server only** | Billing exposure.                       |
| `RESEND_API_KEY`                | **Server only** | Sender-reputation exposure.             |

Anything prefixed `NEXT_PUBLIC_` is treated as published. Server-only modules import
`server-only`, so a build fails loudly if one is ever pulled into a Client Component. An
end-to-end test additionally asserts no secret name or key prefix appears in the delivered
HTML.

## 5. Input validation

Every Server Action validates with Zod **before** touching a repository. A Server Action is
a public HTTP endpoint; treating it as trusted because our own form calls it is how
mass-assignment bugs happen.

- Names reject `<` and `>` outright — nothing legitimate needs them.
- Free-text fields are length-bounded so a single POST cannot exhaust memory.
- Enum fields (service slugs, statuses) are validated against the catalog, not accepted as
  strings.
- The contact form carries a honeypot field: hidden from people, irresistible to bots. When
  filled, the request returns success and silently discards, so the bot learns nothing.

## 6. Rate limiting

Public mutation endpoints are rate limited per IP: 5/minute for saving an eligibility
report, 3/minute for the contact form.

The current implementation is an in-process fixed window, which is honest about what it is
— it protects a single serverless instance, not the fleet. It stops trivial abuse at zero
cost and no extra infrastructure. **Before taking real traffic this must move to Upstash
Redis or Vercel KV** so the window is shared across instances; the call site does not
change when it does.

## 7. Transport and browser headers

Set in `src/proxy.ts` on every response:

| Header                                | Value                                          | Why                                      |
| ------------------------------------- | ---------------------------------------------- | ---------------------------------------- |
| `Content-Security-Policy`             | see below                                      | Limits script and connection sources     |
| `Strict-Transport-Security`           | `max-age=63072000; includeSubDomains; preload` | No downgrade to HTTP                     |
| `X-Frame-Options` / `frame-ancestors` | `DENY` / `'none'`                              | Clickjacking                             |
| `X-Content-Type-Options`              | `nosniff`                                      | MIME confusion                           |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`              | No path leakage to third parties         |
| `Permissions-Policy`                  | camera, mic, geolocation denied                | We need none of them                     |
| `Cache-Control`                       | `no-store` on `/portal` and `/admin`           | No intermediary caching of customer data |

### The CSP trade-off, stated plainly

`script-src` is `'self' 'unsafe-inline'` rather than nonce-based. This is a deliberate
downgrade from the stronger option, and the reasoning is worth recording because the
stronger option actively failed here.

A nonce is per-request, so a page carrying one cannot be prerendered or served from
Next.js's full-route cache. Our marketing pages are statically generated on purpose. Worse,
the two silently disagree: when a route _is_ cached, the HTML keeps the nonce it was
rendered with while the response header carries a fresh one, so **every script is refused
and the page ships completely dead** while still rendering correctly to a casual review.
That happened in this codebase, and only an end-to-end test that clicked a button caught it.

A CSP that fails closed in a way nobody notices is worse than a slightly weaker one that is
correct and continuously verified. What makes the weaker policy acceptable here:

- **No user-generated content is ever rendered as HTML.** React escapes everything. The only
  `dangerouslySetInnerHTML` in the codebase is `JSON.stringify`'d JSON-LD built from our own
  catalog modules — never from request input.
- **There are no third-party scripts at all.** No analytics, no tag manager, no chat widget.
  `'self'` therefore means genuinely only our own code.
- **RLS means script injection alone cannot read another customer's documents.**
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'` and `form-action 'self'`
  close the escalation paths that make an inline-script XSS most damaging.

**Tracked improvement:** revisit a nonce-based policy if we ever render user-supplied rich
content, or once Next.js offers per-route CSP that composes with the full-route cache. The
correct implementation would scope the nonce to `/portal` and `/admin` only, and must be
landed together with a test proving those pages still hydrate.

## 8. Audit logging

Every status change and every privileged read writes to an append-only `audit_log` table:
actor, action, subject, timestamp. Staff may read it; **no update or delete policy is
granted to anyone**, including admins. Inserts happen through the service role.

This exists because the most likely insider risk in this business is not malice but
carelessness — and an operator who knows their access is recorded behaves differently from
one who does not.

## 9. Data protection (UAE PDPL)

- **Minimisation.** The eligibility check runs entirely client-side. Answers are never
  transmitted unless the visitor explicitly asks to save the report. We cannot lose what we
  never collected.
- **Purpose limitation.** Documents are used only to prepare and submit the specific
  application. No secondary use, no sale, no sharing for third-party marketing.
- **Retention.** Application records are held for the statutory period, then deleted.
  Enquiries that do not convert are deleted within 24 months.
- **Access and erasure.** Requests to `security@` are answered within 30 days. Where a legal
  obligation requires retention we say which, and delete the rest.
- **Minimal AI exposure.** Only the rules engine's _conclusions_ are sent to the model —
  never the raw profile with salary and personal details, which the explanation does not
  need.

## 10. Known gaps before launch

Stated openly, because a security document that lists no gaps is not describing a real
system.

1. **Rate limiting is per-instance.** Move to shared Redis before real traffic.
2. **No malware scanning on uploads.** Files are type- and size-restricted but not scanned.
   Add an antivirus step before staff open documents at volume.
3. **No MFA on staff accounts.** Should be mandatory before staff handle live customer
   documents.
4. **Legal copy is unreviewed.** `src/content/legal.ts` is a drafting starting point and
   must be reviewed by a UAE practitioner.
5. **Fee data is researched, not authoritative.** Reconcile against ICP/GDRFA/MoHRE
   published rates before quoting a real customer.
6. **No penetration test.** Commission one before handling live documents.

## 11. Reporting a vulnerability

See [SECURITY.md](../SECURITY.md).
