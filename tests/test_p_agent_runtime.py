from pathlib import Path
import json
import subprocess
import unittest
from command_utils import resolve_node_command

from agenticflow.backend.main import RunAgentRequest, run_agent

ROOT = Path(__file__).resolve().parents[1]


def compile_typescript() -> None:
    subprocess.run([*resolve_node_command("npm"), "run", "test:ts"], cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8")
    subprocess.run(
        [*resolve_node_command("npx"), "tsc", "-p", "agenticflow/tsconfig.json"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


class PAgentRuntimeTest(unittest.TestCase):
    def run_agent_runtime(self, goal="Stabilize demo capability"):
        compile_typescript()
        script = """
import { TaskPlanner } from './.tmp/agenticflow/p-agent/planner/TaskPlanner.js';
import { AgentRuntime } from './.tmp/agenticflow/p-agent/runtime/AgentRuntime.js';
const goal = process.argv[1];
const planner = new TaskPlanner();
const runtime = new AgentRuntime();
const result = runtime.run(goal);
console.log(JSON.stringify({ planned: planner.createPlan(goal), result, memory: runtime.getMemory().list() }));
"""
        output = subprocess.run(
            ["node", "--input-type=module", "-e", script, goal],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        ).stdout
        return json.loads(output)

    def test_planner_creates_expected_tasks(self):
        payload = self.run_agent_runtime()
        task_titles = [task["title"] for task in payload["planned"]]

        self.assertEqual(
            task_titles,
            [
                "Read goal",
                "Create stability signal",
                "Run Patch D vertical slice",
                "Store result in memory",
                "Return execution summary",
            ],
        )

    def test_runtime_executes_vertical_slice_and_stores_memory(self):
        payload = self.run_agent_runtime()
        result = payload["result"]
        memory = payload["memory"]

        self.assertEqual(result["goal"], "Stabilize demo capability")
        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["verticalSliceResult"]["stabilityState"]["status"], "UNSTABLE")
        self.assertEqual(result["verticalSliceResult"]["governanceDecision"]["action"], "DECREASE_TRAFFIC")
        self.assertEqual(result["memoryEntryId"], "memory-1")
        self.assertEqual(len(memory), 1)
        self.assertEqual(memory[0]["goal"], "Stabilize demo capability")

    def test_response_includes_audit_summary(self):
        result = self.run_agent_runtime()["result"]

        self.assertIn("auditSummary", result)
        self.assertGreaterEqual(result["auditSummary"]["eventCount"], 6)
        self.assertIn("SIGNAL_RECEIVED", result["auditSummary"]["eventTypes"])

    def test_runtime_routes_engineering_goal_through_patchd_governance(self):
        payload = self.run_agent_runtime("Run steel member weight engineering")
        planned_titles = [task["title"] for task in payload["planned"]]
        result = payload["result"]

        self.assertEqual(planned_titles[1], "Select Engineering Capability Pack")
        self.assertEqual(planned_titles[2], "Run Patch D governance gate")
        self.assertEqual(result["verticalSliceResult"]["governanceDecision"]["action"], "DECREASE_TRAFFIC")
        self.assertEqual(result["engineeringResult"]["selectedWorkflow"], "SteelWeightWorkflow")
        self.assertEqual(result["engineeringResult"]["result"]["result"]["totalWeightKg"], 268.8)
        self.assertIn("ENGINEERING_PACK_SELECTED", result["auditSummary"]["eventTypes"])

    def test_frontend_page_includes_goal_input_and_execution_panels(self):
        page = (ROOT / "agenticflow/frontend/src/pages/PAgentRuntimeDemo.tsx").read_text(encoding="utf-8")

        for label in [
            "Goal input",
            "Generated task plan",
            "Execution status",
            "Patch D result summary",
            "Audit summary",
            "Memory entry",
        ]:
            self.assertIn(label, page)

    def test_backend_run_agent_endpoint_function_shape(self):
        response = run_agent(RunAgentRequest(goal="Stabilize demo capability"))

        self.assertEqual(response.goal, "Stabilize demo capability")
        self.assertEqual(response.status, "completed")
        self.assertEqual(response.plan[2], "Run Patch D vertical slice")
        self.assertEqual(response.memoryEntryId, "memory-1")
        self.assertIn("auditSummary", response.model_dump())


if __name__ == "__main__":
    unittest.main()
