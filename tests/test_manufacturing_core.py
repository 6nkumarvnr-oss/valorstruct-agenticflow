from pathlib import Path
import json
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def run_manufacturing_script(script: str):
    subprocess.run(
        ["npx", "tsc", "-p", "manufacturing-core/tsconfig.json", "--outDir", ".tmp/manufacturing-core"],
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


class ManufacturingCoreTest(unittest.TestCase):
    def test_phase_four_manufacturing_structure_exists(self):
        required_paths = [
            "manufacturing-core/materials/steel.ts",
            "manufacturing-core/shapes/base-plate.ts",
            "manufacturing-core/dimensions/plate-dimensions.ts",
            "manufacturing-core/fabrication-methods/operations.ts",
            "manufacturing-core/machines/machine-registry.ts",
            "manufacturing-core/welding/weld-planning.ts",
            "manufacturing-core/cutting/cutting-plan.ts",
            "manufacturing-core/drilling/hole-plan.ts",
            "manufacturing-core/coating/coating-plan.ts",
            "manufacturing-core/inspection/inspection-plan.ts",
            "manufacturing-core/routing/production-router.ts",
            "manufacturing-core/costing/cost-estimator.ts",
        ]

        for relative_path in required_paths:
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_base_plate_estimate_matches_phase_four_example(self):
        result = run_manufacturing_script(
            """
import { estimateBasePlateManufacturing } from './.tmp/manufacturing-core/index.js';
const estimate = estimateBasePlateManufacturing({
  partName: 'Base Plate',
  widthMm: 400,
  lengthMm: 400,
  thicknessMm: 20,
  holes: { count: 4, diameterMm: 20 },
  materialGrade: 'S275',
  coatingSystem: 'Paint',
  currency: 'SAR',
});
console.log(JSON.stringify(estimate));
"""
        )

        self.assertEqual(result["material"]["grade"], "S275")
        self.assertEqual(result["weightKg"], 25.12)
        self.assertEqual([operation["name"] for operation in result["operations"]], [
            "Plasma Cut",
            "Drill 4 Holes",
            "Edge Grind",
            "Fit-Up",
            "Weld",
            "Paint",
        ])
        self.assertEqual([step["name"] for step in result["inspection"]], [
            "Dimension Check",
            "Hole Check",
            "Weld Check",
            "DFT Check",
        ])
        self.assertEqual(result["estimatedLaborHours"], 1.4)
        self.assertEqual(result["estimatedCostSar"], 195)
        self.assertEqual(result["estimatedProductionHours"], 4.2)

    def test_dimension_warnings_for_incomplete_plate_data(self):
        result = run_manufacturing_script(
            """
import { estimateBasePlateManufacturing, sampleBasePlateManufacturingInput } from './.tmp/manufacturing-core/index.js';
const estimate = estimateBasePlateManufacturing({ ...sampleBasePlateManufacturingInput, thicknessMm: 0 });
console.log(JSON.stringify(estimate));
"""
        )

        self.assertIn("Plate dimensions must be positive.", result["warnings"])


if __name__ == "__main__":
    unittest.main()
