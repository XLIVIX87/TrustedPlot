---
id: phase-1-data-model-spec-trustedplot
title: Phase 1 Data Model Specification — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
related_docs:
  - docs/phase-1/00-project-brief.md
  - docs/phase-1/01-prd.md
  - docs/phase-1/02-user-journeys.md
  - docs/phase-1/03-acceptance-criteria.md
  - docs/phase-1/05-api-spec.md
  - docs/phase-1/07-ai-spec.md
---

# 1. Purpose

This document defines the Phase 1 data model for **TrustedPlot**, a trust-first real estate marketplace. It is written for a **Prisma + Postgres** implementation and is intended to guide:

- Prisma schema design
- route handler contracts
- data validation and indexing
- migration planning
- seed/dev data setup
- privacy, retention, and deletion behavior

This is **not** the final `schema.prisma` file. It is the design specification that should be translated into the Prisma schema and migrations in a follow-up implementation PR.

---

# 2. Assumed Schema Location

**Assumed path:**  
`apps/web/prisma/schema.prisma`

This path should be confirmed in the repo. If Prisma is instead located at repo root or elsewhere, adjust this document and future commands accordingly.

---

# 3. Data Modeling Principles

TrustedPlot is not just a listing app. It is a **workflow-heavy trust platform**, so the data model must support:

- clear role separation
- listing lifecycle management
- document ownership and verification
- inspection scheduling and reporting
- escrow state transitions
- auditability
- dispute handling
- optional AI usage tracking

The model should optimize for:

- correctness over convenience
- explicit state over inferred state
- traceability of critical actions
- strong relational integrity
- predictable querying for admin and operational workflows

---

# 4. Core Domain Areas

The Phase 1 data model is organized into these domain areas:

1. **Identity & Access**
2. **Listings & Property Metadata**
3. **Documents & Verification**
4. **Inspection Operations**
5. **Escrow & Transaction Lifecycle**
6. **Audit, Admin, and Platform Controls**
7. **Optional AI Usage and Retrieval Support**

---

# 5. Entities and Relationships

## 5.1 High-level ERD Description

At a high level:

- A **User** has one or more platform roles.
- A **Seller Profile** belongs to a User.
- A **Listing** belongs to a Seller Profile.
- A **Listing** has many **Documents**.
- A **Listing** may have one or more **Verification Cases** over time.
- A **Verification Case** may produce a **Badge State** or verification outcome.
- A **Listing** may have many **Inspection Bookings**.
- An **Inspection Booking** may produce one **Inspection Report**.
- A **Listing** may have zero or more **Escrow Cases**.
- An **Escrow Case** may have many **Escrow Events** and zero or more **Disputes**.
- Critical actions create **Audit Log** records.
- Optional AI usage creates **AI Usage Log** entries.

---

## 5.2 Mermaid ERD (conceptual)

