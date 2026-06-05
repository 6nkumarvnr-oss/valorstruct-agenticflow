import { extractPartsFromDrawingNotes } from './PartExtractor.js';
import type { DrawingHole, DrawingPartObject, DrawingWeld } from './types.js';

export interface ShopDrawingPartSummary {
  part: string;
  material: string;
  dimensions: string;
  shapeType: string;
}

export interface ShopDrawingAssistantOutput {
  sourceNote: string;
  partList: ShopDrawingPartSummary[];
  holeSchedule: string[];
  weldNotes: string[];
  fabricationNotes: string[];
  inspectionChecklist: string[];
  revisionLog: string[];
  drawingIssueChecklist: string[];
  warnings: string[];
}

function inferPartMark(note: string, part: DrawingPartObject): string {
  return note.match(/\b([A-Z]{1,4}-\d{1,4})\b/)?.[1] ?? part.metadata.title ?? part.description;
}

function formatDimensions(part: DrawingPartObject): string {
  const dimensions = part.dimensions;
  if (dimensions.widthMm && dimensions.lengthMm && dimensions.thicknessMm) {
    return `${dimensions.widthMm}x${dimensions.lengthMm}x${dimensions.thicknessMm}`;
  }
  if (dimensions.diameterMm && dimensions.thicknessMm) {
    return `Ø${dimensions.diameterMm}x${dimensions.thicknessMm}`;
  }
  if (dimensions.widthMm && dimensions.depthMm && dimensions.thicknessMm) {
    return `${dimensions.widthMm}x${dimensions.depthMm}x${dimensions.thicknessMm}`;
  }
  return 'Dimensions require review';
}

function formatHole(hole: DrawingHole): string {
  return `${hole.count}-M${hole.diameterMm}`;
}

function formatWeld(weld: DrawingWeld, sourceNote: string): string {
  const size = weld.sizeMm ? `${weld.sizeMm}mm ` : '';
  const type = weld.type === 'unknown' ? 'weld' : `${weld.type} weld`;
  const continuity = /all around/i.test(sourceNote) ? ' all around' : '';
  return `${size}${type}${continuity}`.trim();
}

export function generateShopDrawingAssistantPackage(note: string): ShopDrawingAssistantOutput {
  const parts = extractPartsFromDrawingNotes(note);
  const partList = parts.map((part) => ({
    part: inferPartMark(note, part),
    material: part.materialGrade ?? 'S275',
    dimensions: formatDimensions(part),
    shapeType: part.shapeType,
  }));
  const holeSchedule = parts.flatMap((part) => part.holes.map((hole) => `Part ${inferPartMark(note, part)}: ${formatHole(hole)}`));
  const weldNotes = parts.flatMap((part) => part.welds.map((weld) => `Part ${inferPartMark(note, part)}: ${formatWeld(weld, note)}`));
  const warnings = parts.flatMap((part) => part.warnings);

  return {
    sourceNote: note,
    partList,
    holeSchedule: holeSchedule.length ? holeSchedule : ['No hole schedule detected; verify drawing notes.'],
    weldNotes: weldNotes.length ? weldNotes : ['No weld notes detected; verify fabrication requirements.'],
    fabricationNotes: [
      'Verify material grade against project specification before cutting.',
      'Cut plate/section to listed dimensions and deburr all edges.',
      'Drill holes to the extracted schedule and verify alignment before fit-up.',
      'Apply welds according to extracted weld notes and project WPS requirements.',
    ],
    inspectionChecklist: [
      'Confirm part mark, material grade, and dimensions match the drawing issue.',
      'Check hole count, diameter, spacing, and edge distances before release.',
      'Inspect weld size, type, continuity, and finish after fabrication.',
      'Record nonconformances and route unresolved items for engineering review.',
    ],
    revisionLog: [
      'Rev 00 — Initial assistant-generated checklist from text drawing notes.',
    ],
    drawingIssueChecklist: [
      'Part list populated from drawing notes.',
      'Hole schedule reviewed against drawing geometry.',
      'Weld notes reviewed against fabrication specification.',
      'Fabrication notes and inspection checklist attached for shop issue.',
      'Approval status confirmed before external release.',
    ],
    warnings,
  };
}
