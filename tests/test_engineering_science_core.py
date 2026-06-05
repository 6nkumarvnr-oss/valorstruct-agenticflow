from pathlib import Path
import json
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def run_science_script(script: str):
    subprocess.run(
        ["npx", "tsc", "-p", "engineering-science-core/tsconfig.json", "--outDir", ".tmp/engineering-science-core"],
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


class EngineeringScienceCoreTest(unittest.TestCase):
    def test_requested_layer_directories_exist(self):
        for path in [
            "engineering-science-core/mathematics/algebra",
            "engineering-science-core/mathematics/calculus",
            "engineering-science-core/mathematics/linear-algebra",
            "engineering-science-core/mathematics/numerical-methods",
            "engineering-science-core/mathematics/statistics",
            "engineering-science-core/mathematics/optimization",
            "engineering-science-core/physics/kinematics",
            "engineering-science-core/physics/dynamics",
            "engineering-science-core/physics/statics",
            "engineering-science-core/mechanics/stress",
            "engineering-science-core/mechanics/strain",
            "engineering-science-core/mechanics/beam-theory",
            "engineering-science-core/structural-analysis/truss",
            "engineering-science-core/structural-analysis/frame",
            "engineering-science-core/structural-analysis/connection",
            "engineering-science-core/optimization/member-selection",
            "engineering-science-core/simulation/load-simulation",
            "engineering-science-core/ai-reasoning",
        ]:
            self.assertTrue((ROOT / path).exists(), path)

    def test_science_examples_execute(self):
        result = run_science_script(
            """
import {
  calculateAxialBarStiffness,
  calculateAxialStrain,
  calculateEulerBucklingLoad,
  calculateKineticEnergy,
  calculateMidspanPointLoadDeflection,
  calculateNormalStress,
  checkForceEquilibrium,
  combineLoads,
  createEngineeringKnowledgeGraph,
  distributeConnectionLoad,
  evaluatePolynomial,
  findRootBisection,
  gradientDescent,
  linearRegression,
  numericalDerivative,
  selectLightestPassingMember,
  solveConstantAcceleration,
  solveLinearSystem,
  solveSimplySupportedReactions,
} from './.tmp/engineering-science-core/index.js';
const graph = createEngineeringKnowledgeGraph(
  [{ id: 'SHS200', type: 'Section', label: 'SHS200x200x6' }, { id: 'S355', type: 'Material', label: 'S355 Steel' }],
  [{ from: 'SHS200', to: 'S355', relation: 'uses-material' }],
);
console.log(JSON.stringify({
  matrix: solveLinearSystem([[2, 1], [1, -1]], [5, 1]),
  polynomial: evaluatePolynomial([1, 2, 3], 2),
  derivative: numericalDerivative((x) => x * x, 3),
  root: findRootBisection({ fn: (x) => x * x - 4, lower: 0, upper: 5 }),
  regression: linearRegression([{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }]),
  optimum: gradientDescent({ initialX: 10, learningRate: 0.1, iterations: 50, gradient: (x) => 2 * (x - 3) }),
  kinematics: solveConstantAcceleration({ initialVelocityMps: 0, accelerationMps2: 9.81, timeSec: 2 }),
  energy: calculateKineticEnergy(10, 3),
  equilibrium: checkForceEquilibrium([{ fx: 10, fy: 0 }, { fx: -10, fy: 0 }]),
  stress: calculateNormalStress(100, 500),
  strain: calculateAxialStrain(2, 1000),
  beam: calculateMidspanPointLoadDeflection({ spanM: 6, pointLoadKn: 10, elasticModulusMpa: 200000, inertiaMm4: 80000000 }),
  buckling: calculateEulerBucklingLoad({ elasticModulusMpa: 200000, inertiaMm4: 80000000, effectiveLengthM: 3 }),
  reactions: solveSimplySupportedReactions(6, [{ xM: 3, loadKn: 12 }]),
  stiffness: calculateAxialBarStiffness(200000, 1000, 2),
  loadPath: distributeConnectionLoad(100, [{ id: 'bolt-line-a', stiffness: 1 }, { id: 'bolt-line-b', stiffness: 3 }]),
  member: selectLightestPassingMember([{ sectionName: 'A', capacityKn: 100, weightKgPerM: 10, costPerM: 20 }, { sectionName: 'B', capacityKn: 200, weightKgPerM: 15, costPerM: 30 }], 150),
  loads: combineLoads([{ name: 'DL', valueKn: 10, factor: 1.2 }, { name: 'LL', valueKn: 5, factor: 1.6 }]),
  linked: graph.findLinked('SHS200'),
}));
"""
        )

        self.assertEqual(result["matrix"]["solution"], [2, 1])
        self.assertEqual(result["polynomial"], 17)
        self.assertEqual(result["derivative"], 6)
        self.assertEqual(result["root"]["root"], 2)
        self.assertEqual(result["regression"]["slope"], 2)
        self.assertAlmostEqual(result["optimum"]["optimumX"], 3, places=3)
        self.assertEqual(result["kinematics"]["displacementM"], 19.62)
        self.assertEqual(result["energy"]["kineticEnergyJ"], 45)
        self.assertTrue(result["equilibrium"]["isBalanced"])
        self.assertEqual(result["stress"]["stressMpa"], 200)
        self.assertEqual(result["strain"]["strain"], 0.002)
        self.assertGreater(result["beam"]["deflectionMm"], 0)
        self.assertGreater(result["buckling"]["criticalLoadKn"], 0)
        self.assertEqual(result["reactions"]["leftReactionKn"], 6)
        self.assertEqual(result["stiffness"]["stiffnessNPerMm"], 100000)
        self.assertEqual(result["loadPath"][1]["loadKn"], 75)
        self.assertEqual(result["member"]["selected"]["sectionName"], "B")
        self.assertEqual(result["loads"]["factoredLoadKn"], 20)
        self.assertEqual(result["linked"][0]["id"], "S355")


if __name__ == "__main__":
    unittest.main()
