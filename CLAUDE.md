## Project
TrustedPlot is a trust-first real estate marketplace for Nigeria focused on:
- verified listings
- structured inspections
- secure escrow lifecycle
- internal legal/admin operations
- clear trust signals for buyers and sellers

This is not a generic property listing site. It is a trust infrastructure platform for property discovery and transaction execution.

## Product priorities
Always optimize for:
1. Trust
2. Clarity
3. Correctness
4. Security
5. Operational usefulness
6. Clean UX

Never optimize for:
- flashy UI over usability
- feature sprawl
- fake progress
- placeholder architecture with no execution path
- "marketplace clutter"

## Stack
- Next.js (App Router) + React + TypeScript
- Route Handlers under apps/web/app/api/**/route.ts
- Postgres + Prisma
- Auth.js
- Docker + docker-compose
- GitHub Actions
- Optional AI features server-side only
- Optional pgvector later

## Repo assumptions
Main app:
- apps/web

Docs:
- docs/phase-1/00-project-brief.md
- docs/phase-1/01-prd.md
- docs/phase-1/02-user-journeys.md
- docs/phase-1/03-acceptance-criteria.md
- docs/phase-1/04-ui-spec.md
- docs/phase-1/05-api-spec.md
- docs/phase-1/06-data-model.md
- docs/phase-1/07-ai-spec.md
- docs/phase-1/08-infra-runbook.md
- docs/phase-1/09-security-checklist.md

Design source of truth:
- design.md and/or .stitch/DESIGN.md

## Working rules
- Read the phase-1 docs before making architectural decisions.
- Keep route names explicit and resource-oriented.
- Enforce RBAC server-side.
- Treat all uploaded document content as untrusted.
- AI features must be optional, bounded, and never replace deterministic trust logic.
- Prefer simple, production-realistic structure over over-engineering.
- Keep code modular by domain, not random utility dumping.

## Build philosophy
You are allowed to restructure folders if it improves maintainability, but:
- preserve apps/web as the main app root
- avoid breaking the App Router conventions
- keep changes explainable
- do not introduce unnecessary infra complexity
- do not create dead abstractions

## UI philosophy
Design should feel like:
- premium
- calm
- structured
- trustworthy
- modern
- operationally serious

Think:
- Stripe
- Linear
- Notion
- Airbnb trust patterns

Not:
- noisy classified sites
- ad-heavy marketplaces
- visually chaotic dashboards

## Phase 1 MVP scope
Must support:
- auth/session
- role-aware access
- seller listing creation
- document upload
- verification queue + decisions
- badges
- search/filter
- secure doc viewing
- inspection booking
- inspection reporting
- escrow lifecycle skeleton
- admin visibility
- audit logging

Out of scope:
- public agent marketplace
- in-app chat
- mortgages/insurance marketplace
- native mobile app
- full AI automation

## Coding rules
- TypeScript strictness preferred
- Use server components where sensible
- Use client components only for interactive UI
- Use Prisma for persistence
- Validate input server-side
- Prefer Zod for route validation
- Use explicit enums for workflow states
- Log critical actions safely
- Never expose secrets to the client
- Never trust client role/state claims

## File organization preference
Use domain-oriented folders where practical, e.g.:
apps/web/
  app/
  components/
  features/
    auth/
    listings/
    documents/
    verification/
    inspections/
    escrows/
    admin/
    ai/
  lib/
  prisma/

Optional shared UI:
packages/ui/

## Before making major changes
Check:
1. Does this align with the PRD?
2. Does this preserve trust-first behavior?
3. Does this create unnecessary complexity?
4. Is there a simpler path?

## When implementing
Always produce:
- working code
- clear folder structure
- comments where needed
- safe defaults
- explicit TODOs only where genuinely blocked

## When changing architecture
Update the relevant docs:
- API spec
- data model
- UI spec
- infra/runbook
if the change materially affects them.

## Definition of success
A strong contribution:
- compiles
- is understandable
- fits the docs
- is secure enough for Phase 1
- advances the actual product

A weak contribution:
- looks impressive but is hollow
- adds frameworks without need
- ignores docs
- hides problems under mock logic
