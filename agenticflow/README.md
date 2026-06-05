# AgenticFlow Clean Phase 3 Vertical Slice

This directory is the clean rebuild of the Base44 AgenticFlow prototype. The Base44 project is only a reference.

Valor Struct is not an LLM.
Valor Struct is a governed AI organism that orchestrates LLMs, deterministic engineering engines, knowledge graphs, and capability packs through PatchD governance, P-Agent execution, workflow orchestration, and a provider-agnostic AI Gateway.

Valor Struct is a governed engineering AI organism that uses PatchD governance, P-Agent execution, an AI Gateway, and domain capability packs to generate audited engineering, manufacturing, quotation, drawing, and application outputs.

## Valor Struct Five-Layer AI Organism

```text
┌──────────────────────────────────────────────┐
│                USER REQUEST                  │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│  1. PATCHD GOVERNANCE ORGAN                  │
│  Stability → Policy → Adaptive Learning      │
│  AI Role: fast_low_cost_model /              │
│           policy_reasoning_model /           │
│           reasoning_model                    │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│  2. P-AGENT EXECUTION ORGAN                  │
│  Plan → Select → Execute → Store Memory      │
│  AI Role: reasoning_model                    │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│  3. WORKFLOW ORCHESTRATION CORE              │
│  Intent → Plan → Capability Chain → Audit    │
│  AI Role: orchestration_model                │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│  4. AI GATEWAY + CAPABILITY REGISTRY         │
│  Role Routing → Risk/Cost/Privacy Selection  │
│  Roles, not fixed provider names             │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│  5. GOVERNED CAPABILITY SPECIALISTS          │
│  KG → Steel → Manufacturing → Quotation      │
│  Drawing → Reports → Future App/API          │
└──────────────────────┬───────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│  CONSOLIDATED PACKAGE / APP / API OUTPUT     │
└──────────────────────────────────────────────┘
```

```text
User Request
      ↓
PatchD Governance Organ
      ↓
P-Agent Execution Organ
      ↓
Workflow Orchestration Core
      ↓
AI Gateway + Capability Registry
      ↓
Engineering / Manufacturing / Quotation / Drawing Packs
      ↓
Consolidated Engineering Package / App / API
```


## Patch E — Governance-Controlled Execution & Safety Gates

Patch E makes the provider-agnostic governed organism operationally controlled. It adds capability execution permission levels, human approval gates, risk classification per workflow, model-role request audit trails, fallback rules per model role, sensitive-data routing rules, local/private model routing triggers, and final-output approval status.

Example governance levels:

```text
Level 0: Draft only
Level 1: Internal recommendation
Level 2: Human approval required before external use
Level 3: Licensed expert approval required
Level 4: Prohibited without explicit authorization
```

For BP-01 structural package workflows, the system classifies the package as Level 3 and requires Senior Structural Engineer approval before external use.

## Current scope

Built now:

- `patchd-core/stability/StabilityEngine.ts`
- `patchd-core/governance/GovernancePolicyEngine.ts`
- `patchd-core/execution/CompositeEmitter.ts`
- `patchd-core/execution/RoutingGovernor.ts`
- `patchd-core/audit/InMemoryAuditLog.ts`
- `patchd-core/analytics/AnalyticsPipeline.ts`
- `patchd-core/analytics/AnalyticsStateStore.ts`
- `patchd-core/governance/GovernanceFeedbackLoop.ts`
- `patchd-core/vertical-slice/runVerticalSlice.ts`
- `frontend/src/pages/VerticalSliceDemo.tsx`
- `backend/main.py`

Deferred intentionally:

1. Workspace canvas
2. Mutation validator
3. Workflow executor
4. AI Gateway — model-role routing
5. Healing agent
6. AgenticLoopStudio sandbox
7. P-Agent runtime skeleton
8. App Factory
9. Marketplace

## Demo proof

The first vertical slice proves:

```text
Signal
→ UNSTABLE classification
→ DECREASE_TRAFFIC decision
→ routing weight 1.0 to 0.85
→ audit log entry
→ recovery detected at 5000ms
→ policy weight 1.0 to 1.05
```

Run it from the repository root:

```bash
npm run vertical-slice
```

## End-state planning

The five-layer AI organism architecture is documented in `docs/five-layer-ai-organism.md`. The long-term Valor Struct ecosystem, proprietary IP strategy, AI gateway strategy, Engineering Knowledge Base, Business Consultant AI, Digital Marketing AI, and commercial roadmap are documented in `docs/valor-struct-ecosystem-architecture.md` and `docs/commercial-roadmap.md`. These are planning documents only; the current implementation remains focused on the Patch D vertical slice.

