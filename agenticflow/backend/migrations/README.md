# AgenticFlow PostgreSQL Migration Path

Phase 6.2 keeps SQLite as the default local/demo database while preparing an SQL-first PostgreSQL path for production/SaaS deployments.

## Files

- `001_initial_postgres_schema.sql` — PostgreSQL-ready schema for demo auth, workspaces, package governance, project parts, project-level package runs, audit/model-role trails, and exports.

## Notes

- Alembic is intentionally not introduced yet.
- Tests must not require a live PostgreSQL database.
- Production deployments should apply the SQL using the platform migration mechanism of choice and then harden credentials, secrets, backups, token/session expiry, and access-control policy.
