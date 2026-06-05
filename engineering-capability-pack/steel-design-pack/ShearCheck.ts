import type { DesignCheckResult, SteelDesignContext } from './types.js';

function ratio(demand: number, capacity: number): number {
  return Number((demand / capacity).toFixed(3));
}

export function runShearCheck(context: SteelDesignContext): DesignCheckResult {
  const demand = Math.abs(context.input.shearDemandKN);
  const capacity = (0.6 * context.yieldStrengthMpa * context.areaMm2) / 1000;
  const utilization = ratio(demand, capacity);
  return {
    checkName: 'Shear',
    demand,
    capacity: Number(capacity.toFixed(2)),
    utilization,
    status: utilization <= 1 ? 'pass' : 'fail',
    formula: 'Vu / (0.6 × Fy × A)',
    notes: 'Preliminary gross-area shear check.',
  };
}
