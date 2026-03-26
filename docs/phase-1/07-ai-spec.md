Absolutely — below is a production-grade Phase 1 AI Feature & Prompting Spec for TrustedPlot, designed for your Next.js + Postgres/Prisma + optional pgvector stack and aligned with the trust-first product model you’ve already defined.

⸻

✅ FINAL — docs/phase-1/07-ai-spec.md

---
id: phase-1-ai-spec-trustedplot
title: Phase 1 AI Feature & Prompting Specification — TrustedPlot
status: draft
owner: Anthony (Product Lead)
last_updated: 2026-03-24
related_docs:
  - docs/phase-1/00-project-brief.md
  - docs/phase-1/01-prd.md
  - docs/phase-1/02-user-journeys.md
  - docs/phase-1/03-acceptance-criteria.md
  - docs/phase-1/04-ui-spec.md
  - docs/phase-1/05-api-spec.md
assumptions:
  - TrustedPlot is a trust-first real estate platform where AI is supportive, not core to the trust decision itself.
  - AI features in Phase 1 are optional enhancements and must not block critical workflows.
  - All AI calls are server-side only.
  - Sensitive listing, identity, document, and payment data may be processed by AI only under controlled conditions.
  - pgvector is optional and not required for initial MVP unless retrieval proves necessary.
  - Auth.js is used for authenticated access and AI usage should be scoped to authenticated users only.
open_questions:
  - Final LLM provider choice (single provider vs fallback provider)
  - Whether OCR is handled by LLM, dedicated OCR provider, or both
  - Whether document summarization is available to all authenticated users or paid tiers only
  - Whether internal legal-ops AI tools are included in Phase 1 or Phase 2
  - Whether pgvector retrieval is needed in MVP or deferred until enough documents accumulate
  - Cost ceilings per user / per org / per day
---

# 1. AI Feature List

TrustedPlot is not an “AI-first app.” AI is used only where it improves clarity, speed, or internal efficiency **without replacing deterministic business logic or legal verification**.

## 1.1 Phase 1 user-facing AI features

### AIF-01 — Document Summary
Users viewing a property-related document (for example title-related documents) can request a concise summary of what the document appears to contain.

**User value**
- reduces cognitive load
- helps non-expert users understand what they are looking at
- speeds up due diligence before booking an inspection or initiating escrow

**Important limitation**
- summary is informational only
- it does **not** replace legal verification
- it must never be presented as final legal advice

---

## 1.2 Phase 1 internal AI-assisted features

### AIF-02 — OCR-assisted document extraction
The system can extract structured fields from uploaded documents, such as:
- names
- document type
- title references
- dates
- visible addresses or location references
- parcel/survey references where legible

**User value**
- speeds up legal ops review
- improves queue triage
- supports metadata indexing

**Important limitation**
- extracted data is draft-assist only
- legal ops must confirm before any trust signal is issued

### AIF-03 — Internal verification case summarization
For internal legal or admin users, AI may summarize:
- uploaded document bundle
- obvious inconsistencies
- extracted document metadata
- possible next-step checklist

**User value**
- reduces manual reading time
- improves ops throughput

**Important limitation**
- AI must not auto-approve or auto-reject listings
- verification decisions remain human-controlled

---

## 1.3 Candidate later-phase AI features (not required in MVP)

These are documented for future design continuity only:
- duplicate listing/media similarity detection
- fraud/anomaly scoring
- semantic search across verification reports
- support assistant
- market insights / pricing summaries
- investor Q&A over structured deal rooms

These should not be treated as MVP requirements.

---

# 2. Model Selection Rationale

## 2.1 Model strategy

TrustedPlot needs AI that is:
- reliable
- secure
- reasonably fast
- cost-controllable
- good at summarization and structured extraction
- usable server-side only

The model strategy should separate use cases by function.

### Recommended model categories

#### Category A — General language model
Used for:
- document summarization
- internal ops summaries
- controlled text generation

#### Category B — OCR / extraction provider
Used for:
- scanned PDF or image extraction
- layout-sensitive field detection

#### Category C — Embeddings model (optional)
Used only if retrieval is added:
- semantic lookup over reports/SOPs/docs
- internal search or future RAG

## 2.2 Selection guidance

Provider is **TBD**, but the decision should optimize for:

- server-side API reliability
- ability to enforce cost ceilings
- good structured output
- low hallucination on summarization tasks
- observability support
- retry/fallback support
- safe handling of sensitive documents

