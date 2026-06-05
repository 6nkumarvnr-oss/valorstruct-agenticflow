from pathlib import Path
import json
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def run_orchestration_script(script: str):
    subprocess.run(
        ["npx", "tsc", "-p", "workflow-orchestration-core/tsconfig.json", "--outDir", ".tmp/workflow-orchestration-core"],
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


class WorkflowOrchestrationCoreTest(unittest.TestCase):
    def test_required_phase_four_seven_modules_exist(self):
        required_paths = [
            "workflow-orchestration-core/CapabilityRegistry.ts",
            "workflow-orchestration-core/WorkflowIntentClassifier.ts",
            "workflow-orchestration-core/CapabilitySelector.ts",
            "workflow-orchestration-core/WorkflowPlanBuilder.ts",
            "workflow-orchestration-core/WorkflowExecutor.ts",
            "workflow-orchestration-core/WorkflowAuditBridge.ts",
            "workflow-orchestration-core/PackageReportGenerator.ts",
            "workflow-orchestration-core/PackageHtmlRenderer.ts",
            "workflow-orchestration-core/PackageExporter.ts",
            "workflow-orchestration-core/ProjectApprovalPackageBuilder.ts",
            "workflow-orchestration-core/OrchestrationResult.ts",
            "agenticflow/patchd-core/governance/GovernanceSafetyGates.ts",
            "workflow-orchestration-core/README.md",
        ]

        for relative_path in required_paths:
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_intent_selects_expected_capability_chain(self):
        result = run_orchestration_script(
            """
import { classifyWorkflowIntent, selectCapabilities, buildWorkflowPlan } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const intent = classifyWorkflowIntent('Prepare fabrication and quotation package for BP-01');
const capabilities = selectCapabilities(intent);
const plan = buildWorkflowPlan(capabilities);
console.log(JSON.stringify({ intent, capabilities, titles: plan.map((step) => step.title) }));
"""
        )

        self.assertEqual(result["intent"]["name"], "fabrication-quotation-package")
        self.assertEqual(result["intent"]["subject"], "BP-01")
        self.assertEqual(result["capabilities"], ["knowledge-graph", "manufacturing-core", "steel-design-pack", "valor-quotation-pack", "consolidated-report"])
        self.assertEqual(result["titles"], [
            "Query Knowledge Graph for BP-01",
            "Run Manufacturing Core estimate",
            "Run Steel Design Pack preliminary check",
            "Run Quotation Pack",
            "Generate consolidated markdown report",
        ])


    def test_shop_drawing_assistant_is_registered_and_selected_for_drawing_requests(self):
        result = run_orchestration_script(
            """
import { CAPABILITY_REGISTRY, classifyWorkflowIntent, selectCapabilities, buildWorkflowPlan } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const capability = CAPABILITY_REGISTRY.find((candidate) => candidate.id === 'shop_drawing_assistant');
const intent = classifyWorkflowIntent('Prepare BP-01 shop drawing package with drawing notes, hole schedule, and weld notes');
const capabilities = selectCapabilities(intent);
const plan = buildWorkflowPlan(capabilities);
console.log(JSON.stringify({ capability, intent, capabilities, titles: plan.map((step) => step.title) }));
"""
        )

        self.assertEqual(result["capability"]["id"], "shop_drawing_assistant")
        self.assertEqual(result["capability"]["layer"], "drawing-intelligence-core")
        self.assertIn("part list", result["capability"]["output"])
        self.assertIn("hole schedule", result["capability"]["output"])
        self.assertIn("weld notes", result["capability"]["output"])
        self.assertTrue(result["intent"]["includeShopDrawingAssistant"])
        self.assertIn("shop_drawing_assistant", result["capabilities"])
        self.assertEqual(result["capabilities"][1], "shop_drawing_assistant")
        self.assertIn("Run Shop Drawing Assistant", result["titles"])

    def test_shop_drawing_assistant_integrates_into_package_report_and_exports(self):
        result = run_orchestration_script(
            """
import { createPackageExportBundle, runWorkflowOrchestration } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const result = runWorkflowOrchestration(
  'Prepare BP-01 shop drawing package with drawing notes, fabrication notes, hole schedule, and weld notes',
  { shopDrawingNotes: 'BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.' }
);
const bundle = createPackageExportBundle(result);
console.log(JSON.stringify({ result, bundle, parsed: JSON.parse(bundle.json) }));
"""
        )

        orchestration = result["result"]
        self.assertIn("shop_drawing_assistant", orchestration["capabilityChain"])
        self.assertIn("shopDrawingSummary", orchestration)
        self.assertEqual(orchestration["partList"][0]["part"], "BP-01")
        self.assertEqual(orchestration["partList"][0]["material"], "S275")
        self.assertIn("Part BP-01: 4-M20", orchestration["holeSchedule"])
        self.assertIn("Part BP-01: 6mm fillet weld all around", orchestration["weldNotes"])
        self.assertIn("Shop Drawing Assistant Summary", orchestration["consolidatedMarkdownReport"])
        self.assertIn("Part List", orchestration["consolidatedMarkdownReport"])
        self.assertIn("Hole Schedule", orchestration["consolidatedMarkdownReport"])
        self.assertIn("Weld Notes", orchestration["consolidatedMarkdownReport"])
        self.assertEqual(result["parsed"]["shopDrawingSummary"]["partList"][0]["dimensions"], "400x400x20")
        self.assertIn("Shop Drawing Assistant Summary", result["bundle"]["markdown"])
        self.assertIn("Hole Schedule", result["bundle"]["html"])
        self.assertIn("Part BP-01: 4-M20", result["bundle"]["html"])
        self.assertIn("Weld Notes", result["bundle"]["html"])
        self.assertIn("6mm fillet weld all around", result["bundle"]["html"])


    def test_drawing_to_boq_extractor_registered_selected_and_exported(self):
        result = run_orchestration_script(
            """
import { CAPABILITY_REGISTRY, classifyWorkflowIntent, createPackageExportBundle, runWorkflowOrchestration, selectCapabilities } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const capability = CAPABILITY_REGISTRY.find((candidate) => candidate.id === 'drawing_to_boq_extractor');
const intent = classifyWorkflowIntent('Prepare shop drawing BOQ and quotation package for BP-01');
const capabilities = selectCapabilities(intent);
const result = runWorkflowOrchestration('Prepare shop drawing BOQ and quotation package for BP-01');
const bundle = createPackageExportBundle(result);
console.log(JSON.stringify({ capability, intent, capabilities, result, bundle, parsed: JSON.parse(bundle.json) }));
"""
        )

        self.assertEqual(result["capability"]["id"], "drawing_to_boq_extractor")
        self.assertEqual(result["capability"]["layer"], "drawing-to-boq-core")
        self.assertIn("structured BOQ lines", result["capability"]["output"])
        self.assertTrue(result["intent"]["includeDrawingBOQExtractor"])
        self.assertEqual(result["capabilities"], [
            "knowledge-graph",
            "shop_drawing_assistant",
            "drawing_to_boq_extractor",
            "manufacturing-core",
            "steel-design-pack",
            "valor-quotation-pack",
            "consolidated-report",
        ])
        self.assertIn("drawingBOQ", result["result"])
        self.assertEqual(result["result"]["drawingBOQ"]["partId"], "BP-01")
        self.assertEqual(result["result"]["drawingBOQLines"][0]["quantity"], 25.12)
        self.assertEqual(result["result"]["quotationItemSeeds"][0]["materialRate"], 7)
        self.assertIn("Drawing-to-BOQ Summary", result["result"]["consolidatedMarkdownReport"])
        self.assertIn("Drawing-to-BOQ Summary", result["bundle"]["markdown"])
        self.assertIn("Drawing-to-BOQ Summary", result["bundle"]["html"])
        self.assertIn("drawingBOQ", result["parsed"])
        self.assertIn("drawingBOQLines", result["parsed"])
        self.assertIn("quotationItemSeeds", result["parsed"])


    def test_drawing_to_manufacturing_package_registered_selected_and_exported(self):
        result = run_orchestration_script(
            """
import { CAPABILITY_REGISTRY, classifyWorkflowIntent, createPackageExportBundle, runWorkflowOrchestration, selectCapabilities } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const capability = CAPABILITY_REGISTRY.find((candidate) => candidate.id === 'drawing_to_manufacturing_package');
const intent = classifyWorkflowIntent('Prepare drawing manufacturing package with cutting list, drilling schedule, weld schedule, coating schedule, production route and quotation for BP-01');
const capabilities = selectCapabilities(intent);
const result = runWorkflowOrchestration('Prepare drawing manufacturing package with cutting list, drilling schedule, weld schedule, coating schedule, production route and quotation for BP-01');
const bundle = createPackageExportBundle(result);
console.log(JSON.stringify({ capability, intent, capabilities, result, bundle, parsed: JSON.parse(bundle.json) }));
"""
        )

        self.assertEqual(result["capability"]["id"], "drawing_to_manufacturing_package")
        self.assertEqual(result["capability"]["layer"], "drawing-to-manufacturing-core")
        self.assertIn("cutting list", result["capability"]["output"])
        self.assertTrue(result["intent"]["includeDrawingManufacturingPackage"])
        self.assertEqual(result["capabilities"], [
            "knowledge-graph",
            "shop_drawing_assistant",
            "drawing_to_boq_extractor",
            "drawing_to_manufacturing_package",
            "manufacturing-core",
            "steel-design-pack",
            "valor-quotation-pack",
            "consolidated-report",
        ])
        self.assertIn("drawingManufacturingPackage", result["result"])
        self.assertEqual(result["result"]["drawingManufacturingPackage"]["totalEstimatedLaborHr"], 1.4)
        self.assertIn("Drawing-to-Manufacturing Package", result["result"]["consolidatedMarkdownReport"])
        self.assertIn("drawingManufacturingPackage", result["parsed"])
        self.assertIn("Drawing-to-Manufacturing Package", result["bundle"]["markdown"])
        self.assertIn("Production Route", result["bundle"]["markdown"])
        self.assertIn("Cutting List", result["bundle"]["html"])

    def test_executor_runs_capabilities_and_returns_governed_package(self):
        result = run_orchestration_script(
            """
import { runWorkflowOrchestration } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const result = runWorkflowOrchestration('Prepare fabrication and quotation package for BP-01');
console.log(JSON.stringify(result));
"""
        )

        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["graphResult"]["subject"], "BP-01")
        self.assertEqual(result["manufacturingResult"]["weightKg"], 25.12)
        self.assertEqual(result["manufacturingResult"]["estimatedCostSar"], 195)
        self.assertEqual(result["steelDesignResult"]["status"], "completed")
        self.assertEqual(result["quotationResult"]["summary"]["grandTotal"], 195)
        self.assertIn("VALOR STRUCT", result["consolidatedMarkdownReport"])
        self.assertIn("BP-01 Engineering & Fabrication Package", result["consolidatedMarkdownReport"])
        self.assertEqual(result["reportMetadata"]["packageId"], "VS-BP-01-ENG-FAB-PKG")
        self.assertEqual(result["reportMetadata"]["revision"], "Rev 00")
        self.assertIn("Prepared By: AgenticFlow Demo Console", result["consolidatedMarkdownReport"])
        self.assertIn("Checked By: Valor Struct Engineering Review", result["consolidatedMarkdownReport"])
        self.assertIn("Export Timestamp: 2026-06-02T00:00:00.000Z", result["consolidatedMarkdownReport"])
        self.assertIn("## Disclaimer", result["consolidatedMarkdownReport"])
        self.assertIn("Approval Workflow Status: requires-review", result["consolidatedMarkdownReport"])
        self.assertIn("## 1. Project Summary", result["consolidatedMarkdownReport"])
        self.assertIn("## 2. Part Summary", result["consolidatedMarkdownReport"])
        self.assertIn("## 3. Material Summary", result["consolidatedMarkdownReport"])
        self.assertIn("## 4. Drawing Intelligence Summary", result["consolidatedMarkdownReport"])
        self.assertIn("## 5. Manufacturing Route", result["consolidatedMarkdownReport"])
        self.assertIn("## 6. Steel Design Preliminary Check", result["consolidatedMarkdownReport"])
        self.assertIn("## 7. BOQ / Quotation Summary", result["consolidatedMarkdownReport"])
        self.assertIn("## 8. Inspection Plan", result["consolidatedMarkdownReport"])
        self.assertIn("## 9. Risk / Warnings", result["consolidatedMarkdownReport"])
        self.assertIn("## 10. Audit Trail", result["consolidatedMarkdownReport"])
        self.assertIn("## 11. Approval Status", result["consolidatedMarkdownReport"])
        self.assertIn("Grand Total: SAR 195", result["consolidatedMarkdownReport"])
        self.assertIn("Workflow Risk Level: Level 3", result["consolidatedMarkdownReport"])
        self.assertIn("### Model-Role Request Audit", result["consolidatedMarkdownReport"])
        self.assertIn("Final Output Approval: requires-licensed-expert-approval", result["consolidatedMarkdownReport"])
        self.assertEqual(result["approvalStatus"]["status"], "requires-review")
        self.assertEqual(result["governanceControl"]["riskClassification"]["level"], 3)
        self.assertEqual(result["governanceControl"]["riskClassification"]["requiredApprover"], "Senior Structural Engineer approval")
        self.assertEqual(result["governanceControl"]["executionPermission"]["label"], "Licensed expert approval required")
        self.assertEqual(result["governanceControl"]["humanApprovalGate"]["status"], "pending-licensed-expert-approval")
        self.assertEqual(result["governanceControl"]["finalOutputApproval"]["status"], "requires-licensed-expert-approval")
        self.assertEqual(result["governanceControl"]["modelRoleAuditTrail"][2]["requestedRole"], "engineering_reasoning_model")
        self.assertEqual(result["governanceControl"]["modelRoleAuditTrail"][2]["sensitiveDataRouteRole"], "local_private_model")
        self.assertEqual(result["auditSummary"]["eventCount"], 5)


    def test_patch_e_governance_safety_gates_classify_examples_and_gateway_rules(self):
        result = run_orchestration_script(
            """
import { MODEL_ROLE_FALLBACK_RULES, classifyWorkflowRisk, evaluateFinalOutputApproval, evaluateHumanApprovalGate, evaluateSensitiveDataRouting } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const structural = classifyWorkflowRisk('structural-design-report');
const quotation = classifyWorkflowRisk('quotation-draft');
const crm = classifyWorkflowRisk('crm-lead-summary');
const marketing = classifyWorkflowRisk('public-marketing-content');
const sensitive = evaluateSensitiveDataRouting({ clientName: 'Confidential Client' });
console.log(JSON.stringify({
  structural,
  quotation,
  crm,
  marketing,
  structuralGate: evaluateHumanApprovalGate(structural),
  structuralFinal: evaluateFinalOutputApproval(structural),
  sensitive,
  policyFallback: MODEL_ROLE_FALLBACK_RULES.policy_reasoning_model,
  privateFallback: MODEL_ROLE_FALLBACK_RULES.local_private_model,
}));
"""
        )

        self.assertEqual(result["structural"]["level"], 3)
        self.assertEqual(result["structural"]["requiredApprover"], "Senior Structural Engineer approval")
        self.assertEqual(result["quotation"]["level"], 2)
        self.assertEqual(result["quotation"]["requiredApprover"], "Commercial approval")
        self.assertEqual(result["crm"]["level"], 1)
        self.assertEqual(result["marketing"]["requiredApprover"], "Brand approval")
        self.assertEqual(result["structuralGate"]["status"], "pending-licensed-expert-approval")
        self.assertEqual(result["structuralFinal"]["status"], "requires-licensed-expert-approval")
        self.assertTrue(result["sensitive"]["localPrivateModelRequired"])
        self.assertEqual(result["sensitive"]["routeRole"], "local_private_model")
        self.assertEqual(result["policyFallback"]["fallbackRole"], "orchestration_model")
        self.assertEqual(result["privateFallback"]["fallbackRole"], "local_private_model")

    def test_p_agent_orchestrates_package_and_stores_memory(self):
        subprocess.run(["npx", "tsc", "-p", "agenticflow/tsconfig.json"], cwd=ROOT, check=True, capture_output=True, text=True)
        output = subprocess.run(
            [
                "node",
                "--input-type=module",
                "-e",
                """
import { TaskPlanner } from './.tmp/agenticflow/p-agent/planner/TaskPlanner.js';
import { AgentRuntime } from './.tmp/agenticflow/p-agent/runtime/AgentRuntime.js';
const goal = 'Prepare fabrication and quotation package for BP-01';
const planner = new TaskPlanner();
const runtime = new AgentRuntime();
const result = runtime.run(goal);
console.log(JSON.stringify({ plan: planner.createPlan(goal), result, memory: runtime.getMemory().list() }));
""",
            ],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        payload = json.loads(output)

        self.assertEqual([task["title"] for task in payload["plan"]], [
            "Read orchestration request",
            "Query Knowledge Graph for BP-01",
            "Run Manufacturing Core estimate",
            "Run Steel Design Pack preliminary check",
            "Run Quotation Pack",
            "Generate consolidated markdown report",
            "Store result in P-Agent memory",
            "Return audit summary",
        ])
        self.assertEqual(payload["result"]["orchestrationResult"]["quotationResult"]["summary"]["grandTotal"], 195)
        self.assertIn("P_AGENT_MEMORY_STORED", payload["result"]["auditSummary"]["eventTypes"])
        self.assertEqual(payload["memory"][0]["goal"], "Prepare fabrication and quotation package for BP-01")

    def test_package_export_bundle_contains_json_markdown_pdf_and_html(self):
        result = run_orchestration_script(
            """
import { createPackageExportBundle, runWorkflowOrchestration } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const result = runWorkflowOrchestration('Prepare fabrication and quotation package for BP-01');
const bundle = createPackageExportBundle(result);
console.log(JSON.stringify({ ...bundle, parsed: JSON.parse(bundle.json) }));
"""
        )

        self.assertEqual(result["jsonFilename"], "VS-BP-01-ENG-FAB-PKG-REV-00.json")
        self.assertEqual(result["markdownFilename"], "VS-BP-01-ENG-FAB-PKG-REV-00.md")
        self.assertEqual(result["pdfFilename"], "VS-BP-01-ENG-FAB-PKG-REV-00.pdf")
        self.assertEqual(result["htmlFilename"], "VS-BP-01-ENG-FAB-PKG-REV-00.html")
        self.assertEqual(result["parsed"]["packageName"], "BP-01 Engineering & Fabrication Package")
        self.assertEqual(result["parsed"]["reportMetadata"]["packageId"], "VS-BP-01-ENG-FAB-PKG")
        self.assertEqual(result["parsed"]["quotationSummary"]["grandTotal"], 195)
        self.assertEqual(result["parsed"]["governanceControl"]["finalOutputApproval"]["status"], "requires-licensed-expert-approval")
        self.assertIn("## 11. Approval Status", result["markdown"])
        self.assertTrue(result["pdf"].startswith("%PDF-1.4"))
        self.assertIn("VALOR STRUCT", result["pdf"])
        self.assertIn("VALOR STRUCT", result["html"])
        self.assertIn("VS-BP-01-ENG-FAB-PKG", result["html"])
        self.assertIn("Rev 00", result["html"])
        self.assertIn("Approval Status", result["html"])
        self.assertIn("Risk Level", result["html"])
        self.assertIn("Audit Trail Appendix", result["html"])
        self.assertIn("Model-Role Audit Appendix", result["html"])

    def test_package_html_renderer_outputs_print_ready_governance_sections(self):
        result = run_orchestration_script(
            """
import { renderEngineeringPackageHtml, runWorkflowOrchestration } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const orchestrationResult = runWorkflowOrchestration('Prepare fabrication and quotation package for BP-01');
const html = renderEngineeringPackageHtml(orchestrationResult);
console.log(JSON.stringify({ html }));
"""
        )

        html = result["html"]
        self.assertIn("VALOR STRUCT", html)
        self.assertIn("Package ID", html)
        self.assertIn("VS-BP-01-ENG-FAB-PKG", html)
        self.assertIn("Revision", html)
        self.assertIn("Rev 00", html)
        self.assertIn("Approval Status", html)
        self.assertIn("Risk Level", html)
        self.assertIn("External-use Blocking Status", html)
        self.assertIn("Report Sections", html)
        self.assertIn("Audit Trail Appendix", html)
        self.assertIn("Model-Role Audit Appendix", html)
        self.assertIn("@media print", html)


    def test_project_level_package_combines_parts_boq_manufacturing_quotation_and_approval(self):
        result = run_orchestration_script(
            """
import { buildProjectApprovalPackage, createPackageExportBundle, runWorkflowOrchestration } from './.tmp/workflow-orchestration-core/workflow-orchestration-core/index.js';
const projectPackage = buildProjectApprovalPackage();
const orchestrationResult = runWorkflowOrchestration('Project multiple parts combined BOQ combined manufacturing plan combined quotation project-level approval package');
const exports = createPackageExportBundle(orchestrationResult);
console.log(JSON.stringify({
  partIds: projectPackage.parts.map((part) => part.partId),
  combinedBOQCount: projectPackage.combinedBOQ.length,
  labor: projectPackage.combinedManufacturingPlan.totalEstimatedLaborHr,
  production: projectPackage.combinedManufacturingPlan.totalEstimatedProductionHr,
  quotationTotal: projectPackage.combinedQuotation.summary.grandTotal,
  materialKg: Number(projectPackage.combinedBOQ.filter((line) => line.category === 'material').reduce((sum, line) => sum + line.quantity, 0).toFixed(2)),
  cuttingNos: projectPackage.combinedBOQ.filter((line) => line.category === 'cutting').reduce((sum, line) => sum + line.quantity, 0),
  drillingNos: projectPackage.combinedBOQ.filter((line) => line.category === 'drilling').reduce((sum, line) => sum + line.quantity, 0),
  weldingM: Number(projectPackage.combinedBOQ.filter((line) => line.category === 'welding').reduce((sum, line) => sum + line.quantity, 0).toFixed(2)),
  coatingM2: Number(projectPackage.combinedBOQ.filter((line) => line.category === 'coating').reduce((sum, line) => sum + line.quantity, 0).toFixed(2)),
  brMaterialKg: projectPackage.parts.find((part) => part.partId === 'BR-01')?.drawingBOQ.lines.find((line) => line.category === 'material')?.quantity,
  brCuttingNos: projectPackage.parts.find((part) => part.partId === 'BR-01')?.drawingBOQ.lines.find((line) => line.category === 'cutting')?.quantity,
  brDrillingNos: projectPackage.parts.find((part) => part.partId === 'BR-01')?.drawingBOQ.lines.find((line) => line.category === 'drilling')?.quantity ?? 0,
  brWeldingM: projectPackage.parts.find((part) => part.partId === 'BR-01')?.drawingBOQ.lines.find((line) => line.category === 'welding')?.quantity,
  brCoatingM2: projectPackage.parts.find((part) => part.partId === 'BR-01')?.drawingBOQ.lines.find((line) => line.category === 'coating')?.quantity,
  brLabor: projectPackage.parts.find((part) => part.partId === 'BR-01')?.manufacturingPackage.totalEstimatedLaborHr,
  brProduction: projectPackage.parts.find((part) => part.partId === 'BR-01')?.manufacturingPackage.totalEstimatedProductionHr,
  approvalStatus: projectPackage.approvalStatus,
  resultHasProjectPackage: Boolean(orchestrationResult.projectApprovalPackage),
  markdown: orchestrationResult.consolidatedMarkdownReport,
  json: exports.json,
  html: exports.html,
}));
"""
        )

        self.assertEqual(result["partIds"], ["BP-01", "BP-02", "BR-01"])
        self.assertEqual(result["combinedBOQCount"], 17)
        self.assertEqual(result["materialKg"], 48.92)
        self.assertEqual(result["cuttingNos"], 4)
        self.assertEqual(result["drillingNos"], 8)
        self.assertEqual(result["weldingM"], 3.2)
        self.assertEqual(result["coatingM2"], 1.1)
        self.assertEqual(result["labor"], 3.3)
        self.assertEqual(result["production"], 9.8)
        self.assertEqual(result["quotationTotal"], 837.94)
        self.assertEqual(result["brMaterialKg"], 12.5)
        self.assertEqual(result["brCuttingNos"], 2)
        self.assertEqual(result["brDrillingNos"], 0)
        self.assertEqual(result["brWeldingM"], 0.4)
        self.assertEqual(result["brCoatingM2"], 0.6)
        self.assertEqual(result["brLabor"], 0.8)
        self.assertEqual(result["brProduction"], 2.2)
        self.assertEqual(result["approvalStatus"], "requires-review")
        self.assertEqual(result["resultHasProjectPackage"], True)
        self.assertIn("Project-Level Approval Package", result["markdown"])
        self.assertIn("BR-01", result["markdown"])
        self.assertIn("Combined BOQ", result["markdown"])
        self.assertIn("Combined Manufacturing Plan", result["markdown"])
        self.assertIn("combinedBOQ", result["json"])
        self.assertIn("BR-01", result["json"])
        self.assertIn("Project-Level Approval Package", result["html"])
        self.assertIn("BR-01", result["html"])

    def test_engineering_package_console_contains_required_panels(self):
        page = (ROOT / "agenticflow/frontend/src/pages/EngineeringPackageConsole.tsx").read_text()

        for label in [
            "Input request box",
            "BP-01 package run button",
            "Workflow step status",
            "Demo seed selector",
            "Report branding",
            "Package markdown preview",
            "shop drawing notes input",
            "include shop drawing assistant checkbox",
            "include drawing-to-BOQ checkbox",
            "include drawing-to-manufacturing checkbox",
            "Shop Drawing Assistant Summary panel",
            "Drawing-to-Manufacturing Package panel",
            "cutting list table",
            "drilling schedule table",
            "weld schedule table",
            "coating schedule table",
            "production route panel",
            "manufacturing warnings panel",
            "Drawing-to-BOQ Summary panel",
            "warnings panel",
            "Approval workflow status panel",
            "Audit trail panel",
            "Export JSON",
            "Export Markdown",
            "Export HTML",
            "Print / Save as PDF instruction",
            "Export PDF",
            "Prepared by",
            "Checked by",
            "Approved by",
            "Export timestamp",
            "Disclaimer",
        ]:
            self.assertIn(label, page)


if __name__ == "__main__":
    unittest.main()
