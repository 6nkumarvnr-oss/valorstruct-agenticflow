from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any


SCHEMA_TABLES = [
    "roles",
    "users",
    "company_workspaces",
    "workspace_memberships",
    "auth_sessions",
    "projects",
    "package_runs",
    "project_parts",
    "project_level_package_runs",
    "risk_classifications",
    "approval_gates",
    "approval_decisions",
    "audit_events",
    "model_role_audit_events",
    "exports",
    "gsrp_runs",
    "gsrp_approval_decisions",
]

REQUIRED_ROLES = [
    "Owner",
    "Admin",
    "Senior Structural Engineer",
    "Engineer",
    "Reviewer",
    "Viewer",
    "Agent",
]

DEMO_USERS = [
    {"userId": "user-owner", "email": "owner@valorstruct.local", "displayName": "Valor Struct Owner", "role": "Owner"},
    {"userId": "user-admin", "email": "admin@valorstruct.local", "displayName": "Valor Struct Admin", "role": "Admin"},
    {"userId": "user-senior-engineer", "email": "senior.engineer@valorstruct.local", "displayName": "Senior Structural Engineer", "role": "Senior Structural Engineer"},
    {"userId": "user-engineer", "email": "engineer@valorstruct.local", "displayName": "Project Engineer", "role": "Engineer"},
    {"userId": "user-reviewer", "email": "reviewer@valorstruct.local", "displayName": "Package Reviewer", "role": "Reviewer"},
    {"userId": "user-viewer", "email": "viewer@valorstruct.local", "displayName": "Read-only Viewer", "role": "Viewer"},
    {"userId": "user-agent", "email": "agent@valorstruct.local", "displayName": "AgenticFlow Agent", "role": "Agent"},
]

DEMO_PASSWORD = "ValorDemo123!"
DEMO_PASSWORD_MARKER = "mvp-demo-password-marker:ValorDemo123!"
DEMO_WORKSPACE_ID = "valor-demo-workspace"
DEMO_WORKSPACE_NAME = "Valor Struct Demo Workspace"
DEMO_CREATED_AT = "2026-06-03T00:00:00.000Z"

APPROVAL_AUTHORITY_BY_LEVEL = {
    0: ["Agent", "Engineer", "Reviewer", "Admin", "Owner"],
    1: ["Engineer", "Reviewer", "Admin", "Owner"],
    2: ["Reviewer", "Senior Structural Engineer", "Admin", "Owner"],
    3: ["Senior Structural Engineer", "Admin", "Owner"],
    4: ["Owner"],
}

DEFAULT_APPROVER_EMAIL = "senior.engineer@valorstruct.local"


