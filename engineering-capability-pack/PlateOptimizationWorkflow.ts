import { calculatePlateWeight } from '../engineering-core/calculators/plate-weight.js';
import type { PlateWeightInput } from '../engineering-core/calculators/plate-weight.js';

export interface PlateOptimizationInput extends PlateWeightInput {
  stockWidthMm: number;
  stockLengthMm: number;
}

export function runPlateOptimizationWorkflow(input: PlateOptimizationInput) {
  const plate = calculatePlateWeight(input);
  const requestedAreaMm2 = input.widthMm * input.lengthMm * (input.quantity ?? 1);
  const stockAreaMm2 = input.stockWidthMm * input.stockLengthMm;
  const utilisation = Number((requestedAreaMm2 / stockAreaMm2).toFixed(3));
  const wastePercent = Number(Math.max(0, (1 - utilisation) * 100).toFixed(2));
  return {
    status: 'completed' as const,
    workflow: 'PlateOptimizationWorkflow' as const,
    plate,
    stock: { widthMm: input.stockWidthMm, lengthMm: input.stockLengthMm },
    utilisation,
    wastePercent,
    recommendation: utilisation <= 1 ? 'Fits within selected stock plate.' : 'Split across multiple stock plates.',
  };
}
