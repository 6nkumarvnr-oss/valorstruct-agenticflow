from __future__ import annotations

import json
from typing import Any

SNAPSHOT_TABLES = {
    "users": "users",
    "workspaces": "company_workspaces",
    "memberships": "workspace_memberships",
    "projects": "projects",
    "project_parts": "project_parts",
    "package_runs": "package_runs",
    "project_level_package_runs": "project_level_package_runs",
    "approval_decisions": "approval_decisions",
    "audit_events": "audit_events",
    "model_role_audit_events": "model_role_audit_events",
    "exports": "exports",
}


def _rows(store: Any, table: str) -> list[dict[str, Any]]:
    if not hasattr(store, "connection"):
        return []
    rows = store.connection.execute(f"SELECT * FROM {table} ORDER BY 1").fetchall()
    return [dict(row) for row in rows]


def export_store_snapshot(store: Any) -> dict[str, Any]:
    """Export a deterministic MVP snapshot from a GovernanceStore-compatible object."""
    return {key: _rows(store, table) for key, table in SNAPSHOT_TABLES.items()}


def export_store_snapshot_json(store: Any) -> str:
    return json.dumps(export_store_snapshot(store), sort_keys=True, indent=2)
