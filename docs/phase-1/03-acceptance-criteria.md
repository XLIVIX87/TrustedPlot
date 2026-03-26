---
id: phase-1-acceptance-criteria-trustedplot
title: Phase 1 Acceptance Criteria Pack — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
related_docs:
  - docs/phase-1/00-project-brief.md
  - docs/phase-1/01-prd.md
  - docs/phase-1/02-user-journeys.md
---

# Definition of Done (DoD) — Phase 1 PRs

A Phase 1 PR is only considered complete when all of the following are true.

## Code & Architecture
- Code is committed in the correct monorepo location.
- TypeScript passes with no errors.
- Lint passes.
- Build passes.
- New logic is covered by at least one appropriate verification method:
  - unit, integration, e2e, or manual evidence where automation is not yet practical.
- Route handlers follow the expected pattern:
  - `apps/web/app/api/**/route.ts`
- Schema changes include Prisma migration files where applicable.
- New backend logic respects role checks and authorization boundaries.

## Behaviour
- All relevant acceptance criteria in this document are satisfied.
- Happy path and negative path are both handled.
- UI states are implemented where relevant:
  - loading
  - empty
  - error
  - success

## Security & Privacy
- No sensitive data is exposed unintentionally to the client.
- Protected actions require valid authenticated sessions.
- RBAC is enforced server-side.
- Critical actions create audit log entries.

## Documentation
- PR description references implemented AC IDs.
- If behaviour changed from PRD or user journeys, affected docs are updated or flagged.
- Any unresolved deviation is clearly noted in the PR.

## Evidence
- Required evidence is attached or linked:
  - screenshots
  - screen recordings
  - test output
  - logs
  - API responses
  - DB record snapshots where relevant

---

# Traceability Reference Rules

Each AC item includes references to:
- **PRD section**
- **Journey / flow**

Format:
- `PRD:` section reference
- `Journey:` named journey and step cluster

This is to ensure product, engineering, and AI agents can trace each requirement back to source intent.

---

# Acceptance Criteria

---

## AC-001 — User Authentication: Sign Up / Sign In

**Feature:** Authentication  
**Priority:** MUST  
**PRD:** Functional Requirements → Authentication  
**Journey:** Auth / Session Edge Case; Buyer Happy Path prerequisite

### Given / When / Then
- Given a new or existing user
- When they submit valid authentication credentials through the approved auth flow
- Then the system creates or restores an authenticated session and returns the user to the correct post-auth destination

### Expected Assertions
- A valid session exists after authentication
- Session is associated with the correct user ID
- User role is present in the session payload or server-side auth context
- Protected UI routes become accessible to authorized users only

### Negative Case
- Invalid credentials, expired OTP, or tampered auth input must fail with an explicit user-facing error
- No session should be created for failed attempts

### Verification Method
- Integration
- Manual

### Evidence Required
- Screenshot or recording of successful login
- Screenshot of failed login state
- Session/log evidence showing valid session creation

---

## AC-002 — Session Persistence & Expiry Handling

**Feature:** Session Management  
**Priority:** MUST  
**PRD:** Functional Requirements → Authentication / RBAC  
**Journey:** Auth / Session Edge Case

### Given / When / Then
- Given a logged-in user
- When they refresh the page or navigate across protected routes
- Then the session remains valid until expiration and the user remains authenticated

### Expected Assertions
- Refresh does not log the user out prematurely
- Protected routes remain accessible with valid session
- On session expiry, the system redirects the user to login before protected action executes

### Negative Case
- If session expires mid-action, the system must block the protected operation and require re-authentication
- No partially completed protected state transition should occur

### Verification Method
- Integration
- E2E

### Evidence Required
- Recording of page refresh with session preserved
- Recording of session-expiry redirect
- Relevant auth/session logs

---

## AC-003 — Role-Based Access Control (RBAC)

**Feature:** Authorization  
**Priority:** MUST  
**PRD:** Functional Requirements → RBAC  
**Journey:** All protected flows

### Given / When / Then
- Given a user with a specific role
- When they attempt to access a protected route, mutation, or admin action
- Then the system allows or denies access based on server-side role checks

### Expected Assertions
- Buyers cannot access admin or legal-ops endpoints
- Inspectors cannot approve verification decisions
- Legal ops cannot perform finance-only actions unless allowed
- UI does not expose restricted controls to unauthorized roles

### Negative Case
- Unauthorized requests must return 403 or equivalent denial state
- Attempted violations must be logged for review

