from pathlib import Path
import json
import subprocess
import unittest

from agenticflow.backend.main import QuotationItemInput, QuotationRunRequest, run_quotation

ROOT = Path(__file__).resolve().parents[1]


def run_node_quote_script(script: str):
    subprocess.run(["npm", "run", "test:ts"], cwd=ROOT, check=True, capture_output=True, text=True)
    subprocess.run(
        ["npx", "tsc", "-p", "agenticflow/tsconfig.json"],
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


class ValorQuotationPackTest(unittest.TestCase):
    def test_boq_direct_amount_calculation(self):
        result = run_node_quote_script(
            """
import { generateBOQ } from './.tmp/agenticflow/capability-packs/valor-quotation-pack/BOQGenerator.js';
console.log(JSON.stringify(generateBOQ([{ description: 'Steel fabrication', unit: 'kg', quantity: 1000, materialRate: 5, laborRate: 2 }])[0]));
"""
        )

        self.assertEqual(result["directRate"], 7)
        self.assertEqual(result["directAmount"], 7000)

    def test_commercial_summary_calculation(self):
        result = run_node_quote_script(
            """
import { generateBOQ } from './.tmp/agenticflow/capability-packs/valor-quotation-pack/BOQGenerator.js';
import { calculateCommercialSummary } from './.tmp/agenticflow/capability-packs/valor-quotation-pack/RateCalculator.js';
const boq = generateBOQ([{ description: 'Steel fabrication', unit: 'kg', quantity: 1000, materialRate: 5, laborRate: 2 }]);
console.log(JSON.stringify(calculateCommercialSummary(boq, 'SAR', 10, 15, 15)));
"""
        )

        self.assertEqual(result["subtotal"], 7000)
        self.assertEqual(result["overhead"], 700)
        self.assertEqual(result["profit"], 1155)
        self.assertEqual(result["beforeVat"], 8855)
        self.assertEqual(result["vat"], 1328.25)
        self.assertEqual(result["grandTotal"], 10183.25)

    def test_simple_steel_weight_calculation(self):
        result = run_node_quote_script(
            """
import { calculateSteelMemberWeight } from './.tmp/agenticflow/capability-packs/valor-quotation-pack/SimpleCalculationEngine.js';
console.log(JSON.stringify(calculateSteelMemberWeight({ sectionName: 'IPE200', lengthM: 12, weightKgPerM: 22.4 })));
"""
        )

        self.assertEqual(result["totalWeightKg"], 268.8)

    def test_quotation_result_and_report_generation(self):
        result = run_node_quote_script(
            """
import { runQuotationWorkflow } from './.tmp/agenticflow/capability-packs/valor-quotation-pack/runQuotationWorkflow.js';
const result = runQuotationWorkflow();
console.log(JSON.stringify({ quotation: result.quotation, reportMarkdown: result.report.reportMarkdown }));
"""
        )

        self.assertEqual(result["quotation"]["quotationId"], "VS-QTN-20260302-001")
        self.assertIn("Sample Steel Platform", result["reportMarkdown"])
        self.assertIn("ABC Contracting", result["reportMarkdown"])
        self.assertIn("Grand Total", result["reportMarkdown"])

    def test_p_agent_can_route_quotation_goal(self):
        result = run_node_quote_script(
            """
import { AgentRuntime } from './.tmp/agenticflow/p-agent/runtime/AgentRuntime.js';
const result = new AgentRuntime().run('Prepare quotation and BOQ estimate');
console.log(JSON.stringify(result));
"""
        )

        self.assertEqual(result["plan"][1]["title"], "Select Valor Quotation Pack")
        self.assertEqual(result["capabilityResult"]["status"], "completed")
        self.assertEqual(result["capabilityResult"]["summary"]["grandTotal"], 10183.25)
        self.assertEqual(result["memoryEntryId"], "memory-1")

    def test_backend_quotation_endpoint_shape_exists(self):
        response = run_quotation(
            QuotationRunRequest(
                projectName="Sample Steel Platform",
                clientName="ABC Contracting",
                location="Saudi Arabia",
                scopeDescription="Fabrication and installation of steel platform",
                currency="SAR",
                items=[QuotationItemInput(description="Steel fabrication", unit="kg", quantity=1000, materialRate=5, laborRate=2)],
                overheadPercent=10,
                profitPercent=15,
                vatPercent=15,
            )
        )

        self.assertEqual(response["status"], "completed")
        self.assertEqual(response["boq"][0]["directAmount"], 7000)
        self.assertEqual(response["summary"]["grandTotal"], 10183.25)
        self.assertIn("reportMarkdown", response["report"])

    def test_frontend_quotation_demo_contains_required_panels(self):
        page = (ROOT / "agenticflow/frontend/src/pages/QuotationDemo.tsx").read_text()

        for label in [
            "project name input",
            "client name input",
            "location input",
            "scope description",
            "Add/edit BOQ item section",
            "overhead %",
            "profit %",
            "VAT %",
            "Run quotation",
            "BOQ table output",
            "Commercial summary output",
            "Report markdown preview",
        ]:
            self.assertIn(label, page)


if __name__ == "__main__":
    unittest.main()
