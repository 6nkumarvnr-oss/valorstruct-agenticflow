import type { DrillingScheduleItem } from './types.js';

export function buildDrillingSchedule(partId = 'BP-01', quantity = 4): DrillingScheduleItem[] {
  if (quantity <= 0) return [];
  return [{ itemNo: 1, partId, holeType: 'M20', holeDiameterMm: 20, quantity, drillingMethod: 'drill_press', estimatedDrillingTimeHr: 0.3, warnings: [] }];
}