### Verification Method
- Integration
- E2E

### Evidence Required
- API response showing access denial
- Screenshot of hidden/disabled restricted UI
- Audit log entry or security log

---

## AC-004 — Listing Creation by Seller

**Feature:** Listing Creation  
**Priority:** MUST  
**PRD:** Functional Requirements → Listing Creation  
**Journey:** Seller → Verification → Badge

### Given / When / Then
- Given an authenticated seller or authorized mandate
- When they submit a valid listing form with required core fields
- Then the system creates a new listing record with `status = draft`

### Expected Assertions
- Listing record is stored in DB
- Listing is linked to the correct seller user ID
- Required fields are validated before persistence
- Draft listing is retrievable by the owner

### Negative Case
- Missing required fields, invalid enum values, or malformed payloads must return validation errors
- Invalid data must not be saved

### Verification Method
- Unit
- Integration
- Manual

### Evidence Required
- DB snapshot or Prisma query result showing created draft
- Screenshot of draft listing in seller dashboard
- Validation error screenshot/API response

---

## AC-005 — Secure Document Upload

**Feature:** Document Upload  
**Priority:** MUST  
**PRD:** Functional Requirements → Document Upload  
**Journey:** Seller → Verification → Badge

### Given / When / Then
- Given a draft listing
- When the seller uploads a valid supported document
- Then the system stores the file securely, links it to the listing, and records metadata

### Expected Assertions
- File is stored in secure storage
- File is not accessible through a public unauthenticated URL
- Metadata includes:
  - file type
  - upload timestamp
  - listing ID
  - uploader ID
- Upload success is reflected in UI

### Negative Case
- Unsupported file types, oversized files, or corrupt payloads must be rejected
- Partial uploads must not be treated as valid files

### Verification Method
- Integration
- Manual

### Evidence Required
- Storage reference or metadata log
- Screenshot of uploaded document in listing workflow
- Error response for invalid upload

---

## AC-006 — Verification Case Creation

**Feature:** Verification Workflow  
**Priority:** MUST  
**PRD:** Functional Requirements → Verification Workflow  
**Journey:** Seller → Verification → Badge

### Given / When / Then
- Given a seller submits a listing for verification
- When submission succeeds
- Then the system creates a verification case and places it in the legal ops queue within 2 seconds

### Expected Assertions
- Verification case exists in DB linked to the listing
- Queue status is visible to legal ops
- Initial SLA timer is started
- Seller sees `pending verification` state

### Negative Case
- If required verification inputs are missing, the case must not be created and the seller must see remediation requirements
- No phantom queue item should appear

### Verification Method
- Integration

### Evidence Required
- Queue screenshot
- DB record
- SLA timer/log output

---

## AC-007 — Verification Decision Handling

**Feature:** Legal Verification Decision  
**Priority:** MUST  
**PRD:** Functional Requirements → Verification Workflow  
**Journey:** Seller → Verification → Badge

### Given / When / Then
- Given an active verification case
- When legal ops selects Approved, Conditional, or Rejected and submits the decision
- Then the case status, rationale, and audit trail are persisted correctly

### Expected Assertions
- Status is stored in DB
- Legal reviewer ID and timestamp are recorded
- Seller can see resulting state
- Audit log entry is created

### Negative Case
- Invalid status transitions or incomplete decision payloads must be rejected
- Decision changes without authorization must fail

### Verification Method
- Integration
- Manual

### Evidence Required
- Verification case record
- Seller-facing status screenshot
- Audit log entry

---

## AC-008 — Badge Assignment & Display

**Feature:** Verification Badges  
**Priority:** MUST  
**PRD:** Functional Requirements → Badge System  
**Journey:** Seller → Verification → Badge; Buyer Happy Path

### Given / When / Then
- Given a listing is approved through verification
- When the decision is finalized
- Then the correct badge state is attached to the listing and rendered on listing detail and search results

### Expected Assertions
- Badge enum in DB matches verification outcome
- Badge component renders consistently in listing card and detail view
- Badge appears within 2 seconds of finalized decision on next fetch/render cycle

### Negative Case
- Listings in conditional, rejected, or unverified states must not show approved badge styles
- Invalid badge states must fail validation

### Verification Method
- Integration
- E2E

### Evidence Required
- Listing UI screenshot showing badge
- DB state
- API response snapshot

---

## AC-009 — Search and Filter

