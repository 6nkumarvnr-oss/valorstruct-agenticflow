import type { ManufacturingInspectionItem } from './types.js';

export function buildInspectionPlan(partId = 'BP-01', shape: 'Plate' | 'RHS' = 'Plate'): ManufacturingInspectionItem[] {
  if (shape === 'RHS') {
    return [
      { itemNo: 1, partId, inspectionType: 'Member length/dimension inspection', acceptanceCriteria: 'RHS80x40x2.8 length 2.5m', holdPoint: true },
      { itemNo: 2, partId, inspectionType: 'Weld visual inspection', acceptanceCriteria: '6mm fillet weld allowance', holdPoint: true },
      { itemNo: 3, partId, inspectionType: 'Coating visual/DFT inspection', acceptanceCriteria: 'Paint System C3', holdPoint: false },
    ];
  }
  return [
    { itemNo: 1, partId, inspectionType: 'Dimensional inspection', acceptanceCriteria: 'tolerance ±2 mm', holdPoint: true },
    { itemNo: 2, partId, inspectionType: 'Hole diameter/count inspection', acceptanceCriteria: '4-M20 holes', holdPoint: true },
    { itemNo: 3, partId, inspectionType: 'Weld visual inspection', acceptanceCriteria: 'continuous 6mm fillet weld', holdPoint: true },
    { itemNo: 4, partId, inspectionType: 'Coating visual/DFT inspection', acceptanceCriteria: 'Paint System C3', holdPoint: false },
  ];
}
