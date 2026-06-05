import type { WeldScheduleItem } from './types.js';

export const WELD_PERIMETER_WARNING = 'Weld length is estimated from plate perimeter.';

export function buildWeldSchedule(partId = 'BP-01', weldLengthM = 1.6, estimatedWeldingTimeHr = 0.45, warnings: string[] = [WELD_PERIMETER_WARNING]): WeldScheduleItem[] {
  return [{ itemNo: 1, partId, weldType: 'fillet', weldSizeMm: 6, weldLengthM, process: 'GMAW', estimatedWeldingTimeHr, warnings }];
}
