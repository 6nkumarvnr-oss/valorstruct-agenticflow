import type { OrchestrationResult, PackageApprovalStatus, PackageReportMetadata } from './OrchestrationResult.js';

export interface PackageReportInput extends Omit<OrchestrationResult, 'consolidatedMarkdownReport' | 'auditEvents' | 'auditSummary' | 'approvalStatus' | 'reportMetadata'> {
  reportMetadata: PackageReportMetadata;
  approvalStatus: PackageApprovalStatus;
  auditEvents: OrchestrationResult['auditEvents'];
}

function bulletList(items: string[]): string[] {
  return items.length ? items.map((item) => `- ${item}`) : ['- None recorded'];
}

function shopDrawingSection(input: PackageReportInput): string[] {
  if (!input.shopDrawingSummary) {
    return [];
  }
  const partList = input.shopDrawingSummary.partList.map((part) => `${part.part} — ${part.material}; ${part.dimensions}; ${part.shapeType}`);
  return [
    '## Shop Drawing Assistant Summary',
    '### Part List',
    ...bulletList(partList),
    '',
    '### Hole Schedule',
    ...bulletList(input.shopDrawingSummary.holeSchedule),
    '',
    '### Weld Notes',
    ...bulletList(input.shopDrawingSummary.weldNotes),
    '',
    '### Fabrication Notes',
    ...bulletList(input.shopDrawingSummary.fabricationNotes),
    '',
    '### Inspection Checklist',
    ...bulletList(input.shopDrawingSummary.inspectionChecklist),
    '',
    '### Drawing Issue Checklist',
    ...bulletList(input.shopDrawingSummary.drawingIssueChecklist),
    '',
    '### Parser Warnings',
    ...bulletList(input.shopDrawingSummary.warnings),
    '',
  ];
}


function drawingBOQSection(input: PackageReportInput): string[] {
  if (!input.drawingBOQ) {
    return [];
  }
  const quantityLine = (category: string, label: string) => {
    const line = input.drawingBOQ?.lines.find((candidate) => candidate.category === category);
    return line ? `- ${label}: ${line.quantity} ${line.unit}` : `- ${label}: not extracted`;
  };
  return [
    '## Drawing-to-BOQ Summary',
    quantityLine('material', 'Material quantity'),
    quantityLine('cutting', 'Cutting quantity'),
    quantityLine('drilling', 'Drilling quantity'),
    quantityLine('welding', 'Welding length'),
    quantityLine('coating', 'Coating area'),
    quantityLine('inspection', 'Inspection lot'),
    '',
    '### Drawing BOQ Lines',
    '| Item | Category | Description | Unit | Quantity | Confidence |',
    '| --- | --- | --- | --- | ---: | --- |',
    ...input.drawingBOQ.lines.map((line) => `| ${line.itemNo} | ${line.category} | ${line.description} | ${line.unit} | ${line.quantity} | ${line.confidence} |`),
    '',
    '### Drawing BOQ Warnings',
    ...bulletList(input.drawingBOQ.warnings),
    '',
  ];
}


function drawingManufacturingSection(input: PackageReportInput): string[] {
  if (!input.drawingManufacturingPackage) {
    return [];
  }
  const manufacturingPackage = input.drawingManufacturingPackage;
  return [
    '## Drawing-to-Manufacturing Package',
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
    ...manufacturingPackage.coatingSchedule.map((item) => `- ${item.partId}: ${item.coatingSystem}; ${item.areaM2} m2; ${item.estimatedCoatingTimeHr} hr`),
    '',
    '### Inspection Plan',
    ...manufacturingPackage.inspectionPlan.map((item) => `- ${item.inspectionType}: ${item.acceptanceCriteria}; hold point=${item.holdPoint ? 'true' : 'false'}`),
    '',
    '### Production Route',
    ...manufacturingPackage.productionRoute.map((step) => `${step.stepNo}. ${step.operation} — ${step.station}`),
    '',
    '### Labor / Production Time Summary',
    `- Total Estimated Labor: ${manufacturingPackage.totalEstimatedLaborHr.toFixed(2)} hr`,
    `- Total Estimated Production Time: ${manufacturingPackage.totalEstimatedProductionHr.toFixed(2)} hr`,
    '',
    '### Manufacturing Warnings',
    ...bulletList(manufacturingPackage.warnings),
    '',
  ];
}

