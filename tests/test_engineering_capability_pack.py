from pathlib import Path
import json
import subprocess
import unittest
try:
    from command_utils import resolve_node_command
except ModuleNotFoundError:
    from tests.command_utils import resolve_node_command

ROOT = Path(__file__).resolve().parents[1]


def run_capability_script(script: str):
    subprocess.run(
        [resolve_node_command("npx"), "tsc", "-p", "engineering-capability-pack/tsconfig.json", "--outDir", ".tmp/engineering-capability-pack"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    output = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return json.loads(output)


class EngineeringCapabilityPackTest(unittest.TestCase):
    def test_required_workflow_modules_exist(self):
        for workflow in [
            "SteelWeightWorkflow",
            "MaterialTakeoffWorkflow",
            "PlateOptimizationWorkflow",
            "SectionSelectionWorkflow",
            "ConnectionSizingWorkflow",
            "CodeValidationWorkflow",
        ]:
            self.assertTrue((ROOT / f"engineering-capability-pack/{workflow}.ts").exists(), workflow)

    def test_workflows_execute_with_engineering_core(self):
        result = run_capability_script(
            """
import {
  runCodeValidationWorkflow,
  runConnectionSizingWorkflow,
  runMaterialTakeoffWorkflow,
  runPlateOptimizationWorkflow,
  runSectionSelectionWorkflow,
  runSteelWeightWorkflow,
} from './.tmp/engineering-capability-pack/engineering-capability-pack/index.js';
console.log(JSON.stringify({
  steel: runSteelWeightWorkflow({ sectionName: 'IPE200', lengthM: 12 }),
  takeoff: runMaterialTakeoffWorkflow({ members: [{ sectionName: 'IPE200', lengthM: 12 }], plates: [{ widthMm: 200, lengthMm: 300, thicknessMm: 10, quantity: 2 }] }),
  plate: runPlateOptimizationWorkflow({ widthMm: 200, lengthMm: 300, thicknessMm: 10, quantity: 2, stockWidthMm: 1000, stockLengthMm: 2000 }),
  section: runSectionSelectionWorkflow({ family: 'IPE', requiredWeightKgPerM: 20 }),
  connection: runConnectionSizingWorkflow({ shearDemandKn: 250, boltCount: 4, boltDiameterMm: 20, axialDemandKn: 240, anchorCount: 4 }),
  code: runCodeValidationWorkflow({ codeId: 'SBC', checks: [{ label: 'Member axial', demand: 200, capacity: 300 }] }),
}));
"""
        )

        self.assertEqual(result["steel"]["result"]["totalWeightKg"], 268.8)
        self.assertEqual(result["takeoff"]["totalWeightKg"], 278.22)
        self.assertEqual(result["plate"]["recommendation"], "Fits within selected stock plate.")
        self.assertEqual(result["section"]["selectedSection"]["sectionName"], "IPE200")
        self.assertEqual(result["connection"]["checks"][0]["status"], "pass")
        self.assertEqual(result["code"]["validationStatus"], "pass")


if __name__ == "__main__":
    unittest.main()