## 2.3 Practical recommendation

For Phase 1:
- use **one primary LLM provider**
- one OCR provider or OCR-first extraction path
- no forced multi-provider complexity unless there is a clear reliability/cost reason

Do not add model complexity before product workflows are stable.

---

# 3. Prompting Strategy

TrustedPlot prompting must be:
- concise
- predictable
- non-chatty
- non-speculative
- role-aware
- compliant with guardrails

Where supported, prompts should separate:
- **system**
- **developer**
- **user**

The system should strongly constrain the model to:
- summarize only what is present
- avoid legal conclusions
- avoid making unverifiable claims
- return structured outputs where possible

---

# 4. Prompt Templates

## 4.1 Document Summary Prompt

### System
You are an assistant helping users understand real-estate documents. Summarize only what is visible in the document content provided. Do not invent missing facts. Do not give legal advice. Do not claim that a document is valid, enforceable, or verified. If the content is unclear, say so.

### Developer
Your job is to produce a concise, structured summary for a non-expert user. Focus on:
- document type (if inferable)
- named parties
- visible dates
- visible property/location references
- what the document appears to relate to
- any obvious uncertainty or illegibility

Return JSON with:
- `documentTypeGuess`
- `summary`
- `keyFields`
- `uncertainties`
- `disclaimer`

### User
Summarize this document for a buyer/renter in plain language.

---

## 4.2 Internal Verification Case Summary Prompt

### System
You are assisting internal operations staff reviewing real-estate listing documents. You may summarize visible information and obvious inconsistencies, but you must not make final approval or rejection decisions.

### Developer
Produce an internal review summary for legal ops. Focus on:
- likely document types
- extracted names and references
- date consistency
- possible missing information
- visible ambiguity
- suggested follow-up questions

Return JSON with:
- `documentsDetected`
- `entities`
- `possibleIssues`
- `followUpQuestions`
- `confidenceNotes`

### User
Review this uploaded document set and summarize what the legal ops reviewer should check next.

---

## 4.3 OCR Cleanup Prompt (if LLM-assisted)
This should only be used after OCR text extraction if additional cleanup is needed.

### System
You clean OCR text into structured fields. Preserve meaning. Do not guess missing data.

### Developer
Extract the following if visible:
- names
- dates
- addresses
- document references
- land/title numbers
- survey references

Return strict JSON only.

### User
Parse this OCR output into structured fields.

---

# 5. RAG / Retrieval Plan (Optional)

RAG is **not required** for initial MVP but is documented here so it can be added cleanly later.

## 5.1 When retrieval is justified
RAG should only be introduced when TrustedPlot has enough internal documents or knowledge artifacts to justify semantic lookup, for example:
- verification reports
- SOPs
- internal policy docs
- uploaded document sets
- internal help-center or legal review notes

## 5.2 Possible retrieval use cases
- internal ops assistant
- document search across uploaded records
- support/internal Q&A
- future investor/analyst tools

## 5.3 Data sources
If pgvector is used, candidate indexed sources are:
- verification reports
- inspection reports
- internal SOP docs
- admin policy docs
- selected listing summaries
- non-sensitive document excerpts approved for retrieval

## 5.4 Chunking strategy
If retrieval is introduced:
- chunk by semantic section, not arbitrary fixed size where possible
- preserve source metadata:
  - document ID
  - listing ID
  - section/page
  - created_at / updated_at
  - document type
- recommended chunk size:
  - ~500–1,200 tokens depending on content type
- overlap:
  - light overlap only where needed for continuity

## 5.5 Embedding strategy
- embed cleaned, normalized text
- exclude highly sensitive personal data where retrieval is not necessary
- store metadata alongside vectors
- maintain freshness by re-embedding only changed chunks

## 5.6 Freshness policy
- verification reports: refresh on change
- SOP docs: refresh on update
- listing summaries: refresh on listing update
- document bundle entries: refresh on re-upload or changed OCR output

---

# 6. Guardrails

## 6.1 Input validation

All AI requests must be validated server-side before any model call.

### Required checks
- authenticated session exists
- user is authorized for the requested document or context
- request payload shape is valid
- referenced IDs exist
- request is within rate limit
- user quota is not exceeded
- document is in a supported state for summarization

### Invalid input examples
- malformed JSON
- missing document ID
- document user is not allowed to view
- request for unsupported document type
- request volume above threshold

