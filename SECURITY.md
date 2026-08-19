# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Email **security@maqam.ae** with:

- What the issue is and where
- Steps to reproduce, or a proof of concept
- What an attacker could achieve with it

You will get an acknowledgement within **2 working days** and an assessment within **7**.
We will keep you updated through to a fix, and we are happy to credit you publicly unless
you would rather we didn't.

Please give us reasonable time to fix an issue before disclosing it.

## Scope

In scope: this repository, and any deployment of it we operate.

Particularly interested in anything touching:

- **Cross-tenant data access** — reading another customer's application or documents
- **Storage access control** — reaching a document without authorization
- **Privilege escalation** — a customer account gaining staff capability
- **Secret exposure** — server-only configuration reachable from the client
- **Injection** — anything reaching the database or a rendered page unvalidated

Out of scope: findings from automated scanners with no demonstrated impact, missing headers
with no exploit path, social engineering, and denial of service through volume.

## What we already know

`docs/security.md` §10 lists our known gaps openly, including per-instance rate limiting,
no upload malware scanning, and no staff MFA. Reports on those are welcome but are not new
information.

## Safe harbour

We will not pursue legal action against good-faith research that respects user privacy,
avoids degrading service, and does not access, modify or retain data belonging to anyone
else. If in doubt, ask first.
