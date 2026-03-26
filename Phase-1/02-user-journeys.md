---
id: phase-1-user-journeys-trustedplot
title: Phase 1 User Journeys — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
related_docs:
  - docs/phase-1/00-project-brief.md
  - docs/phase-1/01-prd.md
  - docs/phase-1/04-ui-spec.md (if available)
---

# Journey map overview

TrustedPlot journeys follow a **trust-first execution pipeline**:

**Discover → Validate → Inspect → Transact**

Every step reduces uncertainty and introduces:
- verification signals
- controlled access
- auditability
- structured state transitions

The system is not just UI-driven — it is **workflow-driven**, backed by API calls, role checks, and persistent state.

---

# Journey Table (System Overview)

| Journey | Trigger | Steps | System Responses | Errors | Recovery | Data Touched |
|--------|--------|------|------------------|--------|----------|--------------|
| Buyer Happy Path | Search property | Search → View → Unlock → Inspect → Escrow | Listings, docs, booking, escrow lifecycle | Payment fail, doc fail | Retry, fallback | Listings, Docs, Inspections, Escrow |
| Auth Edge Case | Session expired | Attempt → Redirect → Login → Resume | Session check, redirect | Token expired | Re-auth, restore state | Sessions |
| AI Summary | Request summary | Load → Stream → Display | Streaming tokens | Timeout, abuse | Retry, fallback | Docs, AI logs |
| Seller Verification | Submit listing | Upload → Verify → Decision → Badge | Queue + badge update | Rejection | Resubmit | Listings, Verification |

---

# Journey 1: Buyer Happy Path (End-to-End)

## Trigger
User searches for a property

---

## Step 1: Search Listings

Action: User applies filters  
API: `GET /api/listings?filters=...`  
UI States:
- Loading → skeleton cards
- Success → listing grid
- Empty → “No verified listings”
- Error → retry button

Failure:
- API timeout → fallback message
- Partial results → show available + warning

Recovery:
- Retry
- Adjust filters

---

## Step 2: View Listing

API: `GET /api/listings/[id]`  
UI:
- Loading → skeleton
- Success → listing + badge
- Error → fallback

Failure:
- Listing not found → 404
- Badge missing → show “unverified”

Recovery:
- Back to search

---

## Step 3: Unlock Documents

API:
- `POST /api/listings/[id]/unlock`
- `GET /api/listings/[id]/documents`

UI:
- Loading → spinner
- Success → secure viewer
- Error → “Unlock failed”

Failure:
- Payment failure
- Unauthorized access
- Expired unlock

Recovery:
- Retry payment
- Re-authenticate

---

## Step 4: Inspection Booking

API:
- `POST /api/inspections`

UI:
- Loading → slot loader
- Success → confirmation
- Error → “No slots available”

Failure:
- Double booking
- Inspector unavailable
- Location mismatch

Recovery:
- Choose new slot
- Reschedule

---

## Step 5: Escrow Lifecycle

API:
- `POST /api/escrows`
- `POST /api/escrows/[id]/fund`

UI:
- Loading → processing
- Success → escrow timeline
- Error → payment failed

Failure:
- Payment timeout
- Duplicate request
- Partial funding
- Reconciliation mismatch

Recovery:
- Retry (idempotent)
- Escalate to admin
- Manual reconciliation queue

---

## Data Touched
- Listings
- Documents
- Unlocks
- Inspections
- Escrow
- Audit logs

---

# Journey 2: Auth / Session Edge Case

## Trigger
User performs protected action with expired session

---

## Steps

Step 1:
Action: Attempt protected action  
API: `GET /api/auth/session`  
UI: loading → error

Step 2:
System detects invalid session  
UI: redirect to `/login`

Step 3:
User logs in  
API: `POST /api/auth/login`

Step 4:
Session restored  
API: `GET /api/auth/session`

Step 5:
User resumes action

---

## Failure Cases

