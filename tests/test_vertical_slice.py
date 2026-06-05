from pathlib import Path
import json
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class VerticalSliceTest(unittest.TestCase):
    def compile_typescript(self):
        subprocess.run(["npm", "run", "test:ts"], cwd=ROOT, check=True, capture_output=True, text=True)

    def run_vertical_slice(self):
        subprocess.run(["npm", "run", "vertical-slice"], cwd=ROOT, check=True, capture_output=True, text=True)
        output = subprocess.run(
            ["node", ".tmp/agenticflow/patchd-core/vertical-slice/runVerticalSlice.js"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        return json.loads(output)

    def run_custom_signal(self, signal):
        self.compile_typescript()
        subprocess.run(
            ["npx", "tsc", "-p", "agenticflow/tsconfig.json"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        script = """
import { runVerticalSlice, createVerticalSliceReportJson } from './.tmp/agenticflow/patchd-core/vertical-slice/runVerticalSlice.js';
const signal = JSON.parse(process.argv[1]);
const result = runVerticalSlice(signal);
console.log(JSON.stringify({ result, report: JSON.parse(createVerticalSliceReportJson(result)) }));
"""
        output = subprocess.run(
            ["node", "--input-type=module", "-e", script, json.dumps(signal)],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        return json.loads(output)

    def test_required_clean_modules_exist(self):
        required = [
            "agenticflow/patchd-core/stability/StabilityEngine.ts",
            "agenticflow/patchd-core/governance/GovernancePolicyEngine.ts",
            "agenticflow/patchd-core/execution/CompositeEmitter.ts",
            "agenticflow/patchd-core/execution/RoutingGovernor.ts",
            "agenticflow/patchd-core/audit/InMemoryAuditLog.ts",
            "agenticflow/patchd-core/analytics/AnalyticsPipeline.ts",
            "agenticflow/patchd-core/analytics/AnalyticsStateStore.ts",
            "agenticflow/patchd-core/governance/GovernanceFeedbackLoop.ts",
            "agenticflow/patchd-core/vertical-slice/runVerticalSlice.ts",
            "agenticflow/frontend/src/pages/VerticalSliceDemo.tsx",
        ]
        missing = [path for path in required if not (ROOT / path).exists()]
        self.assertEqual(missing, [])

    def test_vertical_slice_demo_proves_required_flow(self):
        result = self.run_vertical_slice()

        self.assertEqual(result["stabilityState"]["status"], "UNSTABLE")
        self.assertEqual(result["stabilityState"]["gatewayRoute"]["role"], "fast_low_cost_model")
        self.assertEqual(result["stabilityState"]["gatewayRoute"]["selectionStage"], "Capability → AI Role → Gateway → Best Available Model")
        self.assertEqual(result["governanceDecision"]["action"], "DECREASE_TRAFFIC")
        self.assertEqual(result["governanceDecision"]["gatewayRoute"]["role"], "policy_reasoning_model")
        self.assertEqual(result["trafficWeightBefore"], 1)
        self.assertEqual(result["trafficWeightAfter"], 0.85)
        self.assertEqual(result["recoveryDetectedAtMs"], 5000)
        self.assertEqual(result["policyWeightBefore"], 1)
        self.assertEqual(result["policyWeightAfter"], 1.05)
        self.assertGreaterEqual(len(result["auditTimeline"]), 6)

    def test_custom_signal_can_produce_unstable_and_audit_event(self):
        payload = self.run_custom_signal(
            {
                "capabilityId": "investor-demo-capability",
                "latencyMs": 1600,
                "errorRate": 0.08,
                "drift": 0.7,
                "tenantImpact": 0.9,
            }
        )
        result = payload["result"]

        self.assertEqual(result["signal"]["capabilityId"], "investor-demo-capability")
        self.assertEqual(result["stabilityState"]["status"], "UNSTABLE")
        self.assertTrue(any(event["type"] == "SIGNAL_RECEIVED" for event in result["auditTimeline"]))

    def test_policy_weight_increases_after_successful_recovery(self):
        result = self.run_vertical_slice()

        self.assertTrue(result["recoveryMetrics"]["success"])
        self.assertEqual(result["policyState"]["previousWeight"], 1)
        self.assertEqual(result["policyState"]["newWeight"], 1.05)
        self.assertGreater(result["policyState"]["adaptedPolicyWeight"], result["policyState"]["basePolicyWeight"])
        self.assertEqual(result["policyState"]["gatewayRoute"]["role"], "reasoning_model")

    def test_exported_report_contains_required_sections(self):
        payload = self.run_custom_signal(
            {
                "capabilityId": "export-report-demo",
                "latencyMs": 1300,
                "errorRate": 0.04,
                "drift": 0.5,
                "tenantImpact": 0.5,
            }
        )
        report = payload["report"]

        for section in ["signal", "decision", "execution", "audit", "analytics", "feedback"]:
            self.assertIn(section, report)
        self.assertEqual(report["decision"]["action"], "DECREASE_TRAFFIC")
        self.assertEqual(report["execution"]["routing"]["nextWeight"], 0.85)
        self.assertTrue(report["analytics"]["success"])
        self.assertEqual(report["feedback"]["newWeight"], 1.05)

    def test_frontend_demo_contains_required_viewers_and_export_button(self):
        page = (ROOT / "agenticflow/frontend/src/pages/VerticalSliceDemo.tsx").read_text()

        for label in [
            "Custom Signal Input Panel",
            "Audit Event Viewer",
            "Policy State Viewer",
            "Recovery Metrics Viewer",
            "Export Report",
            "capabilityId",
            "latencyMs",
            "errorRate",
            "drift",
            "tenantImpact",
        ]:
            self.assertIn(label, page)


if __name__ == "__main__":
    unittest.main()