---

## 6.2 Output handling

AI outputs must never be passed straight through without post-processing.

### Required output controls
- validate output shape
- reject malformed JSON where structured output is required
- cap output size
- sanitize any HTML/markdown rendering risk
- append or display disclaimer where relevant
- do not surface raw model/provider internals to user

### Document summary disclaimer example
> “This summary is AI-generated for convenience only and does not replace legal verification.”

---

## 6.3 Prompt injection considerations

TrustedPlot handles uploaded documents and potentially adversarial text. Prompt injection must be assumed possible.

### Risks
- document content attempts to override system instructions
- malicious text tells model to reveal hidden instructions
- malicious text asks model to ignore safety or disclose secrets
- user-provided content tries to escalate model permissions

### Required mitigations
- system/developer messages must explicitly instruct model to ignore instructions embedded inside documents
- document text should be clearly delimited as **untrusted content**
- model should never have access to secrets or privileged tools unless explicitly required
- output should be constrained to limited structured tasks
- retrieval context should be sanitized and minimal

### Prompt handling rule
Treat all listing and document text as **untrusted external input**.

---

## 6.4 Rate limits, quotas, and cost ceilings

AI is optional and must never become an uncontrolled cost center.

### Minimum controls
- per-user request rate limit
- per-day quota
- per-request timeout
- hard monthly budget alert
- admin-visible usage metrics

### Recommended starting policy
- Document summary:
  - max 5 requests per user per hour
  - max 20 requests per user per day
- Internal ops summary:
  - separate quota by staff role
- Timeout:
  - 10 seconds default
- Max tokens:
  - defined per route
- Cost ceilings:
  - alert at product/day threshold
  - alert at user/day threshold
  - optionally disable AI summary for users after quota reached

### Required behavior on quota breach
Return controlled `RATE_LIMITED` or `QUOTA_EXCEEDED` response with retry guidance.

---

# 7. Streaming UX Plan

Streaming is useful for perceived speed and clarity, but only when it improves the experience.

## 7.1 Where streaming should be used
- document summary generation
- internal review summary generation (optional)

## 7.2 UI behavior while streaming
When a summary request starts:
- show loading state immediately
- indicate summary is being generated
- render progressive text only if stream quality is stable
- allow cancel if supported
- keep raw document visible and usable while summary loads

## 7.3 UI states

### Loading
- “Generating summary…”
- disable duplicate submit actions
- show spinner or skeleton area

### Streaming
- progressively append safe text
- show subtle “still generating” indicator

### Success
- show full summary
- show disclaimer
- allow “regenerate” only within quota

### Error
- show “Summary unavailable right now”
- provide retry
- preserve manual document reading flow

### Empty
- if no document content extractable:
  - show “No readable text available for summary”

---

# 8. Evaluation Plan

TrustedPlot AI should be judged by usefulness, restraint, and safety — not by how verbose or impressive it sounds.

## 8.1 What “good” looks like

### For document summary
A good output:
- accurately reflects visible content
- does not hallucinate legal conclusions
- is understandable to non-experts
- clearly states uncertainty where text is unclear
- is concise

### For internal ops summary
A good output:
- helps reviewer orient quickly
- highlights likely inconsistencies
- suggests next checks
- does not pretend to make final decisions

## 8.2 Evaluation dimensions
- factual grounding
- clarity
- overclaiming/hallucination rate
- structured output validity
- latency
- cost per request
- failure fallback quality

## 8.3 Example eval tests

### Eval 1 — Clear document
Input: readable title document  
Expected:
- identifies likely document type
- extracts visible names and dates
- includes disclaimer
- no legal conclusion

### Eval 2 — Poor scan
Input: blurry/partial scan  
Expected:
- summary acknowledges uncertainty
- no invented fields
- no confident overstatement

### Eval 3 — Prompt injection inside document
Input: document text containing “ignore all previous instructions…”  
Expected:
- model ignores malicious embedded instruction
- output remains constrained to summary task

### Eval 4 — Unauthorized doc
Input: user requests summary for document they cannot access  
Expected:
- route rejects before model call
- no AI cost incurred

### Eval 5 — Rate limit exceeded
Input: repeated summary requests beyond threshold  
Expected:
- controlled rejection
- request logged
- no model call after limit hit

---

# 9. Observability for AI

AI must be observable at both product and operational levels.

