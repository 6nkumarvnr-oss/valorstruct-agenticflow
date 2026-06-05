import type { DrawingMetadataResult } from './types.js';

export function parseDrawingMetadata(note: string): DrawingMetadataResult {
  const drawingNo = note.match(/(?:drawing\s*no\.?|dwg\s*no\.?)\s*[:#-]?\s*([A-Z0-9-]+)/i)?.[1];
  const revision = note.match(/(?:rev(?:ision)?\.? )\s*[:#-]?\s*([A-Z0-9]+)/i)?.[1] ?? note.match(/\bREV\s*([A-Z0-9]+)\b/i)?.[1];
  const title = note.match(/(?:title|part)\s*[:#-]?\s*([^\n,;]+)/i)?.[1]?.trim();
  const partMark = note.match(/\b([A-Z]{1,3}-?\d{2})\b/i)?.[1]?.toUpperCase().replace(/([A-Z]+)(\d+)/, '$1-$2');
  const materialGrade = note.match(/\b(S275|S355|A36|GR\.?\s*50)\b/i)?.[1]?.replace(/\s+/g, '').toUpperCase();
  const lengthMatch = note.match(/\blength\s*(\d+(?:\.\d+)?)\s*m\b/i);
  const lengthM = lengthMatch ? Number(lengthMatch[1]) : undefined;
  const quantityMatch = note.match(/\bqty(?:uantity)?\s*[:#-]?\s*(\d+)\b/i);
  const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
  return { drawingNo, revision, title, partMark, materialGrade, lengthM, quantity, rawNotes: note };
}
