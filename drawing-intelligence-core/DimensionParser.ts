import type { DrawingDimensions } from './types.js';

const NUMBER = String.raw`(\d+(?:\.\d+)?)`;

function value(match: RegExpMatchArray | null, index: number): number | undefined {
  return match ? Number(match[index]) : undefined;
}

export function parseDimensions(note: string): DrawingDimensions {
  const compact = note.replace(/×/g, 'x');
  const shs = compact.match(new RegExp(String.raw`SHS\s*${NUMBER}\s*x\s*${NUMBER}\s*x\s*${NUMBER}`, 'i'));
  if (shs) return { widthMm: value(shs, 1), depthMm: value(shs, 2), thicknessMm: value(shs, 3) };

  const rhs = compact.match(new RegExp(String.raw`RHS\s*${NUMBER}\s*x\s*${NUMBER}\s*x\s*${NUMBER}`, 'i'));
  if (rhs) return { widthMm: value(rhs, 1), depthMm: value(rhs, 2), thicknessMm: value(rhs, 3) };

  const plate = compact.match(new RegExp(String.raw`${NUMBER}\s*x\s*${NUMBER}\s*x\s*${NUMBER}`, 'i'));
  if (plate) {
    return { widthMm: value(plate, 1), lengthMm: value(plate, 2), thicknessMm: value(plate, 3) };
  }

  const chs = compact.match(new RegExp(String.raw`CHS\s*${NUMBER}\s*x\s*${NUMBER}`, 'i'));
  if (chs) return { diameterMm: value(chs, 1), thicknessMm: value(chs, 2) };

  const angle = compact.match(new RegExp(String.raw`(?:L|ANGLE)\s*${NUMBER}\s*x\s*${NUMBER}\s*x\s*${NUMBER}`, 'i'));
  if (angle) return { widthMm: value(angle, 1), depthMm: value(angle, 2), thicknessMm: value(angle, 3) };

  return {};
}
