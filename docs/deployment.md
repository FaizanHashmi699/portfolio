# Deployment

## Architecture

```
GitHub  ──push──►  Vercel        Next.js app: marketing (SSG) + portal + admin + API
                      │
                      └────────►  Supabase   Postgres (RLS) · Auth · Storage
                      │
                      ├────────►  Anthropic  eligibility narration, document summaries
                      └────────►  Resend     transactional email
```

There is no separate backend service. Next.js Route Handlers and Server Actions run as
serverless functions and _are_ the backend — see
[ADR-0001](adr/0001-no-separate-backend.md).

**Cost at launch: zero.** Vercel Hobby and Supabase Free cover it until traffic justifies
spend. Anthropic and Resend are usage-billed and optional.

## First deploy

### 1. Supabase

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

This applies `supabase/migrations/`: tables, row-level security policies, the private
`documents` bucket, and the trigger that creates a profile row on signup.

Then, in **Authentication → Providers**, enable email (and any social providers you want),
and set the site URL and redirect URLs to your production domain.

To grant yourself staff access, set `role = 'admin'` on your row in `public.profiles`.

### 2. Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new). Framework, build
   command and output are all detected — no configuration needed.
2. Add environment variables under **Settings → Environment Variables**:

   | Variable                        | Environments        | Notes                                                         |
   | ------------------------------- | ------------------- | ------------------------------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL`          | Production          | Your real domain. Metadata, sitemap and JSON-LD depend on it. |
   | `NEXT_PUBLIC_SUPABASE_URL`      | All                 |                                                               |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All                 |                                                               |
   | `SUPABASE_SERVICE_ROLE_KEY`     | Production, Preview | **Never** rename with a `NEXT_PUBLIC_` prefix.                |
   | `ANTHROPIC_API_KEY`             | Production          | Optional.                                                     |
   | `RESEND_API_KEY`                | Production          | Optional.                                                     |
   | `RESEND_FROM_EMAIL`             | Production          | Must be on a verified domain.                                 |

3. Deploy. Preview URLs are created per branch; `main` goes to production.

Consider using a separate Supabase project for previews so preview deployments never touch
production customer data.

### 3. Domain and email

- Point the apex and `www` at Vercel per its DNS instructions. TLS is automatic.
- Verify your sending domain in Resend and add the SPF, DKIM and DMARC records it gives
  you. Without DMARC, transactional mail to Gmail recipients will land in spam — which for
  a business whose product is "you never have to chase us" is a real failure.

## Launch checklist

**Legal and regulatory — blocking**

- [ ] UAE trade licence obtained; number replaces `licenceNumber` in `src/config/brand.ts`
- [ ] `src/content/legal.ts` reviewed by a qualified UAE practitioner
- [ ] Every fee in `src/domain/catalog/services.ts` reconciled against current ICP, GDRFA,
      MoHRE and free-zone published rates
- [ ] Every threshold in `src/domain/eligibility/rules/routes.ts` verified, and
      `RULES_VERSION` bumped
- [ ] Real contact details, address and WhatsApp number in `src/config/brand.ts`

**Security — blocking**

- [ ] Rate limiting moved to shared storage (Upstash Redis or Vercel KV)
- [ ] MFA enforced on all staff accounts
- [ ] Malware scanning on document uploads
- [ ] Penetration test completed
- [ ] `SUPABASE_SERVICE_ROLE_KEY` confirmed absent from every client bundle
- [ ] RLS verified by attempting a cross-tenant read with a real second account

**Product**

- [ ] `npm run verify` green
- [ ] `npm run test:e2e` green
- [ ] Lighthouse ≥ 95 on performance, accessibility, best practices and SEO
- [ ] Open Graph cards checked in a real share preview (they are generated per page)
- [ ] Localised pages reviewed by a native speaker before the translation notice comes down
- [ ] Sitemap submitted to Google Search Console and Bing Webmaster Tools
- [ ] Real applications processed end to end in staging

**Operations**

- [ ] Vercel and Supabase alerts wired to a channel someone actually reads
- [ ] Database backups verified by performing a restore, not by trusting the setting
- [ ] Runbook written for the top three failure modes

## Rolling back

Vercel keeps every deployment. **Deployments → ⋯ → Promote to Production** on the last good
one is an instant rollback.

Database migrations are forward-only. Anything destructive needs a tested down-migration
written _before_ the up-migration ships.
