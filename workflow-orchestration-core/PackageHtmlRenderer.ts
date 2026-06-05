import type { OrchestrationResult } from './OrchestrationResult.js';

function escapeHtml(value: string | number | boolean): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderReportSections(markdown: string): string {
  return markdown
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) {
        return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      }
      if (line.startsWith('### ')) {
        return `<h3>${escapeHtml(line.slice(4))}</h3>`;
      }
      if (line.startsWith('# ')) {
        return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      }
      if (line.startsWith('- ')) {
        return `<p class="bullet">${escapeHtml(line)}</p>`;
      }
      if (line.trim() === '---') {
        return '<hr />';
      }
      if (line.trim().length === 0) {
        return '';
      }
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join('\n');
}

export function renderEngineeringPackageHtml(result: OrchestrationResult): string {
  const metadata = result.reportMetadata;
  const risk = result.governanceControl.riskClassification;
  const finalApproval = result.governanceControl.finalOutputApproval;
  const externalBlockingStatus = finalApproval.externalUseAllowed ? 'External use allowed' : 'External use blocked pending required approval';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>VALOR STRUCT — ${escapeHtml(metadata.packageId)} ${escapeHtml(metadata.revision)}</title>
  <style>
    @page { margin: 18mm; }
    * { box-sizing: border-box; }
    body { color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.45; margin: 0; }
    header.title-page { align-items: center; border-bottom: 3px solid #111827; display: flex; flex-direction: column; justify-content: center; min-height: 92vh; text-align: center; page-break-after: always; }
    .brand { font-size: 28pt; font-weight: 800; letter-spacing: 0.08em; margin: 0 0 16px; }
    .subtitle { color: #374151; font-size: 16pt; margin: 0 0 28px; }
    .metadata-card { border: 1px solid #d1d5db; margin: 20px auto; max-width: 620px; padding: 18px; text-align: left; width: 100%; }
    h1, h2, h3 { color: #111827; page-break-after: avoid; }
    h1 { font-size: 22pt; }
    h2 { border-bottom: 1px solid #d1d5db; font-size: 15pt; margin-top: 24px; padding-bottom: 4px; }
    h3 { font-size: 12pt; margin-top: 18px; }
    table { border-collapse: collapse; margin: 10px 0 18px; width: 100%; }
    th, td { border: 1px solid #d1d5db; padding: 7px 9px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; }
    .status { background: #fff7ed; border: 1px solid #fed7aa; padding: 10px 12px; }
    .report-section { page-break-inside: avoid; }
    .appendix { page-break-before: always; }
    .bullet { margin-left: 12px; }
    footer { border-top: 1px solid #d1d5db; color: #4b5563; font-size: 9pt; margin-top: 28px; padding-top: 10px; }
    @media print { a { color: inherit; text-decoration: none; } .no-print { display: none; } body { print-color-adjust: exact; } }
  </style>
</head>
<body>
  <header class="title-page">
    <p class="brand">VALOR STRUCT</p>
    <h1>Engineering Package Export</h1>
    <p class="subtitle">Print-ready engineering, fabrication, quotation, and governance package</p>
    <div class="metadata-card">
      <p><strong>Package ID:</strong> ${escapeHtml(metadata.packageId)}</p>
      <p><strong>Revision:</strong> ${escapeHtml(metadata.revision)}</p>
      <p><strong>Project:</strong> ${escapeHtml(result.subject)} Engineering & Fabrication Package</p>
      <p><strong>Approval Status:</strong> ${escapeHtml(result.approvalStatus.status)}</p>
      <p><strong>Risk Level:</strong> Level ${escapeHtml(risk.level)} — ${escapeHtml(risk.label)}</p>
      <p><strong>External-use Blocking Status:</strong> ${escapeHtml(externalBlockingStatus)}</p>
    </div>
  </header>

  <main>
    <section class="report-section">
      <h1>Project Summary</h1>
      <table>
        <tbody>
          <tr><th>Package ID</th><td>${escapeHtml(metadata.packageId)}</td></tr>
          <tr><th>Revision</th><td>${escapeHtml(metadata.revision)}</td></tr>
          <tr><th>Request</th><td>${escapeHtml(result.request)}</td></tr>
          <tr><th>Subject</th><td>${escapeHtml(result.subject)}</td></tr>
          <tr><th>Capability Chain</th><td>${escapeHtml(result.capabilityChain.join(' → '))}</td></tr>
          <tr><th>Export Timestamp</th><td>${escapeHtml(metadata.exportTimestamp)}</td></tr>
        </tbody>
      </table>
    </section>

    <section class="report-section">
      <h2>Prepared / Checked / Approved</h2>
      <table>
        <thead><tr><th>Role</th><th>Name / Authority</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Prepared</td><td>${escapeHtml(metadata.preparedBy)}</td><td>Prepared</td></tr>
          <tr><td>Checked</td><td>${escapeHtml(metadata.checkedBy)}</td><td>Checked for demo completeness</td></tr>
          <tr><td>Approved</td><td>${escapeHtml(metadata.approvedBy)}</td><td>${escapeHtml(result.approvalStatus.status)}</td></tr>
        </tbody>
      </table>
    </section>

    <section class="status report-section">
      <h2>Governance Status</h2>
      <p><strong>Approval Status:</strong> ${escapeHtml(result.approvalStatus.status)}</p>
      <p><strong>Required Approver:</strong> ${escapeHtml(result.approvalStatus.requiredApprover)}</p>
      <p><strong>Risk Level:</strong> Level ${escapeHtml(risk.level)} — ${escapeHtml(risk.label)}</p>
      <p><strong>External-use Blocking Status:</strong> ${escapeHtml(externalBlockingStatus)}</p>
      <p><strong>Reason:</strong> ${escapeHtml(result.approvalStatus.reason)}</p>
    </section>

    <section class="report-section">
      <h2>Report Sections</h2>
      ${renderReportSections(result.consolidatedMarkdownReport)}
    </section>

    <section class="appendix">
      <h2>Audit Trail Appendix</h2>
      <table>
        <thead><tr><th>Order</th><th>Type</th><th>Message</th></tr></thead>
        <tbody>
          ${result.auditEvents.map((event) => `<tr><td>${escapeHtml(event.order)}</td><td>${escapeHtml(event.type)}</td><td>${escapeHtml(event.message)}</td></tr>`).join('\n          ')}
        </tbody>
      </table>
    </section>

    <section class="appendix">
      <h2>Model-Role Audit Appendix</h2>
      <table>
        <thead><tr><th>Order</th><th>Capability</th><th>Task</th><th>Requested Role</th><th>Fallback</th><th>Sensitive Route</th></tr></thead>
        <tbody>
          ${result.governanceControl.modelRoleAuditTrail.map((event) => `<tr><td>${escapeHtml(event.order)}</td><td>${escapeHtml(event.capability)}</td><td>${escapeHtml(event.task)}</td><td>${escapeHtml(event.requestedRole)}</td><td>${escapeHtml(event.fallbackRole)}</td><td>${escapeHtml(event.sensitiveDataRouteRole)}</td></tr>`).join('\n          ')}
        </tbody>
      </table>
    </section>
  </main>

  <footer>
    <strong>Disclaimer:</strong> ${escapeHtml(metadata.disclaimer)}<br />
    VALOR STRUCT | AgenticFlow Engineering Intelligence | Print-ready HTML export for browser Print / Save as PDF.
  </footer>
</body>
</html>`;
}