class GovernancePersistenceStore:
    """SQLite-backed persistence for Patch E package governance records."""

    def __init__(self, db_path: str | Path = ":memory:") -> None:
        self.db_path = str(db_path)
        self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.initialize_schema()

    def close(self) -> None:
        self.connection.close()

    def __enter__(self) -> "GovernancePersistenceStore":
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        self.close()

    def initialize_schema(self) -> None:
        self.connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS roles (
                name TEXT PRIMARY KEY,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT NOT NULL UNIQUE,
                email TEXT PRIMARY KEY,
                display_name TEXT NOT NULL,
                role TEXT NOT NULL REFERENCES roles(name),
                password_hash TEXT NOT NULL,
                status TEXT NOT NULL,
                active INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS company_workspaces (
                workspace_id TEXT PRIMARY KEY,
                company_name TEXT NOT NULL,
                owner_user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                active INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS workspace_memberships (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
                user_id TEXT NOT NULL REFERENCES users(user_id),
                role TEXT NOT NULL REFERENCES roles(name),
                active INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS auth_sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(user_id),
                workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
                issued_at TEXT NOT NULL,
                active INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                client_name TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS package_runs (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id),
                workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
                created_by_user_id TEXT NOT NULL REFERENCES users(user_id),
                created_by_email TEXT NOT NULL REFERENCES users(email),
                request TEXT NOT NULL,
                status TEXT NOT NULL,
                package_id TEXT NOT NULL,
                revision TEXT NOT NULL,
                approval_status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS project_parts (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id),
                workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
                part_id TEXT NOT NULL,
                drawing_note TEXT NOT NULL,
                material TEXT NOT NULL,
                dimensions TEXT NOT NULL,
                source_data TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS project_level_package_runs (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL REFERENCES projects(id),
                workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
                project_name TEXT NOT NULL,
                parts_json TEXT NOT NULL,
                combined_boq_summary_json TEXT NOT NULL,
                combined_manufacturing_summary_json TEXT NOT NULL,
                combined_quotation_summary_json TEXT NOT NULL,
                approval_status TEXT NOT NULL,
                created_by_email TEXT NOT NULL REFERENCES users(email),
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS risk_classifications (
                id TEXT PRIMARY KEY,
                package_run_id TEXT NOT NULL REFERENCES package_runs(id),
                workflow_type TEXT NOT NULL,
                level INTEGER NOT NULL,
                label TEXT NOT NULL,
                required_approver TEXT NOT NULL,
                rationale TEXT NOT NULL,
                blocked INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS approval_gates (
                id TEXT PRIMARY KEY,
                package_run_id TEXT NOT NULL REFERENCES package_runs(id),
                gate_id TEXT NOT NULL,
                required INTEGER NOT NULL,
                required_approver TEXT NOT NULL,
                status TEXT NOT NULL,
                reason TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS approval_decisions (
                id TEXT PRIMARY KEY,
                approval_gate_id TEXT NOT NULL REFERENCES approval_gates(id),
                decision TEXT NOT NULL,
                decided_by TEXT NOT NULL,
                user_email TEXT NOT NULL REFERENCES users(email),
                user_role TEXT NOT NULL,
                reason TEXT NOT NULL,
                decided_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS audit_events (
                id TEXT PRIMARY KEY,
                package_run_id TEXT NOT NULL REFERENCES package_runs(id),
                event_order INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                message TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS model_role_audit_events (
                id TEXT PRIMARY KEY,
                package_run_id TEXT NOT NULL REFERENCES package_runs(id),
                event_order INTEGER NOT NULL,
                capability TEXT NOT NULL,
                task TEXT NOT NULL,
                requested_role TEXT NOT NULL,
                selected_model_ref TEXT NOT NULL,
                fallback_role TEXT NOT NULL,
                sensitive_data_route_role TEXT NOT NULL,
                reason TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS exports (
                id TEXT PRIMARY KEY,
                package_run_id TEXT NOT NULL REFERENCES package_runs(id),
                export_type TEXT NOT NULL,
                filename TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS gsrp_runs (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL REFERENCES company_workspaces(workspace_id),
                created_by_email TEXT NOT NULL REFERENCES users(email),
                request TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                governance_decision TEXT NOT NULL,
                human_approval_required INTEGER NOT NULL,
                approval_status TEXT NOT NULL,
                selected_agents_json TEXT NOT NULL,
                capability_contracts_json TEXT NOT NULL,
                selected_plan_json TEXT NOT NULL,
                candidate_outputs_json TEXT NOT NULL,
                critiques_json TEXT NOT NULL,
                verification_json TEXT NOT NULL,
                audit_events_json TEXT NOT NULL,
                result_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS gsrp_approval_decisions (
                id TEXT PRIMARY KEY,
                gsrp_run_id TEXT NOT NULL REFERENCES gsrp_runs(id),
                decision TEXT NOT NULL,
                decided_by TEXT NOT NULL,
                user_email TEXT NOT NULL REFERENCES users(email),
                user_role TEXT NOT NULL,
                reason TEXT NOT NULL,
                decided_at TEXT NOT NULL
            );
            """
        )
        self.seed_demo_auth_data()
        self.connection.commit()

    def seed_demo_users(self) -> None:
        self.seed_demo_auth_data()

    def seed_demo_auth_data(self) -> None:
        for role in REQUIRED_ROLES:
            self.connection.execute(
                "INSERT OR REPLACE INTO roles (name, created_at) VALUES (?, ?)",
                (role, DEMO_CREATED_AT),
            )
        for user in DEMO_USERS:
            self.connection.execute(
                """
                INSERT OR REPLACE INTO users (user_id, email, display_name, role, password_hash, status, active, created_at)
                VALUES (:userId, :email, :displayName, :role, :passwordHash, :status, :active, :createdAt)
                """,
                {
                    **user,
                    "passwordHash": DEMO_PASSWORD_MARKER,
                    "status": "active",
                    "active": 1,
                    "createdAt": DEMO_CREATED_AT,
                },
            )
        self.connection.execute(
            """
            INSERT OR REPLACE INTO company_workspaces
            (workspace_id, company_name, owner_user_id, created_at, active)
            VALUES (?, ?, ?, ?, ?)
            """,
            (DEMO_WORKSPACE_ID, DEMO_WORKSPACE_NAME, "user-owner", DEMO_CREATED_AT, 1),
        )
        for user in DEMO_USERS:
            self.connection.execute(
                """
                INSERT OR REPLACE INTO workspace_memberships
                (id, workspace_id, user_id, role, active)
                VALUES (?, ?, ?, ?, ?)
                """,
                (f"membership-{user['userId']}", DEMO_WORKSPACE_ID, user["userId"], user["role"], 1),
            )

    def table_names(self) -> list[str]:
        rows = self.connection.execute("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").fetchall()
        return [str(row["name"]) for row in rows]

    def create_project(self, project: dict[str, Any]) -> dict[str, Any]:
        record = {
            "id": project.get("id", "project-bp-01"),
            "name": project.get("name", "BP-01 Fabrication Package"),
            "clientName": project.get("clientName", "Valor Struct Demo Client"),
            "status": project.get("status", "active"),
            "createdAt": project.get("createdAt", "2026-06-03T00:00:00.000Z"),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO projects (id, name, client_name, status, created_at)
            VALUES (:id, :name, :clientName, :status, :createdAt)
            """,
            record,
        )
        self.connection.commit()
        return record

    def create_project_part(self, part: dict[str, Any]) -> dict[str, Any]:
        record = {
            "id": part.get("id", f"project-part-{part.get('projectId', 'project-multi-part')}-{part.get('partId', 'part')}"),
            "projectId": part.get("projectId", "valor-demo-project-multi-part"),
            "workspaceId": part.get("workspaceId", DEMO_WORKSPACE_ID),
            "partId": part["partId"],
            "drawingNote": part["drawingNote"],
            "material": part.get("material", "S275"),
            "dimensions": part.get("dimensions", "400x400x20"),
            "sourceData": json.dumps(part.get("sourceData", part), sort_keys=True),
            "createdAt": part.get("createdAt", DEMO_CREATED_AT),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO project_parts
            (id, project_id, workspace_id, part_id, drawing_note, material, dimensions, source_data, created_at)
            VALUES (:id, :projectId, :workspaceId, :partId, :drawingNote, :material, :dimensions, :sourceData, :createdAt)
            """,
            record,
        )
        self.connection.commit()
        return {**record, "sourceData": json.loads(record["sourceData"])}

    def list_project_parts(self, project_id: str) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            "SELECT * FROM project_parts WHERE project_id = ? ORDER BY part_id",
            (project_id,),
        ).fetchall()
        return [_project_part_row_to_dict(row) for row in rows]

    def persist_project_level_package_run(self, payload: dict[str, Any]) -> dict[str, Any]:
        project = self.create_project({
            "id": payload.get("projectId", "valor-demo-project-multi-part"),
            "name": payload.get("projectName", "Valor Struct Multi-Part Demo Project"),
            "clientName": payload.get("clientName", "Valor Struct Demo Client"),
            "status": "active",
            "createdAt": payload.get("createdAt", DEMO_CREATED_AT),
        })
        workspace_id = str(payload.get("workspaceId", DEMO_WORKSPACE_ID))
        parts = list(payload.get("parts", []))
        for part in parts:
            self.create_project_part({
                **part,
                "projectId": project["id"],
                "workspaceId": workspace_id,
                "createdAt": payload.get("createdAt", DEMO_CREATED_AT),
            })
        record = {
            "id": payload.get("id", f"project-level-package-{project['id']}-001"),
            "projectId": project["id"],
            "workspaceId": workspace_id,
            "projectName": project["name"],
            "partsJson": json.dumps(parts, sort_keys=True),
            "combinedBoqSummaryJson": json.dumps(payload.get("combinedBOQSummary", {}), sort_keys=True),
            "combinedManufacturingSummaryJson": json.dumps(payload.get("combinedManufacturingSummary", {}), sort_keys=True),
            "combinedQuotationSummaryJson": json.dumps(payload.get("combinedQuotationSummary", {}), sort_keys=True),
            "approvalStatus": payload.get("approvalStatus", "requires-review"),
            "createdByEmail": payload.get("createdByEmail", "agent@valorstruct.local"),
            "createdAt": payload.get("createdAt", DEMO_CREATED_AT),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO project_level_package_runs
            (id, project_id, workspace_id, project_name, parts_json, combined_boq_summary_json, combined_manufacturing_summary_json, combined_quotation_summary_json, approval_status, created_by_email, created_at)
            VALUES (:id, :projectId, :workspaceId, :projectName, :partsJson, :combinedBoqSummaryJson, :combinedManufacturingSummaryJson, :combinedQuotationSummaryJson, :approvalStatus, :createdByEmail, :createdAt)
            """,
            record,
        )
        self.connection.commit()
        return self.get_project_level_package_run(str(record["id"]))

    def get_project_level_package_run(self, package_run_id: str) -> dict[str, Any]:
        row = self.connection.execute(
            "SELECT * FROM project_level_package_runs WHERE id = ?",
            (package_run_id,),
        ).fetchone()
        if row is None:
            raise ValueError(f"Project-level package run {package_run_id} was not found")
        return _project_level_package_row_to_dict(row)

    def list_project_level_package_runs(self) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            "SELECT * FROM project_level_package_runs ORDER BY created_at DESC, id",
        ).fetchall()
        return [_project_level_package_row_to_dict(row) for row in rows]

    def list_package_runs(self) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT package_runs.*, projects.name AS project_name, projects.client_name AS client_name
            FROM package_runs
            JOIN projects ON projects.id = package_runs.project_id
            ORDER BY package_runs.created_at DESC, package_runs.id
            """
        ).fetchall()
        return [
            {
                **_package_run_row_to_dict(row),
                "projectName": row["project_name"],
                "clientName": row["client_name"],
            }
            for row in rows
        ]

    def create_package_run(self, payload: dict[str, Any]) -> dict[str, Any]:
        project = self.create_project(payload["project"])
        run = payload["packageRun"]
        created_by_email = str(run.get("createdByEmail", "agent@valorstruct.local"))
        created_by_user = self.get_user(created_by_email)
        run_record = {
            "id": run.get("id", "package-run-bp-01-001"),
            "projectId": project["id"],
            "workspaceId": run.get("workspaceId", DEMO_WORKSPACE_ID),
            "createdByUserId": run.get("createdByUserId", created_by_user["userId"]),
            "createdByEmail": created_by_email,
            "request": run["request"],
            "status": run.get("status", "completed"),
            "packageId": run.get("packageId", "VS-BP-01-ENG-FAB-PKG"),
            "revision": run.get("revision", "Rev 00"),
            "approvalStatus": run.get("approvalStatus", "requires-review"),
            "createdAt": run.get("createdAt", DEMO_CREATED_AT),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO package_runs
            (id, project_id, workspace_id, created_by_user_id, created_by_email, request, status, package_id, revision, approval_status, created_at)
            VALUES (:id, :projectId, :workspaceId, :createdByUserId, :createdByEmail, :request, :status, :packageId, :revision, :approvalStatus, :createdAt)
            """,
            run_record,
        )

        self._replace_risk_classification(run_record["id"], payload["riskClassification"])
        self._replace_approval_gate(run_record["id"], payload["approvalGate"])
        self._replace_audit_events(run_record["id"], payload.get("auditEvents", []))
        self._replace_model_role_audit_events(run_record["id"], payload.get("modelRoleAuditEvents", []))
        self._replace_exports(run_record["id"], payload.get("exports", []))
        self.connection.commit()
        return self.get_package_run(run_record["id"])

    def list_users(self) -> list[dict[str, Any]]:
        rows = self.connection.execute("SELECT * FROM users ORDER BY email").fetchall()
        return [_public_user_dict(row) for row in rows]

    def get_user(self, email: str) -> dict[str, Any]:
        row = self.connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if row is None:
            raise ValueError(f"User {email} was not found")
        return _public_user_dict(row)

    def authenticate_user(self, email: str, password: str) -> dict[str, Any] | None:
        """Validate deterministic MVP local auth credentials for demo users only."""
        row = self.connection.execute(
            "SELECT * FROM users WHERE email = ? AND active = 1",
            (email,),
        ).fetchone()
        if row is None or password != DEMO_PASSWORD or row["password_hash"] != DEMO_PASSWORD_MARKER:
            return None
        return _public_user_dict(row)

    def issue_demo_token(self, user: dict[str, Any]) -> str:
        workspace = self.get_current_workspace(str(user["userId"]))
        token = f"demo-token-{user['userId']}"
        self.connection.execute(
            """
            INSERT OR REPLACE INTO auth_sessions (token, user_id, workspace_id, issued_at, active)
            VALUES (?, ?, ?, ?, ?)
            """,
            (token, user["userId"], workspace["workspaceId"], DEMO_CREATED_AT, 1),
        )
        self.connection.commit()
        return token

    def logout_token(self, token: str) -> dict[str, Any]:
        self.connection.execute("UPDATE auth_sessions SET active = 0 WHERE token = ?", (token,))
        self.connection.commit()
        return {"loggedOut": True, "token": token}

    def get_current_user_from_token(self, token: str | None) -> dict[str, Any]:
        if not token:
            raise PermissionError("Authentication token is required.")
        normalized_token = token.removeprefix("Bearer ").strip()
        row = self.connection.execute(
            """
            SELECT users.* FROM auth_sessions
            JOIN users ON users.user_id = auth_sessions.user_id
            WHERE auth_sessions.token = ? AND auth_sessions.active = 1 AND users.active = 1
            """,
            (normalized_token,),
        ).fetchone()
        if row is None:
            raise PermissionError("Authentication token is invalid or expired for this MVP demo session.")
        return _public_user_dict(row)

    def list_workspaces_for_user(self, user_id: str) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT company_workspaces.*, workspace_memberships.role AS membership_role
            FROM company_workspaces
            JOIN workspace_memberships ON workspace_memberships.workspace_id = company_workspaces.workspace_id
            WHERE workspace_memberships.user_id = ? AND workspace_memberships.active = 1 AND company_workspaces.active = 1
            ORDER BY company_workspaces.workspace_id
            """,
            (user_id,),
        ).fetchall()
        return [_row_to_camel_dict(row) for row in rows]

    def get_current_workspace(self, user_id: str) -> dict[str, Any]:
        workspaces = self.list_workspaces_for_user(user_id)
        if not workspaces:
            raise PermissionError(f"User {user_id} does not belong to an active workspace.")
        return workspaces[0]

    def require_role(self, user: dict[str, Any], allowed_roles: list[str]) -> dict[str, Any]:
        if user.get("role") not in allowed_roles:
            raise PermissionError(f"{user.get('role')} is not allowed; requires one of: {', '.join(allowed_roles)}.")
        return user

    def require_workspace_access(self, user: dict[str, Any], workspace_id: str) -> dict[str, Any]:
        row = self.connection.execute(
            """
            SELECT 1 FROM workspace_memberships
            WHERE workspace_id = ? AND user_id = ? AND active = 1
            """,
            (workspace_id, user["userId"]),
        ).fetchone()
        if row is None:
            raise PermissionError(f"User {user['email']} does not have access to workspace {workspace_id}.")
        return user

    def require_approval_authority_for_package(self, user: dict[str, Any], package_run_id: str) -> dict[str, Any]:
        run = self.get_package_run(package_run_id)["packageRun"]
        self.require_workspace_access(user, run["workspaceId"])
        level = self._package_risk_level(package_run_id)
        authority = self.check_approval_authority(str(user["email"]), level)
        if not authority["allowed"]:
            raise PermissionError(authority["reason"])
        return authority

    def record_approval_decision_for_user(self, package_run_id: str, user: dict[str, Any], decision: str, reason: str) -> dict[str, Any]:
        self.require_approval_authority_for_package(user, package_run_id)
        return self.record_approval_decision(
            package_run_id,
            {
                "decision": decision,
                "decidedBy": user["displayName"],
                "userEmail": user["email"],
                "reason": reason,
                "decidedAt": DEMO_CREATED_AT,
            },
        )

    def check_approval_authority(self, user_email: str, level: int) -> dict[str, Any]:
        user = self.get_user(user_email)
        normalized_level = int(level)
        allowed_roles = APPROVAL_AUTHORITY_BY_LEVEL.get(normalized_level, [])
        allowed = user["role"] in allowed_roles
        return {
            "userEmail": user["email"],
            "userRole": user["role"],
            "level": normalized_level,
            "allowed": allowed,
            "allowedRoles": allowed_roles,
            "reason": (
                f"{user['role']} can approve Level {normalized_level}."
                if allowed
                else f"{user['role']} cannot approve Level {normalized_level}; requires one of: {', '.join(allowed_roles)}."
            ),
        }

    def record_approval_decision(self, package_run_id: str, decision: dict[str, Any]) -> dict[str, Any]:
        gate = self.connection.execute(
            "SELECT id FROM approval_gates WHERE package_run_id = ? ORDER BY id LIMIT 1",
            (package_run_id,),
        ).fetchone()
        if gate is None:
            raise ValueError(f"No approval gate found for package run {package_run_id}")

        risk_level = self._package_risk_level(package_run_id)
        user_email = str(decision.get("userEmail") or DEFAULT_APPROVER_EMAIL)
        user = self.get_user(user_email)
        authority = self.check_approval_authority(user_email, risk_level)
        requested_decision = str(decision["decision"])
        effective_decision = requested_decision if authority["allowed"] else "blocked"
        reason = decision.get("reason", "Approval decision recorded.")
        if not authority["allowed"]:
            reason = f"Approval blocked: {authority['reason']} Requested decision: {requested_decision}. {reason}"

        decision_record = {
            "id": decision.get("id", f"approval-decision-{package_run_id}-001"),
            "approvalGateId": str(gate["id"]),
            "decision": effective_decision,
            "decidedBy": decision.get("decidedBy", user["displayName"]),
            "userEmail": user["email"],
            "userRole": user["role"],
            "reason": reason,
            "decidedAt": decision.get("decidedAt", "2026-06-03T00:00:00.000Z"),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO approval_decisions
            (id, approval_gate_id, decision, decided_by, user_email, user_role, reason, decided_at)
            VALUES (:id, :approvalGateId, :decision, :decidedBy, :userEmail, :userRole, :reason, :decidedAt)
            """,
            decision_record,
        )
        if decision_record["decision"] in {"approved", "rejected"}:
            next_status = "approved" if decision_record["decision"] == "approved" else "rejected"
            self.connection.execute(
                "UPDATE approval_gates SET status = ? WHERE id = ?",
                (next_status, decision_record["approvalGateId"]),
            )
            self.connection.execute(
                "UPDATE package_runs SET approval_status = ? WHERE id = ?",
                (next_status, package_run_id),
            )
        self.connection.commit()
        return self.get_package_run(package_run_id)

    def get_package_run(self, package_run_id: str) -> dict[str, Any]:
        run = self.connection.execute("SELECT * FROM package_runs WHERE id = ?", (package_run_id,)).fetchone()
        if run is None:
            raise ValueError(f"Package run {package_run_id} was not found")
        project = self.connection.execute("SELECT * FROM projects WHERE id = ?", (run["project_id"],)).fetchone()
        return {
            "project": _project_row_to_dict(project),
            "packageRun": _package_run_row_to_dict(run),
            "riskClassification": self._fetch_one("risk_classifications", package_run_id),
            "approvalGate": self._fetch_one("approval_gates", package_run_id),
            "approvalDecisions": self._fetch_many("approval_decisions", package_run_id, join_gate=True),
            "auditEvents": self._fetch_many("audit_events", package_run_id),
            "modelRoleAuditEvents": self._fetch_many("model_role_audit_events", package_run_id),
            "exports": self._fetch_many("exports", package_run_id),
        }

    def get_audit_events(self, package_run_id: str) -> list[dict[str, Any]]:
        return self._fetch_many("audit_events", package_run_id)

    def get_model_role_audit_events(self, package_run_id: str) -> list[dict[str, Any]]:
        return self._fetch_many("model_role_audit_events", package_run_id)

    def get_exports(self, package_run_id: str) -> list[dict[str, Any]]:
        return self._fetch_many("exports", package_run_id)


    def get_dashboard_summary(self) -> dict[str, Any]:
        total_projects = self._count("projects")
        total_package_runs = self._count("package_runs")
        packages_by_approval_status = self._count_grouped("package_runs", "approval_status")
        risk_level_summary = {f"level{row['level']}": row["count"] for row in self.connection.execute("SELECT level, COUNT(*) AS count FROM risk_classifications GROUP BY level ORDER BY level").fetchall()}
        pending_approvals = self.connection.execute(
            """
            SELECT COUNT(*) AS count FROM package_runs
            LEFT JOIN approval_gates ON approval_gates.package_run_id = package_runs.id
            WHERE package_runs.approval_status = 'requires-review' OR approval_gates.status LIKE 'pending%'
            """
        ).fetchone()["count"]
        approved_packages = self.connection.execute("SELECT COUNT(*) AS count FROM package_runs WHERE approval_status = 'approved'").fetchone()["count"]
        rejected_packages = self.connection.execute("SELECT COUNT(*) AS count FROM package_runs WHERE approval_status = 'rejected'").fetchone()["count"]

        return {
            "totalProjects": total_projects,
            "totalPackageRuns": total_package_runs,
            "packagesByApprovalStatus": packages_by_approval_status,
            "packagesByRiskLevel": risk_level_summary,
            "riskLevelSummary": risk_level_summary,
            "pendingApprovals": pending_approvals,
            "approvedPackages": approved_packages,
            "rejectedPackages": rejected_packages,
            "recentAuditEvents": self._recent_audit_events(),
            "recentModelRoleEvents": self._recent_model_role_events(),
            "recentExports": self._recent_exports(),
        }

    def _count(self, table: str) -> int:
        return int(self.connection.execute(f"SELECT COUNT(*) AS count FROM {table}").fetchone()["count"])

    def _count_grouped(self, table: str, column: str) -> dict[str, int]:
        rows = self.connection.execute(f"SELECT {column} AS value, COUNT(*) AS count FROM {table} GROUP BY {column} ORDER BY {column}").fetchall()
        return {str(row["value"]): int(row["count"]) for row in rows}

    def _recent_audit_events(self, limit: int = 5) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT audit_events.*, package_runs.package_id AS package_id
            FROM audit_events
            JOIN package_runs ON package_runs.id = audit_events.package_run_id
            ORDER BY package_runs.created_at DESC, audit_events.event_order DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return [_row_to_camel_dict(row) for row in rows]

    def _recent_model_role_events(self, limit: int = 5) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT model_role_audit_events.*, package_runs.package_id AS package_id
            FROM model_role_audit_events
            JOIN package_runs ON package_runs.id = model_role_audit_events.package_run_id
            ORDER BY package_runs.created_at DESC, model_role_audit_events.event_order DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return [_row_to_camel_dict(row) for row in rows]

    def _recent_exports(self, limit: int = 5) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            """
            SELECT exports.id, exports.package_run_id, exports.export_type, exports.filename, exports.created_at, package_runs.package_id AS package_id
            FROM exports
            JOIN package_runs ON package_runs.id = exports.package_run_id
            ORDER BY exports.created_at DESC, exports.id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return [_row_to_camel_dict(row) for row in rows]


    def persist_gsrp_run(self, payload: dict[str, Any]) -> dict[str, Any]:
        run = dict(payload["run"])
        created_by_email = str(payload.get("createdByEmail", "agent@valorstruct.local"))
        self.get_user(created_by_email)
        record = {
            "id": run.get("runId", "gsrp-run-001"),
            "workspaceId": payload.get("workspaceId", DEMO_WORKSPACE_ID),
            "createdByEmail": created_by_email,
            "request": run.get("request", payload.get("request", "Prepare governed swarm package")),
            "riskLevel": run.get("riskLevel", "medium"),
            "governanceDecision": run.get("governanceDecision", "requires_human_approval"),
            "humanApprovalRequired": 1 if run.get("humanApprovalRequired", True) else 0,
            "approvalStatus": payload.get("approvalStatus", "pending-human-approval" if run.get("humanApprovalRequired", True) else "draft-approved"),
            "selectedAgentsJson": json.dumps(run.get("selectedAgents", []), sort_keys=True),
            "capabilityContractsJson": json.dumps(run.get("capabilityContracts", []), sort_keys=True),
            "selectedPlanJson": json.dumps(run.get("selectedPlan", []), sort_keys=True),
            "candidateOutputsJson": json.dumps(run.get("candidateOutputs", []), sort_keys=True),
            "critiquesJson": json.dumps(run.get("critiques", []), sort_keys=True),
            "verificationJson": json.dumps(run.get("verification", {}), sort_keys=True),
            "auditEventsJson": json.dumps(run.get("auditEvents", []), sort_keys=True),
            "resultJson": json.dumps(run, sort_keys=True),
            "createdAt": payload.get("createdAt", DEMO_CREATED_AT),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO gsrp_runs
            (id, workspace_id, created_by_email, request, risk_level, governance_decision, human_approval_required, approval_status, selected_agents_json, capability_contracts_json, selected_plan_json, candidate_outputs_json, critiques_json, verification_json, audit_events_json, result_json, created_at)
            VALUES (:id, :workspaceId, :createdByEmail, :request, :riskLevel, :governanceDecision, :humanApprovalRequired, :approvalStatus, :selectedAgentsJson, :capabilityContractsJson, :selectedPlanJson, :candidateOutputsJson, :critiquesJson, :verificationJson, :auditEventsJson, :resultJson, :createdAt)
            """,
            record,
        )
        self.connection.commit()
        return self.get_gsrp_run(str(record["id"]))

    def list_gsrp_runs(self) -> list[dict[str, Any]]:
        rows = self.connection.execute("SELECT * FROM gsrp_runs ORDER BY created_at DESC, id").fetchall()
        return [_gsrp_run_row_to_dict(row, self.list_gsrp_approval_decisions(str(row["id"]))) for row in rows]

    def get_gsrp_run(self, run_id: str) -> dict[str, Any]:
        row = self.connection.execute("SELECT * FROM gsrp_runs WHERE id = ?", (run_id,)).fetchone()
        if row is None:
            raise ValueError(f"GSRP run {run_id} was not found")
        return _gsrp_run_row_to_dict(row, self.list_gsrp_approval_decisions(run_id))

    def list_gsrp_approval_decisions(self, run_id: str) -> list[dict[str, Any]]:
        rows = self.connection.execute(
            "SELECT * FROM gsrp_approval_decisions WHERE gsrp_run_id = ? ORDER BY decided_at, id",
            (run_id,),
        ).fetchall()
        return [_gsrp_approval_decision_row_to_dict(row) for row in rows]

    def record_gsrp_approval_decision(self, run_id: str, decision: dict[str, Any]) -> dict[str, Any]:
        run = self.get_gsrp_run(run_id)
        user_email = str(decision.get("userEmail", DEFAULT_APPROVER_EMAIL))
        user = self.get_user(user_email)
        if user["role"] not in {"Owner", "Admin", "Senior Structural Engineer", "Reviewer"}:
            raise PermissionError(f"{user['role']} cannot approve GSRP runs.")
        normalized_decision = str(decision["decision"]).lower()
        if normalized_decision not in {"approved", "rejected", "needs_revision"}:
            raise ValueError("GSRP decision must be approved, rejected, or needs_revision")
        record = {
            "id": decision.get("id", f"gsrp-decision-{run_id}-{len(run['approvalDecisions']) + 1}"),
            "gsrpRunId": run_id,
            "decision": normalized_decision,
            "decidedBy": decision.get("decidedBy", user["displayName"]),
            "userEmail": user_email,
            "userRole": user["role"],
            "reason": decision.get("reason", "GSRP approval decision recorded."),
            "decidedAt": decision.get("decidedAt", DEMO_CREATED_AT),
        }
        self.connection.execute(
            """
            INSERT OR REPLACE INTO gsrp_approval_decisions
            (id, gsrp_run_id, decision, decided_by, user_email, user_role, reason, decided_at)
            VALUES (:id, :gsrpRunId, :decision, :decidedBy, :userEmail, :userRole, :reason, :decidedAt)
            """,
            record,
        )
        approval_status = "approved" if normalized_decision == "approved" else "rejected" if normalized_decision == "rejected" else "needs-revision"
        self.connection.execute("UPDATE gsrp_runs SET approval_status = ? WHERE id = ?", (approval_status, run_id))
        self.connection.commit()
        return self.get_gsrp_run(run_id)

    def _package_risk_level(self, package_run_id: str) -> int:
        row = self.connection.execute(
            "SELECT level FROM risk_classifications WHERE package_run_id = ?",
            (package_run_id,),
        ).fetchone()
        if row is None:
            raise ValueError(f"No risk classification found for package run {package_run_id}")
        return int(row["level"])

    def _replace_risk_classification(self, package_run_id: str, risk: dict[str, Any]) -> None:
        self.connection.execute("DELETE FROM risk_classifications WHERE package_run_id = ?", (package_run_id,))
        self.connection.execute(
            """
            INSERT INTO risk_classifications
            (id, package_run_id, workflow_type, level, label, required_approver, rationale, blocked)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                risk.get("id", f"risk-{package_run_id}"),
                package_run_id,
                risk["workflowType"],
                risk["level"],
                risk["label"],
                risk["requiredApprover"],
                risk["rationale"],
                int(bool(risk.get("blocked", False))),
            ),
        )

    def _replace_approval_gate(self, package_run_id: str, gate: dict[str, Any]) -> None:
        self.connection.execute("DELETE FROM approval_gates WHERE package_run_id = ?", (package_run_id,))
        self.connection.execute(
            """
            INSERT INTO approval_gates
            (id, package_run_id, gate_id, required, required_approver, status, reason)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                gate.get("id", f"approval-gate-{package_run_id}"),
                package_run_id,
                gate["gateId"],
                int(bool(gate["required"])),
                gate["requiredApprover"],
                gate["status"],
                gate["reason"],
            ),
        )

    def _replace_audit_events(self, package_run_id: str, events: list[dict[str, Any]]) -> None:
        self.connection.execute("DELETE FROM audit_events WHERE package_run_id = ?", (package_run_id,))
        for index, event in enumerate(events, start=1):
            self.connection.execute(
                """
                INSERT INTO audit_events (id, package_run_id, event_order, event_type, message)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    event.get("id", f"audit-{package_run_id}-{index}"),
                    package_run_id,
                    event.get("order", index),
                    event["type"],
                    event["message"],
                ),
            )

    def _replace_model_role_audit_events(self, package_run_id: str, events: list[dict[str, Any]]) -> None:
        self.connection.execute("DELETE FROM model_role_audit_events WHERE package_run_id = ?", (package_run_id,))
        for index, event in enumerate(events, start=1):
            self.connection.execute(
                """
                INSERT INTO model_role_audit_events
                (id, package_run_id, event_order, capability, task, requested_role, selected_model_ref,
                 fallback_role, sensitive_data_route_role, reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    event.get("id", f"model-role-audit-{package_run_id}-{index}"),
                    package_run_id,
                    event.get("order", index),
                    event["capability"],
                    event["task"],
                    event["requestedRole"],
                    event["selectedModelRef"],
                    event["fallbackRole"],
                    event["sensitiveDataRouteRole"],
                    event["reason"],
                ),
            )

    def _replace_exports(self, package_run_id: str, exports: list[dict[str, Any]]) -> None:
        self.connection.execute("DELETE FROM exports WHERE package_run_id = ?", (package_run_id,))
        for index, export in enumerate(exports, start=1):
            content = export["content"] if isinstance(export["content"], str) else json.dumps(export["content"], sort_keys=True)
            self.connection.execute(
                """
                INSERT INTO exports (id, package_run_id, export_type, filename, content, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    export.get("id", f"export-{package_run_id}-{index}"),
                    package_run_id,
                    export["exportType"],
                    export["filename"],
                    content,
                    export.get("createdAt", "2026-06-03T00:00:00.000Z"),
                ),
            )

    def _fetch_one(self, table: str, package_run_id: str) -> dict[str, Any] | None:
        row = self.connection.execute(f"SELECT * FROM {table} WHERE package_run_id = ?", (package_run_id,)).fetchone()
        return _row_to_camel_dict(row) if row else None

    def _fetch_many(self, table: str, package_run_id: str, join_gate: bool = False) -> list[dict[str, Any]]:
        if join_gate:
            rows = self.connection.execute(
                """
                SELECT approval_decisions.* FROM approval_decisions
                JOIN approval_gates ON approval_gates.id = approval_decisions.approval_gate_id
                WHERE approval_gates.package_run_id = ?
                ORDER BY approval_decisions.decided_at
                """,
                (package_run_id,),
            ).fetchall()
        else:
            order_column = "event_order" if table in {"audit_events", "model_role_audit_events"} else "id"
            rows = self.connection.execute(
                f"SELECT * FROM {table} WHERE package_run_id = ? ORDER BY {order_column}",
                (package_run_id,),
            ).fetchall()
        return [_row_to_camel_dict(row) for row in rows]



def _loads_json(value: str) -> Any:
    return json.loads(value) if value else None


def _project_part_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "workspaceId": row["workspace_id"],
        "partId": row["part_id"],
        "drawingNote": row["drawing_note"],
        "material": row["material"],
        "dimensions": row["dimensions"],
        "sourceData": _loads_json(row["source_data"]),
        "createdAt": row["created_at"],
    }


def _project_level_package_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "workspaceId": row["workspace_id"],
        "projectName": row["project_name"],
        "parts": _loads_json(row["parts_json"]),
        "combinedBOQSummary": _loads_json(row["combined_boq_summary_json"]),
        "combinedManufacturingSummary": _loads_json(row["combined_manufacturing_summary_json"]),
        "combinedQuotationSummary": _loads_json(row["combined_quotation_summary_json"]),
        "approvalStatus": row["approval_status"],
        "createdByEmail": row["created_by_email"],
        "createdAt": row["created_at"],
    }

def _public_user_dict(row: sqlite3.Row) -> dict[str, Any]:
    public_keys = {"user_id", "email", "display_name", "role", "status", "active", "created_at"}
    return {_snake_to_camel(key): _normalize_value(key, row[key]) for key in row.keys() if key in public_keys}


def _row_to_camel_dict(row: sqlite3.Row | None) -> dict[str, Any]:
    if row is None:
        return {}
    return {_snake_to_camel(key): _normalize_value(key, row[key]) for key in row.keys() if key != "package_run_id"}


def _project_row_to_dict(row: sqlite3.Row | None) -> dict[str, Any]:
    if row is None:
        return {}
    return {
        "id": row["id"],
        "name": row["name"],
        "clientName": row["client_name"],
        "status": row["status"],
        "createdAt": row["created_at"],
    }


def _package_run_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "projectId": row["project_id"],
        "workspaceId": row["workspace_id"],
        "createdByUserId": row["created_by_user_id"],
        "createdByEmail": row["created_by_email"],
        "request": row["request"],
        "status": row["status"],
        "packageId": row["package_id"],
        "revision": row["revision"],
        "approvalStatus": row["approval_status"],
        "createdAt": row["created_at"],
    }


def _snake_to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.title() for part in parts[1:])


def _normalize_value(key: str, value: Any) -> Any:
    if key in {"required", "blocked", "active"}:
        return bool(value)
    return value


def _gsrp_run_row_to_dict(row: sqlite3.Row, approval_decisions: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "workspaceId": row["workspace_id"],
        "createdByEmail": row["created_by_email"],
        "request": row["request"],
        "riskLevel": row["risk_level"],
        "governanceDecision": row["governance_decision"],
        "humanApprovalRequired": bool(row["human_approval_required"]),
        "approvalStatus": row["approval_status"],
        "selectedAgents": json.loads(row["selected_agents_json"]),
        "capabilityContracts": json.loads(row["capability_contracts_json"]),
        "selectedPlan": json.loads(row["selected_plan_json"]),
        "candidateOutputs": json.loads(row["candidate_outputs_json"]),
        "critiques": json.loads(row["critiques_json"]),
        "verification": json.loads(row["verification_json"]),
        "auditEvents": json.loads(row["audit_events_json"]),
        "result": json.loads(row["result_json"]),
        "approvalDecisions": approval_decisions,
        "createdAt": row["created_at"],
    }


def _gsrp_approval_decision_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "gsrpRunId": row["gsrp_run_id"],
        "decision": row["decision"],
        "decidedBy": row["decided_by"],
        "userEmail": row["user_email"],
        "userRole": row["user_role"],
        "reason": row["reason"],
        "decidedAt": row["decided_at"],
    }
