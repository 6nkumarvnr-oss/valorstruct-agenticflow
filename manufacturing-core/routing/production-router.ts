import { validatePlateDimensions } from '../dimensions/plate-dimensions.js';
import { totalLaborHours, totalProductionHours } from '../fabrication-methods/operations.js';
import { getManufacturingSteelMaterial } from '../materials/steel.js';
import { calculateBasePlateWeight } from '../shapes/base-plate.js';
import { planCoating } from '../coating/coating-plan.js';
import { estimateManufacturingCost } from '../costing/cost-estimator.js';
import { planEdgeGrind, planPlasmaCut } from '../cutting/cutting-plan.js';
import { planHoleDrilling } from '../drilling/hole-plan.js';
import { createBasePlateInspectionPlan } from '../inspection/inspection-plan.js';
import { planFitUp, planWelding } from '../welding/weld-planning.js';
import type { BasePlateManufacturingInput, ManufacturingEstimate } from '../types.js';

export const sampleBasePlateManufacturingInput: BasePlateManufacturingInput = {
  partName: 'Base Plate',
  widthMm: 400,
  lengthMm: 400,
  thicknessMm: 20,
  holes: { count: 4, diameterMm: 20 },
  materialGrade: 'S275',
  coatingSystem: 'Paint',
  currency: 'SAR',
};

export function estimateBasePlateManufacturing(input: BasePlateManufacturingInput = sampleBasePlateManufacturingInput): ManufacturingEstimate {
  const material = getManufacturingSteelMaterial(input.materialGrade);
  const weightKg = calculateBasePlateWeight(input);
  const operations = [
    planPlasmaCut(),
    planHoleDrilling(input.holes),
    planEdgeGrind(),
    planFitUp(),
    planWelding(),
    planCoating(input.coatingSystem),
  ];
  const warnings = validatePlateDimensions(input.widthMm, input.lengthMm, input.thicknessMm);

  return {
    status: 'completed',
    input,
    material: { grade: material.grade, densityKgPerM3: material.densityKgPerM3, unitCostSarPerKg: material.unitCostSarPerKg },
    weightKg,
    operations,
    inspection: createBasePlateInspectionPlan(),
    estimatedLaborHours: totalLaborHours(operations),
    estimatedCostSar: estimateManufacturingCost({ weightKg, unitCostSarPerKg: material.unitCostSarPerKg, operations }),
    estimatedProductionHours: totalProductionHours(operations),
    warnings,
  };
}