**Feature:** Search & Filter  
**Priority:** MUST  
**PRD:** Functional Requirements → Search / Filter  
**Journey:** Buyer Happy Path

### Given / When / Then
- Given listings exist in the system
- When a user applies valid search filters
- Then the system returns only matching listings with correct pagination

### Expected Assertions
- Filters respect location, property type, price, and badge status where implemented
- Results are paginated
- Search returns within p95 < 300ms for standard query conditions

### Negative Case
- Invalid query parameters must return a controlled validation error
- No results must show explicit empty state, not broken UI

### Verification Method
- Integration
- E2E
- Performance check

### Evidence Required
- Search results screenshot
- Empty state screenshot
- API response
- Performance log

---

## AC-010 — Secure Document Viewer

**Feature:** Document Access / Viewer  
**Priority:** MUST  
**PRD:** Functional Requirements → Secure Document Viewer  
**Journey:** Buyer Happy Path; AI Summary flow prerequisite

### Given / When / Then
- Given an authorized user with valid access to a document
- When they open the document viewer
- Then the file renders securely with audit logging and watermark protection

### Expected Assertions
- Authenticated access required
- Access event logged with:
  - user ID
  - timestamp
  - IP/device if available
- Watermark is applied in viewer
- Raw public download URL is not exposed to unauthorized users

### Negative Case
- Unauthorized or expired access must be blocked
- Missing or corrupt documents must return controlled error state

### Verification Method
- Integration
- Manual

### Evidence Required
- Viewer screenshot
- Access log
- Rejected access response

---

## AC-011 — Inspection Booking

**Feature:** Inspection Booking  
**Priority:** MUST  
**PRD:** Functional Requirements → Inspection Booking  
**Journey:** Buyer Happy Path

### Given / When / Then
- Given an available listing and open inspection slots
- When a user books an inspection
- Then the system creates an inspection booking linked to the listing, user, and assigned inspector

### Expected Assertions
- Booking record exists
- Slot is marked unavailable to others if exclusive
- Buyer sees booking confirmation
- Inspector receives assigned job

### Negative Case
- Double booking of same slot must fail
- Invalid slot or unavailable inspector must return controlled error

### Verification Method
- Integration
- E2E

### Evidence Required
- Booking DB record
- Buyer confirmation screenshot
- Inspector job view screenshot or API response

---

## AC-012 — Inspection Report Submission

**Feature:** Inspection Report  
**Priority:** MUST  
**PRD:** Functional Requirements → Inspection Reporting  
**Journey:** Buyer Happy Path

### Given / When / Then
- Given an assigned inspection has occurred
- When the inspector submits a valid report
- Then the system stores the report and makes it available to the appropriate buyer/admin flows

### Expected Assertions
- Report is linked to booking and listing
- Submission timestamp recorded
- Buyer can access completed report
- Report contents become immutable after final submission unless explicitly versioned

### Negative Case
- Incomplete report payload must fail validation
- Unauthorized inspector cannot submit report for another job

### Verification Method
- Integration
- Manual

### Evidence Required
- Report record
- Buyer-facing report screenshot
- Validation error example

---

## AC-013 — Escrow Case Creation

**Feature:** Escrow Lifecycle  
**Priority:** MUST  
**PRD:** Functional Requirements → Escrow Lifecycle  
**Journey:** Buyer Happy Path

### Given / When / Then
- Given a user initiates a transaction flow that requires escrow
- When escrow creation succeeds
- Then a new escrow case is created with valid initial status and linked transaction context

### Expected Assertions
- Escrow record exists in DB
- Escrow has valid lifecycle state (for example `created`)
- Listing/user linkage is correct
- Audit log entry is created

### Negative Case
- Duplicate escrow initiation for the same protected context must be rejected or idempotently handled
- Invalid transaction payload must fail validation

### Verification Method
- Integration

### Evidence Required
- Escrow DB record
- API response
- Audit log entry

---

## AC-014 — Escrow Funding Attempt

**Feature:** Escrow Funding  
**Priority:** MUST  
**PRD:** Functional Requirements → Escrow Lifecycle  
**Journey:** Buyer Happy Path

### Given / When / Then
- Given a valid escrow case in fundable state
- When the buyer attempts funding
- Then the system records the funding attempt and updates escrow status appropriately

### Expected Assertions
- Funding attempt is logged
- Successful funding updates escrow status
- Duplicate funding requests are idempotently handled
- No duplicate state transitions occur

