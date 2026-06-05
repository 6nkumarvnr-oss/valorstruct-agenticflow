import type { DrawingWeld } from './types.js';

export function parseWelds(note: string): DrawingWeld[] {
  const welds: DrawingWeld[] = [];
  const fillet = note.match(/(?:(\d+)\s*mm?\s*)?(?:fillet\s*weld|FW)(?:\s*(\d+)\s*mm?)?/i);
  if (fillet) welds.push({ type: 'fillet', sizeMm: fillet[1] || fillet[2] ? Number(fillet[1] ?? fillet[2]) : undefined, note: fillet[0] });

  const butt = note.match(/(?:(\d+)\s*mm?\s*)?butt\s*weld(?:\s*(\d+)\s*mm?)?/i);
  if (butt) welds.push({ type: 'butt', sizeMm: butt[1] || butt[2] ? Number(butt[1] ?? butt[2]) : undefined, note: butt[0] });

  if (/\bweld\b/i.test(note) && welds.length === 0) welds.push({ type: 'unknown', note: 'Weld note detected; type and size require review.' });
  return welds;
}
