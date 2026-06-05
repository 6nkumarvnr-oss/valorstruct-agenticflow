import { getSteelMaterial } from '../materials/steel.js';

export interface PlateWeightInput {
  widthMm: number;
  lengthMm: number;
  thicknessMm: number;
  quantity?: number;
  steelGrade?: string;
}

export function calculatePlateWeight(input: PlateWeightInput) {
  const density = getSteelMaterial(input.steelGrade).densityKgPerM3 ?? 7850;
  const quantity = input.quantity ?? 1;
  const singlePlateKg = (input.widthMm * input.lengthMm * input.thicknessMm * density) / 1_000_000_000;
  return {
    ...input,
    quantity,
    singlePlateKg: Number(singlePlateKg.toFixed(2)),
    totalWeightKg: Number((singlePlateKg * quantity).toFixed(2)),
  };
}
