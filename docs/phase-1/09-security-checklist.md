---
id: phase-1-security-checklist-trustedplot
title: Phase 1 Security Checklist — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
related_docs:
  - docs/phase-1/00-project-brief.md
  - docs/phase-1/01-prd.md
  - docs/phase-1/05-api-spec.md
  - docs/phase-1/06-data-model.md
  - docs/phase-1/07-ai-spec.md
  - docs/phase-1/08-infra-runbook.md
---

# 1. Purpose

This document defines the **Phase 1 security baseline** for TrustedPlot. It is designed to:

- prevent avoidable security failures early
- guide implementation decisions across API, auth, infra, and AI
- provide a **checklist-driven system** for continuous verification
- support both **human and AI-assisted development workflows**

This is **not a compliance document** — it is a **practical engineering security checklist** for a trust-sensitive platform (real estate + escrow + documents).

---

# 2. Threat Model Summary

## 2.1 Core Assets

These are the most sensitive system components:

### A. User identity & sessions
- user accounts
- login/session tokens
- role permissions (admin, legal ops, inspector)

### B. Property & listing data
- ownership claims
- listing metadata
- seller/mandate assertions

### C. Documents (HIGH RISK)
- title documents (C of O, R of O, etc.)
- identity-linked documents
- legal files
- uploaded PDFs/images

### D. Escrow & transaction state
- payment intent
- escrow lifecycle state
- dispute records

### E. AI inputs/outputs
- document text
- extracted metadata
- summaries (risk of leakage or hallucination misuse)

### F. Secrets
- database credentials
- Auth.js secret
- AI API keys
- payment/escrow keys

---

## 2.2 Threat Actors

### External attackers
- bots scraping listings or APIs
- fraudsters uploading fake documents
- attackers trying to bypass verification
- API abuse / brute force / scraping

### Malicious users
- fake sellers or mandates
- users attempting escrow fraud
- users attempting document manipulation

### Insider risk
- admin misuse
- legal ops data exposure
- developer misconfiguration

### Automated abuse
- AI endpoint abuse (cost + spam)
- brute-force requests
- scraping bots

---

## 2.3 Trust Boundaries

### Boundary 1 — Browser ↔ Server
- all client input is untrusted
- must validate everything server-side

### Boundary 2 — Server ↔ Database
- enforce schema + access control
- prevent unsafe queries and over-fetching

### Boundary 3 — Server ↔ External APIs
- AI providers
- payment/escrow providers
- storage providers

### Boundary 4 — Internal roles
- admin vs legal ops vs inspector vs user
- must enforce RBAC strictly

---

# 3. Secrets Management Checklist

## 3.1 Local

Checklist:
- [ ] `.env.local` used for local secrets only
- [ ] `.env.local` ignored via `.gitignore`
- [ ] no secrets hardcoded in codebase
- [ ] no secrets in test fixtures

---

## 3.2 CI (GitHub Actions)

Checklist:
- [ ] secrets stored in GitHub Secrets
- [ ] no secrets printed in logs
- [ ] PR builds do NOT expose production secrets
- [ ] environment-level separation (dev vs prod)

---

## 3.3 Production

Checklist:
- [ ] secrets injected via environment or secret manager
- [ ] no secrets in client bundle
- [ ] no `NEXT_PUBLIC_` prefix on sensitive values
- [ ] rotation plan exists (manual acceptable in Phase 1)

---

## 3.4 High-risk mistakes to avoid
- exposing AI keys in frontend
- committing `.env` accidentally
- logging secrets
- embedding secrets in Docker image

---

# 4. Auth / Session Checklist (Auth.js)

## 4.1 Authentication

Checklist:
- [ ] Auth.js properly configured
- [ ] strong `AUTH_SECRET`
- [ ] secure session strategy (JWT or DB-backed)
- [ ] login flow validated end-to-end

---

## 4.2 Session Handling

Checklist:
- [ ] session expiry defined
- [ ] session invalidation works on logout
- [ ] protected routes require session
- [ ] no sensitive logic on client-only checks

---

## 4.3 Authorization (CRITICAL)

Checklist:
- [ ] RBAC enforced server-side
- [ ] user cannot access another user’s listing/docs
- [ ] admin routes strictly restricted
- [ ] role checks implemented in route handlers

---

## 4.4 CSRF & Cookies

Checklist:
- [ ] CSRF protection enabled (Auth.js default or custom)
- [ ] cookies are:
  - httpOnly
  - secure (in prod)
  - sameSite appropriate
- [ ] no session token exposure in client logs

---

# 5. API Security Checklist

## 5.1 Input Validation

Checklist:
- [ ] all route handlers validate input
- [ ] schema validation (Zod or equivalent recommended)
- [ ] reject malformed JSON
- [ ] enforce max payload size
- [ ] validate IDs (UUID/cuid format)

---

## 5.2 Authorization

Checklist:
- [ ] every protected route checks session
- [ ] ownership checks for:
  - listings
  - documents
  - escrow cases
- [ ] no “trust client” assumptions

---

## 5.3 Rate Limiting

Checklist:
- [ ] rate limit sensitive endpoints:
  - auth
  - AI
  - document upload
- [ ] protect against brute force and spam
- [ ] return structured rate-limit errors

---

## 5.4 Logging & Redaction

Checklist:
- [ ] logs include:
  - request ID
  - route
  - user ID
- [ ] logs DO NOT include:
  - raw documents
  - secrets
  - tokens
- [ ] errors sanitized before returning to client

---

## 5.5 Error Handling

Checklist:
- [ ] consistent error format
- [ ] no stack traces exposed to client
- [ ] sensitive internal errors masked