### Negative Case
- Timeout, provider failure, or partial funding must not silently move escrow to funded state
- Failed attempts must return controlled error and allow safe retry logic

### Verification Method
- Integration
- Manual

### Evidence Required
- Payment/funding log
- Escrow state record
- Failure response example

---

## AC-015 — Admin Dashboard Access & Visibility

**Feature:** Admin Dashboard  
**Priority:** MUST  
**PRD:** Functional Requirements → Admin Dashboard  
**Journey:** Admin operational flows

### Given / When / Then
- Given an authenticated admin
- When they access the dashboard
- Then they can see the expected operational datasets for their role

### Expected Assertions
- Admin can see users, listings, verification cases, or other scoped data
- Dashboard respects role permissions
- Dashboard renders with controlled loading/error states

### Negative Case
- Non-admins must not access dashboard
- Broken downstream query should not crash entire admin shell

### Verification Method
- E2E
- Manual

### Evidence Required
- Admin dashboard screenshot
- Access denied screenshot for non-admin
- Relevant API response/log

---

## AC-016 — Audit Logging for Critical Actions

**Feature:** Audit Logging  
**Priority:** MUST  
**PRD:** Functional Requirements → Audit Logging  
**Journey:** All critical operational flows

### Given / When / Then
- Given a critical action occurs
- When it completes
- Then an immutable audit entry is recorded

### Expected Assertions
- Audit log includes:
  - actor/user ID
  - action type
  - timestamp
  - relevant entity ID
- Logs cannot be casually overwritten through normal UI actions

### Negative Case
- Missing audit log for a critical action is a failure
- Unauthorized audit access is blocked

### Verification Method
- Integration

### Evidence Required
- Audit log record
- Example action-to-log mapping

---

## AC-017 — AI Document Summary (Optional)

**Feature:** AI Summary  
**Priority:** COULD  
**PRD:** AI-enabled Features  
**Journey:** AI Summary flow

### Given / When / Then
- Given an authorized user is viewing a valid document
- When they request an AI summary
- Then the system streams or returns a structured summary response

### Expected Assertions
- AI request only occurs server-side
- Output appears progressively if streaming is enabled
- Response is associated with the current document context
- Usage is logged

### Negative Case
- Timeout, malformed output, or provider error must return controlled fallback
- AI failure must not block manual document reading

### Verification Method
- Manual
- Integration (if mocked)

### Evidence Required
- Streaming or response screenshot
- Server log / usage log
- Fallback state screenshot

---

## AC-018 — Verification Conflict Detection

**Feature:** Verification Safety  
**Priority:** SHOULD  
**PRD:** Risks & Mitigations / Verification logic  
**Journey:** Seller → Verification → Badge

### Given / When / Then
- Given two listings appear to reference the same property or conflicting ownership claims
- When verification runs
- Then the system flags the conflict for manual review and blocks automatic approval

### Expected Assertions
- Conflict flag is stored
- Verification case cannot proceed to approved state without explicit review
- Admin/legal ops sees flagged case

### Negative Case
- Duplicate/conflicting listings must not both pass through approval silently

### Verification Method
- Integration
- Manual

### Evidence Required
- Conflict flag record
- Queue screenshot
- Audit trail

---

## AC-019 — Escrow Idempotency

**Feature:** Escrow Safety  
**Priority:** MUST  
**PRD:** Escrow lifecycle / failure handling  
**Journey:** Buyer Happy Path

### Given / When / Then
- Given a buyer retries the same escrow funding request
- When duplicate requests hit the backend
- Then only one valid escrow state transition is allowed

### Expected Assertions
- Duplicate requests do not create duplicate funded states
- Duplicate requests return same idempotent result or safe failure
- Payment logs remain consistent

### Negative Case
- Multiple successful state transitions for same funding action is a failure

### Verification Method
- Integration

### Evidence Required
- Payment log
- Escrow status log
- Duplicate request test output

---

## AC-020 — Inspection Completion SLA Tracking

**Feature:** Inspection Operations  
**Priority:** SHOULD  
**PRD:** Inspection workflow + SLA visibility  
**Journey:** Buyer Happy Path / inspection operations

### Given / When / Then
- Given an inspection booking exists
- When the report is not submitted within the defined SLA
- Then the system flags the booking as overdue and makes it visible to operations

### Expected Assertions
- Overdue flag is visible in internal views
- SLA breach timestamp is recorded
- Operations team can identify delayed reports

