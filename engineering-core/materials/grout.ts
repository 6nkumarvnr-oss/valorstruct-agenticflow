import type { MaterialProfile } from '../types.js';

export const groutMaterials: MaterialProfile[] = [
  { id: 'grout-40', name: 'Non-shrink grout', grade: '40MPa', compressiveStrengthMpa: 40, notes: 'Default grout profile for future base-plate workflows.' },
  { id: 'grout-60', name: 'Non-shrink grout', grade: '60MPa', compressiveStrengthMpa: 60, notes: 'High-strength grout profile for future anchor and bearing checks.' },
];

export function getGroutMaterial(grade = '40MPa'): MaterialProfile {
  return groutMaterials.find((material) => material.grade === grade) ?? groutMaterials[0];
}
