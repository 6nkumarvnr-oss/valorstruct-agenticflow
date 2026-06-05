import type { MaterialProfile } from '../types.js';

export const boltMaterials: MaterialProfile[] = [
  { id: 'bolt-8-8', name: 'High-strength bolt', grade: '8.8', tensileStrengthMpa: 800, notes: 'Initial bolt grade for simple bolt-group capacity blocks.' },
  { id: 'bolt-10-9', name: 'High-strength bolt', grade: '10.9', tensileStrengthMpa: 1000, notes: 'Future option for advanced connection validation.' },
];

export function getBoltMaterial(grade = '8.8'): MaterialProfile {
  return boltMaterials.find((material) => material.grade === grade) ?? boltMaterials[0];
}
