---
id: phase-1-infra-runbook-trustedplot
title: Phase 1 Infrastructure & Runbook — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
related_docs:
  - docs/phase-1/00-project-brief.md
  - docs/phase-1/01-prd.md
  - docs/phase-1/05-api-spec.md
  - docs/phase-1/06-data-model.md
  - docs/phase-1/07-ai-spec.md
environments:
  - local
  - dev
  - staging
  - prod
---

# 1. Purpose

This document defines the Phase 1 infrastructure model and operating runbook for **TrustedPlot**. It covers:

- local development
- Docker / Compose workflow
- CI with GitHub Actions
- deployment flow
- database migration discipline
- secrets handling
- rollback approach
- operational incident playbooks

It is written to be usable by:
- a solo founder/developer
- a small team
- AI-assisted engineering tools
- future operators or on-call support

This runbook assumes:
- app code lives in a monorepo
- the main web app is under `apps/web`
- local development uses Docker + Compose
- CI uses GitHub Actions
- the app uses Auth.js, Postgres, Prisma, and optional AI features

---

# 2. Environment Overview

TrustedPlot should operate across four environments.

## 2.1 Local
Purpose:
- feature development
- debugging
- schema changes
- UI iteration
- AI-assisted implementation

Characteristics:
- Docker Compose driven
- local Postgres
- local app server
- local secrets file
- optional fake mail / storage emulator / mock AI service

---

## 2.2 Dev
Purpose:
- shared development testing
- early integration checks
- branch deploy testing if supported

Characteristics:
- unstable
- lower data sensitivity
- safe for feature branches
- may share infra with staging in early phase if resources are limited

---

## 2.3 Staging
Purpose:
- pre-release verification
- QA
- migration rehearsal
- stakeholder demos
- acceptance validation

Characteristics:
- production-like configuration
- protected secrets
- controlled access
- should reflect real deployment mode as closely as possible

---

## 2.4 Production
Purpose:
- real user traffic
- trusted operational execution

Characteristics:
- hardened secrets handling
- migration discipline enforced
- backups and rollback support
- auditability required

---

# 3. Architecture Overview

Phase 1 infrastructure should support these core runtime concerns:

- Next.js web application
- Route Handlers for backend endpoints
- Postgres database
- Prisma client + migrations
- Auth.js session handling
- optional Redis later if needed
- optional AI provider access from server-side routes only

At minimum, the platform needs:
- one application runtime
- one database
- one migration procedure
- one CI pipeline
- one repeatable deployment process

---

# 4. Local Dev Setup

## 4.1 Prerequisites

Install the following locally:

- Docker Desktop or Docker Engine
- Docker Compose support
- Node.js 20+
- npm
- Git
- access to repo
- `.env.local` or equivalent local env file template

Optional but recommended:
- make
- direnv
- VS Code with Prisma and Docker extensions

---

## 4.2 Assumed Local Services

Compose should run at least:

- `web` — Next.js application
- `db` — Postgres
- optional `mailhog` or equivalent for local email testing
- optional `otel-collector` later
- optional `adminer`/`pgadmin` only if needed locally

---

## 4.3 Example Compose Topology

Expected local services:

### web
- builds or runs `apps/web`
- exposes app on port `3000`

### db
- Postgres
- exposes port `5432`
- persistent local volume

### optional support services
- local mail catcher
- local object storage emulator
- local mock payment/AI service if needed later

---

## 4.4 Local Dev Principles

- local setup should be one-command bootable
- no manual DB creation steps after first setup
- Prisma migrations should apply cleanly
- local secrets should never be committed
- route handlers should run against the same DB container every time unless reset intentionally

---

# 5. Exact Commands (Copy/Paste)

These commands assume a monorepo with app code under `apps/web` and Compose config at repo root.

## 5.1 First-time setup

