Absolutely — below is a production-grade Phase 1 API SPEC for TrustedPlot, written for a Next.js Route Handlers architecture and aligned with the stack, PRD, journeys, acceptance criteria, and trust-first operating model you’ve already defined.

⸻

✅ FINAL — docs/phase-1/05-api-spec.md

---
id: phase-1-api-spec-trustedplot
title: Phase 1 API Specification — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
related_docs:
  - docs/phase-1/00-project-brief.md
  - docs/phase-1/01-prd.md
  - docs/phase-1/02-user-journeys.md
  - docs/phase-1/03-acceptance-criteria.md
  - docs/phase-1/04-ui-spec.md
---

# 1. API Design Principles

TrustedPlot APIs are implemented as **Next.js Route Handlers** under:

```text
apps/web/app/api/**/route.ts

The API layer is responsible for:
	•	authenticated user actions
	•	role-based access control
	•	listing and document workflows
	•	verification workflows
	•	inspection workflows
	•	escrow state handling
	•	admin tooling
	•	auditability
	•	optional AI-assisted features

The API is not designed as a public third-party developer API in Phase 1. It is an internal product API used by the TrustedPlot web application and internal ops workflows.

1.1 Design principles

Trust-first

Every endpoint must preserve:
	•	data integrity
	•	authorization correctness
	•	auditability
	•	predictable state transitions

Explicit over implicit

Endpoints should be:
	•	narrowly scoped
	•	explicit in purpose
	•	server-validated
	•	easy to trace to product workflows

Stateful but controlled

Because TrustedPlot is workflow-heavy, endpoints must respect:
	•	listing lifecycle states
	•	verification states
	•	inspection states
	•	escrow states
	•	dispute states

Minimal magic

No hidden permission upgrades, implicit side effects, or silent fallbacks without logs.

Server-side source of truth

Validation, authorization, and workflow transitions must be enforced on the server, not assumed from the client.

⸻

1.2 Versioning

Phase 1 does not require URL-level versioning such as /api/v1/....

Instead:
	•	APIs are versioned through repository evolution and route stability
	•	breaking changes should be introduced carefully and documented in PRs
	•	if external/public API exposure is introduced later, formal versioning can be added

For now, routes use stable resource-oriented naming under /api.

⸻

1.3 Naming conventions

Route naming

Use:
	•	plural nouns for collections
	•	resource identifiers for specific entities
	•	action suffixes only when action is not standard CRUD

Examples:
	•	/api/listings
	•	/api/listings/[listingId]
	•	/api/listings/[listingId]/documents
	•	/api/verification/[caseId]/decision
	•	/api/escrows/[escrowId]/fund

Method usage
	•	GET = fetch
	•	POST = create or action
	•	PATCH = partial update / state transition
	•	DELETE = remove when appropriate (rare in Phase 1; prefer soft delete or moderation states)

⸻

1.4 Error model

All endpoints should return a consistent JSON error structure.

Standard error shape

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": {
      "field": "price",
      "reason": "Must be greater than zero"
    },
    "correlationId": "req_123456789"
  }
}

Error categories
	•	UNAUTHENTICATED
	•	FORBIDDEN
	•	NOT_FOUND
	•	VALIDATION_ERROR
	•	CONFLICT
	•	RATE_LIMITED
	•	EXTERNAL_SERVICE_ERROR
	•	STATE_TRANSITION_ERROR
	•	INTERNAL_ERROR

Error principles
	•	never leak secrets
	•	never expose raw stack traces
	•	always include correlation ID
	•	include field-level detail where safe and useful

⸻

2. Auth Model

TrustedPlot uses Auth.js for authentication/session handling.

2.1 Session model

Endpoints fall into three broad categories:

Public

Can be called without login
	•	listing search
	•	listing detail (public-safe subset)
	•	public trust content pages (if API-backed)

Authenticated user

Require valid session
	•	create listing
	•	upload document
	•	unlock doc
	•	book inspection
	•	create escrow
	•	AI summary request

Privileged internal role

Require valid session + role checks
	•	verification queue access
	•	verification decision actions
	•	admin dashboard actions
	•	audit log access
	•	dispute resolution actions

⸻

2.2 Role model

Phase 1 assumes these roles:
	•	BUYER
	•	SELLER
	•	MANDATE
	•	LEGAL_OPS
	•	INSPECTOR
	•	ADMIN

Role enforcement principles
	•	all privileged endpoints must verify role server-side
	•	UI hiding alone is not sufficient
	•	session must include or resolve role before action execution
	•	unauthorized calls return 403 FORBIDDEN

⸻

2.3 Authentication requirements by category

Category	Session Required	Role Check Required
Public listing search	No	No
Listing detail (public-safe)	No	No
Seller listing creation	Yes	Yes
Doc upload	Yes	Yes
Verification queue	Yes	Yes
Inspection booking	Yes	Yes
Escrow actions	Yes	Yes
AI summary	Yes	Yes
Admin actions	Yes	Yes


⸻

3. Endpoint Catalogue

⸻

3.1 Listings

GET /api/listings

Fetch searchable property listings.

Purpose
	•	return paginated searchable listing data
	•	support filters for buyer discovery

Auth required
	•	No

Request schema

{
  "query": "optional string",
  "city": "optional string",
  "district": "optional string",
  "propertyType": "optional enum",
  "badge": "optional enum",
  "minPrice": "optional number",
  "maxPrice": "optional number",
  "page": 1,
  "pageSize": 20
}

Response schema

{
  "data": [
    {
      "id": "lst_123",
      "title": "3 Bedroom Apartment",
      "city": "Lagos",
      "district": "Lekki",
      "price": 120000000,
      "badge": "VERIFIED_GOLD",
      "thumbnailUrl": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 120
  }
}

Status codes
	•	200 OK
	•	400 BAD_REQUEST

Errors
	•	invalid filter values
	•	invalid pagination parameters

⸻

POST /api/listings

Create a new listing.

Purpose
	•	allow seller/mandate to create draft listing

Auth required
	•	Yes

Allowed roles
	•	SELLER
	•	MANDATE

Request schema

{
  "title": "3 Bedroom Apartment",
  "description": "Short description",
  "propertyType": "APARTMENT",
  "city": "Lagos",
  "district": "Lekki",
  "price": 120000000,
  "bedrooms": 3,
  "bathrooms": 3
}

Response schema

{
  "data": {
    "id": "lst_123",
    "status": "DRAFT"
  }
}

Status codes
	•	201 CREATED
	•	400 BAD_REQUEST
	•	401 UNAUTHORIZED
	•	403 FORBIDDEN

Errors
	•	invalid role
	•	invalid payload
	•	missing required fields

⸻

GET /api/listings/[listingId]

Fetch listing detail.

Purpose
	•	return public-safe or role-adjusted listing details

Auth required
	•	No for public-safe view
	•	Yes for enhanced access depending on role/unlock state

Response schema

{
  "data": {
    "id": "lst_123",
    "title": "3 Bedroom Apartment",
    "description": "Detailed text",
    "price": 120000000,
    "badge": "VERIFIED_GOLD",
    "documentsAvailable": true,
    "inspectionAvailable": true
  }
}

Status codes
	•	200 OK
	•	404 NOT_FOUND

⸻

PATCH /api/listings/[listingId]

Update seller-owned draft listing.

Auth required
	•	Yes

Allowed roles
	•	SELLER
	•	MANDATE

Constraints
	•	only owner/authorized mandate may update
	•	restricted fields after submission for verification

Status codes
	•	200 OK
	•	400 BAD_REQUEST
	•	403 FORBIDDEN
	•	404 NOT_FOUND
	•	409 CONFLICT

⸻

3.2 Documents

POST /api/listings/[listingId]/documents

Upload a document for listing.

Purpose
	•	attach title/ownership/supporting documents

Auth required
	•	Yes

Allowed roles
	•	SELLER
	•	MANDATE

Request
	•	multipart/form-data or upload-token flow
	•	metadata fields may include document type

Response

{
  "data": {
    "documentId": "doc_123",
    "type": "CERTIFICATE_OF_OCCUPANCY",
    "status": "UPLOADED"
  }
}

Status codes
	•	201 CREATED
	•	400 BAD_REQUEST
	•	401 UNAUTHORIZED
	•	403 FORBIDDEN
	•	413 PAYLOAD_TOO_LARGE

Errors
	•	invalid file type
	•	invalid ownership
	•	file too large
	•	corrupt file

⸻

GET /api/listings/[listingId]/documents

Fetch documents available to current user.

Purpose
	•	return document metadata or secure-view links depending on permissions

Auth required
	•	Yes

Response

{
  "data": [
    {
      "id": "doc_123",
      "type": "CERTIFICATE_OF_OCCUPANCY",
      "access": "LOCKED"
    }
  ]
}

Errors
	•	unauthorized access
	•	no unlock entitlement
	•	no document found

⸻

POST /api/listings/[listingId]/unlock

Unlock document access for authorized user.

Purpose
	•	support paid unlocks or tier entitlements

Auth required
	•	Yes

Allowed roles
	•	BUYER
	•	SELLER (if owner)
	•	ADMIN

Response

{
  "data": {
    "listingId": "lst_123",
    "unlocked": true
  }
}

Errors
	•	payment failure
	•	already unlocked
	•	invalid access state

⸻

3.3 Verification

POST /api/verification

Submit listing for verification.

Purpose
	•	create verification case from listing

Auth required
	•	Yes

Allowed roles
	•	SELLER
	•	MANDATE

Request

{
  "listingId": "lst_123"
}

Response

{
  "data": {
    "verificationCaseId": "ver_123",
    "status": "PENDING"
  }
}

Errors
	•	missing required documents
	•	invalid listing state
	•	already submitted

⸻

GET /api/verification/queue

Fetch legal verification queue.

Auth required
	•	Yes

Allowed roles
	•	LEGAL_OPS
	•	ADMIN

Response

{
  "data": [
    {
      "id": "ver_123",
      "listingId": "lst_123",
      "status": "PENDING",
      "slaDueAt": "2026-03-25T10:00:00Z"
    }
  ]
}


⸻

POST /api/verification/[caseId]/decision

Submit verification decision.

Auth required
	•	Yes

Allowed roles
	•	LEGAL_OPS
	•	ADMIN

Request

{
  "decision": "APPROVED",
  "reason": "Documents validated",
  "badge": "VERIFIED_GOLD"
}

Response

{
  "data": {
    "caseId": "ver_123",
    "status": "APPROVED",
    "badge": "VERIFIED_GOLD"
  }
}

Errors
	•	invalid state transition
	•	unauthorized actor
	•	missing rationale
	•	conflicting listing state

⸻

3.4 Inspections

POST /api/inspections

Book an inspection.

Auth required
	•	Yes

Allowed roles
	•	BUYER

Request

{
  "listingId": "lst_123",
  "slotAt": "2026-03-27T14:00:00Z"
}

Response

{
  "data": {
    "inspectionId": "ins_123",
    "status": "BOOKED"
  }
}

Errors
	•	no slot available
	•	duplicate booking
	•	invalid listing state

⸻

GET /api/inspections/[inspectionId]

Get inspection detail.

Auth required
	•	Yes

Allowed roles
	•	BUYER
	•	INSPECTOR
	•	ADMIN

⸻

POST /api/inspections/[inspectionId]/report

Submit inspection report.

Auth required
	•	Yes

Allowed roles
	•	INSPECTOR

Request

{
  "summary": "Property inspected successfully",
  "notes": "Minor wall defects",
  "media": []
}

Response

{
  "data": {
    "inspectionId": "ins_123",
    "status": "REPORTED"
  }
}

Errors
	•	unauthorized inspector
	•	incomplete report
	•	wrong inspection state

⸻

3.5 Escrow

POST /api/escrows

Create escrow case.

Auth required
	•	Yes

Allowed roles
	•	BUYER

Request

{
  "listingId": "lst_123",
  "amount": 5000000
}

Response

{
  "data": {
    "escrowId": "esc_123",
    "status": "CREATED"
  }
}

Errors
	•	invalid listing state
	•	duplicate escrow
	•	invalid amount

⸻

POST /api/escrows/[escrowId]/fund

Attempt to fund escrow.

Auth required
	•	Yes

Allowed roles
	•	BUYER

Request

{
  "paymentMethod": "TRANSFER"
}

Response

{
  "data": {
    "escrowId": "esc_123",
    "status": "FUNDING_PENDING"
  }
}

Errors
	•	timeout
	•	duplicate request
	•	invalid state
	•	provider failure

⸻

POST /api/escrows/[escrowId]/dispute

Open dispute.

Auth required
	•	Yes

Allowed roles
	•	BUYER
	•	SELLER
	•	ADMIN

Request

{
  "reason": "Property did not match report"
}


⸻

3.6 Admin / Audit

GET /api/admin/dashboard

Fetch admin metrics and overview.

Auth required
	•	Yes

Allowed roles
	•	ADMIN

⸻

GET /api/audit

Fetch audit logs.

Auth required
	•	Yes

Allowed roles
	•	ADMIN

⸻

3.7 AI

POST /api/ai/summarize

Generate AI summary for authorized document.

Purpose
	•	summarize a document for the current authorized viewer

Auth required
	•	Yes

Allowed roles
	•	any authenticated user with valid document access

Request

{
  "documentId": "doc_123"
}

Response

{
  "data": {
    "summary": "This document appears to be a Certificate of Occupancy..."
  }
}

Errors
	•	unauthorized doc access
	•	rate limited
	•	timeout
	•	provider failure

⸻

4. Validation Rules

All input validation is server-side.

4.1 Principles
	•	never trust client input
	•	validate shape, type, enum, ownership, and state transitions
	•	reject malformed payloads with 4xx
	•	never persist invalid states

4.2 Examples
	•	listing price must be numeric and > 0
	•	property type must be enum value
	•	document uploads must match allowed MIME/type list
	•	verification decisions must include valid decision enum
	•	escrow creation must check listing and user eligibility
	•	AI summarize requires document entitlement check

4.3 Input limits

Recommended Phase 1 limits:
	•	query string length capped
	•	page size max 100
	•	file upload max size capped by doc type
	•	AI summarize request max frequency per user
	•	text fields trimmed and length-limited

⸻

5. Rate Limiting / Abuse Controls

5.1 General controls

Apply route-level rate limiting where appropriate:
	•	auth endpoints
	•	unlock endpoints
	•	AI endpoints
	•	escrow funding endpoints

5.2 AI-specific abuse controls

AI routes are especially sensitive for:
	•	cost abuse
	•	repeated requests
	•	prompt abuse
	•	unnecessary document summarization load

Minimum controls
	•	max requests per user per hour
	•	short timeout
	•	server-side only
	•	usage logging
	•	fallback error state
	•	no raw model/provider details leaked

5.3 Payment / escrow abuse controls
	•	idempotency required for fund attempts
	•	duplicate requests must not create duplicate states
	•	abnormal retry patterns should be logged

⸻

6. Observability

6.1 What to log

Each critical endpoint should log:
	•	correlation ID
	•	authenticated user ID (if any)
	•	role
	•	route
	•	action outcome
	•	duration
	•	safe error code

6.2 What NOT to log

Never log:
	•	raw secrets
	•	session tokens
	•	full PII payloads
	•	raw identity documents
	•	payment secrets
	•	AI provider keys

6.3 Correlation IDs

Every request should carry or generate a correlation ID.

This ID must be:
	•	included in logs
	•	returned in error responses
	•	usable across downstream services where possible

⸻

7. Example Payloads

7.1 Create listing

{
  "title": "Luxury 4 Bedroom Duplex",
  "description": "Well-finished duplex in Lekki Phase 1",
  "propertyType": "HOUSE",
  "city": "Lagos",
  "district": "Lekki Phase 1",
  "price": 250000000
}

7.2 Submit verification decision

{
  "decision": "CONDITIONAL",
  "reason": "Survey plan mismatch requires clarification",
  "badge": null
}

7.3 Create inspection

{
  "listingId": "lst_123",
  "slotAt": "2026-03-27T14:00:00Z"
}

7.4 Create escrow

{
  "listingId": "lst_123",
  "amount": 5000000
}

7.5 AI summary

{
  "documentId": "doc_123"
}


⸻

8. Mapping to Implementation

Proposed file structure for route handlers:

apps/web/app/api/
  auth/
    session/route.ts
  listings/
    route.ts
    [listingId]/
      route.ts
      documents/
        route.ts
      unlock/
        route.ts
  verification/
    route.ts
    queue/
      route.ts
    [caseId]/
      decision/
        route.ts
  inspections/
    route.ts
    [inspectionId]/
      route.ts
      report/
        route.ts
  escrows/
    route.ts
    [escrowId]/
      fund/
        route.ts
      dispute/
        route.ts
  admin/
    dashboard/
      route.ts
  audit/
    route.ts
  ai/
    summarize/
      route.ts


⸻

9. Verification Steps

Review checklist
	•	endpoint purposes align with PRD and journeys
	•	auth/role model is explicit
	•	request and response schemas are understandable
	•	failure modes are documented
	•	AI abuse controls are defined
	•	implementation file paths align with app router structure

Proposed contract tests

Suggested tests to add:
	•	auth required routes reject anonymous requests
	•	role-restricted routes reject wrong roles
	•	listing creation validates input
	•	verification case creation fails when docs missing
	•	escrow funding is idempotent
	•	AI summarize is rate-limited and requires doc access

If repo exists, run

npm install
npm run lint
npm run build
npm run test

If contract/integration tests exist:

npm run test:integration

Artefacts to capture
	•	markdown preview screenshot
	•	PR diff
	•	example API responses
	•	logs for at least one success and one failure case
	•	contract test output where available

⸻

10. Committable Files

Suggested filename

docs/phase-1/05-api-spec.md

Branch name

docs/phase1-api-spec

PR title

Add Phase 1 API spec for TrustedPlot

Commit message

docs: add Phase 1 API specification for TrustedPlot

---

## PR Description

This PR adds the Phase 1 API Specification for TrustedPlot under `docs/phase-1/05-api-spec.md`. It defines the API design principles, auth model, endpoint catalogue, validation rules, abuse controls, observability requirements, example payloads, and proposed file-path mapping for Next.js Route Handlers. The document is intended to serve as the canonical API contract for Phase 1 implementation and to support AI-assisted development, route scaffolding, and integration testing.

---

If you want, the next best step is **`06-domain-model.md`** so we can turn the product, journeys, acceptance criteria, UI spec, and API spec into a concrete **Prisma schema + enum/state model**.