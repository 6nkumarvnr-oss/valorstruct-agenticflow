import type { CuttingListItem } from './types.js';

export function buildCuttingList(
  partId = 'BP-01',
  material = 'S275',
  dimensions = '400x400x20',
  shape = 'Plate',
  quantity = 1,
  cuttingMethod: CuttingListItem['cuttingMethod'] = 'plasma',
  estimatedCuttingTimeHr = 0.25,
): CuttingListItem[] {
  return [{ itemNo: 1, partId, material, shape, dimensions, quantity, cuttingMethod, estimatedCuttingTimeHr, warnings: [] }];
}
