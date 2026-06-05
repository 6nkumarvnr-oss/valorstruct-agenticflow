from pathlib import Path
import json
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def run_drawing_script(script: str):
    subprocess.run(
        ["npx", "tsc", "-p", "drawing-intelligence-core/tsconfig.json", "--outDir", ".tmp/drawing-intelligence-core"],
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


class DrawingIntelligenceCoreTest(unittest.TestCase):
    def test_required_phase_four_five_modules_exist(self):
        required_paths = [
            "drawing-intelligence-core/DimensionParser.ts",
            "drawing-intelligence-core/ShapeParser.ts",
            "drawing-intelligence-core/SectionParser.ts",
            "drawing-intelligence-core/HoleParser.ts",
            "drawing-intelligence-core/WeldParser.ts",
            "drawing-intelligence-core/PartExtractor.ts",
            "drawing-intelligence-core/ShopDrawingAssistant.ts",
            "drawing-intelligence-core/DrawingMetadata.ts",
        ]

        for relative_path in required_paths:
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_base_plate_note_extracts_structured_part_and_manufacturing_handoff(self):
        result = run_drawing_script(
            """
import { extractPartsFromDrawingNotes } from './.tmp/drawing-intelligence-core/index.js';
const [part] = extractPartsFromDrawingNotes('DWG No BP-001 Rev A; Base Plate 400 x 400 x 20, 4-M20 Holes, S275 Steel, Paint, 6mm fillet weld');
console.log(JSON.stringify(part));
"""
        )

        self.assertEqual(result["shapeType"], "Plate")
        self.assertEqual(result["dimensions"], {"widthMm": 400, "lengthMm": 400, "thicknessMm": 20})
        self.assertEqual(result["holes"][0]["count"], 4)
        self.assertEqual(result["holes"][0]["diameterMm"], 20)
        self.assertEqual(result["materialGrade"], "S275")
        self.assertEqual(result["welds"][0]["type"], "fillet")
        self.assertEqual(result["handoffs"]["manufacturingInput"]["widthMm"], 400)
        self.assertEqual(result["handoffs"]["quotationItemSeed"]["unit"], "each")

    def test_drawing_core_connects_to_manufacturing_core(self):
        subprocess.run(
            ["npx", "tsc", "-p", "manufacturing-core/tsconfig.json", "--outDir", ".tmp/manufacturing-core"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        result = run_drawing_script(
            """
import { extractPartsFromDrawingNotes } from './.tmp/drawing-intelligence-core/index.js';
import { estimateBasePlateManufacturing } from './.tmp/manufacturing-core/index.js';
const [part] = extractPartsFromDrawingNotes('Base Plate 400 x 400 x 20, 4-M20 Holes, S275 Steel, Paint');
const estimate = estimateBasePlateManufacturing(part.handoffs.manufacturingInput);
console.log(JSON.stringify({ part, estimate }));
"""
        )

        self.assertEqual(result["estimate"]["weightKg"], 25.12)
        self.assertEqual(result["estimate"]["estimatedCostSar"], 195)
        self.assertEqual(result["estimate"]["operations"][1]["name"], "Drill 4 Holes")

    def test_supported_section_families_extract_steel_design_and_quotation_seeds(self):
        result = run_drawing_script(
            """
import { extractPartsFromDrawingNotes } from './.tmp/drawing-intelligence-core/index.js';
const notes = ['SHS 200 x 200 x 6 S355 Steel', 'RHS 250 x 150 x 8 S275 Steel', 'CHS 168 x 8 S355 Steel', 'Angle L 75 x 75 x 8 S275 Steel', 'Channel UPN 200 S275 Steel', 'I-Beam IPE 200 S355 Steel'];
const parts = notes.map((note) => extractPartsFromDrawingNotes(note)[0]);
console.log(JSON.stringify(parts.map((part) => ({ shapeType: part.shapeType, section: part.section?.designation, steel: part.handoffs.steelDesignInputSeed, quotation: part.handoffs.quotationItemSeed }))));
"""
        )

        self.assertEqual([part["shapeType"] for part in result], ["SHS", "RHS", "CHS", "Angle", "Channel", "I-Beam"])
        self.assertEqual(result[0]["steel"]["materialGrade"], "S355")
        self.assertEqual(result[5]["section"], "IPE200")
        self.assertEqual(result[5]["quotation"]["unit"], "m")



    def test_rhs_br_01_note_extracts_part_mark_section_and_length(self):
        result = run_drawing_script(
            """
import { extractPartsFromDrawingNotes } from './.tmp/drawing-intelligence-core/index.js';
const [part] = extractPartsFromDrawingNotes('BR-01 RHS80x40x2.8 S275 length 2.5m.');
console.log(JSON.stringify(part));
"""
        )

        self.assertEqual(result["partMark"], "BR-01")
        self.assertEqual(result["shapeType"], "RHS")
        self.assertEqual(result["section"]["designation"], "RHS80X40X2.8")
        self.assertEqual(result["materialGrade"], "S275")
        self.assertEqual(result["lengthM"], 2.5)
        self.assertEqual(result["quantity"], 1)

    def test_shop_drawing_assistant_generates_text_based_issue_package(self):
        result = run_drawing_script(
            """
import { generateShopDrawingAssistantPackage } from './.tmp/drawing-intelligence-core/index.js';
const output = generateShopDrawingAssistantPackage('BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.');
console.log(JSON.stringify(output));
"""
        )

        self.assertEqual(result["partList"][0]["part"], "BP-01")
        self.assertEqual(result["partList"][0]["material"], "S275")
        self.assertEqual(result["partList"][0]["dimensions"], "400x400x20")
        self.assertIn("Part BP-01: 4-M20", result["holeSchedule"])
        self.assertIn("Part BP-01: 6mm fillet weld all around", result["weldNotes"])
        self.assertGreaterEqual(len(result["fabricationNotes"]), 1)
        self.assertGreaterEqual(len(result["inspectionChecklist"]), 1)
        self.assertIn("Rev 00", result["revisionLog"][0])
        self.assertGreaterEqual(len(result["drawingIssueChecklist"]), 1)

    def test_shop_drawing_assistant_demo_page_contains_required_panels(self):
        page = (ROOT / "agenticflow/frontend/src/pages/ShopDrawingAssistantDemo.tsx").read_text()

        for required in [
            "Shop Drawing Assistant MVP",
            "drawing note input",
            "part list",
            "hole schedule",
            "weld notes",
            "fabrication notes",
            "inspection checklist",
            "revision log",
            "drawing issue checklist",
            "Generate shop drawing assistant package",
        ]:
            self.assertIn(required, page)

    def test_unknown_notes_return_review_warnings(self):
        result = run_drawing_script(
            """
import { extractPartsFromDrawingNotes } from './.tmp/drawing-intelligence-core/index.js';
const [part] = extractPartsFromDrawingNotes('Unclear bracket note without material');
console.log(JSON.stringify(part));
"""
        )

        self.assertEqual(result["shapeType"], "Unknown")
        self.assertIn("Shape could not be classified from drawing notes.", result["warnings"])
        self.assertIn("Material grade missing; default handoff may use S275.", result["warnings"])


if __name__ == "__main__":
    unittest.main()
