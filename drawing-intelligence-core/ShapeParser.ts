import type { DrawingShapeType } from './types.js';

export function parseShape(note: string): DrawingShapeType {
  if (/\b(base\s*)?plate\b/i.test(note)) return 'Plate';
  if (/\bSHS(?=\b|\d)/i.test(note)) return 'SHS';
  if (/\bRHS(?=\b|\d)/i.test(note)) return 'RHS';
  if (/\bCHS(?=\b|\d)/i.test(note)) return 'CHS';
  if (/\b(angle|L\s*\d)/i.test(note)) return 'Angle';
  if (/\b(channel|UPN|C\s*\d)/i.test(note)) return 'Channel';
  if (/\b(IPE|HEA|HEB|W\d|I[-\s]?beam)\b/i.test(note)) return 'I-Beam';
  return 'Unknown';
}
