export interface ManufacturingSteelMaterial {
  grade: string;
  densityKgPerM3: number;
  unitCostSarPerKg: number;
  notes: string;
}

const STEEL_MATERIALS: ManufacturingSteelMaterial[] = [
  { grade: 'S275', densityKgPerM3: 7850, unitCostSarPerKg: 4, notes: 'Common mild steel fabrication grade.' },
  { grade: 'S355', densityKgPerM3: 7850, unitCostSarPerKg: 4.5, notes: 'Higher-strength structural steel grade.' },
];

export function getManufacturingSteelMaterial(grade = 'S275'): ManufacturingSteelMaterial {
  return STEEL_MATERIALS.find((material) => material.grade.toLowerCase() === grade.toLowerCase()) ?? STEEL_MATERIALS[0];
}
