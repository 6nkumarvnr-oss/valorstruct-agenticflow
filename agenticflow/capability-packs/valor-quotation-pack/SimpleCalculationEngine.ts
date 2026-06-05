export interface SimpleCalculationInput {
  sectionName: string;
  lengthM: number;
  weightKgPerM: number;
}

export interface SimpleCalculationResult {
  sectionName: string;
  lengthM: number;
  weightKgPerM: number;
  totalWeightKg: number;
}

export function calculateSteelMemberWeight(input: SimpleCalculationInput): SimpleCalculationResult {
  return {
    ...input,
    totalWeightKg: Number((input.lengthM * input.weightKgPerM).toFixed(2)),
  };
}
