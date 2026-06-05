import { createGatewayRequest, routeGatewayRequest } from '../agenticflow/ai-gateway/ModelRoleGateway.js';
import { runQuotationWorkflow } from '../agenticflow/capability-packs/valor-quotation-pack/runQuotationWorkflow.js';
import type { QuotationInput, QuotationItemInput } from '../agenticflow/capability-packs/valor-quotation-pack/QuotationInput.js';
import { convertDrawingBOQToQuotationItems, extractDrawingBOQFromShopDrawingSummary } from '../drawing-to-boq-core/index.js';
import { buildDrawingManufacturingPackage } from '../drawing-to-manufacturing-core/index.js';
import { generateShopDrawingAssistantPackage } from '../drawing-intelligence-core/ShopDrawingAssistant.js';
import { buildProjectApprovalPackage } from './ProjectApprovalPackageBuilder.js';
import { runSteelDesignWorkflow, sampleSteelDesignInput } from '../engineering-capability-pack/steel-design-pack/runSteelDesignWorkflow.js';
import { reasonAboutBasePlateGraph } from '../knowledge-graph/reasoning/graph-reasoner.js';
import { estimateBasePlateManufacturing, sampleBasePlateManufacturingInput } from '../manufacturing-core/routing/production-router.js';
import { CAPABILITY_EXECUTION_PERMISSIONS, classifyWorkflowRisk, createModelRoleAuditTrailEvent, evaluateFinalOutputApproval, evaluateHumanApprovalGate } from '../agenticflow/patchd-core/governance/GovernanceSafetyGates.js';
import { selectCapabilities } from './CapabilitySelector.js';
import { generateEngineeringPackageReport } from './PackageReportGenerator.js';
import { createWorkflowAuditEvents, summarizeWorkflowAudit } from './WorkflowAuditBridge.js';
import { classifyWorkflowIntent } from './WorkflowIntentClassifier.js';
import { buildWorkflowPlan } from './WorkflowPlanBuilder.js';
import type { OrchestrationCapabilityId, OrchestrationResult, PackageReportMetadata, WorkflowPlanStep } from './OrchestrationResult.js';

const demoReportMetadata: PackageReportMetadata = {
  packageId: 'VS-BP-01-ENG-FAB-PKG',
  revision: 'Rev 00',
  preparedBy: 'AgenticFlow Demo Console',
  checkedBy: 'Valor Struct Engineering Review',
  approvedBy: 'Pending approval',
  exportTimestamp: '2026-06-02T00:00:00.000Z',
  disclaimer: 'Preliminary demo package for engineering and fabrication planning only. Not for construction, procurement, or code-compliant release without licensed professional review.',
};

const defaultShopDrawingNotes = 'BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.';

export interface WorkflowOrchestrationOptions {
  includeShopDrawingAssistant?: boolean;
  includeDrawingBOQExtractor?: boolean;
  includeDrawingManufacturingPackage?: boolean;
  shopDrawingNotes?: string;
  includeProjectApprovalPackage?: boolean;
  projectDrawingNotes?: string[];
}

function buildQuotationInput(weightKg: number, estimatedCostSar: number, quotationItemSeeds?: QuotationItemInput[]): QuotationInput {
  return {
    projectName: 'BP-01 Fabrication Package',
    clientName: 'Valor Struct Demo Client',
    location: 'Saudi Arabia',
    scopeDescription: 'Fabrication and quotation package for BP-01 base plate',
    currency: 'SAR',
    items: quotationItemSeeds?.length ? quotationItemSeeds : [
      {
        description: 'BP-01 base plate fabrication package',
        unit: 'package',
        quantity: 1,
        materialRate: estimatedCostSar,
        laborRate: 0,
      },
    ],
    overheadPercent: 0,
    profitPercent: 0,
    vatPercent: 0,
  };
}

