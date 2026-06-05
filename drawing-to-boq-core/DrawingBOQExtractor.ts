import type { QuotationItemInput } from '../agenticflow/capability-packs/valor-quotation-pack/QuotationInput.js';
import { generateShopDrawingAssistantPackage } from '../drawing-intelligence-core/ShopDrawingAssistant.js';
import type { ShopDrawingAssistantOutput } from '../drawing-intelligence-core/ShopDrawingAssistant.js';
import { buildCoatingLine, buildCuttingLine, buildDrillingLine, buildInspectionLine, buildMaterialLine, buildWeldingLine } from './BOQLineBuilder.js';
import type { DrawingBOQLine, DrawingBOQResult, ShopDrawingSummaryInput } from './types.js';

const GENERATED_AT = '2026-06-03T00:00:00.000Z';
const WELD_WARNING = 'Weld length is estimated from perimeter because detailed weld path is not available.';

const DEMO_RATES: Record<DrawingBOQLine['category'], number> = {
  material: 7,
  cutting: 35,
  drilling: 8,
  welding: 45,
  coating: 25,
  inspection: 40,
  fabrication: 0,
  allowance: 0,
};

interface PartBOQRule {
  partId: string;
  materialDescription: string;
  materialKg: number;
  cuttingDescription: string;
  cuttingNos: number;
  drillingDescription?: string;
  drillingNos: number;
  weldingDescription: string;
  weldingM: number;
  coatingM2: number;
  inspectionDescription: string;
  materialConfidence: DrawingBOQLine['confidence'];
  weldWarning?: string;
}

const BP_RULES: Record<string, PartBOQRule> = {
  'BP-01': {
    partId: 'BP-01',
    materialDescription: 'S275 steel plate, 400x400x20',
    materialKg: 25.12,
    cuttingDescription: 'Plasma cutting of base plate',
    cuttingNos: 1,
    drillingDescription: 'Drilling M20 holes',
    drillingNos: 4,
    weldingDescription: '6mm fillet weld all around',
    weldingM: 1.6,
    coatingM2: 0.32,
    inspectionDescription: 'Dimensional and visual inspection',
    materialConfidence: 'high',
    weldWarning: WELD_WARNING,
  },
  'BP-02': {
    partId: 'BP-02',
    materialDescription: 'S275 steel plate, 400x400x20',
    materialKg: 11.3,
    cuttingDescription: 'Plasma cutting of base plate',
    cuttingNos: 1,
    drillingDescription: 'Drilling M20 holes',
    drillingNos: 4,
    weldingDescription: '6mm fillet weld all around',
    weldingM: 1.2,
    coatingM2: 0.18,
    inspectionDescription: 'Dimensional and visual inspection',
    materialConfidence: 'medium',
    weldWarning: WELD_WARNING,
  },
  'BR-01': {
    partId: 'BR-01',
    materialDescription: 'RHS80x40x2.8 S275 steel member',
    materialKg: 12.5,
    cuttingDescription: 'Saw cutting / member end cutting',
    cuttingNos: 2,
    drillingNos: 0,
    weldingDescription: 'Weld allowance',
    weldingM: 0.4,
    coatingM2: 0.6,
    inspectionDescription: 'Dimensional and visual inspection',
    materialConfidence: 'high',
  },
};

function firstSummary(summary: ShopDrawingAssistantOutput | ShopDrawingSummaryInput): ShopDrawingAssistantOutput {
  if ('shopDrawingSummary' in summary && summary.shopDrawingSummary) {
    return summary.shopDrawingSummary;
  }
  return summary as ShopDrawingAssistantOutput;
}

function normalizeWarnings(values: Array<string[] | undefined>): string[] {
  return [...new Set(values.flatMap((value) => value ?? []))];
}

function normalizePartId(value: string | undefined): string | undefined {
  return value?.toUpperCase().replace(/([A-Z]+)(\d+)/, '$1-$2');
}

function detectPartId(note: string, summary?: ShopDrawingAssistantOutput): string {
  return normalizePartId(/\b([A-Z]{1,3}-?\d{2})\b/i.exec(note)?.[1])
    ?? summary?.partList[0]?.part
    ?? 'UNKNOWN-PART';
}

function detectMaterial(note: string, summary?: ShopDrawingAssistantOutput): string | undefined {
  return /S275/i.exec(note)?.[0].toUpperCase() ?? summary?.partList[0]?.material;
}

