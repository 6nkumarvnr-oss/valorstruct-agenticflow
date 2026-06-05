from pathlib import Path
import json
import subprocess
import unittest
try:
    from command_utils import resolve_node_command
except ModuleNotFoundError:
    from tests.command_utils import resolve_node_command

ROOT = Path(__file__).resolve().parents[1]


def run_manufacturing_script(script: str):
    subprocess.run(
        [resolve_node_command("npx"), "tsc", "-p", "drawing-to-manufacturing-core/tsconfig.json", "--outDir", ".tmp/drawing-to-manufacturing-core"],
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


class DrawingToManufacturingCoreTest(unittest.TestCase):
    def test_required_drawing_to_manufacturing_core_files_exist(self):
        for relative_path in [
            "drawing-to-manufacturing-core/README.md",
            "drawing-to-manufacturing-core/types.ts",
            "drawing-to-manufacturing-core/CuttingListBuilder.ts",
            "drawing-to-manufacturing-core/DrillingScheduleBuilder.ts",
            "drawing-to-manufacturing-core/WeldScheduleBuilder.ts",
            "drawing-to-manufacturing-core/CoatingScheduleBuilder.ts",
            "drawing-to-manufacturing-core/InspectionPlanBuilder.ts",
            "drawing-to-manufacturing-core/ProductionRouteBuilder.ts",
            "drawing-to-manufacturing-core/ManufacturingPackageReport.ts",
            "drawing-to-manufacturing-core/DrawingManufacturingPackageBuilder.ts",
            "drawing-to-manufacturing-core/index.ts",
            "drawing-to-manufacturing-core/tsconfig.json",
        ]:
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_bp_01_generates_deterministic_manufacturing_package_and_report(self):
        result = run_manufacturing_script(
            """
import { buildDrawingManufacturingPackage, generateManufacturingPackageReport } from './.tmp/drawing-to-manufacturing-core/drawing-to-manufacturing-core/index.js';
const manufacturingPackage = buildDrawingManufacturingPackage('BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.');
const report = generateManufacturingPackageReport(manufacturingPackage);
console.log(JSON.stringify({ manufacturingPackage, report }));
"""
        )

        package = result["manufacturingPackage"]
        self.assertEqual(package["cuttingList"][0]["partId"], "BP-01")
        self.assertEqual(package["cuttingList"][0]["cuttingMethod"], "plasma")
        self.assertEqual(package["drillingSchedule"][0]["quantity"], 4)
        self.assertEqual(package["weldSchedule"][0]["weldLengthM"], 1.6)
        self.assertEqual(package["coatingSchedule"][0]["areaM2"], 0.32)
        self.assertIn("Final inspection", [step["operation"] for step in package["productionRoute"]])
        self.assertEqual(package["totalEstimatedLaborHr"], 1.4)
        self.assertEqual(package["totalEstimatedProductionHr"], 4.2)
        self.assertIn("Drawing-to-Manufacturing Package", result["report"])
        self.assertIn("Production Route", result["report"])

    def test_br_01_rhs_generates_deterministic_manufacturing_package(self):
        result = run_manufacturing_script(
            """
import { buildDrawingManufacturingPackage } from './.tmp/drawing-to-manufacturing-core/drawing-to-manufacturing-core/index.js';
const manufacturingPackage = buildDrawingManufacturingPackage('BR-01 RHS80x40x2.8 S275 length 2.5m.');
console.log(JSON.stringify({ manufacturingPackage }));
"""
        )

        package = result["manufacturingPackage"]
        self.assertEqual(package["partId"], "BR-01")
        self.assertEqual(package["cuttingList"][0]["shape"], "RHS")
        self.assertEqual(package["cuttingList"][0]["dimensions"], "RHS80x40x2.8 length 2.5m")
        self.assertEqual(package["cuttingList"][0]["quantity"], 2)
        self.assertEqual(package["cuttingList"][0]["cuttingMethod"], "saw")
        self.assertEqual(package["cuttingList"][0]["estimatedCuttingTimeHr"], 0.2)
        self.assertEqual(package["drillingSchedule"], [])
        self.assertEqual(package["weldSchedule"][0]["weldLengthM"], 0.4)
        self.assertEqual(package["weldSchedule"][0]["estimatedWeldingTimeHr"], 0.2)
        self.assertEqual(package["coatingSchedule"][0]["areaM2"], 0.6)
        self.assertEqual(package["coatingSchedule"][0]["estimatedCoatingTimeHr"], 0.15)
        self.assertIn("Final inspection", [step["operation"] for step in package["productionRoute"]])
        self.assertEqual(package["totalEstimatedLaborHr"], 0.8)
        self.assertEqual(package["totalEstimatedProductionHr"], 2.2)



if __name__ == "__main__":
    unittest.main()