```bash
git clone <REPO_URL>
cd <REPO_ROOT>
cp .env.example .env.local
docker compose up -d db
npm install

Expected outcome:
	•	dependencies installed
	•	Postgres container running

⸻

5.2 Start full local stack

docker compose up -d

Expected outcome:
	•	app container or dependencies start
	•	Postgres available
	•	app reachable at http://localhost:3000

⸻

5.3 Run Prisma format / validate

npx prisma format --schema apps/web/prisma/schema.prisma
npx prisma validate --schema apps/web/prisma/schema.prisma

Expected outcome:
	•	schema formatted
	•	validation passes with no errors

⸻

5.4 Run local migrations

npx prisma migrate dev --schema apps/web/prisma/schema.prisma

Expected outcome:
	•	migration applied to local DB
	•	Prisma client regenerated if configured
	•	migration folder created if schema changed

⸻

5.5 Generate Prisma client

npx prisma generate --schema apps/web/prisma/schema.prisma

Expected outcome:
	•	Prisma client generated successfully

⸻

5.6 Start app in dev mode (if not fully containerized app runtime)

npm run dev

Expected outcome:
	•	Next.js dev server starts
	•	app available at http://localhost:3000

⸻

5.7 Run quality checks

npm run lint
npm run build
npm run test

Expected outcome:
	•	no lint failures
	•	successful build
	•	tests pass

If tests are not yet present:
	•	npm run test may be absent; add when test harness is introduced

⸻

5.8 Stop stack

docker compose down

Expected outcome:
	•	containers stop
	•	volumes preserved unless explicitly removed

⸻

5.9 Reset local DB (destructive)

docker compose down -v
docker compose up -d db
npx prisma migrate dev --schema apps/web/prisma/schema.prisma

Expected outcome:
	•	DB volume destroyed
	•	fresh Postgres
	•	migrations re-applied

⸻

6. docker-compose Services

This section defines the intended local service contract.

6.1 Required services

web

Responsibilities:
	•	run the Next.js app
	•	connect to Postgres
	•	expose route handlers
	•	use server-side env vars only

db

Responsibilities:
	•	persist application state
	•	support Prisma migrations
	•	act as source of truth for local testing

⸻

6.2 Recommended environment variables for local

Examples only; exact names must follow actual app conventions.

App
	•	DATABASE_URL
	•	AUTH_SECRET
	•	AUTH_URL
	•	NODE_ENV=development

Optional AI
	•	AI_PROVIDER
	•	AI_API_KEY
	•	AI_MODEL_SUMMARY
	•	AI_REQUEST_TIMEOUT_MS

Optional mail
	•	SMTP variables for local testing

⸻

6.3 Volume strategy

Recommended:
	•	persist Postgres data in named volume
	•	do not persist build artifacts across unrelated environments
	•	avoid mounting secrets into version-controlled paths

⸻

7. CI Pipeline Overview

GitHub Actions is the primary CI system.

7.1 What runs on PRs

On every PR, CI should run:
	•	checkout
	•	Node setup
	•	dependency install
	•	lint
	•	type-check if separate
	•	build
	•	tests (unit/integration if present)
	•	optional Prisma validate

If relevant to PR scope:
	•	screenshot/evidence checks may be manually attached, not automated

⸻

7.2 What runs on main

On merge to main, CI should run:
	•	all PR checks
	•	build production artifact
	•	optionally build/push Docker image
	•	optionally deploy to dev/staging/prod depending on release policy

⸻

7.3 Recommended CI gates

PR must not merge if:
	•	lint fails
	•	build fails
	•	migration validation fails
	•	required acceptance evidence missing
	•	route changes are undocumented when contract changed

⸻

7.4 Suggested CI jobs
	•	lint
	•	build
	•	test
	•	prisma-validate
	•	docker-build (if container artifact is built in CI)
	•	deploy-staging or deploy-prod depending on branch policy

⸻

8. DB Migration Procedure

Prisma migrations must be handled carefully because TrustedPlot is stateful and trust-sensitive.

8.1 Dev migration flow

Use in local development when schema changes are intentional.

npx prisma format --schema apps/web/prisma/schema.prisma
npx prisma validate --schema apps/web/prisma/schema.prisma
npx prisma migrate dev --schema apps/web/prisma/schema.prisma --name <migration_name>
npx prisma generate --schema apps/web/prisma/schema.prisma

Rules:
	•	migration name must be descriptive
	•	migration diff must be reviewed in PR
	•	destructive changes must be called out explicitly

⸻

8.2 Staging / Prod migration flow

For shared environments and production, use deploy-style migrations only.

npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

Rules:
	•	no migrate dev in production
	•	migrations must be generated and committed before deployment
	•	migration apply step must be logged
	•	release should halt if migration fails

⸻

8.3 Migration policy
	•	never edit applied migrations casually
	•	do not run schema drift fixes directly in production DB
	•	use explicit backfill scripts if new required fields are introduced
	•	audit high-risk enum/status changes carefully

⸻

9. Secrets Handling Strategy

TrustedPlot handles sensitive systems, so secrets discipline matters.

9.1 Local secrets

Use:
	•	.env.local
	•	or Compose secrets support if preferred

Rules:
	•	never commit secrets
	•	keep local-only secrets separate from shared docs
	•	rotate if accidentally exposed

⸻

9.2 CI secrets

Store in:
	•	GitHub Actions secrets / environment secrets

Rules:
	•	keep least privilege
	•	do not echo secrets in logs
	•	use environment-level separation for staging vs prod
	•	avoid putting provider API keys into PR builds unless required

⸻

9.3 Production secrets

Use whichever secret mechanism your deployment platform supports.

Rules:
	•	secrets must be server-side only
	•	never prefix sensitive server secrets with NEXT_PUBLIC_
	•	rotate on incident
	•	restrict visibility to deploy operators only

⸻

9.4 Sensitive secret categories

Examples:
	•	database URL
	•	Auth.js secret
	•	AI provider keys
	•	payment/escrow keys
	•	mail provider keys
	•	storage credentials

⸻

10. Deployment Procedure

Deployment mode is TBD, so this section is written to support:
	•	self-hosted Docker deployment
	•	managed preview/staging deployment
	•	manual deploy process in early phase

Where exact platform details differ, keep this runbook structure and adjust commands.

⸻

10.1 Standard deployment flow

Step 1 — Confirm readiness

Before deploy:
	•	PR merged
	•	CI green
	•	migration reviewed
	•	required evidence attached
	•	any config changes documented

Step 2 — Build artifact

Depending on platform:
	•	build Docker image
	•	or run production build for managed platform

Step 3 — Apply migrations

Run:

npx prisma migrate deploy --schema apps/web/prisma/schema.prisma

Step 4 — Start new release
	•	deploy app artifact
	•	verify health checks
	•	verify route handlers reachable
	•	verify DB connection

Step 5 — Smoke test

Manually validate:
	•	homepage loads
	•	login works
	•	listing search works
	•	one protected route works
	•	DB-backed action succeeds
	•	admin route still protected

Step 6 — Monitor

Watch:
	•	logs
	•	auth failures
	•	DB errors
	•	AI usage spikes if enabled

⸻

10.2 Rollback Plan

If deployment fails after release:

App rollback
	•	redeploy previous working artifact/image
	•	confirm old version boots cleanly

Migration rollback

Prisma does not provide casual rollback magic for all migrations.
Preferred strategy:
	•	avoid destructive migrations unless necessary
	•	use forward-fix migration if possible
	•	restore from backup only if severe data-impact issue occurs

Operational rollback rules

Rollback if:
	•	app cannot start
	•	DB connectivity broken
	•	auth broken for all users
	•	critical protected workflows fail
	•	migration produces severe schema mismatch

⸻

11. Operational Playbooks

⸻

11.1 Playbook — App won’t start

Symptoms
	•	container exits immediately
	•	Next.js process crashes
	•	health check fails
	•	port 3000 not responding

Checks
	1.	inspect logs
	2.	confirm env vars present
	3.	confirm DB reachable
	4.	confirm build output exists
	5.	confirm no Prisma client mismatch

Commands

docker compose logs web
docker compose ps
docker compose exec web printenv

If running outside container:

npm run build
npm run dev

Common causes
	•	missing DATABASE_URL
	•	invalid AUTH_SECRET
	•	Prisma client not generated
	•	build failure hidden until runtime
	•	port conflict

Resolution
	•	fix env issue
	•	regenerate Prisma client
	•	rebuild image/container
	•	restart service

Evidence to capture
	•	logs
	•	failing command output
	•	screenshot if UI symptom

⸻

11.2 Playbook — DB migration failed

Symptoms
	•	deploy halts during migration
	•	app boots but schema mismatch errors appear
	•	Prisma errors on startup

Checks
	1.	inspect migration logs
	2.	confirm target DB is correct environment
	3.	confirm migration files committed
	4.	validate schema locally
	5.	check for destructive change assumptions

Commands

npx prisma validate --schema apps/web/prisma/schema.prisma
npx prisma migrate status --schema apps/web/prisma/schema.prisma

Common causes
	•	schema drift
	•	missing committed migration
	•	invalid enum change
	•	production data violating new constraint

Resolution
	•	do not hot-edit DB blindly
	•	stop rollout
	•	decide:
	•	fix migration and redeploy
	•	create follow-up forward migration
	•	restore from backup only if necessary

Evidence to capture
	•	migration status output
	•	exact failing migration name
	•	DB error logs

⸻

11.3 Playbook — Auth broken

Symptoms
	•	users cannot log in
	•	sessions expire immediately
	•	protected routes redirect incorrectly
	•	callback/auth URL mismatch

Checks
	1.	confirm AUTH_SECRET
	2.	confirm auth base URL config
	3.	inspect browser cookies/session behavior
	4.	inspect server logs
	5.	confirm session store assumptions

Commands

docker compose logs web

Manual checks:
	•	login flow
	•	page refresh while authenticated
	•	protected route access
	•	logout/login cycle

Common causes
	•	wrong auth secret
	•	wrong callback URL / host URL
	•	cookie domain mismatch
	•	session parsing issue
	•	RBAC regression

Resolution
	•	restore valid auth env config
	•	redeploy
	•	verify protected routes manually

Evidence to capture
	•	auth logs
	•	browser session/cookie behavior
	•	screenshots/recording of failure

⸻

11.4 Playbook — AI costs spiking

Symptoms
	•	sudden increase in provider usage
	•	unexpected request volume
	•	high AI error or retry counts
	•	quota/rate-limit anomalies

Checks
	1.	inspect AI usage logs
	2.	inspect route call counts
	3.	identify user or endpoint concentration
	4.	confirm rate limiting still active
	5.	confirm no accidental client-side exposure

Common causes
	•	abuse or repeated retries
	•	broken UI loop calling summarize repeatedly
	•	missing quota enforcement
	•	provider timeout causing user spam-click retries

Resolution
	•	temporarily disable AI route if needed
	•	tighten rate limits
	•	add UI debounce / button disable
	•	investigate top requesting users
	•	reduce timeout / token caps

Evidence to capture
	•	AI usage logs
	•	provider dashboard snapshot
	•	route frequency logs

⸻

12. On-Call Notes

Even if TrustedPlot is operated by one person initially, on-call discipline matters.

12.1 Minimum solo on-call rules
	•	log every incident
	•	keep one incident note per production issue
	•	classify severity:
	•	Sev 1 = app down / auth down / DB broken
	•	Sev 2 = major feature broken
	•	Sev 3 = minor degradation
	•	always capture:
	•	time detected
	•	symptoms
	•	root cause
	•	resolution
	•	follow-up action

⸻

12.2 Golden operational priorities

When something breaks, prioritize in this order:
	1.	app availability
	2.	auth/session integrity
	3.	DB integrity
	4.	protected workflows
	5.	AI and secondary enhancements

AI is optional. Auth and DB are not.

⸻

12.3 Manual smoke checklist after incident
	•	homepage loads
	•	login works
	•	listing search works
	•	one listing detail opens
	•	one protected page loads
	•	DB-backed mutation works
	•	admin access still restricted properly

⸻

13. PR Checklist

Every infra-affecting PR should include:
	•	clear summary of change
	•	migration impact noted
	•	secrets/config impact noted
	•	local dev changes documented
	•	CI impact noted
	•	rollback note included if relevant
	•	screenshots/recordings if UI-visible infra changes
	•	logs or command output if migration/deploy-related

Required evidence:
	•	CI logs
	•	migration diff or status output if schema changed
	•	local boot evidence for setup changes
	•	screen recording if auth or environment-sensitive UI changed

⸻

14. Expected Outputs / Healthy State

Healthy local state
	•	docker compose ps shows running services
	•	app reachable at localhost:3000
	•	Postgres reachable
	•	Prisma validate passes
	•	lint/build pass

Healthy CI state
	•	PR checks green
	•	no migration validation failure
	•	build artifact successful

Healthy deploy state
	•	app responds
	•	no mass auth failures
	•	DB migrations applied
	•	smoke test passes

⸻

15. Verification Steps

Review checklist
	•	environment model is clear
	•	commands are copy/paste-ready
	•	migration strategy is safe
	•	secrets handling is environment-aware
	•	deployment flow is understandable
	•	rollback guidance exists
	•	operational playbooks cover common incidents

If repo exists, run

docker compose up -d
npx prisma validate --schema apps/web/prisma/schema.prisma
npm install
npm run lint
npm run build

If tests exist:

npm run test

If migration is present:

npx prisma migrate status --schema apps/web/prisma/schema.prisma

Artefacts to capture
	•	local startup screenshot or terminal output
	•	CI run link or screenshot
	•	migration status output
	•	one successful smoke test recording or screenshot
	•	PR diff

⸻

16. Committable Files

Suggested filename

docs/phase-1/08-infra-runbook.md

Branch name

docs/phase1-infra-runbook

PR title

Add Phase 1 infrastructure and runbook for TrustedPlot

Commit message

docs: add Phase 1 infra and runbook for TrustedPlot

**PR description:**  
This PR adds the Phase 1 infrastructure and runbook document for TrustedPlot under `docs/phase-1/08-infra-runbook.md`. It defines local development setup, Docker/Compose workflow, CI expectations, migration procedures, secrets handling, deployment and rollback steps, and incident playbooks for common operational failures. The document is intended to be the baseline operating guide for development, release, and troubleshooting across local, staging, and production environments.