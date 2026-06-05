import type { DesignCheckResult, SteelDesignContext } from './types.js';

function ratio(demand: number, capacity: number): number {
  return Number((demand / capacity).toFixed(3));
}

export function runBendingCheck(context: SteelDesignContext): DesignCheckResult {
  const demand = Math.abs(context.input.momentDemandKNm);
  const capacity = (context.yieldStrengthMpa * context.estimatedSectionModulusMm3) / 1_000_000;
  const utilization = ratio(demand, capacity);
  return {
    checkName: 'Bending',
    demand,
    capacity: Number(capacity.toFixed(2)),
    utilization,
    status: utilization <= 1 ? 'pass' : 'fail',
    formula: 'Mu / (Fy × S)',
    notes: 'Preliminary elastic bending check with estimated section modulus.',
  };
}
