from pathlib import Path
import json
import subprocess
import unittest
from command_utils import resolve_node_command

ROOT = Path(__file__).resolve().parents[1]


def run_engineering_core_script(script: str):
    subprocess.run(
        [*resolve_node_command("npx"), "tsc", "-p", "engineering-core/tsconfig.json", "--outDir", ".tmp/engineering-core"],
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


class EngineeringCoreTest(unittest.TestCase):
    def test_required_phase_four_structure_exists(self):
        required_paths = [
            "engineering-core/codes/SBC.ts",
            "engineering-core/codes/AISC.ts",
            "engineering-core/codes/Eurocode.ts",
            "engineering-core/materials/steel.ts",
            "engineering-core/materials/bolts.ts",
            "engineering-core/materials/anchors.ts",
            "engineering-core/materials/grout.ts",
            "engineering-core/sections/SHS.ts",
            "engineering-core/sections/RHS.ts",
            "engineering-core/sections/IPE.ts",
            "engineering-core/sections/HEA.ts",
            "engineering-core/sections/W.ts",
            "engineering-core/calculators/member-weight.ts",
            "engineering-core/calculators/plate-weight.ts",
            "engineering-core/calculators/bolt-group.ts",
            "engineering-core/calculators/anchor-load.ts",
            "engineering-core/validators/code-check.ts",
            "engineering-core/validators/design-check.ts",
        ]

        for relative_path in required_paths:
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_calculators_and_validators_return_governed_results(self):
        result = run_engineering_core_script(
            """
import { calculateAnchorLoad, calculateBoltGroup, calculateMemberWeight, calculatePlateWeight, validateCodeSelection, validateDesignCapacity } from './.tmp/engineering-core/index.js';
console.log(JSON.stringify({
  member: calculateMemberWeight({ sectionName: 'IPE200', lengthM: 12 }),
  plate: calculatePlateWeight({ widthMm: 200, lengthMm: 300, thicknessMm: 10, quantity: 2 }),
  bolts: calculateBoltGroup({ boltCount: 4, boltDiameterMm: 20 }),
  anchor: calculateAnchorLoad({ factoredLoadKn: 240, anchorCount: 4, eccentricityFactor: 1.2 }),
  code: validateCodeSelection('SBC'),
  design: validateDesignCapacity({ label: 'Bolt group shear', demand: 300, capacity: 500 }),
}));
"""
        )

        self.assertEqual(result["member"]["totalWeightKg"], 268.8)
        self.assertEqual(result["plate"]["totalWeightKg"], 9.42)
        self.assertGreater(result["bolts"]["groupShearKn"], 0)
        self.assertEqual(result["anchor"]["demandPerAnchorKn"], 72)
        self.assertEqual(result["code"]["status"], "pass")
        self.assertEqual(result["design"]["status"], "pass")


if __name__ == "__main__":
    unittest.main()
