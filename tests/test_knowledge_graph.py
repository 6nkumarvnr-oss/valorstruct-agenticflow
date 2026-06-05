from pathlib import Path
import json
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def run_knowledge_script(script: str):
    subprocess.run(
        ["npx", "tsc", "-p", "knowledge-graph/tsconfig.json", "--outDir", ".tmp/knowledge-graph"],
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


class KnowledgeGraphTest(unittest.TestCase):
    def test_required_phase_four_six_structure_exists(self):
        required_paths = [
            "knowledge-graph/nodes/node-types.ts",
            "knowledge-graph/nodes/base-plate-graph.ts",
            "knowledge-graph/edges/edge-types.ts",
            "knowledge-graph/queries/graph-queries.ts",
            "knowledge-graph/reasoning/graph-reasoner.ts",
        ]

        for relative_path in required_paths:
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_graph_contains_required_node_types(self):
        result = run_knowledge_script(
            """
import { createBasePlateKnowledgeGraph } from './.tmp/knowledge-graph/index.js';
const graph = createBasePlateKnowledgeGraph();
console.log(JSON.stringify([...new Set(graph.nodes.map((node) => node.type))].sort()));
"""
        )

        self.assertEqual(
            result,
            ["Code", "Connection", "Cost", "Drawing", "Fabrication", "Inspection", "Material", "Part", "Project", "Risk", "Section", "Supplier"],
        )

    def test_bp_01_links_to_requested_manufacturing_and_cost_chain(self):
        result = run_knowledge_script(
            """
import { createBasePlateKnowledgeGraph, findNeighbors } from './.tmp/knowledge-graph/index.js';
const graph = createBasePlateKnowledgeGraph();
const neighbors = findNeighbors(graph, 'part-bp-01').map((node) => node.label);
console.log(JSON.stringify(neighbors));
"""
        )

        for label in ["Plate 400x400x20", "4-M20 Holes", "Paint System C3", "Inspection Plan", "SAR 195"]:
            self.assertIn(label, result)

    def test_reasoner_returns_cross_layer_summary_for_p_agent(self):
        result = run_knowledge_script(
            """
import { reasonAboutBasePlateGraph } from './.tmp/knowledge-graph/index.js';
console.log(JSON.stringify(reasonAboutBasePlateGraph('BP-01')));
"""
        )

        self.assertEqual(result["subject"], "BP-01")
        self.assertEqual(result["material"], "S275")
        self.assertEqual(result["weightKg"], 25.12)
        self.assertEqual(result["estimatedCost"], "SAR 195")
        self.assertIn("Plasma Cut", result["fabricationOperations"])
        self.assertIn("Drill 4 Holes", result["fabricationOperations"])
        self.assertIn("DFT Check", result["inspectionPlan"])
        self.assertEqual(result["recommendedCapabilities"], ["Drawing Intelligence Core", "Manufacturing Core", "Steel Design Pack", "Valor Quotation Pack"])

    def test_p_agent_routes_graph_reasoning_goal(self):
        subprocess.run(["npx", "tsc", "-p", "agenticflow/tsconfig.json"], cwd=ROOT, check=True, capture_output=True, text=True)
        output = subprocess.run(
            [
                "node",
                "--input-type=module",
                "-e",
                """
import { TaskPlanner } from './.tmp/agenticflow/p-agent/planner/TaskPlanner.js';
import { AgentRuntime } from './.tmp/agenticflow/p-agent/runtime/AgentRuntime.js';
const goal = 'Trace BP-01 in the engineering knowledge graph';
const runtime = new AgentRuntime();
const result = runtime.run(goal);
const planner = new TaskPlanner();
console.log(JSON.stringify({ plan: planner.createPlan(goal), result, memory: runtime.getMemory().list() }));
""",
            ],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        payload = json.loads(output)

        self.assertEqual(payload["plan"][1]["title"], "Query Engineering Knowledge Graph")
        self.assertEqual(payload["result"]["knowledgeResult"]["estimatedCost"], "SAR 195")
        self.assertIn("GRAPH_QUERIED", payload["result"]["auditSummary"]["eventTypes"])
        self.assertEqual(payload["memory"][0]["goal"], "Trace BP-01 in the engineering knowledge graph")


if __name__ == "__main__":
    unittest.main()
