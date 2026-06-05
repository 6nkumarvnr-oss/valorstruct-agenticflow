import { parseDimensions } from './DimensionParser.js';
import { parseShape } from './ShapeParser.js';
import type { DrawingSection } from './types.js';

export function parseSection(note: string): DrawingSection | undefined {
  const shape = parseShape(note);
  const sectionMatch = note.match(/\b(SHS\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?|RHS\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?|CHS\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?|L\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?|ANGLE\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?\s*x\s*\d+(?:\.\d+)?|IPE\s*\d+|HEA\s*\d+|HEB\s*\d+|W\s*\d+(?:x\d+)?)\b/i);
  if (!sectionMatch || shape === 'Plate' || shape === 'Unknown') return undefined;

  return {
    family: shape,
    designation: sectionMatch[1].replace(/\s+/g, '').toUpperCase(),
    dimensions: parseDimensions(note),
  };
}
