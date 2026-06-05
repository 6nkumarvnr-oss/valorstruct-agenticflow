import type { DrawingHole } from './types.js';

export function parseHoles(note: string): DrawingHole[] {
  const holes: DrawingHole[] = [];
  const pattern = /(\d+)\s*[- ]?M\s*(\d+)\s*(?:holes?|Holes?|HOLES?)?/gi;
  for (const match of note.matchAll(pattern)) {
    holes.push({ count: Number(match[1]), diameterMm: Number(match[2]), label: `${match[1]}-M${match[2]} Holes` });
  }

  const diameterPattern = /(\d+)\s*(?:holes?|HOLES?)\s*(?:dia|diameter|Ø)\s*(\d+)/gi;
  for (const match of note.matchAll(diameterPattern)) {
    holes.push({ count: Number(match[1]), diameterMm: Number(match[2]), label: `${match[1]} Holes Ø${match[2]}` });
  }

  return holes;
}
