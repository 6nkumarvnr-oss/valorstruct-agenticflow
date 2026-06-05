import type { QuotationWorkflowResult } from '../agenticflow/capability-packs/valor-quotation-pack/runQuotationWorkflow.js';
import { runQuotationWorkflow } from '../agenticflow/capability-packs/valor-quotation-pack/runQuotationWorkflow.js';
import type { QuotationItemInput } from '../agenticflow/capability-packs/valor-quotation-pack/QuotationInput.js';
import { convertDrawingBOQToQuotationItems, extractDrawingBOQFromNote } from '../drawing-to-boq-core/index.js';
import type { DrawingBOQLine, DrawingBOQResult } from '../drawing-to-boq-core/types.js';
import { buildDrawingManufacturingPackage } from '../drawing-to-manufacturing-core/index.js';
import type { CoatingScheduleItem, CuttingListItem, DrawingManufacturingPackage, DrillingScheduleItem, ProductionRouteStep, WeldScheduleItem } from '../drawing-to-manufacturing-core/types.js';

const DEFAULT_PROJECT_NOTES = [
  'BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.',
  'BP-02 Plate 300x300x16 S275 with 4-M16 holes and 6mm fillet weld all around.',
  'BR-01 RHS80x40x2.8 S275 length 2.5m.',
];
const GENERATED_AT = '2026-06-04T00:00:00.000Z';

export interface ProjectPartPackage {
  partId: string;
  drawingNote: string;
  drawingBOQ: DrawingBOQResult;
  manufacturingPackage: DrawingManufacturingPackage;
  quotationItemSeeds: QuotationItemInput[];
}

export interface CombinedBOQLine extends DrawingBOQLine {
  projectItemNo: number;
  partId: string;
}

export interface CombinedManufacturingPlan {
  cuttingList: CuttingListItem[];
  drillingSchedule: DrillingScheduleItem[];
  weldSchedule: WeldScheduleItem[];
  coatingSchedule: CoatingScheduleItem[];
  productionRoute: ProductionRouteStep[];
  totalEstimatedLaborHr: number;
  totalEstimatedProductionHr: number;
  warnings: string[];
}

export interface ProjectApprovalPackage {
  projectId: string;
  projectName: string;
  source: 'project_drawing_notes';
  parts: ProjectPartPackage[];
  combinedBOQ: CombinedBOQLine[];
  combinedManufacturingPlan: CombinedManufacturingPlan;
  combinedQuotation: QuotationWorkflowResult;
  approvalStatus: 'requires-review';
  requiredApprover: 'Senior Structural Engineer approval';
  generatedAt: string;
}

function detectPartId(note: string, fallbackIndex: number): string {
  return /\b([A-Z]{1,3}-?\d{2})\b/i.exec(note)?.[1].toUpperCase().replace(/([A-Z]+)(\d+)/, '$1-$2') ?? `PART-${String(fallbackIndex).padStart(2, '0')}`;
}

function retargetDrawingBOQ(result: DrawingBOQResult, partId: string): DrawingBOQResult {
  return {
    ...result,
    partId,
    lines: result.lines.map((line) => ({
      ...line,
      sourcePartId: partId,
    })),
  };
}

function combineProductionRoutes(parts: ProjectPartPackage[]): ProductionRouteStep[] {
  return parts.flatMap((part, partIndex) => part.manufacturingPackage.productionRoute.map((step) => ({
    ...step,
    stepNo: partIndex * 100 + step.stepNo,
    operation: `${part.partId} — ${step.operation}`,
  })));
}

export function buildProjectApprovalPackage(notes: string[] = DEFAULT_PROJECT_NOTES): ProjectApprovalPackage {
  const parts = notes.map((note, index) => {
    const partId = detectPartId(note, index + 1);
    const drawingBOQ = retargetDrawingBOQ(extractDrawingBOQFromNote(note), partId);
    const manufacturingPackage = buildDrawingManufacturingPackage(drawingBOQ);
    const quotationItemSeeds = convertDrawingBOQToQuotationItems(drawingBOQ).map((item) => ({
      ...item,
      description: `${partId}: ${item.description}`,
    }));
    return { partId, drawingNote: note, drawingBOQ, manufacturingPackage, quotationItemSeeds };
  });

  const combinedBOQ = parts.flatMap((part) => part.drawingBOQ.lines.map((line) => ({
    ...line,
    projectItemNo: 0,
    partId: part.partId,
  }))).map((line, index) => ({ ...line, projectItemNo: index + 1 }));
  const combinedQuotationItems = parts.flatMap((part) => part.quotationItemSeeds);
  const combinedQuotation = runQuotationWorkflow({
    projectName: 'Valor Struct Multi-Part Approval Package',
    clientName: 'Valor Struct Demo Client',
    location: 'Saudi Arabia',
    scopeDescription: 'Combined drawing-derived BOQ and quotation for multiple project parts',
    currency: 'SAR',
    items: combinedQuotationItems,
    overheadPercent: 0,
    profitPercent: 0,
    vatPercent: 0,
  });
  const combinedManufacturingPlan: CombinedManufacturingPlan = {
    cuttingList: parts.flatMap((part) => part.manufacturingPackage.cuttingList),
    drillingSchedule: parts.flatMap((part) => part.manufacturingPackage.drillingSchedule),
    weldSchedule: parts.flatMap((part) => part.manufacturingPackage.weldSchedule),
    coatingSchedule: parts.flatMap((part) => part.manufacturingPackage.coatingSchedule),
    productionRoute: combineProductionRoutes(parts),
    totalEstimatedLaborHr: Number(parts.reduce((sum, part) => sum + part.manufacturingPackage.totalEstimatedLaborHr, 0).toFixed(2)),
    totalEstimatedProductionHr: Number(parts.reduce((sum, part) => sum + part.manufacturingPackage.totalEstimatedProductionHr, 0).toFixed(2)),
    warnings: [...new Set(parts.flatMap((part) => part.manufacturingPackage.warnings))],
  };

  return {
    projectId: 'valor-demo-project-multi-part',
    projectName: 'Valor Struct Multi-Part Demo Project',
    source: 'project_drawing_notes',
    parts,
    combinedBOQ,
    combinedManufacturingPlan,
    combinedQuotation,
    approvalStatus: 'requires-review',
    requiredApprover: 'Senior Structural Engineer approval',
    generatedAt: GENERATED_AT,
  };
}
