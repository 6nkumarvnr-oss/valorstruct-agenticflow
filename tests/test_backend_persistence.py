from copy import deepcopy
from pathlib import Path
import tempfile
import unittest

from agenticflow.backend.main import (
    ApprovalDecisionRequest,
    ApprovalActionRequest,
    LoginRequest,
    MultiPartPackageRunRequest,
    PackageRunPersistenceRequest,
    auth_me,
    build_demo_package_run_payload,
    create_demo_bp_01_package_run,
    get_package_audit_events,
    get_dashboard_summary,
    get_package_exports,
    get_package_model_role_audit_events,
    get_package_run,
    get_user_by_email,
    get_workspace,
    list_package_runs,
    list_users,
    list_workspaces,
    login,
    record_package_approval,
    run_multi_part_package_helper,
    run_package,
    persistence_schema,
    record_approval_decision,
    record_approved_decision,
    record_rejected_decision,
    check_approval_authority,
    ApprovalAuthorityRequest,
)
from fastapi import HTTPException

from agenticflow.backend.persistence import GovernancePersistenceStore, SCHEMA_TABLES


class BackendPersistenceTest(unittest.TestCase):
    def test_schema_contains_required_governance_tables(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            self.assertEqual(set(SCHEMA_TABLES).issubset(set(store.table_names())), True)
            for table in [
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
            ]:
                self.assertIn(table, store.table_names())

    def test_store_persists_package_run_governance_records(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            persisted = store.create_package_run(build_demo_package_run_payload())

            self.assertEqual(persisted["project"]["id"], "project-bp-01")
            self.assertEqual(persisted["packageRun"]["id"], "package-run-bp-01-001")
            self.assertEqual(persisted["packageRun"]["workspaceId"], "valor-demo-workspace")
            self.assertEqual(persisted["packageRun"]["createdByEmail"], "agent@valorstruct.local")
            self.assertEqual(persisted["riskClassification"]["level"], 3)
            self.assertEqual(persisted["riskClassification"]["requiredApprover"], "Senior Structural Engineer approval")
            self.assertEqual(persisted["approvalGate"]["status"], "pending-licensed-expert-approval")
            self.assertEqual(len(persisted["auditEvents"]), 5)
            self.assertEqual(persisted["modelRoleAuditEvents"][1]["requestedRole"], "engineering_reasoning_model")
            self.assertEqual(persisted["modelRoleAuditEvents"][1]["sensitiveDataRouteRole"], "local_private_model")
            self.assertEqual({export["exportType"] for export in persisted["exports"]}, {"markdown", "json"})

    def test_approval_decision_updates_gate_and_package_status(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            store.create_package_run(build_demo_package_run_payload())
            persisted = store.record_approval_decision(
                "package-run-bp-01-001",
                {
                    "decision": "approved",
                    "decidedBy": "Senior Structural Engineer",
                    "userEmail": "senior.engineer@valorstruct.local",
                    "reason": "Reviewed for demo release.",
                    "decidedAt": "2026-06-03T01:00:00.000Z",
                },
            )

            self.assertEqual(persisted["packageRun"]["approvalStatus"], "approved")
            self.assertEqual(persisted["approvalGate"]["status"], "approved")
            self.assertEqual(persisted["approvalDecisions"][0]["decidedBy"], "Senior Structural Engineer")
            self.assertEqual(persisted["approvalDecisions"][0]["userRole"], "Senior Structural Engineer")

    def test_backend_endpoint_functions_persist_demo_package_and_decision(self):
        schema = persistence_schema()
        for table in SCHEMA_TABLES:
            self.assertIn(table, schema["tables"])

        persisted = create_demo_bp_01_package_run()
        self.assertEqual(persisted["packageRun"]["id"], "package-run-bp-01-001")
        self.assertEqual(persisted["riskClassification"]["level"], 3)
        self.assertEqual(persisted["approvalGate"]["requiredApprover"], "Senior Structural Engineer approval")

        decided = record_approval_decision(
            "package-run-bp-01-001",
            ApprovalDecisionRequest(
                decision="approved",
                decidedBy="Senior Structural Engineer",
                userEmail="senior.engineer@valorstruct.local",
                reason="Approved for controlled demo issue.",
            ),
        )
        self.assertEqual(decided["packageRun"]["approvalStatus"], "approved")
        self.assertEqual(decided["approvalDecisions"][-1]["decision"], "approved")

    def test_backend_helpers_list_detail_audits_model_role_events_and_exports(self):
        create_demo_bp_01_package_run()

        runs = list_package_runs()
        self.assertGreaterEqual(len(runs), 1)
        self.assertIn("package-run-bp-01-001", {run["id"] for run in runs})

        detail = get_package_run("package-run-bp-01-001")
        audit_events = get_package_audit_events("package-run-bp-01-001")
        model_role_events = get_package_model_role_audit_events("package-run-bp-01-001")
        exports = get_package_exports("package-run-bp-01-001")

        self.assertEqual(detail["packageRun"]["packageId"], "VS-BP-01-ENG-FAB-PKG")
        self.assertEqual(audit_events[0]["eventType"], "GRAPH_QUERY")
        self.assertEqual(model_role_events[1]["requestedRole"], "engineering_reasoning_model")
        self.assertEqual(model_role_events[1]["sensitiveDataRouteRole"], "local_private_model")
        self.assertEqual({export["exportType"] for export in exports}, {"markdown", "json"})

    def test_rejection_decision_updates_gate_and_package_status(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            store.create_package_run(build_demo_package_run_payload())
            persisted = store.record_approval_decision(
                "package-run-bp-01-001",
                {
                    "decision": "rejected",
                    "decidedBy": "Senior Structural Engineer",
                    "userEmail": "senior.engineer@valorstruct.local",
                    "reason": "Needs engineering correction before issue.",
                    "decidedAt": "2026-06-03T01:05:00.000Z",
                },
            )

            self.assertEqual(persisted["packageRun"]["approvalStatus"], "rejected")
            self.assertEqual(persisted["approvalGate"]["status"], "rejected")
            self.assertEqual(persisted["approvalDecisions"][0]["decision"], "rejected")
            self.assertEqual(persisted["approvalDecisions"][0]["userRole"], "Senior Structural Engineer")

    def test_demo_users_are_seeded_with_required_roles(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            users = store.list_users()
            users_by_email = {user["email"]: user for user in users}

            expected = {
                "owner@valorstruct.local": "Owner",
                "admin@valorstruct.local": "Admin",
                "senior.engineer@valorstruct.local": "Senior Structural Engineer",
                "engineer@valorstruct.local": "Engineer",
                "reviewer@valorstruct.local": "Reviewer",
                "viewer@valorstruct.local": "Viewer",
                "agent@valorstruct.local": "Agent",
            }
            for email, role in expected.items():
                self.assertEqual(users_by_email[email]["role"], role)

    def test_senior_structural_engineer_can_approve_level_3(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            store.create_package_run(build_demo_package_run_payload())
            persisted = store.record_approval_decision(
                "package-run-bp-01-001",
                {
                    "decision": "approved",
                    "decidedBy": "Senior Structural Engineer",
                    "userEmail": "senior.engineer@valorstruct.local",
                    "reason": "Licensed engineering review complete.",
                },
            )

            self.assertEqual(persisted["packageRun"]["approvalStatus"], "approved")
            self.assertEqual(persisted["approvalDecisions"][0]["userRole"], "Senior Structural Engineer")

    def test_engineer_cannot_approve_level_3(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            store.create_package_run(build_demo_package_run_payload())
            persisted = store.record_approval_decision(
                "package-run-bp-01-001",
                {
                    "decision": "approved",
                    "decidedBy": "Project Engineer",
                    "userEmail": "engineer@valorstruct.local",
                    "reason": "Engineer attempted Level 3 approval.",
                },
            )

            self.assertEqual(persisted["packageRun"]["approvalStatus"], "requires-review")
            self.assertEqual(persisted["approvalGate"]["status"], "pending-licensed-expert-approval")
            self.assertEqual(persisted["approvalDecisions"][0]["decision"], "blocked")
            self.assertEqual(persisted["approvalDecisions"][0]["userRole"], "Engineer")

    def test_owner_can_approve_level_4(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            payload = self._payload_for_level("package-run-level-4", 4)
            store.create_package_run(payload)
            persisted = store.record_approval_decision(
                "package-run-level-4",
                {
                    "decision": "approved",
                    "decidedBy": "Valor Struct Owner",
                    "userEmail": "owner@valorstruct.local",
                    "reason": "Explicit owner authorization granted.",
                },
            )

            self.assertEqual(persisted["packageRun"]["approvalStatus"], "approved")
            self.assertEqual(persisted["approvalDecisions"][0]["userRole"], "Owner")

    def test_agent_cannot_approve_level_2_3_or_4(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            for level in [2, 3, 4]:
                run_id = f"package-run-level-{level}"
                store.create_package_run(self._payload_for_level(run_id, level))
                persisted = store.record_approval_decision(
                    run_id,
                    {
                        "id": f"approval-decision-{run_id}",
                        "decision": "approved",
                        "decidedBy": "AgenticFlow Agent",
                        "userEmail": "agent@valorstruct.local",
                        "reason": f"Agent attempted Level {level} approval.",
                    },
                )

                self.assertEqual(persisted["packageRun"]["approvalStatus"], "requires-review")
                self.assertEqual(persisted["approvalDecisions"][0]["decision"], "blocked")
                self.assertEqual(persisted["approvalDecisions"][0]["userRole"], "Agent")


    def test_dashboard_summary_helper_reports_project_package_governance_totals(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            store.create_package_run(build_demo_package_run_payload())
            summary = store.get_dashboard_summary()

            self.assertEqual(summary["totalProjects"], 1)
            self.assertEqual(summary["totalPackageRuns"], 1)
            self.assertEqual(summary["pendingApprovals"], 1)
            self.assertEqual(summary["approvedPackages"], 0)
            self.assertEqual(summary["rejectedPackages"], 0)
            self.assertEqual(summary["packagesByApprovalStatus"]["requires-review"], 1)
            self.assertEqual(summary["packagesByRiskLevel"]["level3"], 1)
            self.assertEqual(summary["riskLevelSummary"]["level3"], 1)
            self.assertGreaterEqual(len(summary["recentAuditEvents"]), 1)
            self.assertGreaterEqual(len(summary["recentModelRoleEvents"]), 1)
            self.assertGreaterEqual(len(summary["recentExports"]), 1)

    def test_dashboard_summary_endpoint_helper_returns_seeded_demo_summary(self):
        session = login(LoginRequest(email="senior.engineer@valorstruct.local", password="ValorDemo123!"))
        summary = get_dashboard_summary(authorization=f"Bearer {session['token']}")

        self.assertIn("totalProjects", summary)
        self.assertIn("totalPackageRuns", summary)
        self.assertIn("pendingApprovals", summary)
        self.assertIn("approvedPackages", summary)
        self.assertIn("rejectedPackages", summary)
        self.assertIn("packagesByRiskLevel", summary)
        self.assertIn("riskLevelSummary", summary)
        self.assertIn("recentAuditEvents", summary)
        self.assertIn("recentModelRoleEvents", summary)
        self.assertIn("recentExports", summary)
        self.assertGreaterEqual(summary["totalProjects"], 1)
        self.assertGreaterEqual(summary["totalPackageRuns"], 1)

    def test_backend_user_and_authority_helpers(self):
        users = list_users()
        self.assertIn("owner@valorstruct.local", {user["email"] for user in users})
        self.assertEqual(get_user_by_email("engineer@valorstruct.local")["role"], "Engineer")

        allowed = check_approval_authority(ApprovalAuthorityRequest(userEmail="senior.engineer@valorstruct.local", level=3))
        blocked = check_approval_authority(ApprovalAuthorityRequest(userEmail="engineer@valorstruct.local", level=3))
        self.assertEqual(allowed["allowed"], True)
        self.assertEqual(blocked["allowed"], False)

        create_demo_bp_01_package_run()
        approved = record_approved_decision(
            "package-run-bp-01-001",
            ApprovalDecisionRequest(decision="approved", userEmail="senior.engineer@valorstruct.local", reason="Endpoint approve helper."),
        )
        self.assertEqual(approved["packageRun"]["approvalStatus"], "approved")

        create_demo_bp_01_package_run()
        rejected = record_rejected_decision(
            "package-run-bp-01-001",
            ApprovalDecisionRequest(decision="rejected", userEmail="senior.engineer@valorstruct.local", reason="Endpoint reject helper."),
        )
        self.assertEqual(rejected["packageRun"]["approvalStatus"], "rejected")
        self.assertEqual(rejected["approvalDecisions"][-1]["userRole"], "Senior Structural Engineer")


    def test_auth_workspace_and_current_user_helpers(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            self.assertIn("company_workspaces", store.table_names())
            self.assertIn("workspace_memberships", store.table_names())

            user = store.authenticate_user("senior.engineer@valorstruct.local", "ValorDemo123!")
            self.assertIsNotNone(user)
            self.assertIsNone(store.authenticate_user("senior.engineer@valorstruct.local", "wrong-password"))

            token = store.issue_demo_token(user)  # type: ignore[arg-type]
            current_user = store.get_current_user_from_token(f"Bearer {token}")
            self.assertEqual(current_user["email"], "senior.engineer@valorstruct.local")
            self.assertEqual(store.list_workspaces_for_user(current_user["userId"])[0]["workspaceId"], "valor-demo-workspace")

            persisted = store.create_package_run(build_demo_package_run_payload())
            self.assertEqual(persisted["packageRun"]["workspaceId"], "valor-demo-workspace")
            self.assertEqual(persisted["packageRun"]["createdByEmail"], "agent@valorstruct.local")

            approved = store.record_approval_decision_for_user("package-run-bp-01-001", current_user, "approved", "Approved through current-user flow.")
            self.assertEqual(approved["packageRun"]["approvalStatus"], "approved")

    def test_current_user_approval_authority_enforces_role_levels(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            store.create_package_run(build_demo_package_run_payload())
            engineer = store.authenticate_user("engineer@valorstruct.local", "ValorDemo123!")
            with self.assertRaises(PermissionError):
                store.record_approval_decision_for_user("package-run-bp-01-001", engineer, "approved", "Engineer attempted current-user approval.")  # type: ignore[arg-type]

            level4_payload = self._payload_for_level("package-run-level-4-owner", 4)
            store.create_package_run(level4_payload)
            owner = store.authenticate_user("owner@valorstruct.local", "ValorDemo123!")
            approved = store.record_approval_decision_for_user("package-run-level-4-owner", owner, "approved", "Owner approved Level 4.")  # type: ignore[arg-type]
            self.assertEqual(approved["approvalDecisions"][0]["userRole"], "Owner")

    def test_auth_endpoint_helpers_and_protected_package_flow(self):
        session = login(LoginRequest(email="senior.engineer@valorstruct.local", password="ValorDemo123!"))
        authorization = f"Bearer {session['token']}"
        self.assertEqual(auth_me(authorization=authorization)["currentUser"]["email"], "senior.engineer@valorstruct.local")
        self.assertEqual(list_workspaces(authorization=authorization)[0]["workspaceId"], "valor-demo-workspace")
        self.assertEqual(get_workspace("valor-demo-workspace", authorization=authorization)["companyName"], "Valor Struct Demo Workspace")

        payload = build_demo_package_run_payload()
        payload["packageRun"]["id"] = "package-run-auth-flow"
        created = run_package(PackageRunPersistenceRequest(**payload), authorization=authorization)
        self.assertEqual(created["packageRun"]["createdByEmail"], "senior.engineer@valorstruct.local")

        approved = record_package_approval("package-run-auth-flow", ApprovalActionRequest(decision="approved", reason="Logged-in user approved."), authorization=authorization)
        self.assertEqual(approved["approvalDecisions"][-1]["userEmail"], "senior.engineer@valorstruct.local")

        with self.assertRaises(HTTPException):
            get_dashboard_summary()

        with self.assertRaises(HTTPException):
            login(LoginRequest(email="senior.engineer@valorstruct.local", password="wrong-password"))


    def test_project_part_helpers_persist_and_list_parts(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            store.create_project({
                "id": "project-multi-part-test",
                "name": "Multi-Part Demo Project",
                "clientName": "Valor Struct Demo Client",
            })
            persisted = store.create_project_part({
                "projectId": "project-multi-part-test",
                "workspaceId": "valor-demo-workspace",
                "partId": "BP-01",
                "drawingNote": "BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.",
                "material": "S275",
                "dimensions": "400x400x20",
            })
            parts = store.list_project_parts("project-multi-part-test")

            self.assertEqual(persisted["partId"], "BP-01")
            self.assertEqual(len(parts), 1)
            self.assertEqual(parts[0]["drawingNote"], "BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.")

    def test_project_level_package_run_persistence_helpers(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            payload = {
                "id": "project-level-package-test-001",
                "projectId": "project-multi-part-test",
                "workspaceId": "valor-demo-workspace",
                "projectName": "Multi-Part Demo Project",
                "parts": [
                    {
                        "partId": "BP-01",
                        "drawingNote": "BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.",
                        "material": "S275",
                        "dimensions": "400x400x20",
                    },
                    {
                        "partId": "BP-02",
                        "drawingNote": "BP-02 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.",
                        "material": "S275",
                        "dimensions": "400x400x20",
                    },
                    {
                        "partId": "BR-01",
                        "drawingNote": "BR-01 RHS80x40x2.8 S275 length 2.5m.",
                        "material": "S275",
                        "dimensions": "RHS80x40x2.8 length 2.5m",
                    },
                ],
                "combinedBOQSummary": {"lineCount": 17, "materialKg": 48.92},
                "combinedManufacturingSummary": {"totalEstimatedLaborHr": 3.3, "totalEstimatedProductionHr": 9.8},
                "combinedQuotationSummary": {"currency": "SAR", "grandTotal": 837.94},
                "approvalStatus": "requires-review",
                "createdByEmail": "agent@valorstruct.local",
            }
            persisted = store.persist_project_level_package_run(payload)
            listed = store.list_project_level_package_runs()
            detail = store.get_project_level_package_run("project-level-package-test-001")

            self.assertEqual(persisted["projectId"], "project-multi-part-test")
            self.assertEqual(persisted["combinedBOQSummary"]["lineCount"], 17)
            self.assertEqual(detail["combinedManufacturingSummary"]["totalEstimatedProductionHr"], 9.8)
            self.assertEqual(listed[0]["combinedQuotationSummary"]["grandTotal"], 837.94)
            self.assertEqual(len(store.list_project_parts("project-multi-part-test")), 3)

    def test_multi_part_package_endpoint_helper_returns_deterministic_bp_01_bp_02_result(self):
        session = login(LoginRequest(email="senior.engineer@valorstruct.local", password="ValorDemo123!"))
        authorization = f"Bearer {session['token']}"
        result = run_multi_part_package_helper(
            "valor-demo-project-multi-part",
            MultiPartPackageRunRequest(projectName="Valor Struct BP-01/BP-02 Project"),
            authorization=authorization,
        )

        self.assertEqual(result["projectId"], "valor-demo-project-multi-part")
        self.assertEqual([part["partId"] for part in result["parts"]], ["BP-01", "BP-02", "BR-01"])
        self.assertEqual(result["parts"][2]["section"], "RHS80x40x2.8")
        self.assertEqual(result["parts"][2]["lengthM"], 2.5)
        self.assertEqual(result["combinedBOQSummary"]["lineCount"], 17)
        self.assertEqual(result["combinedBOQSummary"]["materialKg"], 48.92)
        self.assertEqual(result["combinedBOQSummary"]["cuttingNos"], 4)
        self.assertEqual(result["combinedBOQSummary"]["drillingNos"], 8)
        self.assertEqual(result["combinedBOQSummary"]["weldLengthM"], 3.2)
        self.assertEqual(result["combinedBOQSummary"]["coatingAreaM2"], 1.1)
        self.assertEqual(result["combinedManufacturingSummary"]["totalEstimatedLaborHr"], 3.3)
        self.assertEqual(result["combinedManufacturingSummary"]["totalEstimatedProductionHr"], 9.8)
        self.assertEqual(result["combinedQuotationSummary"]["grandTotal"], 837.94)
        self.assertEqual(result["approvalStatus"], "requires-review")
        self.assertEqual(result["createdByEmail"], "senior.engineer@valorstruct.local")

    def _payload_for_level(self, package_run_id: str, level: int) -> dict[str, object]:
        payload = deepcopy(build_demo_package_run_payload())
        payload["packageRun"]["id"] = package_run_id
        payload["packageRun"]["approvalStatus"] = "requires-review"
        payload["riskClassification"]["level"] = level
        payload["riskClassification"]["label"] = f"Level {level} approval required"
        payload["riskClassification"]["requiredApprover"] = f"Level {level} authorized approver"
        payload["approvalGate"]["gateId"] = f"gate-level-{level}"
        payload["approvalGate"]["requiredApprover"] = f"Level {level} authorized approver"
        payload["approvalGate"]["status"] = "pending-authorized-approval"
        return payload


if __name__ == "__main__":
    unittest.main()