- Token expired mid-request
- Multiple tab session conflict
- CSRF mismatch

---

## Recovery

- Re-authentication
- Restore intended action via redirect state
- Retry request

---

## Data Touched
- Sessions
- Users
- Intent cache

---

# Journey 3: AI Document Summary (Streaming + Safe)

## Trigger
User requests document summary

---

## Steps

Step 1:
API: `GET /api/documents/[id]`

Step 2:
User clicks summarize  
API: `POST /api/ai/summarize`

Step 3:
Streaming response begins

---

## UI States
- Loading → “Generating…”
- Streaming → partial tokens
- Success → full summary
- Error → fallback

---

## Failure Cases

- AI timeout (>10s)
- Rate limit exceeded
- Malformed response
- Abuse attempt (excessive calls)

---

## Recovery

- Retry button
- Fallback to manual reading
- Disable feature temporarily

---

## AI Safety Controls

- Rate limit: 5 requests/user/hour
- Timeout: 10 seconds
- Server-side only (no exposed keys)
- Input sanitized
- No raw document leakage
- Usage logged
- Cost guard: disabled after threshold

---

## Data Touched
- Documents
- AI logs
- Usage metrics

---

# Journey 4: Seller → Verification → Badge (CRITICAL)

## Trigger
Seller submits listing

---

## Step 1: Create Listing

API: `POST /api/listings`  
UI: form → success

---

## Step 2: Upload Documents

API: `POST /api/listings/[id]/documents`  
UI: upload progress

Failure:
- file too large
- invalid format

Recovery:
- retry upload

---

## Step 3: Submit for Verification

API: `POST /api/verification`  
UI: status = pending

---

## Step 4: Legal Ops Review

API:
- `GET /api/verification/queue`
- `POST /api/verification/[id]/decision`

UI:
- queue dashboard
- decision form

---

## Step 5: Badge Issued

UI:
- badge visible on listing

States:
- approved
- conditional
- rejected

---

## Failure Cases

- missing documents
- invalid documents
- SLA breach
- conflicting ownership

---

## Recovery

- seller notified
- resubmission flow
- escalation to admin

---

## Data Touched
- Listings
- Documents
- Verification cases
- Badges
- Audit logs

---

# Explicit UI State System

## Loading
- skeleton / spinner
- actions disabled

## Empty
- no results
- suggestion CTA

## Error
- message + retry
- logged

## Success
- confirmation + next step

---

# Backend / API Map

Core:
- `/api/auth/*`
- `/api/listings`
- `/api/listings/[id]`
- `/api/listings/[id]/documents`
- `/api/listings/[id]/unlock`

Ops:
- `/api/verification/*`
- `/api/inspections`
- `/api/escrows`
- `/api/disputes`
- `/api/admin`
- `/api/audit`

AI:
- `/api/ai/summarize`

---

# Demo Script (Hands-Free)

1. Open homepage  
2. Search property  
3. Open listing  
4. Unlock documents  
5. View document  
6. Click summarize → watch streaming  
7. Book inspection  
8. Confirm slot  
9. Start escrow  
10. Simulate payment  
11. View escrow timeline  
12. Switch to seller  
13. Create listing  
14. Upload docs  
15. Submit for verification  
16. Switch to admin  
17. Approve → badge appears  

---

# Committable Files

Path:
docs/phase-1/02-user-journeys.md

Branch:
docs/phase1-user-journeys-final

PR Title:
Finalize Phase 1 user journeys (full flows + failures + AI-safe)

Commit Message:
docs: finalize user journeys with full failure paths, AI safety, and verification flows

---

# Verification Steps

## Review Checklist

- All journeys include failure paths
- Recovery defined for all failures
- Every step has API mapping
- UI states explicitly defined
- AI flow safe (rate limits, fallback)
- Seller verification included

## Commands

npm install  
npm run lint  
npm run build  

## Artefacts

- PR diff  
- Markdown preview  
- Reviewer sign-off  