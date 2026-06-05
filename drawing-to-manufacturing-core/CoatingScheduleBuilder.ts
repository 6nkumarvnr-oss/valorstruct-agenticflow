import type { CoatingScheduleItem } from './types.js';

export function buildCoatingSchedule(partId = 'BP-01', areaM2 = 0.32, estimatedCoatingTimeHr = 0.2): CoatingScheduleItem[] {
  return [{ itemNo: 1, partId, coatingSystem: 'Paint System C3', areaM2, preparation: 'Clean, grind sharp edges, remove oil and loose scale', estimatedCoatingTimeHr, warnings: [] }];
}
