# AgenticFlow Next Stage Plan

Valor Struct is not an LLM.
Valor Struct is a governed AI organism that orchestrates LLMs, deterministic engineering engines, knowledge graphs, and capability packs through PatchD governance, P-Agent execution, workflow orchestration, and a provider-agnostic AI Gateway.

Valor Struct is a governed engineering AI organism that uses PatchD governance, P-Agent execution, an AI Gateway, and domain capability packs to generate audited engineering, manufacturing, quotation, drawing, and application outputs.

## Valor Struct Five-Layer AI Organism

```text
User Request
      ↓
1. PatchD Governance Organ
      ↓
2. P-Agent Execution Organ
      ↓
3. Workflow Orchestration Core
      ↓
4. AI Gateway + Capability Registry
      ↓
5. Capability Packs / Domain Specialists
      ↓
Consolidated Engineering Package / App / API
```

After the Patch D organism vertical slice is stable, keep sequencing aligned to the five-layer governed AI organism:

```text
1. PatchD — Governance
2. P-Agent — Execution
3. Workflow Orchestration — Multi-step coordination
4. AI Gateway — Model-role routing
5. Capability Packs — Domain specialists
```

1. PatchD governance refinements
2. P-Agent execution hardening
3. Workflow Orchestration Core hardening
4. AI Gateway — model-role routing
5. Governed Capability Specialists for engineering outputs
6. Engineering package console hardening
7. App Factory remains deferred

Do not start the App Factory, marketplace, or broad Base44 clone until the governed workspace loop is working end-to-end.

## Commercial expansion order

After the governed workspace loop and Engineering AI MVP are working, expand in this order:

1. Engineering AI MVP
2. Shop Drawing + BOQ
3. Business Consultant AI
4. Digital Marketing AI
5. App Factory
6. Agent Marketplace

Digital Marketing AI and Business Consultant AI should become revenue modules, but not before the governance kernel and engineering workflows are stable.

## Patch E — Governance-Controlled Execution & Safety Gates

Patch E makes the five-layer organism operationally controlled instead of adding more random modules.

It adds the rule system that decides:

- what can run automatically
- what must be reviewed
- what must be approved by a human
- what must be approved by a licensed engineer
- what must never be sent externally without permission

Governance levels:

| Level | Meaning | Example |
| --- | --- | --- |
| Level 0 | Draft only | Internal scratch report |
| Level 1 | Internal recommendation | CRM lead summary |
| Level 2 | Human approval required before external use | Quotation draft or public marketing content |
| Level 3 | Licensed expert approval required | Structural design report |
| Level 4 | Prohibited without explicit authorization | External release without authorization |

Patch E safety controls include capability execution permission levels, human approval gates, workflow risk classification, model-role request audit trails, fallback rules per AI Gateway role, sensitive-data routing rules, local/private model routing triggers, and final-output approval status.

## Phase 5.1 — Backend Persistence + Approval Workflow

Phase 5.1 stores Patch E decisions instead of leaving governance controls as transient runtime output.

Persistent records now cover:

- `projects`
- `package_runs`
- `risk_classifications`
- `approval_gates`
- `approval_decisions`
- `audit_events`
- `model_role_audit_events`
- `exports`

The backend exposes persistence helpers for creating projects, persisting package runs, reading package run details, recording approval decisions, and inspecting the schema. This keeps package approval state, model-role audit trails, sensitive-data route decisions, and exports available for later console/API hardening.

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


## Governed Swarm Reasoning Protocol addition

The next-stage architecture now includes a controlled research-protocol layer named Governed Swarm Reasoning Protocol (GSRP). The implementation adds:

```text
Agent registry
Capability contracts
Swarm run result structure
Backend /governed-swarm/run endpoint
Frontend GovernedSwarmConsole page module
Research protocol documentation
JSON schemas
```

This layer must remain governed by PatchD and must require human approval for engineering, quotation, manufacturing, deployment, legal, or public-release decisions.

Software architecture draft prepared for human review and approval.


## GSRP Phase 6 persistence update

Phase 6 adds persistent storage and approval history for Governed Swarm Reasoning Protocol runs. New backend tables are `gsrp_runs` and `gsrp_approval_decisions`; new API endpoints support creating, listing, retrieving, and approving/rejecting/revision-requesting GSRP runs. A new `GovernedSwarmHistoryConsole` page module demonstrates the approval history UI pattern.

Software architecture draft prepared for human review and approval.
