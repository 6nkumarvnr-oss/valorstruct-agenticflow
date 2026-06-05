import { calculateEulerBucklingLoad } from '../../engineering-science-core/mechanics/column-theory/euler-buckling.js';
import type { DesignCheckResult, SteelDesignContext } from './types.js';

function ratio(demand: number, capacity: number): number {
  return Number((demand / capacity).toFixed(3));
}

export function runAxialCompressionCheck(context: SteelDesignContext): DesignCheckResult {
  const demand = Math.abs(Math.min(0, context.input.axialDemandKN));
  const yieldCapacity = (context.areaMm2 * context.yieldStrengthMpa) / 1000;
  const euler = calculateEulerBucklingLoad({
    elasticModulusMpa: 200000,
    inertiaMm4: context.estimatedInertiaMm4,
    effectiveLengthM: context.input.lengthM,
    kFactor: context.input.effectiveLengthFactor,
  });
  const capacity = Math.min(yieldCapacity, euler.criticalLoadKn);
  const utilization = ratio(demand, capacity);
  return {
    checkName: 'Axial compression',
    demand,
    capacity: Number(capacity.toFixed(2)),
    utilization,
    status: utilization <= 1 ? 'pass' : 'fail',
    formula: '|Pu| / min(Fy × A, π²EI / (KL)²)',
    notes: 'Preliminary column check using estimated inertia and Euler buckling.',
  };
}