---

# 6. AI-Specific Security Checklist

## 6.1 Prompt Injection

Checklist:
- [ ] system prompt explicitly ignores instructions in user documents
- [ ] document content treated as untrusted
- [ ] no tool execution based on document instructions
- [ ] outputs constrained (JSON where possible)

---

## 6.2 Data Exfiltration

Checklist:
- [ ] AI never receives secrets
- [ ] no sensitive system data in prompts
- [ ] document access checked BEFORE AI call
- [ ] no cross-user data leakage

---

## 6.3 Abuse & Cost Control

Checklist:
- [ ] rate limits per user
- [ ] daily quotas
- [ ] timeout on AI calls
- [ ] max tokens enforced
- [ ] AI usage logging enabled

---

## 6.4 Output Safety

Checklist:
- [ ] AI output validated
- [ ] disclaimers included where needed
- [ ] no legal claims inferred
- [ ] no hallucinated verification claims

---

# 7. Dependency Hygiene Checklist

## 7.1 Package Security

Checklist:
- [ ] `npm audit` or equivalent reviewed regularly
- [ ] Dependabot enabled (recommended)
- [ ] outdated critical packages upgraded

---

## 7.2 Third-party Libraries

Checklist:
- [ ] minimal dependency footprint
- [ ] avoid unmaintained libraries
- [ ] review auth, crypto, and storage libs carefully

---

## 7.3 GitHub Actions

Checklist:
- [ ] actions pinned to versions (not `latest`)
- [ ] no untrusted third-party actions
- [ ] minimal permissions in workflows

---

# 8. Docker & Supply Chain Checklist

## 8.1 Docker Images

Checklist:
- [ ] base image is official (Node Alpine recommended)
- [ ] multi-stage build used
- [ ] no secrets baked into image
- [ ] non-root user used in runtime container

---

## 8.2 Build Security

Checklist:
- [ ] reproducible builds
- [ ] lockfiles respected
- [ ] build-time secrets not persisted

---

## 8.3 Image Scanning (Placeholder)

Checklist:
- [ ] image scanning planned (future)
- [ ] vulnerability scan tool TBD

---

# 9. Open Risks & Mitigations (Ranked)

## HIGH

### 1. Fake listings / document fraud
Mitigation:
- verification workflow
- document checks
- inspection layer

---

### 2. Unauthorized data access
Mitigation:
- strict RBAC
- ownership checks in every route

---

### 3. AI abuse / cost explosion
Mitigation:
- quotas
- rate limits
- logging + alerts

---

## MEDIUM

### 4. Secrets leakage
Mitigation:
- strict env discipline
- no frontend exposure

---

### 5. Broken auth/session
Mitigation:
- smoke tests
- strong config validation

---

## LOW (Phase 1)

### 6. Supply chain compromise
Mitigation:
- dependency hygiene
- pinned versions

---

# 10. Security Control Checklist Table

| Control | Why | How to Verify | Owner | Status |
|--------|-----|--------------|------|--------|
| Env secrets not committed | Prevent credential leaks | Check repo + `.gitignore` | Dev | ☐ |
| Auth routes protected | Prevent unauthorized access | Manual test + API test | Dev | ☐ |
| RBAC enforced server-side | Prevent privilege escalation | Review route handlers | Dev | ☐ |
| Input validation implemented | Prevent injection attacks | Zod/schema checks | Dev | ☐ |
| Rate limiting active | Prevent abuse | Trigger repeated requests | Dev | ☐ |
| AI quota enforced | Prevent cost spikes | Simulate usage | Dev | ☐ |
| AI prompt injection guarded | Prevent malicious outputs | Injection test case | Dev | ☐ |
| Logs redact sensitive data | Prevent leakage | Inspect logs | Dev | ☐ |
| Prisma schema validated | Prevent DB errors | `prisma validate` | Dev | ☐ |
| Docker runs non-root | Reduce container risk | Inspect Dockerfile | Dev | ☐ |
| CI secrets protected | Prevent exposure | Review workflow logs | Dev | ☐ |
| Dependencies reviewed | Prevent vulnerabilities | `npm audit` | Dev | ☐ |

---

# 11. Verification Steps

## Review checklist
- threat model reflects real risks
- secrets handling is environment-specific
- auth and RBAC enforced server-side
- API validation is explicit
- AI risks are covered (injection, cost, leakage)
- dependency and Docker risks acknowledged
- control table is actionable

---

## If repo exists, run

```bash
npm install
npm run lint
npm run build

Security-related checks:

npm audit
npx prisma validate --schema apps/web/prisma/schema.prisma

Manual tests:
	•	login/logout flow
	•	protected route access
	•	unauthorized access attempt
	•	AI endpoint abuse test
	•	rate limit test

⸻

Artefacts to capture
	•	CI logs
	•	audit output
	•	security checklist review sign-off
	•	screenshots of auth flows
	•	example rate-limit error response
	•	AI usage logs sample

⸻

12. Committable Files

Suggested filename

docs/phase-1/09-security-checklist.md

Branch name

docs/phase1-security-checklist

PR title

Add Phase 1 security checklist for TrustedPlot

Commit message

docs: add Phase 1 security checklist for TrustedPlot

---

### PR Description

This PR introduces the Phase 1 Security Checklist for TrustedPlot, covering threat modeling, secrets management, authentication, API protection, AI-specific risks, dependency hygiene, and Docker supply chain considerations. It provides a structured, checklist-driven approach to securing the platform during early development and deployment, with actionable verification steps and ownership tracking for each control.