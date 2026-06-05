import type { ManufacturingOperation } from '../types.js';

export function totalLaborHours(operations: ManufacturingOperation[]): number {
  return Number(operations.reduce((total, operation) => total + operation.laborHours, 0).toFixed(2));
}

export function totalProductionHours(operations: ManufacturingOperation[]): number {
  return Number(operations.reduce((total, operation) => total + operation.productionHours, 0).toFixed(2));
}