### Negative Case
- Late reports without overdue state are a failure

### Verification Method
- Integration
- Manual

### Evidence Required
- Overdue booking screenshot
- SLA log

---

## AC-021 — AI Abuse Protection

**Feature:** AI Safety  
**Priority:** SHOULD  
**PRD:** AI-enabled features / Risks & mitigations  
**Journey:** AI Summary flow

### Given / When / Then
- Given a user repeatedly requests AI summaries over the allowed threshold
- When they exceed the configured limit
- Then the system rejects further requests with a controlled rate-limit response

### Expected Assertions
- Per-user rate limit is enforced
- Excessive use is logged
- User sees a clear retry-later message

### Negative Case
- Unlimited repeated requests without restriction is a failure

### Verification Method
- Manual
- Integration (if rate-limiter is testable)

### Evidence Required
- Rate limit response
- Usage log
- UI screenshot of blocked state

---

## AC-022 — Global Input Validation

**Feature:** API Validation  
**Priority:** MUST  
**PRD:** Functional requirements + platform safety  
**Journey:** All backend flows

### Given / When / Then
- Given a malformed, incomplete, or invalid request payload
- When it reaches the API
- Then the request is rejected with a controlled 4xx response and no invalid state is persisted

### Expected Assertions
- Validation errors are deterministic
- No invalid DB writes occur
- Error messages are safe and do not leak internal details

### Negative Case
- Invalid payload resulting in persisted bad state is a failure

### Verification Method
- Unit
- Integration

### Evidence Required
- Validation response
- DB check showing no invalid write

---

# Acceptance Criteria Mapping Table

| AC-ID | Feature | Suggested Test Type | Evidence Artefact |
|---|---|---|---|
| AC-001 | Authentication | Integration / Manual | Login screenshots, session log |
| AC-002 | Session persistence | E2E / Manual | Screen recording, auth logs |
| AC-003 | RBAC | Integration / E2E | 403 response, UI screenshot, log |
| AC-004 | Listing creation | Unit / Integration | DB snapshot, UI screenshot |
| AC-005 | Document upload | Integration | Storage metadata, UI screenshot |
| AC-006 | Verification case creation | Integration | Queue screenshot, DB record |
| AC-007 | Verification decision | Integration | Decision record, audit log |
| AC-008 | Badge assignment | Integration / E2E | Listing screenshot, API response |
| AC-009 | Search & filter | Integration / E2E / Perf | Search results, perf log |
| AC-010 | Secure document viewer | Integration / Manual | Viewer screenshot, access log |
| AC-011 | Inspection booking | Integration / E2E | Booking record, confirmation screenshot |
| AC-012 | Inspection report | Integration / Manual | Report record, screenshot |
| AC-013 | Escrow case creation | Integration | Escrow record, audit entry |
| AC-014 | Escrow funding | Integration / Manual | Funding log, state snapshot |
| AC-015 | Admin dashboard | E2E / Manual | Admin screenshot, denied access evidence |
| AC-016 | Audit logging | Integration | Audit record |
| AC-017 | AI summary | Manual / Integration | Stream/fallback screenshot, logs |
| AC-018 | Verification conflict detection | Integration / Manual | Conflict flag, queue screenshot |
| AC-019 | Escrow idempotency | Integration | Duplicate-request test output, logs |
| AC-020 | Inspection SLA tracking | Integration / Manual | Overdue screenshot, SLA log |
| AC-021 | AI abuse protection | Manual / Integration | Rate-limit response, usage log |
| AC-022 | Global input validation | Unit / Integration | 4xx response, DB state check |

---

# Committable Files

## Suggested filename
`docs/phase-1/03-acceptance-criteria.md`

## Branch name
`docs/phase1-acceptance-criteria-final`

## PR title
`Finalize Phase 1 acceptance criteria pack for TrustedPlot`

## Commit message
`docs: finalize Phase 1 acceptance criteria with traceability and failure coverage`

---

# Verification Steps

## Review checklist
- Every MUST feature from the PRD maps to at least one AC item
- Each AC has:
  - Given/When/Then
  - Negative case
  - Verification method
  - Evidence requirement
- Failure handling is covered for:
  - auth/session
  - invalid input
  - verification conflicts
  - inspections
  - escrow
  - AI timeouts / abuse
- Traceability to PRD and journeys is present
- Criteria are specific enough to be tested without interpretation drift

## If repo exists, run
```bash
npm install
npm run lint
npm run build