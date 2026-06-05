import type { ManufacturingOperation } from '../types.js';

export interface ManufacturingCostInput {
  weightKg: number;
  unitCostSarPerKg: number;
  operations: ManufacturingOperation[];
}

export function estimateManufacturingCost(input: ManufacturingCostInput): number {
  const materialCost = input.weightKg * input.unitCostSarPerKg;
  const laborCost = input.operations.reduce((total, operation) => total + operation.laborHours, 0) * 50;
  const productionOverhead = input.operations.reduce((total, operation) => total + operation.productionHours, 0) * 5.84;
  return Number((materialCost + laborCost + productionOverhead).toFixed(0));
}
