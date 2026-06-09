from pathlib import Path
import json
import subprocess
import unittest
from command_utils import resolve_node_command

ROOT = Path(__file__).resolve().parents[1]


def run_swarm_script(script: str):
    subprocess.run(
        [*resolve_node_command("npx"), "tsc", "-p", "workflow-orchestration-core/tsconfig.json", "--outDir", ".tmp/workflow-orchestration-core"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    output = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    ).stdout
    return json.loads(output)


class GovernedSwarmProtocolTest(unittest.TestCase):
    def test_swarm_protocol_exports_registry_contracts_and_run(self):
        result = run_swarm_script(
            """
import { AGENT_REGISTRY, CAPABILITY_CONTRACTS, runGovernedSwarmReasoning } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const run = runGovernedSwarmReasoning('Prepare engineering quotation package for BP-01 with BOQ and human approval');
console.log(JSON.stringify({ agentCount: AGENT_REGISTRY.length, contractCount: CAPABILITY_CONTRACTS.length, run }));
"""
        )
        self.assertGreaterEqual(result["agentCount"], 4)
        self.assertGreaterEqual(result["contractCount"], 3)
        self.assertEqual(result["run"]["riskLevel"], "high")
        self.assertTrue(result["run"]["humanApprovalRequired"])
        self.assertEqual(result["run"]["governanceDecision"], "requires_human_approval")
        self.assertIn("GSRP_GOVERNANCE_DECISION_RECORDED", result["run"]["auditEvents"])
        self.assertTrue(any(agent["agentId"] == "governance.judge.v1" for agent in result["run"]["selectedAgents"]))

    def test_research_protocol_docs_and_schemas_exist(self):
        required = [
            "AGENTIC_ARCHITECTURE.md",
            "agenticflow/docs/research-protocols/GOVERNED_SWARM_REASONING_PROTOCOL.md",
            "agenticflow/schemas/agent_registry.schema.json",
            "agenticflow/schemas/capability_contract.schema.json",
            "agenticflow/frontend/src/pages/GovernedSwarmConsole.tsx",
        ]
        for relative in required:
            self.assertTrue((ROOT / relative).exists(), relative)

        agent_schema = json.loads((ROOT / "agenticflow/schemas/agent_registry.schema.json").read_text())
        capability_schema = json.loads((ROOT / "agenticflow/schemas/capability_contract.schema.json").read_text())
        self.assertIn("agentId", agent_schema["required"])
        self.assertIn("capabilityId", capability_schema["required"])

    def test_backend_swarm_builder_returns_approval_packet(self):
        import sys
        sys.path.insert(0, str(ROOT))
        from agenticflow.backend.main import build_governed_swarm_run

        result = build_governed_swarm_run("Prepare quotation and engineering package for BP-01")
        self.assertEqual(result["governanceDecision"], "requires_human_approval")
        self.assertTrue(result["humanApprovalRequired"])
        self.assertIn("GSRP_AGENTS_SELECTED", result["auditEvents"])
        self.assertTrue(any(agent["agentId"] == "quotation.specialist.v1" for agent in result["selectedAgents"]))


    def test_gsrp_runs_persist_and_record_human_approval(self):
        import sys
        import tempfile
        sys.path.insert(0, str(ROOT))
        from agenticflow.backend.main import build_governed_swarm_run
        from agenticflow.backend.persistence import GovernancePersistenceStore

        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            try:
                run = build_governed_swarm_run("Prepare engineering quotation package for BP-01")
                persisted = store.persist_gsrp_run({"run": run, "createdByEmail": "agent@valorstruct.local"})
                self.assertEqual(persisted["id"], run["runId"])
                self.assertEqual(persisted["approvalStatus"], "pending-human-approval")
                self.assertTrue(persisted["humanApprovalRequired"])
                self.assertIn("governance.judge.v1", {agent["agentId"] for agent in persisted["selectedAgents"]})

                approved = store.record_gsrp_approval_decision(persisted["id"], {
                    "decision": "approved",
                    "decidedBy": "Senior Structural Engineer",
                    "userEmail": "senior.engineer@valorstruct.local",
                    "reason": "GSRP package reviewed for controlled research release.",
                })
                self.assertEqual(approved["approvalStatus"], "approved")
                self.assertEqual(approved["approvalDecisions"][0]["userRole"], "Senior Structural Engineer")
                self.assertEqual(store.list_gsrp_runs()[0]["id"], persisted["id"])
            finally:
                store.close()

    def test_backend_gsrp_helpers_create_list_get_and_approve(self):
        import sys
        sys.path.insert(0, str(ROOT))
        from agenticflow.backend.main import (
            GovernedSwarmRunRequest,
            GSRPApprovalDecisionRequest,
            LoginRequest,
            create_persisted_governed_swarm_run,
            get_governed_swarm_agent_performance,
            get_governed_swarm_run,
            list_governed_swarm_runs,
            login,
            record_governed_swarm_approval,
        )

        auth = login(LoginRequest(email="senior.engineer@valorstruct.local", password="ValorDemo123!"))
        token = f"Bearer {auth['token']}"
        persisted = create_persisted_governed_swarm_run(GovernedSwarmRunRequest(request="Prepare engineering quotation package for BP-01"), token)
        self.assertEqual(persisted["governanceDecision"], "requires_human_approval")
        self.assertEqual(persisted["createdByEmail"], "senior.engineer@valorstruct.local")
        self.assertIn(persisted["id"], {run["id"] for run in list_governed_swarm_runs(token)})
        detail = get_governed_swarm_run(persisted["id"], token)
        self.assertEqual(detail["request"], persisted["request"])
        decided = record_governed_swarm_approval(persisted["id"], GSRPApprovalDecisionRequest(decision="needs_revision"), token)
        self.assertEqual(decided["approvalStatus"], "needs-revision")
        self.assertEqual(decided["approvalDecisions"][-1]["decision"], "needs_revision")
        learning = get_governed_swarm_agent_performance(token)
        self.assertGreaterEqual(learning["trackedAgents"], 4)
        self.assertGreaterEqual(learning["averageScore"], 0.5)


    def test_gsrp_routes_require_authentication_and_use_user_for_approval(self):
        import sys
        sys.path.insert(0, str(ROOT))
        from fastapi import HTTPException
        from agenticflow.backend.main import (
            GovernedSwarmRunRequest,
            GSRPApprovalDecisionRequest,
            LoginRequest,
            create_persisted_governed_swarm_run,
            login,
            record_governed_swarm_approval,
        )

        with self.assertRaises(HTTPException):
            create_persisted_governed_swarm_run(GovernedSwarmRunRequest(request="Prepare quotation package"), None)

        engineer_auth = login(LoginRequest(email="engineer@valorstruct.local", password="ValorDemo123!"))
        senior_auth = login(LoginRequest(email="senior.engineer@valorstruct.local", password="ValorDemo123!"))
        persisted = create_persisted_governed_swarm_run(GovernedSwarmRunRequest(request="Prepare quotation package"), f"Bearer {senior_auth['token']}")

        with self.assertRaises(HTTPException):
            record_governed_swarm_approval(persisted["id"], GSRPApprovalDecisionRequest(decision="approved"), f"Bearer {engineer_auth['token']}")

        approved = record_governed_swarm_approval(persisted["id"], GSRPApprovalDecisionRequest(decision="approved"), f"Bearer {senior_auth['token']}")
        self.assertEqual(approved["approvalStatus"], "approved")
        self.assertEqual(approved["approvalDecisions"][-1]["userEmail"], "senior.engineer@valorstruct.local")

    def test_gsrp_history_console_exists_with_approval_actions(self):
        history_console = (ROOT / "agenticflow/frontend/src/pages/GovernedSwarmHistoryConsole.tsx").read_text()
        self.assertIn("Governed Swarm Approval History", history_console)
        self.assertIn("approve GSRP run", history_console)
        self.assertIn("request revision", history_console)
        self.assertIn("reject GSRP run", history_console)

    def test_gsrp_learning_console_exists_with_performance_scores(self):
        learning_console = (ROOT / "agenticflow/frontend/src/pages/GovernedSwarmLearningConsole.tsx").read_text()
        self.assertIn("Governed Swarm Learning Loop", learning_console)
        self.assertIn("agent performance table", learning_console)
        self.assertIn("Scores guide routing", learning_console)


if __name__ == "__main__":
    unittest.main()