function projectApprovalPackageSection(input: PackageReportInput): string[] {
  if (!input.projectApprovalPackage) {
    return [];
  }
  const projectPackage = input.projectApprovalPackage;
  return [
    '## Project-Level Approval Package',
    `- Project: ${projectPackage.projectName}`,
    `- Project ID: ${projectPackage.projectId}`,
    `- Parts: ${projectPackage.parts.map((part) => part.partId).join(', ')}`,
    `- Approval Status: ${projectPackage.approvalStatus}`,
    `- Required Approver: ${projectPackage.requiredApprover}`,
    '',
    '### Combined BOQ',
    '| Project Item | Part | Category | Description | Unit | Quantity | Confidence |',
    '| ---: | --- | --- | --- | --- | ---: | --- |',
    ...projectPackage.combinedBOQ.map((line) => `| ${line.projectItemNo} | ${line.partId} | ${line.category} | ${line.description} | ${line.unit} | ${line.quantity} | ${line.confidence} |`),
    '',
    '### Combined Manufacturing Plan',
    `- Cutting List Items: ${projectPackage.combinedManufacturingPlan.cuttingList.length}`,
    `- Drilling Schedule Items: ${projectPackage.combinedManufacturingPlan.drillingSchedule.length}`,
    `- Weld Schedule Items: ${projectPackage.combinedManufacturingPlan.weldSchedule.length}`,
    `- Coating Schedule Items: ${projectPackage.combinedManufacturingPlan.coatingSchedule.length}`,
    `- Total Estimated Labor: ${projectPackage.combinedManufacturingPlan.totalEstimatedLaborHr.toFixed(2)} hr`,
    `- Total Estimated Production Time: ${projectPackage.combinedManufacturingPlan.totalEstimatedProductionHr.toFixed(2)} hr`,
    '',
    '### Combined Quotation',
    `- BOQ Items: ${projectPackage.combinedQuotation.boq.length}`,
    `- Grand Total: ${projectPackage.combinedQuotation.summary.currency} ${projectPackage.combinedQuotation.summary.grandTotal}`,
    '',
    '### Project Manufacturing Warnings',
    ...bulletList(projectPackage.combinedManufacturingPlan.warnings),
    '',
  ];
}

