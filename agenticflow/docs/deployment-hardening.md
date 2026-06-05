# Phase 6.3 — Deployment Hardening MVP

AgenticFlow remains a deterministic demo/MVP stack, but Phase 6.3 adds the configuration and checks needed to run it more reliably outside local Codex development.

## Local backend startup

1. Copy `.env.example` to `.env` and keep SQLite defaults for local development.
2. Start the FastAPI app with your preferred local ASGI runner, for example `uvicorn agenticflow.backend.main:app --reload` when FastAPI/Uvicorn are installed.
3. Check `GET /health`, `GET /ready`, and `GET /version` before using the consoles.

## Local frontend startup

1. Copy `agenticflow/frontend/.env.example` to `agenticflow/frontend/.env`.
2. Set `VITE_AGENTICFLOW_API_BASE_URL=http://localhost:8000` for a local backend.
3. Run the Vite frontend from `agenticflow/frontend` with `npm run dev` when dependencies are installed.

## Required environment variables

- `AGENTICFLOW_ENV` — `development` by default; set to `production` for deployment checks.
- `AGENTICFLOW_DB_ENGINE` — `sqlite` by default; PostgreSQL mode is prepared but does not require a live database in tests.
- `AGENTICFLOW_SQLITE_PATH` — SQLite demo database path.
- `AGENTICFLOW_DATABASE_URL` — PostgreSQL URL for future production/SaaS deployment.
- `AGENTICFLOW_AUTH_SECRET` — demo value must be replaced before production.
- `AGENTICFLOW_CORS_ORIGINS` — comma-separated allowed browser origins.
- `AGENTICFLOW_LOG_LEVEL` — standard Python logging level.
- `AGENTICFLOW_DEMO_MODE` — keep `true` locally; disable for production hardening.

## SQLite demo mode

SQLite remains the default for deterministic local demos, package history, approval testing, and project-level BP-01/BP-02/BR-01 workflows.

## PostgreSQL future mode

Phase 6.2 added SQL-first PostgreSQL migration files under `agenticflow/backend/migrations/`. Phase 6.3 does not require a live PostgreSQL server and does not introduce Alembic yet.

## Health/readiness checks

- `/health` confirms the service process is alive.
- `/ready` reports environment, database engine, demo mode, auth mode, persistence readiness, CORS origins, log level, and non-fatal startup warnings.
- `/version` identifies AgenticFlow, the current phase, version, and the five-layer governed AI organism architecture.

## Browser print/PDF workflow

The governed package exporters continue to produce markdown, HTML, JSON, and PDF-like stream outputs. For MVP browser workflows, open the HTML export and use browser print-to-PDF for review packets.

## Backup / snapshot instruction

Owner/Admin demo users can call the storage snapshot helper to export MVP data portability snapshots. Use this before local database resets or before testing migration paths.

## Production hardening checklist

- Replace `AGENTICFLOW_AUTH_SECRET` with a strong secret.
- Disable `AGENTICFLOW_DEMO_MODE`.
- Move from SQLite demo storage to PostgreSQL.
- Restrict CORS origins to deployed frontend domains.
- Add token expiry, secure password hashing, CSRF/session strategy where applicable, and external identity only in a later phase.
- Configure structured logs, backups, monitoring, and deployment-specific secrets management.

## Auth hardening warning

Current auth is local deterministic MVP auth only. Production should harden password hashing, token storage/expiry, access-control policy, and secret management before customer data is used.
