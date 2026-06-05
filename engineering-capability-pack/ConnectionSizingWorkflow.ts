import { calculateAnchorLoad } from '../engineering-core/calculators/anchor-load.js';
import { calculateBoltGroup } from '../engineering-core/calculators/bolt-group.js';
import { validateDesignCapacity } from '../engineering-core/validators/design-check.js';

export interface ConnectionSizingInput {
  shearDemandKn: number;
  boltCount: number;
  boltDiameterMm: number;
  axialDemandKn: number;
  anchorCount: number;
  eccentricityFactor?: number;
}

export function runConnectionSizingWorkflow(input: ConnectionSizingInput) {
  const boltGroup = calculateBoltGroup({
    boltCount: input.boltCount,
    boltDiameterMm: input.boltDiameterMm,
  });
  const anchorLoad = calculateAnchorLoad({
    factoredLoadKn: input.axialDemandKn,
    anchorCount: input.anchorCount,
    eccentricityFactor: input.eccentricityFactor,
  });
  const boltCheck = validateDesignCapacity({
    label: 'Bolt group shear',
    demand: input.shearDemandKn,
    capacity: boltGroup.groupShearKn,
  });
  return {
    status: 'completed' as const,
    workflow: 'ConnectionSizingWorkflow' as const,
    boltGroup,
    anchorLoad,
    checks: [boltCheck],
  };
}
