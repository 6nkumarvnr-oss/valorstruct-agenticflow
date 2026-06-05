import type { DesignCheckResult, SteelDesignContext } from './types.js';

function ratio(demand: number, capacity: number): number {
  return Number((demand / capacity).toFixed(3));
}

export function runAxialTensionCheck(context: SteelDesignContext): DesignCheckResult {
  const demand = Math.max(0, context.input.axialDemandKN);
  const capacity = (context.areaMm2 * context.yieldStrengthMpa) / 1000;
  const utilization = ratio(demand, capacity);
  return {
    checkName: 'Axial tension',
    demand,
    capacity: Number(capacity.toFixed(2)),
    utilization,
    status: utilization <= 1 ? 'pass' : 'fail',
    formula: 'Pu / (Fy × A)',
    notes: 'Preliminary gross-section yielding check only.',
  };
}