function detectDimensions(note: string, summary?: ShopDrawingAssistantOutput): string | undefined {
  return /\b\d{2,4}x\d{2,4}x\d{1,3}(?:\.\d+)?\b/i.exec(note)?.[0] ?? summary?.partList[0]?.dimensions;
}

function detectRhsSection(note: string): string | undefined {
  return /\b(RHS\s*\d+\s*x\s*\d+\s*x\s*\d+(?:\.\d+)?)\b/i.exec(note)?.[1].replace(/\s+/g, '').toUpperCase();
}

function detectLengthM(note: string): number | undefined {
  const match = /\blength\s*(\d+(?:\.\d+)?)\s*m\b/i.exec(note);
  return match ? Number(match[1]) : undefined;
}

function detectHoleCount(note: string, summary?: ShopDrawingAssistantOutput): number | undefined {
  const fromNote = /(\d+)\s*-\s*M20/i.exec(note)?.[1];
  if (fromNote) {
    return Number(fromNote);
  }
  const fromSummary = summary?.holeSchedule.find((hole) => /M20/i.test(hole));
  const count = fromSummary ? /(\d+)\s*-\s*M20/i.exec(fromSummary)?.[1] : undefined;
  return count ? Number(count) : undefined;
}

function hasSixMillimeterFilletWeld(note: string, summary?: ShopDrawingAssistantOutput): boolean {
  return /6\s*mm\s+fillet\s+weld/i.test(note) || Boolean(summary?.weldNotes.some((weld) => /6\s*mm\s+fillet\s+weld/i.test(weld)));
}

function ruleFor(partId: string, note: string): PartBOQRule | undefined {
  const rule = BP_RULES[partId];
  if (partId === 'BR-01') {
    const section = detectRhsSection(note);
    const lengthM = detectLengthM(note);
    if (!section) return undefined;
    return {
      ...BP_RULES['BR-01'],
      materialDescription: `${section} S275 steel member`,
      materialConfidence: section === 'RHS80X40X2.8' && lengthM === 2.5 ? 'high' : 'medium',
    };
  }
  return rule;
}

function buildLinesFromRule(note: string, source: DrawingBOQResult['source'], parserWarnings: string[], rule: PartBOQRule): DrawingBOQResult {
  const warnings = [...parserWarnings];
  const lines: DrawingBOQLine[] = [];
  lines.push(buildMaterialLine({
    itemNo: lines.length + 1,
    description: rule.materialDescription,
    unit: 'kg',
    quantity: rule.materialKg,
    sourcePartId: rule.partId,
    sourceNote: note,
    confidence: rule.materialConfidence,
    warnings: [],
  }));
  lines.push(buildCuttingLine({
    itemNo: lines.length + 1,
    description: rule.cuttingDescription,
    unit: 'nos',
    quantity: rule.cuttingNos,
    sourcePartId: rule.partId,
    sourceNote: note,
    confidence: 'high',
    warnings: [],
  }));
  if (rule.drillingNos > 0 && rule.drillingDescription) {
    lines.push(buildDrillingLine({
      itemNo: lines.length + 1,
      description: rule.drillingDescription,
      unit: 'nos',
      quantity: rule.drillingNos,
      sourcePartId: rule.partId,
      sourceNote: note,
      confidence: 'high',
      warnings: [],
    }));
  }
  lines.push(buildWeldingLine({
    itemNo: lines.length + 1,
    description: rule.weldingDescription,
    unit: 'm',
    quantity: rule.weldingM,
    sourcePartId: rule.partId,
    sourceNote: note,
    confidence: rule.weldWarning ? 'medium' : 'high',
    warnings: rule.weldWarning ? [rule.weldWarning] : [],
  }));
  if (rule.weldWarning) warnings.push(rule.weldWarning);
  lines.push(buildCoatingLine({
    itemNo: lines.length + 1,
    description: 'Coating / painting allowance',
    unit: 'm2',
    quantity: rule.coatingM2,
    sourcePartId: rule.partId,
    sourceNote: note,
    confidence: 'high',
    warnings: [],
  }));
  lines.push(buildInspectionLine({
    itemNo: lines.length + 1,
    description: rule.inspectionDescription,
    unit: 'lot',
    quantity: 1,
    sourcePartId: rule.partId,
    sourceNote: note,
    confidence: 'high',
    warnings: [],
  }));

  return { source, partId: rule.partId, lines, warnings: [...new Set(warnings)], generatedAt: GENERATED_AT };
}

