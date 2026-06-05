import { parseDimensions } from './DimensionParser.js';
import { parseDrawingMetadata } from './DrawingMetadata.js';
import { parseHoles } from './HoleParser.js';
import { parseSection } from './SectionParser.js';
import { parseShape } from './ShapeParser.js';
import { parseWelds } from './WeldParser.js';
import type { DrawingPartHandoffs, DrawingPartObject } from './types.js';

function buildHandoffs(part: Omit<DrawingPartObject, 'handoffs'>): DrawingPartHandoffs {
  if (part.shapeType === 'Plate' && part.dimensions.widthMm && part.dimensions.lengthMm && part.dimensions.thicknessMm) {
    const firstHole = part.holes[0] ?? { count: 0, diameterMm: 0 };
    return {
      manufacturingInput: {
        partName: part.description,
        widthMm: part.dimensions.widthMm,
        lengthMm: part.dimensions.lengthMm,
        thicknessMm: part.dimensions.thicknessMm,
        holes: { count: firstHole.count, diameterMm: firstHole.diameterMm },
        materialGrade: part.materialGrade ?? 'S275',
        coatingSystem: /paint|coating/i.test(part.metadata.rawNotes) ? 'Paint' : 'Primer',
        currency: 'SAR',
      },
      quotationItemSeed: { description: part.description, unit: 'each', quantity: 1 },
    };
  }

  if (part.section) {
    return {
      steelDesignInputSeed: {
        sectionName: part.section.designation,
        materialGrade: part.materialGrade ?? 'S275',
        codeProfile: 'SBC',
      },
      quotationItemSeed: { description: `${part.section.designation} supply/fabrication`, unit: 'm', quantity: 1 },
    };
  }

  return {};
}

export function extractPartsFromDrawingNotes(note: string): DrawingPartObject[] {
  const metadata = parseDrawingMetadata(note);
  const shapeType = parseShape(note);
  const dimensions = parseDimensions(note);
  const section = parseSection(note);
  const holes = parseHoles(note);
  const welds = parseWelds(note);
  const warnings: string[] = [];

  if (shapeType === 'Unknown') warnings.push('Shape could not be classified from drawing notes.');
  if (!metadata.materialGrade) warnings.push('Material grade missing; default handoff may use S275.');
  if (shapeType === 'Plate' && (!dimensions.widthMm || !dimensions.lengthMm || !dimensions.thicknessMm)) warnings.push('Plate dimensions are incomplete.');

  const partialPart = {
    id: metadata.partMark ?? `PART-${shapeType.toUpperCase().replace(/[^A-Z]/g, '') || 'UNKNOWN'}-001`,
    partMark: metadata.partMark,
    shapeType,
    description: metadata.title ?? (shapeType === 'Unknown' ? 'Unclassified Drawing Part' : shapeType),
    dimensions,
    section,
    holes,
    welds,
    materialGrade: metadata.materialGrade,
    lengthM: metadata.lengthM,
    quantity: metadata.quantity,
    metadata,
    warnings,
  };

  return [{ ...partialPart, handoffs: buildHandoffs(partialPart) }];
}
