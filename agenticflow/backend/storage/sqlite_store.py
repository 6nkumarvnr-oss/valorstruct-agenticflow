from __future__ import annotations

from pathlib import Path
from typing import Any

from ..db_config import get_sqlite_path
from ..persistence import GovernancePersistenceStore


class SQLiteGovernanceStore(GovernancePersistenceStore):
    """SQLite implementation of the GovernanceStore protocol.

    This class intentionally reuses the existing GovernancePersistenceStore so
    Phase 6.2 adds a production migration path without replacing the MVP store.
    """

    def __init__(self, db_path: str | Path | None = None) -> None:
        super().__init__(db_path or get_sqlite_path())

    def list_projects(self) -> list[dict[str, Any]]:
        rows = self.connection.execute("SELECT * FROM projects ORDER BY created_at DESC, id").fetchall()
        return [dict(row) for row in rows]

    def create_audit_event(self, package_run_id: str, event: dict[str, Any]) -> dict[str, Any]:
        existing = self.get_audit_events(package_run_id)
        record = {
            "id": event.get("id", f"audit-{package_run_id}-{len(existing) + 1}"),
            "packageRunId": package_run_id,
            "eventOrder": event.get("eventOrder", len(existing) + 1),
            "eventType": event.get("eventType", event.get("type", "MANUAL_AUDIT_EVENT")),
            "message": event.get("message", "Manual audit event recorded."),
            "payload": event.get("payload", "{}"),
            "createdAt": event.get("createdAt", "2026-06-04T00:00:00.000Z"),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO audit_events
            (id, package_run_id, event_order, event_type, message, payload, created_at)
            VALUES (:id, :packageRunId, :eventOrder, :eventType, :message, :payload, :createdAt)
            """,
            record,
        )
        self.connection.commit()
        return record

    def list_audit_events(self, package_run_id: str) -> list[dict[str, Any]]:
        return self.get_audit_events(package_run_id)

    def create_export(self, package_run_id: str, export: dict[str, Any]) -> dict[str, Any]:
        existing = self.get_exports(package_run_id)
        record = {
            "id": export.get("id", f"export-{package_run_id}-{len(existing) + 1}"),
            "packageRunId": package_run_id,
            "exportType": export.get("exportType", "json"),
            "filename": export.get("filename", f"{package_run_id}.json"),
            "contentHash": export.get("contentHash", "mvp-demo-hash"),
            "createdAt": export.get("createdAt", "2026-06-04T00:00:00.000Z"),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO exports
            (id, package_run_id, export_type, filename, content_hash, created_at)
            VALUES (:id, :packageRunId, :exportType, :filename, :contentHash, :createdAt)
            """,
            record,
        )
        self.connection.commit()
        return record

    def list_exports(self, package_run_id: str) -> list[dict[str, Any]]:
        return self.get_exports(package_run_id)


def create_sqlite_store(db_path: str | Path | None = None) -> SQLiteGovernanceStore:
    return SQLiteGovernanceStore(db_path)