## Phase 3.2 P-Agent Runtime Skeleton

The skeleton runtime now accepts a goal, creates the five-step task plan, runs the Patch D vertical slice, stores the result in in-memory agent memory, and returns an audit summary.

## Phase 5.1 — Backend Persistence + Approval Workflow

The backend now includes SQLite-backed persistence for Patch E governance records: projects, package runs, risk classifications, approval gates, approval decisions, audit events, model-role audit events, and exports. This turns the governed package result into a recoverable approval workflow record instead of a transient demo response.
## Phase 6.0 MVP local auth note

Phase 6.0 uses deterministic local demo authentication for the Valor Struct Demo Workspace only. The demo users share the password `ValorDemo123!`, and sessions are local SQLite-backed demo tokens so package creation and approval authority can be tied to a current user and workspace without introducing external SSO yet.

This is not production identity security. Production hardening should use secure password hashing, token expiry/rotation, bearer-token or cookie-session controls compatible with FastAPI, CSRF/session strategy where applicable, and OWASP-aligned session management and access-control reviews.

## Phase 6.2 — PostgreSQL Migration Path

AgenticFlow still defaults to SQLite for local MVP/demo mode (`AGENTICFLOW_DB_ENGINE=sqlite` and `AGENTICFLOW_SQLITE_PATH=agenticflow_demo.db`). Phase 6.2 adds a production data-layer path without replacing the demo store:

- `agenticflow/backend/db_config.py` centralizes environment-based database configuration and can detect PostgreSQL mode with `AGENTICFLOW_DB_ENGINE=postgres` and `AGENTICFLOW_DATABASE_URL=postgresql://user:password@localhost:5432/agenticflow` without opening a live connection.
- `agenticflow/backend/storage/` adds a lightweight `GovernanceStore` protocol, a SQLite wrapper around the existing persistence store, deterministic seed helper, PostgreSQL schema module, and backup/export helper for MVP data portability.
- `agenticflow/backend/migrations/001_initial_postgres_schema.sql` provides SQL-first PostgreSQL DDL for users, workspaces, memberships, sessions, projects, project parts, package runs, project-level package runs, approvals, audit/model-role events, and exports.
- Alembic is intentionally deferred; production teams can apply the SQL through their deployment migration mechanism of choice.
- Production identity/security still requires hardened password hashing, secret management, token/session expiry, audit retention, backup policy, and access-control review before SaaS launch.

## Phase 6.3 — Deployment Hardening MVP

AgenticFlow now includes deployment-oriented MVP hardening while preserving SQLite as the default deterministic demo store:

- `.env.example` documents backend environment variables for environment, SQLite/PostgreSQL configuration, local auth secret, CORS origins, log level, and demo mode.
- Backend settings, logging, and error helpers centralize startup validation, Python logging configuration, CORS parsing, and a standard error response envelope.
- `/health`, `/ready`, and `/version` provide liveness, readiness, and release metadata for deployment checks.
- `agenticflow/docs/deployment-hardening.md` documents local backend/frontend startup, required environment variables, SQLite demo mode, PostgreSQL future mode, snapshot backup instructions, browser print/PDF workflow, and production hardening warnings.

Production deployments must replace the demo auth secret, disable demo mode, restrict CORS origins, harden auth/session handling, and move beyond SQLite for SaaS-scale operation.

## Current release status — v0.1.0 Pilot RC

AgenticFlow is packaged as `AgenticFlow v0.1.0 Pilot RC`, a deterministic pilot release candidate for investor, internal stakeholder, and pilot customer demos.

Pilot docs:

- Release notes: `docs/release-notes-v0.1.0-pilot-rc.md`
- Demo QA checklist: `docs/pilot-demo-qa-checklist.md`
- Known limitations: `docs/known-limitations-v0.1.0.md`
- Pilot pitch summary: `docs/pilot-pitch-summary.md`
- Pilot walkthrough: `docs/pilot-demo-walkthrough.md`
- Release gate checklist: `docs/pilot-release-gate-checklist.md`

Quick demo sequence:

1. Login as `senior.engineer@valorstruct.local` with `ValorDemo123!`.
2. Open Project Dashboard.
3. Open Pilot Demo Checklist.
4. Run the Canopy Base Plates Demo in Multi-Part Package Console.
5. Review BOQ, manufacturing, quotation, approval, audit/model-role events, and HTML export.

Expected demo totals: material `48.92 kg`, cutting `4 nos`, drilling `8 nos`, welding `3.20 m`, coating `1.10 m2`, labor `3.30 hr`, production `9.80 hr`, quotation `837.94 SAR`.

All pilot outputs remain preliminary and review-required, not for final engineering use.
