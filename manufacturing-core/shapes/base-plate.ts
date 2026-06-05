import { calculatePlateVolumeM3 } from '../dimensions/plate-dimensions.js';
import { getManufacturingSteelMaterial } from '../materials/steel.js';
import type { BasePlateManufacturingInput } from '../types.js';

export function calculateBasePlateWeight(input: BasePlateManufacturingInput): number {
  const material = getManufacturingSteelMaterial(input.materialGrade);
  const weight = calculatePlateVolumeM3(input.widthMm, input.lengthMm, input.thicknessMm) * material.densityKgPerM3;
  return Number(weight.toFixed(2));
}
