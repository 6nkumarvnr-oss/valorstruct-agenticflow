import { MANUFACTURING_MACHINES } from '../machines/machine-registry.js';
import type { ManufacturingOperation } from '../types.js';

export function planFitUp(): ManufacturingOperation {
  return {
    name: 'Fit-Up',
    machine: MANUFACTURING_MACHINES.fitUpBench,
    laborHours: 0.2,
    productionHours: 0.5,
    notes: 'Align plate and connection parts before welding.',
  };
}

export function planWelding(): ManufacturingOperation {
  return {
    name: 'Weld',
    machine: MANUFACTURING_MACHINES.weldingStation,
    laborHours: 0.3,
    productionHours: 1.2,
    notes: 'Perform preliminary weld operation allowance.',
  };
}
