from pathlib import Path
import json
import subprocess
import unittest
try:
    from command_utils import resolve_node_command
except ModuleNotFoundError:
    from tests.command_utils import resolve_node_command

ROOT = Path(__file__).resolve().parents[1]


def run_drawing_boq_script(script: str):
    subprocess.run(
        [resolve_node_command("npx"), "tsc", "-p", "drawing-to-boq-core/tsconfig.json", "--outDir", ".tmp/drawing-to-boq-core"],
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


class DrawingToBOQCoreTest(unittest.TestCase):
    def test_required_drawing_to_boq_core_files_exist(self):
        for relative_path in [
            "drawing-to-boq-core/README.md",
            "drawing-to-boq-core/types.ts",
            "drawing-to-boq-core/DrawingBOQExtractor.ts",
            "drawing-to-boq-core/BOQLineBuilder.ts",
            "drawing-to-boq-core/DrawingBOQReport.ts",
            "drawing-to-boq-core/index.ts",
            "drawing-to-boq-core/tsconfig.json",
        ]:
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_bp_01_note_generates_deterministic_boq_lines_and_report(self):
        result = run_drawing_boq_script(
            """
import { extractDrawingBOQFromNote, generateDrawingBOQReport } from './.tmp/drawing-to-boq-core/drawing-to-boq-core/index.js';
const boq = extractDrawingBOQFromNote('BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.');
const report = generateDrawingBOQReport(boq);
console.log(JSON.stringify({ boq, report }));
"""
        )

        boq = result["boq"]
        material = next(line for line in boq["lines"] if line["category"] == "material")
        drilling = next(line for line in boq["lines"] if line["category"] == "drilling")
        welding = next(line for line in boq["lines"] if line["category"] == "welding")
        coating = next(line for line in boq["lines"] if line["category"] == "coating")
        self.assertEqual(material["description"], "S275 steel plate, 400x400x20")
        self.assertEqual(material["quantity"], 25.12)
        self.assertEqual(drilling["quantity"], 4)
        self.assertEqual(welding["quantity"], 1.6)
        self.assertEqual(coating["quantity"], 0.32)
        self.assertIn("Weld length is estimated from perimeter because detailed weld path is not available.", boq["warnings"])
        self.assertIn("Drawing-to-BOQ Summary", result["report"])
        self.assertIn("| Item | Category | Description | Unit | Quantity | Confidence |", result["report"])


    def test_br_01_rhs_note_generates_deterministic_boq_lines(self):
        result = run_drawing_boq_script(
            """
import { extractDrawingBOQFromNote } from './.tmp/drawing-to-boq-core/drawing-to-boq-core/index.js';
const boq = extractDrawingBOQFromNote('BR-01 RHS80x40x2.8 S275 length 2.5m.');
console.log(JSON.stringify({ boq }));
"""
        )

        boq = result["boq"]
        by_category = {line["category"]: line for line in boq["lines"]}
        self.assertEqual(boq["partId"], "BR-01")
        self.assertEqual(by_category["material"]["quantity"], 12.5)
        self.assertIn("RHS80X40X2.8", by_category["material"]["description"])
        self.assertEqual(by_category["cutting"]["quantity"], 2)
        drilling_quantity = by_category.get("drilling", {"quantity": 0})["quantity"]
        self.assertEqual(drilling_quantity, 0)
        self.assertEqual(by_category["welding"]["quantity"], 0.4)
        self.assertEqual(by_category["coating"]["quantity"], 0.6)

    def test_drawing_boq_converts_to_quotation_item_seeds_with_demo_rates(self):
        result = run_drawing_boq_script(
            """
import { convertDrawingBOQToQuotationItems, extractDrawingBOQFromNote } from './.tmp/drawing-to-boq-core/drawing-to-boq-core/index.js';
const boq = extractDrawingBOQFromNote('BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.');
const seeds = convertDrawingBOQToQuotationItems(boq);
console.log(JSON.stringify({ seeds }));
"""
        )

        seeds = result["seeds"]
        by_description = {seed["description"]: seed for seed in seeds}
        self.assertEqual(by_description["S275 steel plate, 400x400x20"]["materialRate"], 7)
        self.assertEqual(by_description["Plasma cutting of base plate"]["materialRate"], 35)
        self.assertEqual(by_description["Drilling M20 holes"]["materialRate"], 8)
        self.assertEqual(by_description["6mm fillet weld all around"]["materialRate"], 45)
        self.assertEqual(by_description["Coating / painting allowance"]["materialRate"], 25)
        self.assertEqual(by_description["Dimensional and visual inspection"]["materialRate"], 40)


if __name__ == "__main__":
    unittest.main()
