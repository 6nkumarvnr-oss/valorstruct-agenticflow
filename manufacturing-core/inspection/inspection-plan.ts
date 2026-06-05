import type { InspectionStep } from '../types.js';

export function createBasePlateInspectionPlan(): InspectionStep[] {
  return [
    { name: 'Dimension Check', acceptance: 'Width, length and thickness match drawing tolerance.' },
    { name: 'Hole Check', acceptance: 'Hole count, diameter and location are verified.' },
    { name: 'Weld Check', acceptance: 'Visual weld acceptance before coating.' },
    { name: 'DFT Check', acceptance: 'Dry film thickness recorded for painted surface.' },
  ];
}
