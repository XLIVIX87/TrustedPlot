---
id: phase-1-project-brief-trustedplot
title: Phase 1 Project Brief — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
repo_paths_used:
  - docs/phase-1/ (expected; create if missing)
  - apps/web/ (confirmed monorepo app root)
  - apps/web/app/api/**/route.ts (expected Route Handler location)
  - packages/* (shared modules; expected)
  - prisma/ (expected; confirm actual location)
  - compose.yaml or docker-compose.yml (TBD; confirm)
  - .github/workflows/ (expected CI location)
assumptions:
  - TrustedPlot is a trust-first real estate marketplace focused on Abuja and Lagos.
  - The system prioritizes verification, inspections, and structured transactions over listing volume.
  - Next.js (apps/web) handles both frontend and backend-for-frontend via Route Handlers.
  - Auth.js manages authentication/session; RBAC is implemented at the application layer.
  - PostgreSQL + Prisma is the source of truth for all relational and transactional data.
  - Escrow in MVP will be lifecycle-based and may be simulated or manually orchestrated (not necessarily fully integrated).
  - AI features are optional enhancements and not required for MVP success.
  - Docker is used for consistent environments; CI/CD via GitHub Actions.
open_questions:
  - Final escrow approach (simulated vs integrated provider)
  - Final verification badge taxonomy (Gold/Green naming + criteria)
  - Mandatory document list per property type
  - Exact RBAC roles required in MVP
  - Inspection ops model (in-house vs partner)
  - NDPA/privacy scope for MVP vs Phase 2
  - Repo path confirmations (compose.yaml vs docker-compose.yml, prisma location)
dependencies:
  - Phase 1 PRD (docs/phase-1/01-prd.md)
  - User journeys (docs/phase-1/02-user-journeys.md)
  - UI spec / Stitch outputs (docs/phase-1/04-ui-spec.md or external)
  - Domain model (Prisma schema)
  - Verification & inspection SOPs
---

# Problem statement

Nigeria’s real estate market suffers from a systemic trust deficit. Buyers and renters routinely encounter fake listings, unverifiable mandates, forged documents, disorganized inspections, and unsafe payment flows. Existing platforms optimize for listing volume rather than listing credibility, resulting in wasted time, financial loss, and poor user confidence.

TrustedPlot is designed to replace assumption-based trust with **evidence-based trust**, where every listing is evaluated through structured identity checks, document validation, inspection workflows, and controlled transaction processes.

The product is not a listing marketplace with trust features — it is a **trust infrastructure platform for real estate execution**.

---

# Target users and jobs-to-be-done

## Primary users

### Buyers / Renters
- Find properties they can trust
- Avoid fake listings and wasted inspections
- Access verified documents before committing
- Move money safely

### Sellers / Owners / Developers
- Prove legitimacy
- Attract serious buyers
- Close faster with structured workflows

### Mandates
- Represent properties with verified authority
- Must be validated through owner consent

### Legal / Verification Ops
- Review documents
- Issue decisions and badges
- Maintain verification SLA

### Inspectors
- Execute structured site visits
- Upload standardized reports

### Admin / Operations
- Manage disputes, fraud, SLAs, and platform health

---

## Core jobs-to-be-done

- “Help me trust this property before I act”
- “Help me prove this property is legitimate”
- “Help me verify documents and authority”
- “Help me inspect efficiently”
- “Help me transact safely”

---

# Solution overview

TrustedPlot is a full-stack platform combining:

- Verified listings (documents + badges)
- Controlled access to sensitive information
- Inspection workflows
- Escrow-based transaction lifecycle
- Internal operational systems (legal, admin, audit)

The system ensures that:
- Trust is **earned, not assumed**
- Actions are **tracked and auditable**
- Transactions are **structured and controlled**

---

# MVP scope (in/out)

## In scope (Phase 1)

### Core marketplace
- Auth + onboarding
- Listing creation + management
- Buyer discovery + filtering
- Listing detail pages

### Trust infrastructure
- KYC onboarding
- Document upload + secure storage
- Verification workflow (queue → decision → badge)
- Badge system (approved / conditional / rejected)

### Operational layer
- Inspection booking + reporting
- Admin dashboard
- Audit logging
- SLA visibility

### Transaction layer
- Escrow lifecycle (create → fund → track → resolve)
- NOTE: escrow may be simulated or manually coordinated

### Platform foundation
- Prisma schema
- Route Handler structure
- Dockerized dev environment
- CI pipeline
- Error tracking hooks

---

## Out of scope

- Chat/messaging system
- Agent marketplace
- Mortgage/insurance products
- Native mobile apps
- Advanced AI copilots
- Multi-city expansion
- Full automation of escrow/legal processes

---

# Success metrics

## Phase 1 (readiness metrics)

- Project brief approved
- MVP scope frozen
- Domain model (Prisma) defined
- Route structure defined
- RBAC model defined
- User journeys validated
- SOPs approved (verification + inspection)

## Phase 2 (product metrics – defined early)

- ≥ 70% listings verified
- Verification SLA ≤ 48 hours
- Inspection completion rate ≥ 80%
- Escrow initiation rate ≥ defined baseline
- Dispute rate < 5%

---

# Risks & mitigations

## Product risk
Drifting into generic listing platform  
→ Mitigation: keep verification + inspection + escrow in MVP

## Operational risk
Slow verification/inspection  
→ Mitigation: SLA tracking + queue systems

## Legal risk
Handling sensitive documents incorrectly  
→ Mitigation: secure access, audit logs, NDPA alignment

## Technical risk
Unstructured backend logic  
→ Mitigation: domain-driven modules + strict API boundaries

## AI risk
Uncontrolled cost / abuse  
→ Mitigation:
- server-side AI only
- rate limits
- optional usage
- fallback to manual workflows

## Marketplace trust risk
Fake mandates / forged docs  
→ Mitigation:
- owner consent validation
- document verification workflow
- audit trails

---

# Open questions (explicit)

1. Escrow approach (simulated vs provider)
2. Badge taxonomy and criteria
3. Required document sets per listing
4. RBAC role definition
5. Inspection ops model
6. NDPA compliance scope
7. Repo structure confirmations

---

# Phase 1 deliverables

- 01-prd.md (requirements)
- 02-user-journeys.md (flows)
- 03-domain-model.md (Prisma schema)
- 04-ui-spec.md (design system)
- 05-architecture.md (system design)
- 06-rbac.md (permissions)
- 07-verification-sop.md
- 08-inspection-sop.md
- 09-escrow-flow.md

---

# Committable files

## Path
docs/phase-1/00-project-brief.md

## Branch
docs/phase1-project-brief

## PR title
Add Phase 1 project brief for TrustedPlot (final)

## Commit message
docs: finalize Phase 1 project brief (aligned with PRD + journeys + stack)

---

# Verification steps

## Review checklist
- Problem statement aligns with trust-first positioning
- MVP scope matches PRD
- Escrow positioning is realistic (not over-promised)
- AI clearly optional
- Risks and mitigations are actionable
- Open questions reflect real decisions

## Commands (if repo exists)
npm install  
npm run lint  
npm run build  

## Artefacts
- Markdown preview
- PR diff
- Reviewer approvals