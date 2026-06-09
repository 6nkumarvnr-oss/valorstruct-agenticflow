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


if __name__ == "__main__":
    unittest.main()
