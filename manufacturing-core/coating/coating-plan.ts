import { MANUFACTURING_MACHINES } from '../machines/machine-registry.js';
import type { ManufacturingOperation } from '../types.js';

export function planCoating(coatingSystem: string): ManufacturingOperation {
  return {
    name: coatingSystem || 'Paint',
    machine: MANUFACTURING_MACHINES.paintBooth,
    laborHours: 0.15,
    productionHours: 0.6,
    notes: 'Apply protective coating allowance after fabrication checks.',
  };
}
