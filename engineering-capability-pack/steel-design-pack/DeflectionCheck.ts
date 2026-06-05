import { calculateMidspanPointLoadDeflection } from '../../engineering-science-core/mechanics/beam-theory/beam-deflection.js';
import type { DesignCheckResult, SteelDesignContext } from './types.js';

function ratio(demand: number, capacity: number): number {
  return Number((demand / capacity).toFixed(3));
}

export function runDeflectionCheck(context: SteelDesignContext): DesignCheckResult {
  const estimatedPointLoadDeflection = calculateMidspanPointLoadDeflection({
    spanM: context.input.lengthM,
    pointLoadKn: Math.max(0, Math.abs(context.input.shearDemandKN)),
    elasticModulusMpa: 200000,
    inertiaMm4: context.estimatedInertiaMm4,
  }).deflectionMm;
  const demand = context.input.deflectionDemandMm || estimatedPointLoadDeflection;
  const capacity = context.input.deflectionLimitMm;
  const utilization = ratio(demand, capacity);
  return {
    checkName: 'Deflection',
    demand: Number(demand.toFixed(3)),
    capacity: Number(capacity.toFixed(3)),
    utilization,
    status: utilization <= 1 ? 'pass' : 'fail',
    formula: 'δactual / δlimit',
    notes: 'Uses provided deflection demand, or a simple point-load estimate when demand is zero.',
  };
}