```mermaid
erDiagram
  USER ||--o{ USER_ROLE : has
  USER ||--o| SELLER_PROFILE : owns
  USER ||--o{ AUDIT_LOG : performs
  USER ||--o{ AI_USAGE_LOG : triggers

  SELLER_PROFILE ||--o{ LISTING : creates
  LISTING ||--o{ LISTING_DOCUMENT : has
  LISTING ||--o{ VERIFICATION_CASE : enters
  LISTING ||--o{ INSPECTION_BOOKING : schedules
  LISTING ||--o{ ESCROW_CASE : initiates

  VERIFICATION_CASE ||--o{ VERIFICATION_DECISION : records
  INSPECTION_BOOKING ||--o| INSPECTION_REPORT : produces
  ESCROW_CASE ||--o{ ESCROW_EVENT : tracks
  ESCROW_CASE ||--o{ DISPUTE : has

This ERD is conceptual only. The actual Prisma schema may collapse or separate some models depending on implementation detail.

⸻

6. Entity Definitions

Below are the Phase 1 entities and what each must represent.

⸻

6.1 User

Represents any authenticated platform user.

Purpose
	•	authentication identity
	•	session ownership
	•	role attachment
	•	traceable actor for audit

Key fields
	•	id
	•	email or phone-based unique identifier
	•	name
	•	status
	•	createdAt
	•	updatedAt

Notes

User should be treated as the canonical platform identity. Business-specific role behavior should not be overloaded directly into the User model.

⸻

6.2 UserRole

Represents user roles.

Purpose

Support RBAC and future multi-role users.

Suggested approach

Either:
	•	enum field on User if one-role-only in Phase 1
	•	or separate relational UserRole model if multi-role users are expected soon

Preferred Phase 1 approach

Use a relational role model if operational roles may overlap. Otherwise a strict enum can be acceptable for simplicity.

Candidate role enum values
	•	BUYER
	•	SELLER
	•	MANDATE
	•	LEGAL_OPS
	•	INSPECTOR
	•	ADMIN

⸻

6.3 SellerProfile

Represents seller-specific metadata for a user.

Purpose

Separate seller/business concerns from generic identity.

Key fields
	•	id
	•	userId
	•	sellerType (individual, developer, landlord, mandate)
	•	displayName
	•	kycStatus
	•	isMandate
	•	createdAt
	•	updatedAt

Notes

Mandate-specific fields should not automatically make a user valid to act on behalf of an owner. Authority still requires document and workflow validation.

⸻

6.4 Listing

Represents a property listing.

Purpose

Core marketplace unit.

Key fields
	•	id
	•	sellerProfileId
	•	title
	•	description
	•	propertyType
	•	listingType (sale, rent, JV)
	•	city
	•	district
	•	addressSummary
	•	price
	•	bedrooms
	•	bathrooms
	•	status
	•	visibility
	•	createdAt
	•	updatedAt

Important enums

propertyType
	•	APARTMENT
	•	HOUSE
	•	LAND
	•	COMMERCIAL
	•	OTHER

listingType
	•	SALE
	•	RENT
	•	JV

listingStatus
	•	DRAFT
	•	SUBMITTED
	•	UNDER_VERIFICATION
	•	VERIFIED
	•	CONDITIONAL
	•	REJECTED
	•	SUSPENDED
	•	ARCHIVED

Notes

status must be explicit and server-controlled. Listing status must not be inferred from documents alone.

⸻

6.5 ListingMedia

Represents listing photos/videos or public-facing media.

Purpose

Store visual assets distinct from legal documents.

Key fields
	•	id
	•	listingId
	•	mediaType
	•	url
	•	position
	•	createdAt

Notes

This model is separate from legal documents because visibility, retention, and processing rules differ.

⸻

6.6 ListingDocument

Represents uploaded legal or supporting listing documents.

Purpose

Store property-related proof and evidence for verification.

Key fields
	•	id
	•	listingId
	•	documentType
	•	storageKey / secure path
	•	originalFilename
	•	mimeType
	•	checksum
	•	uploadedByUserId
	•	status
	•	createdAt
	•	updatedAt

Candidate documentType values
	•	CERTIFICATE_OF_OCCUPANCY
	•	RIGHT_OF_OCCUPANCY
	•	GOVERNORS_CONSENT
	•	DEED_OF_ASSIGNMENT
	•	SURVEY_PLAN
	•	OWNER_CONSENT
	•	POWER_OF_ATTORNEY
	•	LAND_RECEIPT
	•	OTHER

Candidate status
	•	UPLOADED
	•	PROCESSING
	•	AVAILABLE
	•	INVALID
	•	REPLACED

Notes

Do not store public URLs for sensitive documents. Storage should be private and access-controlled.

⸻

6.7 VerificationCase

Represents a verification workflow instance for a listing.

Purpose

Track listing verification lifecycle, SLA, reviewer actions, and outcomes.

Key fields
	•	id
	•	listingId
	•	submittedByUserId
	•	status
	•	slaStartedAt
	•	slaDueAt
	•	assignedToUserId (optional)
	•	createdAt
	•	updatedAt

Candidate status
	•	PENDING
	•	IN_REVIEW
	•	CONDITIONAL
	•	APPROVED
	•	REJECTED
	•	CANCELLED

Notes

A listing may have multiple verification cases over time, especially if re-submitted after remediation.

⸻

6.8 VerificationDecision

Represents the decision history inside a verification case.

Purpose

Store decision events, not just current state.

Key fields
	•	id
	•	verificationCaseId
	•	reviewerUserId
	•	decision
	•	badgeType (nullable)
	•	reason
	•	createdAt

Candidate decision
	•	APPROVED
	•	CONDITIONAL
	•	REJECTED

Candidate badgeType
	•	VERIFIED_GOLD
	•	VERIFIED_GREEN
	•	CONDITIONAL
	•	NONE

Notes

This model preserves historical actions and supports auditability beyond a single mutable status field.

⸻

6.9 InspectionBooking

Represents a booked property inspection.

Purpose

Track inspection scheduling and assignment.

Key fields
	•	id
	•	listingId
	•	buyerUserId
	•	inspectorUserId (nullable until assigned)
	•	slotAt
	•	status
	•	notes
	•	createdAt
	•	updatedAt

Candidate status
	•	REQUESTED
	•	CONFIRMED
	•	ASSIGNED
	•	IN_PROGRESS
	•	COMPLETED
	•	CANCELLED
	•	OVERDUE

Notes

Bookings should be explicit and support SLA tracking.

⸻

6.10 InspectionReport

Represents completed inspection output.

Purpose

Capture structured field-visit observations.

Key fields
	•	id
	•	inspectionBookingId
	•	submittedByInspectorUserId
	•	summary
	•	notes
	•	reportData (JSON)
	•	createdAt
	•	updatedAt

Notes

If reports require structured checklists, reportData can hold normalized JSON until a more rigid sub-model is needed.

⸻

6.11 EscrowCase

Represents a transaction escrow lifecycle.

Purpose

Track safe payment flow.

Key fields
	•	id
	•	listingId
	•	buyerUserId
	•	sellerUserId or sellerProfileId
	•	amount
	•	currency
	•	status
	•	providerReference (nullable)
	•	createdAt
	•	updatedAt

Candidate status
	•	CREATED
	•	FUNDING_PENDING
	•	FUNDED
	•	PENDING_RESOLUTION
	•	RELEASED
	•	REFUNDED
	•	DISPUTED
	•	CANCELLED

Notes

The model must support a simulated/manual escrow process in Phase 1, even if full provider integration is deferred.

⸻

6.12 EscrowEvent

Represents escrow lifecycle events.

Purpose

Capture state transitions and important actions over time.

Key fields
	•	id
	•	escrowCaseId
	•	eventType
	•	payload (JSON)
	•	createdAt
	•	createdByUserId (nullable/system-supported)

Candidate eventType
	•	CREATED
	•	FUND_ATTEMPTED
	•	FUNDED
	•	RELEASE_REQUESTED
	•	RELEASED
	•	DISPUTE_OPENED
	•	REFUND_REQUESTED
	•	REFUNDED
	•	ERROR

Notes

This is essential for auditability, debugging, and operations.

⸻

6.13 Dispute

Represents a dispute against an escrow case or transaction state.

Purpose

Support structured issue handling.

Key fields
	•	id
	•	escrowCaseId
	•	openedByUserId
	•	reason
	•	status
	•	resolutionSummary
	•	createdAt
	•	updatedAt

Candidate status
	•	OPEN
	•	IN_REVIEW
	•	RESOLVED
	•	REJECTED
	•	CANCELLED

⸻

6.14 AuditLog

Represents immutable audit records for critical actions.

Purpose

Traceability, compliance, debugging, accountability.

Key fields
	•	id
	•	actorUserId
	•	actionType
	•	entityType
	•	entityId
	•	metadata (JSON)
	•	createdAt

Notes

Critical actions only. Do not attempt to log every UI interaction here.

⸻

6.15 AIUsageLog (Optional but recommended)

Represents AI feature usage.

Purpose

Track cost, abuse, latency, and feature adoption.

Key fields
	•	id
	•	userId
	•	featureType
	•	documentId (nullable)
	•	status
	•	latencyMs
	•	tokenUsage (nullable)
	•	estimatedCost (nullable)
	•	createdAt

Candidate featureType
	•	DOCUMENT_SUMMARY
	•	OCR_ASSIST
	•	INTERNAL_VERIFICATION_SUMMARY

Notes

This can start small and expand later.

⸻

7. Relationships Summary

Below is the core relationship intent.
	•	User 1—* SellerProfile (or 1—1 depending on simplification)
	•	SellerProfile 1—* Listing
	•	Listing 1—* ListingMedia
	•	Listing 1—* ListingDocument
	•	Listing 1—* VerificationCase
	•	VerificationCase 1—* VerificationDecision
	•	Listing 1—* InspectionBooking
	•	InspectionBooking 1—1 InspectionReport
	•	Listing 1—* EscrowCase
	•	EscrowCase 1—* EscrowEvent
	•	EscrowCase 1—* Dispute
	•	User 1—* AuditLog
	•	User 1—* AIUsageLog

⸻

8. Prisma Model Definitions (Described, not full schema)

This section describes how Prisma models should be expressed, without writing the full schema yet.

8.1 General Prisma conventions
	•	use UUID or cuid-like string IDs consistently
	•	add createdAt and updatedAt to mutable models
	•	use enums for controlled state machines
	•	use explicit relation names where Prisma may otherwise infer ambiguous relations
	•	prefer normalized tables for business-critical workflows
	•	use JSON only where data is semi-structured or likely to evolve

8.2 Field conventions
	•	status fields should be enums, not free text
	•	money should use integer smallest units or Decimal depending on consistency strategy
	•	large optional AI or inspection details may use JSON where appropriate
	•	sensitive values should not be duplicated across models unnecessarily

8.3 Deletion strategy

Prefer soft delete / status archival for:
	•	listings
	•	disputes
	•	verification cases where history matters

Hard deletion should be carefully controlled and rare.

⸻

9. Indexing Strategy

Indexes should support the expected high-value queries and operational workflows.

9.1 Listings

Recommended indexes
	•	city
	•	district
	•	propertyType
	•	listingType
	•	status
	•	price
	•	combined index on searchable listing filters, for example:
	•	(city, district, propertyType, status)
	•	seller ownership index:
	•	sellerProfileId

Why

Search and browse are core product flows and must remain responsive.

⸻

9.2 Documents

Recommended indexes
	•	listingId
	•	documentType
	•	uploadedByUserId
	•	status

Why

Verification workflows need quick document retrieval by listing and type.

⸻

9.3 Verification

Recommended indexes
	•	listingId
	•	status
	•	assignedToUserId
	•	slaDueAt

Why

Legal ops queues and SLA reporting depend on these lookups.

⸻

9.4 Inspections

Recommended indexes
	•	listingId
	•	buyerUserId
	•	inspectorUserId
	•	slotAt
	•	status

Why

Scheduling and dashboarding will query by these dimensions frequently.

⸻

9.5 Escrow

Recommended indexes
	•	listingId
	•	buyerUserId
	•	status
	•	providerReference

Why

Escrow lifecycle lookups and reconciliation need fast direct access.

⸻

9.6 Audit Logs

Recommended indexes
	•	actorUserId
	•	entityType + entityId
	•	createdAt

Why

Operational review and debugging depend on searchable audit trails.

⸻

9.7 AI Usage Logs

Recommended indexes
	•	userId
	•	featureType
	•	createdAt
	•	status

Why

Rate limiting, cost monitoring, and support review depend on these dimensions.

⸻

10. Migration Strategy

TrustedPlot needs a disciplined migration process from the start.

10.1 Dev migration approach

In development:
	•	update Prisma schema
	•	generate migration
	•	apply locally
	•	seed minimal test data
	•	validate route assumptions

Recommended workflow:

npx prisma format
npx prisma validate
npx prisma migrate dev --name <descriptive_name>

10.2 Prod migration approach

In production:
	•	migrations must be reviewed before apply
	•	no ad hoc schema mutation
	•	use explicit deploy migration flow

Recommended workflow:

npx prisma migrate deploy

10.3 Migration discipline rules
	•	every schema change must be traceable to a product/API requirement
	•	state enums should be added carefully to avoid breaking running workflows
	•	destructive changes should be delayed unless data safety is clear
	•	backfills should be explicit when needed

⸻

11. Optional Vector Strategy

pgvector is optional in Phase 1. If included, it should be introduced only for a clear use case.

11.1 What content could be embedded

Potential candidates:
	•	verification reports
	•	internal SOPs
	•	admin knowledge base
	•	AI summary-friendly sanitized document text
	•	support/troubleshooting docs

Do not embed sensitive content indiscriminately.

11.2 Storage approach

If enabled:
	•	use Postgres with pgvector extension
	•	store embeddings in a dedicated table, not mixed casually into core business rows
	•	each embedded record should reference:
	•	source type
	•	source ID
	•	chunk index
	•	updatedAt

11.3 Retrieval flow

Basic retrieval flow:
	1.	user/internal system submits query
	2.	query embedded
	3.	vector similarity search runs against approved embedded corpus
	4.	top matches returned with metadata
	5.	optional summarization happens server-side

11.4 Cost notes
	•	embeddings create recurring compute/storage costs
	•	only embed content that supports a real retrieval need
	•	do not enable by default without a concrete product use case

⸻

12. Data Lifecycle, Retention, and Privacy

TrustedPlot handles sensitive user and document data. Data lifecycle must be explicit.

12.1 Retention principles
	•	retain only what supports trust, operations, compliance, and auditability
	•	avoid unnecessary duplication of PII
	•	preserve history where legally or operationally necessary

12.2 Suggested retention rules

These are policy placeholders and should be confirmed with legal/compliance:
	•	Listings:
	•	archive rather than delete if tied to operational history
	•	Verification decisions:
	•	retain for audit purposes
	•	Inspection reports:
	•	retain while listing or related transaction remains relevant
	•	Escrow/dispute records:
	•	retain according to finance/compliance policy
	•	AI usage logs:
	•	retain only as long as needed for support/cost analysis
	•	Sensitive raw documents:
	•	retain according to trust/compliance requirements, not indefinitely by default

12.3 Deletion and user privacy

Where applicable:
	•	support deletion/anonymization requests consistent with NDPA requirements
	•	separate “delete account” from “erase all auditable records”
	•	never silently delete data required for compliance or dispute resolution
	•	document-level access must remain controlled at all times

⸻

13. Seed / Dev Data Strategy

Phase 1 development needs reliable seed data.

13.1 Goals of seed data
	•	support happy-path testing
	•	support edge-case testing
	•	support role-specific UI development
	•	support AI summary experiments
	•	support admin/ops dashboards

13.2 Minimum seed dataset

Seed data should include:

Users
	•	1 buyer
	•	1 seller
	•	1 mandate
	•	1 legal ops user
	•	1 inspector
	•	1 admin

Listings
	•	2 draft listings
	•	2 submitted listings
	•	1 verified listing
	•	1 conditional listing
	•	1 rejected listing

Documents
	•	valid C of O
	•	valid R of O
	•	owner consent doc
	•	incomplete document set

Verification cases
	•	pending
	•	approved
	•	conditional
	•	rejected

Inspections
	•	requested
	•	assigned
	•	completed with report
	•	overdue

Escrows
	•	created
	•	funded
	•	disputed
	•	released

Audit logs
	•	sample verification action
	•	sample admin moderation action
	•	sample escrow action

AI logs
	•	one successful summary
	•	one timeout
	•	one rate-limited event

13.3 Seed implementation notes

Recommended:
	•	create deterministic seed script
	•	ensure IDs and emails are predictable
	•	avoid random seeds that break screenshots and tests

⸻

14. Proposed Follow-up Implementation Plan

This spec should lead directly into implementation PRs.

Suggested next implementation PR
	•	create schema.prisma
	•	define enums
	•	create initial migration
	•	create seed script
	•	add Prisma client wiring
	•	add one integration test that validates schema assumptions

⸻

15. Verification Steps

Review checklist
	•	entity set covers all Phase 1 workflows
	•	enums and states are explicit
	•	relationships reflect PRD and journeys
	•	indexing strategy matches expected queries
	•	migration strategy is realistic
	•	retention/privacy notes are acknowledged
	•	vector strategy is optional and correctly scoped

If schema exists

Run:

npx prisma format
npx prisma validate

If migrations exist and local DB is configured:

npx prisma migrate dev

If Prisma client generation is configured:

npx prisma generate

If no schema yet, the repo SHOULD support

npx prisma init
npx prisma format
npx prisma validate
npx prisma migrate dev --name init
npx prisma generate

General repo commands

npm install
npm run lint
npm run build

If tests exist:

npm run test

Artefacts to capture
	•	markdown preview screenshot
	•	schema diff / migration diff
	•	Prisma validation output
	•	seed output summary
	•	reviewer sign-off on entity list and lifecycle states

⸻

16. Committable Files

Suggested filename

docs/phase-1/06-data-model.md

Branch name

docs/phase1-data-model

PR title

Add Phase 1 data model spec for TrustedPlot

Commit message

docs: add Phase 1 data model spec for TrustedPlot

Suggested follow-up implementation PR

Branch: feat/prisma-phase1-schema
PR title: Implement Phase 1 Prisma schema, initial migration, and seed data for TrustedPlot

---

### PR Description

This PR adds the Phase 1 Data Model Specification for TrustedPlot under `docs/phase-1/06-data-model.md`. It defines the core entities, relationships, lifecycle states, indexing strategy, migration approach, optional vector support, retention/privacy considerations, and seed data strategy for the Prisma + Postgres implementation. The document is intended to serve as the canonical design reference before writing `schema.prisma`, migrations, and seed scripts.