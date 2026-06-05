from pathlib import Path
import json
import subprocess
import unittest
from command_utils import resolve_node_command

from agenticflow.backend.main import SteelDesignRunRequest, run_steel_design

ROOT = Path(__file__).resolve().parents[1]


def run_steel_script(script: str):
    subprocess.run(
        [*resolve_node_command("npx"), "tsc", "-p", "engineering-capability-pack/tsconfig.json", "--outDir", ".tmp/steel-design-pack"],
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


class SteelDesignPackTest(unittest.TestCase):
    def test_utilization_checks_and_report(self):
        result = run_steel_script(
            """
import { runSteelDesignWorkflow } from './.tmp/steel-design-pack/engineering-capability-pack/steel-design-pack/runSteelDesignWorkflow.js';
const result = runSteelDesignWorkflow();
console.log(JSON.stringify(result));
"""
        )
        checks = {check["checkName"]: check for check in result["summary"]["checks"]}

        self.assertEqual(checks["Axial tension"]["utilization"], 0)
        self.assertEqual(checks["Axial compression"]["utilization"], 0.119)
        self.assertEqual(checks["Bending"]["utilization"], 0.275)
        self.assertEqual(checks["Shear"]["utilization"], 0.074)
        self.assertEqual(checks["Deflection"]["utilization"], 0.6)
        self.assertEqual(result["summary"]["governingUtilization"], 0.6)
        self.assertEqual(result["summary"]["status"], "pass")
        self.assertIn("Sample Canopy Member Check", result["reportMarkdown"])
        self.assertIn("Member: B1", result["reportMarkdown"])
        self.assertIn("Code/Profile: SBC", result["reportMarkdown"])
        self.assertIn("PRELIMINARY ENGINEERING CHECK", result["reportMarkdown"])

    def test_warning_when_input_data_is_incomplete(self):
        result = run_steel_script(
            """
import { runSteelDesignWorkflow, sampleSteelDesignInput } from './.tmp/steel-design-pack/engineering-capability-pack/steel-design-pack/runSteelDesignWorkflow.js';
const result = runSteelDesignWorkflow({ ...sampleSteelDesignInput, sectionName: 'UNKNOWN', materialGrade: 'UNKNOWN', deflectionDemandMm: 0 });
console.log(JSON.stringify(result.context.warnings));
"""
        )

        self.assertGreaterEqual(len(result), 3)
        self.assertTrue(any("Section UNKNOWN" in warning for warning in result))
        self.assertTrue(any("Material UNKNOWN" in warning for warning in result))

    def test_p_agent_routes_steel_design_goal(self):
        subprocess.run(
            [*resolve_node_command("npx"), "tsc", "-p", "agenticflow/tsconfig.json"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        output = subprocess.run(
            [
                "node",
                "--input-type=module",
                "-e",
                """
import { AgentRuntime } from './.tmp/agenticflow/p-agent/runtime/AgentRuntime.js';
const result = new AgentRuntime().run('steel design axial bending shear deflection member check');
console.log(JSON.stringify(result));
""",
            ],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        ).stdout
        result = json.loads(output)

        self.assertEqual(result["plan"][1]["title"], "Select Steel Design Pack")
        self.assertEqual(result["engineeringResult"]["selectedWorkflow"], "SteelDesignWorkflow")
        self.assertEqual(result["engineeringResult"]["result"]["summary"]["governingUtilization"], 0.6)
        self.assertIn("SteelDesignWorkflow", result["auditSummary"]["eventTypes"])

    def test_backend_endpoint_shape_exists(self):
        response = run_steel_design(
            SteelDesignRunRequest(
                projectName="Sample Canopy Member Check",
                memberId="B1",
                codeProfile="SBC",
                materialGrade="S355",
                sectionName="IPE200",
                lengthM=6,
                effectiveLengthFactor=1,
                axialDemandKN=-120,
                shearDemandKN=45,
                momentDemandKNm=25,
                deflectionDemandMm=12,
                deflectionLimitMm=20,
            )
        )

        self.assertEqual(response["status"], "completed")
        self.assertEqual(response["summary"]["governingUtilization"], 0.6)
        self.assertIn("reportMarkdown", response)

    def test_frontend_page_contains_required_panels(self):
        page = (ROOT / "agenticflow/frontend/src/pages/SteelDesignDemo.tsx").read_text(encoding="utf-8")

        for label in [
            "project/member input",
            "material and section input",
            "demand input",
            "Run design",
            "utilization table",
            "pass/fail status",
            "markdown report preview",
        ]:
            self.assertIn(label, page)


if __name__ == "__main__":
    unittest.main()
