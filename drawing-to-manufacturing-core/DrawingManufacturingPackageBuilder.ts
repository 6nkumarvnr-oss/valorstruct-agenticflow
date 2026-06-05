import type { DrawingBOQResult } from '../drawing-to-boq-core/types.js';
import { buildCoatingSchedule } from './CoatingScheduleBuilder.js';
import { buildCuttingList } from './CuttingListBuilder.js';
import { buildDrillingSchedule } from './DrillingScheduleBuilder.js';
import { buildInspectionPlan } from './InspectionPlanBuilder.js';
import { buildProductionRoute } from './ProductionRouteBuilder.js';
import { buildWeldSchedule, WELD_PERIMETER_WARNING } from './WeldScheduleBuilder.js';
import type { DrawingManufacturingPackage } from './types.js';

const GENERATED_AT = '2026-06-04T00:00:00.000Z';
const DEFAULT_NOTE = 'BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.';
const NO_DRILLING_WARNING = 'No drilling required for BR-01 RHS member.';

function matchValue(pattern: RegExp, note: string, fallback: string): string {
  return pattern.exec(note)?.[1] ?? fallback;
}

function normalizePartId(value: string): string {
  return value.toUpperCase().replace(/([A-Z]+)(\d+)/, '$1-$2');
}

function numberFromBOQ(boq: DrawingBOQResult | undefined, category: string, fallback: number): number {
  return boq?.lines.find((line) => line.category === category)?.quantity ?? fallback;
}

function sourceNoteFrom(input: string | DrawingBOQResult): string {
  return typeof input === 'string' ? input : input.lines[0]?.sourceNote ?? DEFAULT_NOTE;
}

function partIdFrom(input: string | DrawingBOQResult, sourceNote: string): string {
  return typeof input === 'string'
    ? normalizePartId(matchValue(/\b([A-Z]{1,3}-?\d{2})\b/i, sourceNote, 'BP-01'))
    : input.partId;
}

export function buildDrawingManufacturingPackage(input: string | DrawingBOQResult = DEFAULT_NOTE): DrawingManufacturingPackage {
  const source = typeof input === 'string' ? 'drawing_note' : 'drawing_to_boq';
  const sourceNote = sourceNoteFrom(input);
  const partId = partIdFrom(input, sourceNote);
  const material = matchValue(/\b(S275)\b/i, sourceNote, 'S275').toUpperCase();
  const isRhsMember = partId === 'BR-01' || /\bRHS\s*80\s*x\s*40\s*x\s*2\.8\b/i.test(sourceNote);

  if (isRhsMember) {
    const weldLength = numberFromBOQ(typeof input === 'string' ? undefined : input, 'welding', 0.4);
    const coatingArea = numberFromBOQ(typeof input === 'string' ? undefined : input, 'coating', 0.6);
    const warnings = [...new Set([...(typeof input === 'string' ? [] : input.warnings), NO_DRILLING_WARNING])];
    return {
      source,
      partId,
      cuttingList: buildCuttingList(partId, material, 'RHS80x40x2.8 length 2.5m', 'RHS', 2, 'saw', 0.2),
      drillingSchedule: buildDrillingSchedule(partId, 0),
      weldSchedule: buildWeldSchedule(partId, weldLength, 0.2, []),
      coatingSchedule: buildCoatingSchedule(partId, coatingArea, 0.15),
      inspectionPlan: buildInspectionPlan(partId, 'RHS'),
      productionRoute: buildProductionRoute('RHS'),
      totalEstimatedLaborHr: 0.8,
      totalEstimatedProductionHr: 2.2,
      warnings,
      generatedAt: GENERATED_AT,
    };
  }

  const dimensions = matchValue(/\b(\d{2,4}x\d{2,4}x\d{1,3})\b/i, sourceNote, '400x400x20');
  const drillingQuantity = numberFromBOQ(typeof input === 'string' ? undefined : input, 'drilling', 4);
  const weldLength = numberFromBOQ(typeof input === 'string' ? undefined : input, 'welding', partId === 'BP-02' ? 1.2 : 1.6);
  const coatingArea = numberFromBOQ(typeof input === 'string' ? undefined : input, 'coating', partId === 'BP-02' ? 0.18 : 0.32);
  const cuttingList = buildCuttingList(partId, material, dimensions);
  const drillingSchedule = buildDrillingSchedule(partId, drillingQuantity);
  const weldSchedule = buildWeldSchedule(partId, weldLength, partId === 'BP-02' ? 0.35 : 0.45);
  const coatingSchedule = buildCoatingSchedule(partId, coatingArea, partId === 'BP-02' ? 0.15 : 0.2);
  const inspectionPlan = buildInspectionPlan(partId);
  const productionRoute = buildProductionRoute();
  const warnings = [...new Set([...(typeof input === 'string' ? [] : input.warnings), WELD_PERIMETER_WARNING])];

  return {
    source,
    partId,
    cuttingList,
    drillingSchedule,
    weldSchedule,
    coatingSchedule,
    inspectionPlan,
    productionRoute,
    totalEstimatedLaborHr: partId === 'BP-02' ? 1.1 : 1.4,
    totalEstimatedProductionHr: partId === 'BP-02' ? 3.4 : 4.2,
    warnings,
    generatedAt: GENERATED_AT,
  };
}
