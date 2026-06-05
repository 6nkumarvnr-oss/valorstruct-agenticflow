import type { ProductionRouteStep } from './types.js';

const plateOperations = [
  ['Material receiving', 'Receiving bay', 0.1, true],
  ['Plasma cutting', 'Cutting station', 0.25, true],
  ['Edge grinding', 'Grinding bench', 0.15, false],
  ['Hole drilling', 'Drill press', 0.3, true],
  ['Fit-up', 'Fabrication bench', 0.2, true],
  ['Welding', 'Welding bay', 0.45, true],
  ['Coating', 'Paint booth', 0.2, false],
  ['Final inspection', 'QC station', 0.25, true],
  ['Packing / release', 'Dispatch bay', 0.1, false],
] as const;

const rhsOperations = [
  ['Material receiving', 'Receiving bay', 0.1, true],
  ['Saw cutting', 'Cutting station', 0.2, true],
  ['End preparation', 'Grinding bench', 0.15, false],
  ['Fit-up', 'Fabrication bench', 0.15, true],
  ['Welding', 'Welding bay', 0.2, true],
  ['Coating', 'Paint booth', 0.15, false],
  ['Final inspection', 'QC station', 0.2, true],
  ['Packing / release', 'Dispatch bay', 0.1, false],
] as const;

export function buildProductionRoute(shape: 'Plate' | 'RHS' = 'Plate'): ProductionRouteStep[] {
  const operations = shape === 'RHS' ? rhsOperations : plateOperations;
  return operations.map(([operation, station, estimatedTimeHr, qualityHoldPoint], index) => ({
    stepNo: index + 1,
    operation,
    station,
    estimatedTimeHr,
    dependsOn: index === 0 ? undefined : [index],
    qualityHoldPoint,
  }));
}