export function generateEngineeringPackageReport(input: PackageReportInput): string {
  const material = input.graphResult.material ?? input.manufacturingResult.material.grade;
  const riskItems = [...input.graphResult.risks, ...input.manufacturingResult.warnings, ...input.steelDesignResult.context.warnings];
  return [
    '# VALOR STRUCT',
    '## BP-01 Engineering & Fabrication Package',
    '',
    `Package ID: ${input.reportMetadata.packageId}`,
    `Revision: ${input.reportMetadata.revision}`,
    `Prepared By: ${input.reportMetadata.preparedBy}`,
    `Checked By: ${input.reportMetadata.checkedBy}`,
    `Approved By: ${input.reportMetadata.approvedBy}`,
    `Export Timestamp: ${input.reportMetadata.exportTimestamp}`,
    `Approval Workflow Status: ${input.approvalStatus.status}`,
    '',
    '---',
    '',
    '## 1. Project Summary',
    `- Request: ${input.request}`,
    `- Package Subject: ${input.subject}`,
    `- Intent: ${input.intent}`,
    `- Capability Chain: ${input.capabilityChain.join(' → ')}`,
    '',
    '## 2. Part Summary',
    `- Part ID: ${input.subject}`,
    '- Part Type: Base Plate',
    '- Geometry: Plate 400x400x20',
    '- Hole Pattern: 4-M20 Holes',
    `- Estimated Weight: ${input.manufacturingResult.weightKg} kg`,
    '',
    '## 3. Material Summary',
    `- Material: ${material}`,
    `- Density: ${input.manufacturingResult.material.densityKgPerM3} kg/m³`,
    `- Unit Cost Basis: SAR ${input.manufacturingResult.material.unitCostSarPerKg}/kg`,
    '',
    '## 4. Drawing Intelligence Summary',
    `- Knowledge Path: ${input.graphResult.linkedPath.join(' → ')}`,
    `- Recommended Capabilities: ${input.graphResult.recommendedCapabilities.join(', ')}`,
    '',
    ...shopDrawingSection(input),
    ...drawingBOQSection(input),
    ...drawingManufacturingSection(input),
    ...projectApprovalPackageSection(input),
    '## 5. Manufacturing Route',
    ...input.manufacturingResult.operations.map((operation, index) => `${index + 1}. ${operation.name} — ${operation.machine}; labor ${operation.laborHours}h; production ${operation.productionHours}h.`),
    `- Total Labor: ${input.manufacturingResult.estimatedLaborHours} hours`,
    `- Total Production Time: ${input.manufacturingResult.estimatedProductionHours} hours`,
    `- Manufacturing Cost: SAR ${input.manufacturingResult.estimatedCostSar}`,
    '',
    '## 6. Steel Design Preliminary Check',
    `- Status: ${input.steelDesignResult.summary.status}`,
    `- Governing Check: ${input.steelDesignResult.summary.governingCheck}`,
    `- Governing Utilization: ${input.steelDesignResult.summary.governingUtilization}`,
    '- Note: preliminary educational check only; not a final code-compliant design release.',
    '',
    '## 7. BOQ / Quotation Summary',
    `- BOQ Items: ${input.quotationResult.boq.length}`,
    `- Subtotal: ${input.quotationResult.summary.currency} ${input.quotationResult.summary.subtotal}`,
    `- VAT: ${input.quotationResult.summary.currency} ${input.quotationResult.summary.vat}`,
    `- Grand Total: ${input.quotationResult.summary.currency} ${input.quotationResult.summary.grandTotal}`,
    '',
    '## 8. Inspection Plan',
    ...input.manufacturingResult.inspection.map((step, index) => `${index + 1}. ${step.name} — ${step.acceptance}`),
    '',
    '## 9. Risk / Warnings',
    `- Workflow Risk Level: Level ${input.governanceControl.riskClassification.level} — ${input.governanceControl.riskClassification.label}`,
    `- Required Approval Gate: ${input.governanceControl.humanApprovalGate.status}`,
    `- Required Approver: ${input.governanceControl.humanApprovalGate.requiredApprover}`,
    `- Execution Permission: ${input.governanceControl.executionPermission.label}`,
    ...bulletList(riskItems),
    '',
    '## 10. Audit Trail',
    ...input.auditEvents.map((event) => `${event.order}. ${event.type}: ${event.message}`),
    '',
    '### Model-Role Request Audit',
    ...input.governanceControl.modelRoleAuditTrail.map((event) => `${event.order}. ${event.capability} requested ${event.requestedRole} for ${event.task}; fallback=${event.fallbackRole}; sensitive-route=${event.sensitiveDataRouteRole}.`),
    '',
    '## 11. Approval Status',
    `- Status: ${input.approvalStatus.status}`,
    `- Required Approver: ${input.approvalStatus.requiredApprover}`,
    `- Reason: ${input.approvalStatus.reason}`,
    `- Final Output Approval: ${input.governanceControl.finalOutputApproval.status}`,
    `- External Use Allowed: ${input.governanceControl.finalOutputApproval.externalUseAllowed ? 'yes' : 'no'}`,
    '',
    '## Disclaimer',
    input.reportMetadata.disclaimer,
    '',
    '---',
    'VALOR STRUCT | AgenticFlow Engineering Intelligence | Footer: Demo package pending professional approval',
  ].join('\n');
}
