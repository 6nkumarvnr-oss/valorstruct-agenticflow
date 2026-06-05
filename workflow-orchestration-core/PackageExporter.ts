import type { OrchestrationResult } from './OrchestrationResult.js';
import { renderEngineeringPackageHtml } from './PackageHtmlRenderer.js';

export interface PackageExportBundle {
  jsonFilename: string;
  markdownFilename: string;
  pdfFilename: string;
  htmlFilename: string;
  json: string;
  markdown: string;
  pdf: string;
  html: string;
}

function pdfText(value: string): string {
  return value
    .replace(/[^\x20-\x7E\n]/g, '-')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildPdfStream(lines: string[]): string {
  const contentLines = lines.slice(0, 46).map((line) => `(${pdfText(line).slice(0, 96)}) Tj`).join(' 0 -14 Td\n');
  return `BT\n/F1 10 Tf\n50 780 Td\n${contentLines}\nET`;
}

export function exportPackageJson(result: OrchestrationResult): string {
  return JSON.stringify(
    {
      packageName: 'BP-01 Engineering & Fabrication Package',
      reportMetadata: result.reportMetadata,
      status: result.status,
      request: result.request,
      subject: result.subject,
      approvalStatus: result.approvalStatus,
      governanceControl: result.governanceControl,
      plan: result.plan,
      graphResult: result.graphResult,
      manufacturingResult: result.manufacturingResult,
      steelDesignSummary: result.steelDesignResult.summary,
      quotationSummary: result.quotationResult.summary,
      shopDrawingSummary: result.shopDrawingSummary,
      partList: result.partList,
      holeSchedule: result.holeSchedule,
      weldNotes: result.weldNotes,
      fabricationNotes: result.fabricationNotes,
      inspectionChecklist: result.inspectionChecklist,
      revisionLog: result.revisionLog,
      drawingIssueChecklist: result.drawingIssueChecklist,
      parserWarnings: result.parserWarnings,
      drawingBOQ: result.drawingBOQ,
      drawingBOQLines: result.drawingBOQLines,
      quotationItemSeeds: result.quotationItemSeeds,
      drawingManufacturingPackage: result.drawingManufacturingPackage,
      cuttingList: result.cuttingList,
      drillingSchedule: result.drillingSchedule,
      weldSchedule: result.weldSchedule,
      coatingSchedule: result.coatingSchedule,
      productionRoute: result.productionRoute,
      manufacturingWarnings: result.manufacturingWarnings,
      projectApprovalPackage: result.projectApprovalPackage,
      projectParts: result.projectParts,
      combinedBOQ: result.combinedBOQ,
      combinedManufacturingPlan: result.combinedManufacturingPlan,
      combinedQuotationSummary: result.combinedQuotation?.summary,
      auditSummary: result.auditSummary,
      auditEvents: result.auditEvents,
    },
    null,
    2,
  );
}

export function exportPackageMarkdown(result: OrchestrationResult): string {
  return result.consolidatedMarkdownReport;
}

export function exportPackageHtml(result: OrchestrationResult): string {
  return renderEngineeringPackageHtml(result);
}

export function exportPackagePdf(result: OrchestrationResult): string {
  const lines = [
    'VALOR STRUCT',
    'BP-01 Engineering & Fabrication Package',
    `Package ID: ${result.reportMetadata.packageId}`,
    `Revision: ${result.reportMetadata.revision}`,
    `Prepared By: ${result.reportMetadata.preparedBy}`,
    `Checked By: ${result.reportMetadata.checkedBy}`,
    `Approved By: ${result.reportMetadata.approvedBy}`,
    `Export Timestamp: ${result.reportMetadata.exportTimestamp}`,
    `Approval Workflow Status: ${result.approvalStatus.status}`,
    '',
    ...result.consolidatedMarkdownReport.split('\n').filter((line) => line.trim().length > 0),
  ];
  const stream = buildPdfStream(lines);
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
  ];
  const header = '%PDF-1.4\n';
  let offset = header.length;
  const offsets = objects.map((object) => {
    const current = offset;
    offset += object.length + 1;
    return current;
  });
  const body = `${objects.join('\n')}\n`;
  const xrefOffset = header.length + body.length;
  const xrefRows = offsets.map((value) => `${String(value).padStart(10, '0')} 00000 n `).join('\n');
  return `${header}${body}xref\n0 6\n0000000000 65535 f \n${xrefRows}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
}

export function createPackageExportBundle(result: OrchestrationResult): PackageExportBundle {
  return {
    jsonFilename: 'VS-BP-01-ENG-FAB-PKG-REV-00.json',
    markdownFilename: 'VS-BP-01-ENG-FAB-PKG-REV-00.md',
    pdfFilename: 'VS-BP-01-ENG-FAB-PKG-REV-00.pdf',
    htmlFilename: 'VS-BP-01-ENG-FAB-PKG-REV-00.html',
    json: exportPackageJson(result),
    markdown: exportPackageMarkdown(result),
    pdf: exportPackagePdf(result),
    html: exportPackageHtml(result),
  };
}
