import { MANUFACTURING_MACHINES } from '../machines/machine-registry.js';
import type { ManufacturingOperation } from '../types.js';

export function planPlasmaCut(): ManufacturingOperation {
  return {
    name: 'Plasma Cut',
    machine: MANUFACTURING_MACHINES.plasmaTable,
    laborHours: 0.25,
    productionHours: 0.7,
    notes: 'Cut base plate profile from steel plate stock.',
  };
}

export function planEdgeGrind(): ManufacturingOperation {
  return {
    name: 'Edge Grind',
    machine: MANUFACTURING_MACHINES.grinder,
    laborHours: 0.18,
    productionHours: 0.4,
    notes: 'Remove burrs and prepare plate edges.',
  };
}
