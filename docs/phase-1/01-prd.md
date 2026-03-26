---
id: phase-1-prd-trustedplot
title: Phase 1 Product Requirements Document — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
related_docs:
  - docs/phase-1/00-project-brief.md
  - docs/phase-1/02-user-journeys.md
  - docs/phase-1/03-domain-model.md (planned)
assumptions:
  - TrustedPlot is a trust-first real estate marketplace (not a listing aggregator)
  - Next.js (apps/web) handles frontend + backend via Route Handlers
  - Prisma + Postgres is the source of truth
  - Auth.js handles authentication; RBAC is app-level
  - Escrow in MVP is lifecycle-based and may be simulated/manual
  - AI features are optional and non-blocking
open_questions:
  - Escrow provider vs manual flow
  - Final badge taxonomy
  - Required documents per listing type
  - RBAC scope for MVP
  - Inspection ops structure
---

# 1. Goals and Non-Goals

## Goals
- Deliver a **trust-first marketplace**
- Enable **verified listings**
- Enable **inspection workflows**
- Enable **structured transaction lifecycle**
- Build **internal operational systems**
- Ensure system is **AI-compatible but not AI-dependent**

## Non-Goals
- High-volume listing marketplace
- Chat/messaging system
- Agent marketplace
- Full escrow automation
- AI-first product experience

---

# 2. Personas

(Condensed for execution)

- Buyer/Renter → trust, clarity, safe execution
- Seller/Owner → credibility, faster close
- Mandate → controlled representation
- Legal Ops → verification
- Inspector → structured field ops
- Admin → system control

---

# 3. User Problems (Ranked)

1. Cannot trust listings
2. Cannot verify documents
3. Fake mandates
4. Disorganized inspections
5. Unsafe payments
6. No structured workflow
7. No accountability

---

# 4. Functional Requirements (WITH ACCEPTANCE CRITERIA)

---

## 4.1 Authentication (MUST)

Acceptance Criteria:
- User can sign up/login via Auth.js
- Session persists across refresh
- Protected routes redirect unauthenticated users
- Session expiry triggers re-authentication
- User role is attached to session

---

## 4.2 RBAC (MUST)

Acceptance Criteria:
- Roles: buyer, seller, mandate, legal_ops, inspector, admin
- Each API route validates role before execution
- Unauthorized access returns 403
- UI hides restricted actions
- Role change reflects within 1 request cycle

---

## 4.3 Listing Creation (MUST)

Acceptance Criteria:
- Seller can create listing with required fields
- Listing saved to DB
- Listing retrievable via ID
- Invalid inputs rejected with validation errors
- Listing status = draft until submitted

---

## 4.4 Document Upload (MUST)

Acceptance Criteria:
- Files uploaded securely
- File linked to listing
- File not publicly accessible
- Upload failure returns error within 3s
- File metadata stored (type, timestamp, uploader)

---

## 4.5 Verification Workflow (MUST)

Acceptance Criteria:
- Listing submission creates verification case
- Case appears in legal queue within 2 seconds
- Legal ops can:
  - approve
  - reject
  - mark conditional
- Decision stored and auditable
- SLA timer visible

---

## 4.6 Badge System (MUST)

Acceptance Criteria:
- Badge assigned based on verification result
- Badge visible on listing
- Badge updates within 2 seconds of decision
- Badge state persists in DB
- Invalid state cannot exist

---

## 4.7 Search & Filter (MUST)

Acceptance Criteria:
- Filters return correct listings
- Results paginated
- No results → empty state shown
- Query executes < 300ms (p95)

---

## 4.8 Secure Document Viewer (MUST)

Acceptance Criteria:
- Auth required for access
- No public URLs
- Access logged (user, timestamp)
- Unauthorized access blocked
- Watermark applied

---

## 4.9 Inspection Booking (MUST)

Acceptance Criteria:
- User selects available slot
- Booking created with inspector assigned
- Double booking prevented
- Confirmation returned within 2s
- Booking visible in dashboard

---

## 4.10 Inspection Report (MUST)

Acceptance Criteria:
- Inspector submits report
- Report linked to listing
- Buyer can view report
- Submission timestamp stored
- Report immutable after submission

---

## 4.11 Escrow Lifecycle (MUST)

Acceptance Criteria:
- Escrow case created
- States: created → funded → pending → resolved
- Payment attempt recorded
- No duplicate escrow allowed
- NOTE: payment execution may be simulated

Failure Criteria:
- Timeout → user retry allowed
- Duplicate request → idempotent response

---

## 4.12 Admin Dashboard (MUST)

Acceptance Criteria:
- Admin can view:
  - users
  - listings
  - verification cases
- Admin actions logged
- Admin can flag listings

---

## 4.13 Audit Logging (MUST)

Acceptance Criteria:
- All critical actions logged
- Logs include:
  - user_id
  - action
  - timestamp
- Logs immutable

---

# 5. Non-Functional Requirements (TESTABLE)

## Performance
- API p95 < 300ms
- Page load < 2s
- Upload < 5s

## Reliability
- If external service fails:
  - response < 2s
  - user shown retry
  - no partial state committed

## Security
- All sensitive routes require auth
- RBAC enforced server-side
- Secrets never exposed client-side

## Privacy
- PII encrypted at rest
- Consent recorded
- Access logged
- User can request deletion

---

# 6. AI-enabled Features

## AI (optional only)
- Document summarization
- OCR

## Deterministic (core)
- Verification
- Escrow
- Inspection
- RBAC

## AI Safety Controls

- Rate limit: 5 requests/user/hour
- Timeout: 10s
- No client-side keys
- All inputs sanitized
- Logs captured
- Fallback: manual reading

---

# 7. MVP + Roadmap

## Phase 1
- Core trust system
- Verification
- Inspection
- Escrow skeleton

## Phase 2
- Escrow integration
- Monetization
- Notifications

## Phase 3
- AI copilots
- Expansion
- Advanced analytics

---

# 8. Analytics & Metrics

## Phase 1
- Scope defined
- Flows validated
- Schema complete

## Phase 2
- % verified listings ≥ 70%
- SLA ≤ 48h
- Inspection completion ≥ 80%
- Disputes < 5%

---

# 9. Out of Scope

- Chat
- Agents marketplace
- Mortgage/insurance
- Native apps
- Full AI automation

---

# 10. Feature Table

| Feature | Value | Acceptance | Risk | Priority |
|--------|------|-----------|------|---------|
| Listing | Create supply | 4.3 | Data quality | MUST |
| Docs | Trust proof | 4.4 | Security | MUST |
| Verification | Trust engine | 4.5 | Legal | MUST |
| Badge | Signal trust | 4.6 | Misuse | MUST |
| Search | Discovery | 4.7 | UX | MUST |
| Inspection | Reality check | 4.9 | No-show | MUST |
| Escrow | Safe payment | 4.11 | Legal | MUST |
| Admin | Control | 4.12 | Abuse | MUST |

---

# Committable files

Path:
docs/phase-1/01-prd.md

Branch:
docs/phase1-prd-final

PR Title:
Finalize Phase 1 PRD (aligned with brief + journeys + validation fixes)

---

# Verification steps

## Review
- Acceptance criteria exist for all MUST features
- AI vs deterministic clear
- NFRs testable
- Escrow realistic
- Alignment with brief

## Commands
npm install  
npm run lint  
npm run build  

## Artefacts
- PR diff
- Markdown preview