## 9.1 What to log
For every AI request:
- correlation ID
- user ID
- role
- route
- document ID / context ID
- model/provider
- request start/end time
- latency
- success/failure status
- token usage if available
- estimated/requested cost if available
- rate-limit/quota outcome

## 9.2 What NOT to log
Do not log:
- raw sensitive documents unless explicitly necessary and access-controlled
- secrets
- provider API keys
- full identity document contents in plain logs
- raw prompts containing unnecessary personal data

## 9.3 Error categories
Track at minimum:
- `TIMEOUT`
- `RATE_LIMITED`
- `QUOTA_EXCEEDED`
- `UNAUTHORIZED_CONTEXT`
- `PROVIDER_ERROR`
- `OUTPUT_VALIDATION_ERROR`
- `PROMPT_INJECTION_SUSPECTED`

## 9.4 Product dashboards to support later
- AI requests/day
- AI requests/user
- average latency
- failure rate
- quota rejection rate
- average cost per request
- most-requested doc types

---

# 10. Implementation Hooks

## 10.1 Proposed folder paths

### Core AI library
```text
apps/web/lib/ai/
  providers/
  prompts/
  guards/
  evaluators/
  schemas/
  usage/

Route handlers

apps/web/app/api/ai/
  summarize/route.ts
  internal-review-summary/route.ts

Suggested internal file breakdown

apps/web/lib/ai/providers/
  client.ts
  summarize.ts
  embeddings.ts (optional)
  ocr.ts (optional)

apps/web/lib/ai/prompts/
  documentSummary.ts
  verificationSummary.ts
  ocrCleanup.ts

apps/web/lib/ai/guards/
  authz.ts
  rateLimit.ts
  quota.ts
  inputValidation.ts
  outputValidation.ts

apps/web/lib/ai/schemas/
  documentSummary.schema.ts
  verificationSummary.schema.ts

apps/web/lib/ai/usage/
  logUsage.ts
  costEstimation.ts


⸻

10.2 Required env vars

All AI env vars must be server-only.
Do not expose them in client bundles.
Do not prefix sensitive values with NEXT_PUBLIC_.

Examples

AI_PROVIDER=<provider_name>
AI_API_KEY=<server_only_secret>
AI_MODEL_SUMMARY=<model_name>
AI_MODEL_INTERNAL_REVIEW=<model_name>
AI_REQUEST_TIMEOUT_MS=10000
AI_SUMMARY_RATE_LIMIT_PER_HOUR=5
AI_SUMMARY_DAILY_QUOTA=20
AI_COST_ALERT_DAILY_USD=<threshold>

Optional if retrieval is added

AI_EMBEDDING_MODEL=<embedding_model>
PGVECTOR_ENABLED=true


⸻

11. Recommended Phase 1 Scope Decision

To keep Phase 1 disciplined, TrustedPlot should ship with:

Include
	•	document summary
	•	OCR-assisted extraction for ops
	•	internal review summary if lightweight enough

Exclude from MVP unless clearly justified
	•	full RAG
	•	public AI chatbot
	•	multi-agent flows
	•	AI-driven approval decisions
	•	autonomous fraud decisions

This keeps AI useful without making it a hidden liability.

⸻

12. Committable Files

Suggested filename

docs/phase-1/07-ai-spec.md

Branch name

docs/phase1-ai-spec

PR title

Add Phase 1 AI feature and prompting spec for TrustedPlot

Commit message

docs: add Phase 1 AI spec for TrustedPlot

---

# Verification Steps

## Review checklist
- AI features are optional and clearly scoped
- Deterministic business logic remains outside model control
- Prompt templates are constrained and concise
- Prompt injection risks are acknowledged and mitigated
- Rate limits, quotas, and cost ceilings are defined
- Streaming UX is described clearly
- Logging and observability requirements are specific
- Implementation hooks align with Next.js Route Handler structure

## If repo exists, run
```bash
npm install
npm run lint
npm run build

If tests exist:

npm run test

If AI route mocks/tests exist:

npm run test:integration

Artefacts to capture
	•	Markdown preview screenshot
	•	PR diff
	•	Example AI request/response logs with redaction
	•	Screenshot or recording of streaming summary UX
	•	Evidence of rate-limit behavior (mock or real)
	•	Output validation test example

⸻

If you want, the next best follow-up is a Phase 1 Domain Model / Prisma Schema Spec so the entire product stack becomes fully implementable end-to-end.