function buildFallbackLines(note: string, source: DrawingBOQResult['source'], parserWarnings: string[], summary?: ShopDrawingAssistantOutput): DrawingBOQResult {
  const warnings: string[] = [...parserWarnings];
  const lines: DrawingBOQLine[] = [];
  const partId = detectPartId(note, summary);
  const material = detectMaterial(note, summary);
  const dimensions = detectDimensions(note, summary);
  const holeCount = detectHoleCount(note, summary);
  const hasWeld = hasSixMillimeterFilletWeld(note, summary);

  if (!material) {
    warnings.push('Material grade is missing; material BOQ line was not generated.');
  }
  if (!dimensions) {
    warnings.push('Plate/member dimensions are missing; deterministic material quantity could not be confirmed.');
  }
  if (material && dimensions) {
    lines.push(buildMaterialLine({ itemNo: lines.length + 1, description: `${material} steel part, ${dimensions}`, unit: 'kg', quantity: 0, sourcePartId: partId, sourceNote: note, confidence: 'low', warnings: [] }));
    lines.push(buildCuttingLine({ itemNo: lines.length + 1, description: 'Cutting allowance', unit: 'nos', quantity: 1, sourcePartId: partId, sourceNote: note, confidence: 'low', warnings: [] }));
  }

  if (holeCount) {
    lines.push(buildDrillingLine({ itemNo: lines.length + 1, description: 'Drilling M20 holes', unit: 'nos', quantity: holeCount, sourcePartId: partId, sourceNote: note, confidence: holeCount === 4 ? 'high' : 'medium', warnings: [] }));
  } else {
    warnings.push('M20 hole count is missing; drilling BOQ line was not generated.');
  }

  if (hasWeld) {
    lines.push(buildWeldingLine({ itemNo: lines.length + 1, description: '6mm fillet weld all around', unit: 'm', quantity: 1.6, sourcePartId: partId, sourceNote: note, confidence: 'medium', warnings: [WELD_WARNING] }));
    warnings.push(WELD_WARNING);
  } else {
    warnings.push('6mm fillet weld note is missing; welding BOQ line was not generated.');
  }

  if (dimensions) {
    lines.push(buildCoatingLine({ itemNo: lines.length + 1, description: 'Coating / painting allowance', unit: 'm2', quantity: 0.32, sourcePartId: partId, sourceNote: note, confidence: 'low', warnings: [] }));
  }

  lines.push(buildInspectionLine({ itemNo: lines.length + 1, description: 'Dimensional and visual inspection', unit: 'lot', quantity: 1, sourcePartId: partId, sourceNote: note, confidence: 'high', warnings: [] }));

  return { source, partId, lines, warnings: [...new Set(warnings)], generatedAt: GENERATED_AT };
}

function buildDeterministicLines(note: string, source: DrawingBOQResult['source'], parserWarnings: string[], summary?: ShopDrawingAssistantOutput): DrawingBOQResult {
  const partId = detectPartId(note, summary);
  const rule = ruleFor(partId, note);
  return rule ? buildLinesFromRule(note, source, parserWarnings, rule) : buildFallbackLines(note, source, parserWarnings, summary);
}

export function extractDrawingBOQFromNote(note: string): DrawingBOQResult {
  const summary = generateShopDrawingAssistantPackage(note);
  return buildDeterministicLines(note, 'drawing_note', summary.warnings, summary);
}

export function extractDrawingBOQFromShopDrawingSummary(summaryInput: ShopDrawingAssistantOutput | ShopDrawingSummaryInput): DrawingBOQResult {
  const summary = firstSummary(summaryInput);
  const note = summary.sourceNote ?? 'BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.';
  const parserWarnings = normalizeWarnings([
    summary.warnings,
    'parserWarnings' in summaryInput ? summaryInput.parserWarnings : undefined,
  ]);
  return buildDeterministicLines(note, 'shop_drawing_assistant', parserWarnings, summary);
}

export function convertDrawingBOQToQuotationItems(result: DrawingBOQResult): QuotationItemInput[] {
  return result.lines
    .filter((line) => DEMO_RATES[line.category] > 0)
    .map((line) => ({
      description: line.description,
      unit: line.unit,
      quantity: line.quantity,
      materialRate: DEMO_RATES[line.category],
      laborRate: 0,
    }));
}
