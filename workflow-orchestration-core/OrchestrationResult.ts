import type { QuotationWorkflowResult } from '../agenticflow/capability-packs/valor-quotation-pack/runQuotationWorkflow.js';
import type { SteelDesignWorkflowResult } from '../engineering-capability-pack/steel-design-pack/runSteelDesignWorkflow.js';
import type { KnowledgeGraphReasoningResult } from '../knowledge-graph/reasoning/graph-reasoner.js';
import type { ManufacturingEstimate } from '../manufacturing-core/types.js';
import type { ShopDrawingAssistantOutput } from '../drawing-intelligence-core/ShopDrawingAssistant.js';
import type { QuotationItemInput } from '../agenticflow/capability-packs/valor-quotation-pack/QuotationInput.js';
import type { DrawingBOQLine, DrawingBOQResult } from '../drawing-to-boq-core/types.js';
import type { CoatingScheduleItem, CuttingListItem, DrawingManufacturingPackage, DrillingScheduleItem, ProductionRouteStep, WeldScheduleItem } from '../drawing-to-manufacturing-core/types.js';
import type { CombinedBOQLine, CombinedManufacturingPlan, ProjectApprovalPackage } from './ProjectApprovalPackageBuilder.js';
import type { CapabilityExecutionPermission, FinalOutputApprovalStatus, HumanApprovalGate, ModelRoleAuditTrailEvent, WorkflowRiskClassification } from '../agenticflow/patchd-core/governance/GovernanceSafetyGates.js';

export type OrchestrationCapabilityId = 'knowledge-graph' | 'manufacturing-core' | 'steel-design-pack' | 'valor-quotation-pack' | 'shop_drawing_assistant' | 'drawing_to_boq_extractor' | 'drawing_to_manufacturing_package' | 'consolidated-report';

export interface WorkflowPlanStep {
  order: number;
  capabilityId: OrchestrationCapabilityId;
  title: string;
  status: 'pending' | 'completed';
}

export interface WorkflowAuditEvent {
  order: number;
  type: string;
  message: string;
}

export interface GovernanceControlSummary {
  executionPermission: CapabilityExecutionPermission;
  riskClassification: WorkflowRiskClassification;
  humanApprovalGate: HumanApprovalGate;
  finalOutputApproval: FinalOutputApprovalStatus;
  modelRoleAuditTrail: ModelRoleAuditTrailEvent[];
}

export interface OrchestrationAuditSummary {
  eventCount: number;
  eventTypes: string[];
  firstEvent: string;
  lastEvent: string;
}

export interface PackageApprovalStatus {
  status: 'draft' | 'approved' | 'requires-review';
  requiredApprover: string;
  reason: string;
}

export interface PackageReportMetadata {
  packageId: string;
  revision: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  exportTimestamp: string;
  disclaimer: string;
}

export interface OrchestrationResult {
  status: 'completed';
  request: string;
  intent: string;
  subject: string;
  capabilityChain: string[];
  plan: WorkflowPlanStep[];
  graphResult: KnowledgeGraphReasoningResult;
  manufacturingResult: ManufacturingEstimate;
  steelDesignResult: SteelDesignWorkflowResult;
  quotationResult: QuotationWorkflowResult;
  shopDrawingSummary?: ShopDrawingAssistantOutput;
  partList?: ShopDrawingAssistantOutput['partList'];
  holeSchedule?: string[];
  weldNotes?: string[];
  fabricationNotes?: string[];
  inspectionChecklist?: string[];
  revisionLog?: string[];
  drawingIssueChecklist?: string[];
  parserWarnings?: string[];
  drawingBOQ?: DrawingBOQResult;
  drawingBOQLines?: DrawingBOQLine[];
  quotationItemSeeds?: QuotationItemInput[];
  drawingManufacturingPackage?: DrawingManufacturingPackage;
  cuttingList?: CuttingListItem[];
  drillingSchedule?: DrillingScheduleItem[];
  weldSchedule?: WeldScheduleItem[];
  coatingSchedule?: CoatingScheduleItem[];
  productionRoute?: ProductionRouteStep[];
  manufacturingWarnings?: string[];
  projectApprovalPackage?: ProjectApprovalPackage;
  projectParts?: ProjectApprovalPackage['parts'];
  combinedBOQ?: CombinedBOQLine[];
  combinedManufacturingPlan?: CombinedManufacturingPlan;
  combinedQuotation?: ProjectApprovalPackage['combinedQuotation'];
  consolidatedMarkdownReport: string;
  reportMetadata: PackageReportMetadata;
  approvalStatus: PackageApprovalStatus;
  governanceControl: GovernanceControlSummary;
  auditEvents: WorkflowAuditEvent[];
  auditSummary: OrchestrationAuditSummary;
}