function ensureCapability(capabilityIds: OrchestrationCapabilityId[], capabilityId: OrchestrationCapabilityId, afterCapabilityId?: OrchestrationCapabilityId): OrchestrationCapabilityId[] {
  if (capabilityIds.includes(capabilityId)) {
    return capabilityIds;
  }
  if (afterCapabilityId) {
    const afterIndex = capabilityIds.indexOf(afterCapabilityId);
    if (afterIndex !== -1) {
      return [...capabilityIds.slice(0, afterIndex + 1), capabilityId, ...capabilityIds.slice(afterIndex + 1)];
    }
  }
  const reportIndex = capabilityIds.indexOf('consolidated-report');
  if (reportIndex === -1) {
    return [...capabilityIds, capabilityId];
  }
  return [...capabilityIds.slice(0, reportIndex), capabilityId, ...capabilityIds.slice(reportIndex)];
}

function completePlanStep(plan: WorkflowPlanStep[], capabilityId: OrchestrationCapabilityId): void {
  const step = plan.find((candidate) => candidate.capabilityId === capabilityId);
  if (step) {
    step.status = 'completed';
  }
}

export function runWorkflowOrchestration(
  request = 'Prepare fabrication and quotation package for BP-01',
  options: WorkflowOrchestrationOptions = {},
): OrchestrationResult {
  const intent = classifyWorkflowIntent(request);
  const includeDrawingManufacturingPackage = options.includeDrawingManufacturingPackage ?? intent.includeDrawingManufacturingPackage;
  const includeDrawingBOQExtractor = options.includeDrawingBOQExtractor ?? (intent.includeDrawingBOQExtractor || includeDrawingManufacturingPackage);
  const includeShopDrawingAssistant = options.includeShopDrawingAssistant ?? (intent.includeShopDrawingAssistant || includeDrawingBOQExtractor);
  const includeProjectApprovalPackage = options.includeProjectApprovalPackage ?? /project|multiple parts|combined boq|combined manufacturing|project-level approval/i.test(request);
  let capabilityIds = selectCapabilities({ ...intent, includeShopDrawingAssistant, includeDrawingBOQExtractor, includeDrawingManufacturingPackage });
  if (includeShopDrawingAssistant) {
    capabilityIds = ensureCapability(capabilityIds, 'shop_drawing_assistant', 'knowledge-graph');
  }
  if (includeDrawingBOQExtractor) {
    capabilityIds = ensureCapability(capabilityIds, 'drawing_to_boq_extractor', 'shop_drawing_assistant');
  }
  if (includeDrawingManufacturingPackage) {
    capabilityIds = ensureCapability(capabilityIds, 'drawing_to_manufacturing_package', 'drawing_to_boq_extractor');
  }
  const plan = buildWorkflowPlan(capabilityIds);

  const graphResult = reasonAboutBasePlateGraph(intent.subject);
  completePlanStep(plan, 'knowledge-graph');

  const shopDrawingSummary = includeShopDrawingAssistant
    ? generateShopDrawingAssistantPackage(options.shopDrawingNotes?.trim() || defaultShopDrawingNotes)
    : undefined;
  if (shopDrawingSummary) {
    completePlanStep(plan, 'shop_drawing_assistant');
  }

  const drawingBOQ = includeDrawingBOQExtractor && shopDrawingSummary
    ? extractDrawingBOQFromShopDrawingSummary(shopDrawingSummary)
    : undefined;
  const quotationItemSeeds = drawingBOQ ? convertDrawingBOQToQuotationItems(drawingBOQ) : undefined;
  if (drawingBOQ) {
    completePlanStep(plan, 'drawing_to_boq_extractor');
  }

  const drawingManufacturingPackage = includeDrawingManufacturingPackage && drawingBOQ
    ? buildDrawingManufacturingPackage(drawingBOQ)
    : undefined;
  if (drawingManufacturingPackage) {
    completePlanStep(plan, 'drawing_to_manufacturing_package');
  }

  const projectApprovalPackage = includeProjectApprovalPackage ? buildProjectApprovalPackage(options.projectDrawingNotes) : undefined;

  const manufacturingResult = estimateBasePlateManufacturing(sampleBasePlateManufacturingInput);
  completePlanStep(plan, 'manufacturing-core');
  const steelDesignResult = runSteelDesignWorkflow({ ...sampleSteelDesignInput, projectName: 'BP-01 Fabrication Package', memberId: 'BP-01' });
  completePlanStep(plan, 'steel-design-pack');
  const quotationResult = runQuotationWorkflow(buildQuotationInput(manufacturingResult.weightKg, manufacturingResult.estimatedCostSar, quotationItemSeeds));
  completePlanStep(plan, 'valor-quotation-pack');

  const riskClassification = classifyWorkflowRisk('structural-design-report');
  const humanApprovalGate = evaluateHumanApprovalGate(riskClassification);
  const finalOutputApproval = evaluateFinalOutputApproval(riskClassification);
  const executionPermission = CAPABILITY_EXECUTION_PERMISSIONS[riskClassification.level];
  const gatewayRequests = [
    createGatewayRequest('WorkflowIntentClassifier', 'orchestrate_workflow', { request }),
    createGatewayRequest('CapabilitySelector', 'orchestrate_workflow', { intent: intent.name, subject: intent.subject }),
    createGatewayRequest('SteelDesignPack', 'reason_about_engineering', { subject: intent.subject, licensedDesignData: true }),
  ];
  const modelRoleAuditTrail = gatewayRequests.map((gatewayRequest, index) => createModelRoleAuditTrailEvent(
    index + 1,
    gatewayRequest,
    routeGatewayRequest(gatewayRequest),
    gatewayRequest.payload,
  ));

  const partial = {
    status: 'completed' as const,
    request,
    intent: intent.name,
    subject: intent.subject,
    capabilityChain: capabilityIds,
    plan,
    graphResult,
    manufacturingResult,
    steelDesignResult,
    quotationResult,
    ...(shopDrawingSummary ? {
      shopDrawingSummary,
      partList: shopDrawingSummary.partList,
      holeSchedule: shopDrawingSummary.holeSchedule,
      weldNotes: shopDrawingSummary.weldNotes,
      fabricationNotes: shopDrawingSummary.fabricationNotes,
      inspectionChecklist: shopDrawingSummary.inspectionChecklist,
      revisionLog: shopDrawingSummary.revisionLog,
      drawingIssueChecklist: shopDrawingSummary.drawingIssueChecklist,
      parserWarnings: shopDrawingSummary.warnings,
    } : {}),
    ...(drawingBOQ ? {
      drawingBOQ,
      drawingBOQLines: drawingBOQ.lines,
      quotationItemSeeds,
    } : {}),
    ...(drawingManufacturingPackage ? {
      drawingManufacturingPackage,
      cuttingList: drawingManufacturingPackage.cuttingList,
      drillingSchedule: drawingManufacturingPackage.drillingSchedule,
      weldSchedule: drawingManufacturingPackage.weldSchedule,
      coatingSchedule: drawingManufacturingPackage.coatingSchedule,
      productionRoute: drawingManufacturingPackage.productionRoute,
      manufacturingWarnings: drawingManufacturingPackage.warnings,
    } : {}),
    ...(projectApprovalPackage ? {
      projectApprovalPackage,
      projectParts: projectApprovalPackage.parts,
      combinedBOQ: projectApprovalPackage.combinedBOQ,
      combinedManufacturingPlan: projectApprovalPackage.combinedManufacturingPlan,
      combinedQuotation: projectApprovalPackage.combinedQuotation,
    } : {}),
  };
  completePlanStep(plan, 'consolidated-report');
  const auditEvents = createWorkflowAuditEvents(plan);
  const auditSummary = summarizeWorkflowAudit(auditEvents);
  const approvalStatus = {
    status: 'requires-review' as const,
    requiredApprover: finalOutputApproval.requiredApprover,
    reason: finalOutputApproval.reason,
  };
  const governanceControl = {
    executionPermission,
    riskClassification,
    humanApprovalGate,
    finalOutputApproval,
    modelRoleAuditTrail,
  };
  const reportMetadata = demoReportMetadata;
  const consolidatedMarkdownReport = generateEngineeringPackageReport({ ...partial, reportMetadata, approvalStatus, governanceControl, auditEvents });
  return { ...partial, consolidatedMarkdownReport, reportMetadata, approvalStatus, governanceControl, auditEvents, auditSummary };
}
