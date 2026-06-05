import type { MaterialProfile } from '../types.js';

export const anchorMaterials: MaterialProfile[] = [
  { id: 'anchor-5-8', name: 'Anchor rod', grade: '5.8', tensileStrengthMpa: 500, notes: 'Baseline anchor material for simple anchor-load distribution.' },
  { id: 'anchor-8-8', name: 'Anchor rod', grade: '8.8', tensileStrengthMpa: 800, notes: 'Higher-grade anchor material for future base-plate packs.' },
];

export function getAnchorMaterial(grade = '5.8'): MaterialProfile {
  return anchorMaterials.find((material) => material.grade === grade) ?? anchorMaterials[0];
}
