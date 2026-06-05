import { MANUFACTURING_MACHINES } from '../machines/machine-registry.js';
import type { ManufacturingOperation, PlateHoleInput } from '../types.js';

export function planHoleDrilling(holes: PlateHoleInput): ManufacturingOperation {
  return {
    name: `Drill ${holes.count} Holes`,
    machine: MANUFACTURING_MACHINES.drillPress,
    laborHours: Number((holes.count * 0.08).toFixed(2)),
    productionHours: Number((holes.count * 0.2).toFixed(2)),
    notes: `Drill ${holes.count} holes at ${holes.diameterMm} mm diameter.`,
  };
}
