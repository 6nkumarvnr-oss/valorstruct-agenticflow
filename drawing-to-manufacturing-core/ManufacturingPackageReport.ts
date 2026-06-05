import type { DrawingManufacturingPackage } from './types.js';

function warnings(warnings: string[]): string[] {
  return warnings.length ? warnings.map((warning) => `- ${warning}`) : ['- None'];
}

export function generateManufacturingPackageReport(manufacturingPackage: DrawingManufacturingPackage): string {
  return [
    '## Drawing-to-Manufacturing Package',
    '',
    '### Cutting List',
    ...manufacturingPackage.cuttingList.map((item) => `- ${item.partId}: ${item.material} ${item.shape} ${item.dimensions}; qty ${item.quantity}; ${item.cuttingMethod}; ${item.estimatedCuttingTimeHr} hr`),
    '',
    '### Drilling Schedule',
    ...manufacturingPackage.drillingSchedule.map((item) => `- ${item.partId}: ${item.quantity}-${item.holeType}; ${item.holeDiameterMm} mm; ${item.drillingMethod}; ${item.estimatedDrillingTimeHr} hr`),
    '',
    '### Weld Schedule',
    ...manufacturingPackage.weldSchedule.map((item) => `- ${item.partId}: ${item.weldSizeMm}mm ${item.weldType}; ${item.weldLengthM.toFixed(2)} m; ${item.process}; ${item.estimatedWeldingTimeHr} hr`),
    '',
    '### Coating Schedule',
    ...manufacturingPackage.coatingSchedule.map((item) => `- ${item.partId}: ${item.coatingSystem}; ${item.areaM2} m2; ${item.preparation}; ${item.estimatedCoatingTimeHr} hr`),
    '',
    '### Inspection Plan',
    ...manufacturingPackage.inspectionPlan.map((item) => `- ${item.inspectionType}: ${item.acceptanceCriteria}; hold point=${item.holdPoint ? 'true' : 'false'}`),
    '',
    '### Production Route',
    ...manufacturingPackage.productionRoute.map((step) => `${step.stepNo}. ${step.operation} — ${step.station}; ${step.estimatedTimeHr} hr; hold point=${step.qualityHoldPoint ? 'true' : 'false'}`),
    '',
    '### Labor / Production Time Summary',
    `- Total Estimated Labor: ${manufacturingPackage.totalEstimatedLaborHr.toFixed(2)} hr`,
    `- Total Estimated Production Time: ${manufacturingPackage.totalEstimatedProductionHr.toFixed(2)} hr`,
    '',
    '### Warnings',
    ...warnings(manufacturingPackage.warnings),
  ].join('\n');
}
