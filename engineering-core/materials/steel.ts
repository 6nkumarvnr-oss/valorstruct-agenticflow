import type { MaterialProfile } from '../types.js';

export const steelMaterials: MaterialProfile[] = [
  { id: 'steel-s275', name: 'Structural steel', grade: 'S275', densityKgPerM3: 7850, yieldStrengthMpa: 275, notes: 'Default mild steel for early BOQ and weight calculations.' },
  { id: 'steel-s355', name: 'Structural steel', grade: 'S355', densityKgPerM3: 7850, yieldStrengthMpa: 355, notes: 'Common higher-strength steel grade for future design checks.' },
];

export function getSteelMaterial(grade = 'S275'): MaterialProfile {
  return steelMaterials.find((material) => material.grade === grade) ?? steelMaterials[0];
}
