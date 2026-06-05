import { useState } from 'react';
import { useAuthContext } from '../state/AuthContext.js';

interface ApprovalDecision {
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  approver: string;
  reason: string;
  timestamp: string;
}

interface FieldEvent {
  target: { value: string };
}

const demoUsers = [
  { email: 'owner@valorstruct.local', role: 'Owner' },
  { email: 'admin@valorstruct.local', role: 'Admin' },
  { email: 'senior.engineer@valorstruct.local', role: 'Senior Structural Engineer' },
  { email: 'engineer@valorstruct.local', role: 'Engineer' },
  { email: 'reviewer@valorstruct.local', role: 'Reviewer' },
  { email: 'viewer@valorstruct.local', role: 'Viewer' },
  { email: 'agent@valorstruct.local', role: 'Agent' },
];

const approvalAuthorityByLevel: Record<number, string[]> = {
  0: ['Agent', 'Engineer', 'Reviewer', 'Admin', 'Owner'],
  1: ['Engineer', 'Reviewer', 'Admin', 'Owner'],
  2: ['Reviewer', 'Senior Structural Engineer', 'Admin', 'Owner'],
  3: ['Senior Structural Engineer', 'Admin', 'Owner'],
  4: ['Owner'],
};

function renderPackageHistoryHtml(run: typeof packageRuns[number], decision: ApprovalDecision): string {
  const auditRows = run.auditEvents.map((event) => `<tr><td>${event.order}</td><td>${event.type}</td><td>${event.message}</td></tr>`).join('');
  const modelRoleRows = run.modelRoleAuditEvents.map((event) => `<tr><td>${event.order}</td><td>${event.capability}</td><td>${event.task}</td><td>${event.requestedRole}</td><td>${event.fallbackRole}</td><td>${event.sensitiveDataRouteRole}</td></tr>`).join('');
  const externalUseBlocked = run.riskClassification.level >= 2 && decision.status !== 'approved';
  const shopDrawingPartRows = run.shopDrawingSummary.partList.map((part) => `<tr><td>${part.part}</td><td>${part.material}</td><td>${part.dimensions}</td><td>${part.shapeType}</td></tr>`).join('');
  const holeScheduleRows = run.shopDrawingSummary.holeSchedule.map((hole) => `<li>${hole}</li>`).join('');
  const weldNoteRows = run.shopDrawingSummary.weldNotes.map((weld) => `<li>${weld}</li>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>VALOR STRUCT — ${run.packageId} ${run.revision}</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;margin:32px;color:#111827}h1,h2{page-break-after:avoid}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #d1d5db;padding:8px;text-align:left}th{background:#f3f4f6}footer{border-top:1px solid #d1d5db;margin-top:28px;padding-top:12px;font-size:10pt}@media print{body{margin:18mm}}</style>
</head>
<body>
  <h1>VALOR STRUCT</h1>
  <h2>Package History Engineering Export</h2>
  <p><strong>Package ID:</strong> ${run.packageId}</p>
  <p><strong>Revision:</strong> ${run.revision}</p>
  <p><strong>Project Summary:</strong> ${run.projectName}</p>
  <h2>Prepared / Checked / Approved</h2>
  <table><tbody><tr><th>Prepared</th><td>AgenticFlow Package History Console</td></tr><tr><th>Checked</th><td>${run.approvalGate.requiredApprover}</td></tr><tr><th>Approved</th><td>${decision.approver}</td></tr></tbody></table>
  <p><strong>Approval Status:</strong> ${decision.status}</p>
  <p><strong>Risk Level:</strong> Level ${run.riskClassification.level} — ${run.riskClassification.label}</p>
  <p><strong>External-use Blocking Status:</strong> ${externalUseBlocked ? 'External use blocked pending required approval' : 'External use allowed for controlled demo'}</p>
  <h2>Report Sections</h2>
  <p>${run.request}</p>
  <p>${run.approvalGate.reason}</p>
  <h2>Shop Drawing Assistant Summary</h2>
  <h3>Part List</h3>
  <table><thead><tr><th>Part</th><th>Material</th><th>Dimensions</th><th>Shape</th></tr></thead><tbody>${shopDrawingPartRows}</tbody></table>
  <h3>Hole Schedule</h3><ul>${holeScheduleRows}</ul>
  <h3>Weld Notes</h3><ul>${weldNoteRows}</ul>
  <h2>Audit Trail Appendix</h2>
  <table><thead><tr><th>Order</th><th>Type</th><th>Message</th></tr></thead><tbody>${auditRows}</tbody></table>
  <h2>Model-Role Audit Appendix</h2>
  <table><thead><tr><th>Order</th><th>Capability</th><th>Task</th><th>Requested Role</th><th>Fallback</th><th>Sensitive Route</th></tr></thead><tbody>${modelRoleRows}</tbody></table>
  <footer>Disclaimer: preliminary demo export only; not for external engineering use without required professional approval. Print / Save as PDF from browser.</footer>
</body>
</html>`;
}

const packageRuns = [
  {
    id: 'package-run-bp-01-001',
    projectName: 'BP-01 Fabrication Package',
    request: 'Prepare fabrication and quotation package for BP-01',
    packageId: 'VS-BP-01-ENG-FAB-PKG',
    revision: 'Rev 00',
    status: 'completed',
    approvalStatus: 'requires-review',
    createdAt: '2026-06-03T00:00:00.000Z',
    riskClassification: {
      workflowType: 'structural-design-report',
      level: 3,
      label: 'Licensed expert approval required',
      requiredApprover: 'Senior Structural Engineer approval',
      rationale: 'Structural design reports can affect life-safety and code compliance.',
    },
    approvalGate: {
      gateId: 'gate-level-3',
      required: true,
      requiredApprover: 'Senior Structural Engineer approval',
      status: 'pending-licensed-expert-approval',
      reason: 'Licensed expert approval required before external package issue.',
    },
    shopDrawingSummary: {
      partList: [{ part: 'BP-01', material: 'S275', dimensions: '400x400x20', shapeType: 'plate' }],
      holeSchedule: ['Part BP-01: 4-M20'],
      weldNotes: ['Part BP-01: 6mm fillet weld all around'],
      fabricationNotes: ['Verify plate dimensions before cutting.', 'Drill M20 holes to approved drawing tolerance.', 'Prepare weld surfaces before fit-up.'],
      inspectionChecklist: ['Confirm material grade S275.', 'Check hole count, diameter, and spacing.', 'Inspect 6mm fillet weld all around.'],
      revisionLog: ['Rev 00 — Initial text-based shop drawing assistant package.'],
      drawingIssueChecklist: ['Confirm part mark BP-01 appears on drawing.', 'Confirm dimensions 400x400x20 are explicit.', 'Confirm hole schedule and weld notes are approved.'],
      parserWarnings: [],
    },
    drawingBOQ: {
      partId: 'BP-01',
      lines: [
        { itemNo: 1, category: 'material', description: 'S275 steel plate, 400x400x20', unit: 'kg', quantity: 25.12, confidence: 'high' },
        { itemNo: 2, category: 'cutting', description: 'Plasma cutting of base plate', unit: 'nos', quantity: 1, confidence: 'high' },
        { itemNo: 3, category: 'drilling', description: 'Drilling M20 holes', unit: 'nos', quantity: 4, confidence: 'high' },
        { itemNo: 4, category: 'welding', description: '6mm fillet weld all around', unit: 'm', quantity: 1.6, confidence: 'medium' },
        { itemNo: 5, category: 'coating', description: 'Coating / painting allowance', unit: 'm2', quantity: 0.32, confidence: 'high' },
        { itemNo: 6, category: 'inspection', description: 'Dimensional and visual inspection', unit: 'lot', quantity: 1, confidence: 'high' },
      ],
      warnings: ['Weld length is estimated from perimeter because detailed weld path is not available.'],
    },
    drawingManufacturingPackage: {
      cuttingList: [{ itemNo: 1, partId: 'BP-01', material: 'S275', shape: 'Plate', dimensions: '400x400x20', quantity: 1, cuttingMethod: 'plasma', estimatedCuttingTimeHr: 0.25, warnings: [] }],
      drillingSchedule: [{ itemNo: 1, partId: 'BP-01', holeType: 'M20', holeDiameterMm: 20, quantity: 4, drillingMethod: 'drill_press', estimatedDrillingTimeHr: 0.3, warnings: [] }],
      weldSchedule: [{ itemNo: 1, partId: 'BP-01', weldType: 'fillet', weldSizeMm: 6, weldLengthM: 1.6, process: 'GMAW', estimatedWeldingTimeHr: 0.45, warnings: ['Weld length is estimated from plate perimeter.'] }],
      coatingSchedule: [{ itemNo: 1, partId: 'BP-01', coatingSystem: 'Paint System C3', areaM2: 0.32, preparation: 'Clean, grind sharp edges, remove oil and loose scale', estimatedCoatingTimeHr: 0.2, warnings: [] }],
      productionRoute: ['Material receiving', 'Plasma cutting', 'Edge grinding', 'Hole drilling', 'Fit-up', 'Welding', 'Coating', 'Final inspection', 'Packing / release'],
      warnings: ['Weld length is estimated from plate perimeter.'],
    },
    auditEvents: [
      { order: 1, type: 'GRAPH_QUERY', message: 'Queried BP-01 graph.' },
      { order: 2, type: 'MANUFACTURING_ESTIMATE', message: 'Estimated BP-01 manufacturing route.' },
      { order: 3, type: 'STEEL_DESIGN_CHECK', message: 'Ran preliminary steel design check.' },
      { order: 4, type: 'QUOTATION', message: 'Generated quotation summary.' },
      { order: 5, type: 'CONSOLIDATED_REPORT', message: 'Generated package report.' },
    ],
    modelRoleAuditEvents: [
      {
        order: 1,
        capability: 'WorkflowIntentClassifier',
        task: 'orchestrate_workflow',
        requestedRole: 'orchestration_model',
        fallbackRole: 'fallback_model',
        sensitiveDataRouteRole: 'fallback_model',
      },
      {
        order: 2,
        capability: 'SteelDesignPack',
        task: 'reason_about_engineering',
        requestedRole: 'engineering_reasoning_model',
        fallbackRole: 'local_private_model',
        sensitiveDataRouteRole: 'local_private_model',
      },
    ],
    exports: [
      { exportType: 'markdown', filename: 'VS-BP-01-ENG-FAB-PKG-REV-00.md', createdAt: '2026-06-03T00:00:00.000Z' },
      { exportType: 'json', filename: 'VS-BP-01-ENG-FAB-PKG-REV-00.json', createdAt: '2026-06-03T00:00:00.000Z' },
    ],
  },
];

export function PackageHistoryConsole() {
  const auth = useAuthContext();
  const [selectedRunId, setSelectedRunId] = useState(packageRuns[0].id);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState('senior.engineer@valorstruct.local');
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision>({
    status: 'pending',
    approver: 'Senior Structural Engineer',
    reason: 'Awaiting package review.',
    timestamp: '2026-06-03T00:00:00.000Z',
  });
  const selectedRun = packageRuns.find((run) => run.id === selectedRunId) ?? packageRuns[0];
  const fallbackApprover = demoUsers.find((user) => user.email === selectedApproverEmail) ?? demoUsers[2];
  const selectedApprover = auth.currentUser ?? fallbackApprover;
  const allowedRoles = approvalAuthorityByLevel[selectedRun.riskClassification.level] ?? [];
  const hasApprovalAuthority = allowedRoles.includes(selectedApprover.role);
  const authorityMessage = hasApprovalAuthority
    ? `current user role-based approval authority: ${selectedApprover.role} can approve Level ${selectedRun.riskClassification.level}.`
    : `current user role-based approval authority: ${selectedApprover.role} cannot approve Level ${selectedRun.riskClassification.level}; requires ${allowedRoles.join(', ')}.`;
  const packageHistoryHtml = renderPackageHistoryHtml(selectedRun, approvalDecision);
  const htmlExportHref = `data:text/html;charset=utf-8,${encodeURIComponent(packageHistoryHtml)}`;

  const decide = (status: 'approved' | 'rejected') => {
    if (!hasApprovalAuthority) {
      setApprovalDecision({
        status: 'blocked',
        approver: `${selectedApprover.email} (${selectedApprover.role})`,
        reason: `Blocked approval message: ${authorityMessage}`,
        timestamp: '2026-06-03T01:10:00.000Z',
      });
      return;
    }

    setApprovalDecision({
      status,
      approver: `${selectedApprover.email} (${selectedApprover.role})`,
      reason: status === 'approved' ? 'Approved for controlled demo issue.' : 'Rejected pending engineering corrections.',
      timestamp: status === 'approved' ? '2026-06-03T01:00:00.000Z' : '2026-06-03T01:05:00.000Z',
    });
  };

  return (
    <main className="package-history-console">
      <header>
        <p>VALOR STRUCT</p>
        <h1>Package History & Approval Console</h1>
        <p>Review saved engineering package runs, audit trails, exports, and approval decisions.</p>
      </header>

      <section aria-label="Current User Workspace Panel">
        <h2>current user panel</h2>
        <p>role display: {auth.currentUser?.role ?? 'Not authenticated; using demo approver fallback'}</p>
        <p>workspace display: {auth.workspace?.companyName ?? 'No workspace selected'}</p>
        <p>Current user: {auth.currentUser?.email ?? 'demo fallback approver selector'}</p>
        <button type="button" onClick={auth.logout}>logout button</button>
      </section>

      <section aria-label="Package Run List Panel">
        <h2>package run list</h2>
        <ul>
          {packageRuns.map((run) => (
            <li key={run.id}>
              <button type="button" onClick={() => setSelectedRunId(run.id)}>
                {run.packageId} — {run.revision} — {run.approvalStatus}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Selected Package Detail Panel">
        <h2>selected package detail panel</h2>
        <p>Package Run ID: {selectedRun.id}</p>
        <p>Project: {selectedRun.projectName}</p>
        <p>Package ID: {selectedRun.packageId}</p>
        <p>Revision: {selectedRun.revision}</p>
        <p>Status: {selectedRun.status}</p>
        <p>Approval Status: {selectedRun.approvalStatus}</p>
      </section>

      <section aria-label="Risk Classification Panel">
        <h2>risk classification panel</h2>
        <p>Workflow Type: {selectedRun.riskClassification.workflowType}</p>
        <p>Risk Level: Level {selectedRun.riskClassification.level}</p>
        <p>Label: {selectedRun.riskClassification.label}</p>
        <p>Required Approver: {selectedRun.riskClassification.requiredApprover}</p>
        <p>Rationale: {selectedRun.riskClassification.rationale}</p>
      </section>

      <section aria-label="Approval Gate Panel">
        <h2>approval gate panel</h2>
        <p>Gate: {selectedRun.approvalGate.gateId}</p>
        <p>Required: {selectedRun.approvalGate.required ? 'yes' : 'no'}</p>
        <p>Required Approver: {selectedRun.approvalGate.requiredApprover}</p>
        <p>Status: {selectedRun.approvalGate.status}</p>
        <p>Reason: {selectedRun.approvalGate.reason}</p>
      </section>

      <section aria-label="Approval Decision Panel">
        <h2>approval decision panel</h2>
        <p>Status: {approvalDecision.status}</p>
        <p>Approver: {approvalDecision.approver}</p>
        <p>Reason: {approvalDecision.reason}</p>
        <label>
          Approver selector (demo fallback only when no auth context exists)
          <select value={selectedApproverEmail} onChange={(event: FieldEvent) => setSelectedApproverEmail(event.target.value)}>
            {demoUsers.map((user) => (
              <option key={user.email} value={user.email}>{user.email} — {user.role}</option>
            ))}
          </select>
        </label>
        <p>Selected approver role: {selectedApprover.role}</p>
        <p>Approval authority result: {authorityMessage}</p>
        {!hasApprovalAuthority && <p>Blocked approval message: current logged-in user lacks authority for this Level 3 package.</p>}
        <p>Timestamp: {approvalDecision.timestamp}</p>
        <button type="button" disabled={!hasApprovalAuthority} onClick={() => decide('approved')}>Approve package</button>
        <button type="button" disabled={!hasApprovalAuthority} onClick={() => decide('rejected')}>Reject package</button>
      </section>

      <section aria-label="Shop Drawing Assistant Summary Panel">
        <h2>Shop Drawing Assistant Summary panel</h2>
        <h3>Part List</h3>
        <ul>{selectedRun.shopDrawingSummary.partList.map((part) => <li key={part.part}>{part.part}: {part.material} {part.dimensions}</li>)}</ul>
        <h3>Hole Schedule</h3>
        <ul>{selectedRun.shopDrawingSummary.holeSchedule.map((hole) => <li key={hole}>{hole}</li>)}</ul>
        <h3>Weld Notes</h3>
        <ul>{selectedRun.shopDrawingSummary.weldNotes.map((weld) => <li key={weld}>{weld}</li>)}</ul>
        <h3>Fabrication Notes</h3>
        <ul>{selectedRun.shopDrawingSummary.fabricationNotes.map((note) => <li key={note}>{note}</li>)}</ul>
        <h3>Inspection Checklist</h3>
        <ul>{selectedRun.shopDrawingSummary.inspectionChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>Drawing Issue Checklist</h3>
        <ul>{selectedRun.shopDrawingSummary.drawingIssueChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section aria-label="Drawing-to-BOQ Summary Panel">
        <h2>Drawing-to-BOQ Summary panel</h2>
        <table>
          <thead><tr><th>item number</th><th>category</th><th>description</th><th>unit</th><th>quantity</th><th>confidence</th></tr></thead>
          <tbody>
            {selectedRun.drawingBOQ.lines.map((line) => (
              <tr key={line.itemNo}>
                <td>{line.itemNo}</td><td>{line.category}</td><td>{line.description}</td><td>{line.unit}</td><td>{line.quantity}</td><td>{line.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>warnings panel</h3>
        <ul>{selectedRun.drawingBOQ.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
      </section>

      <section aria-label="Drawing-to-Manufacturing Package Panel">
        <h2>Drawing-to-Manufacturing Package panel</h2>
        <h3>cutting list table</h3>
        <table><tbody>{selectedRun.drawingManufacturingPackage.cuttingList.map((item) => <tr key={item.itemNo}><td>{item.partId}</td><td>{item.material}</td><td>{item.dimensions}</td><td>{item.cuttingMethod}</td></tr>)}</tbody></table>
        <h3>drilling schedule table</h3>
        <table><tbody>{selectedRun.drawingManufacturingPackage.drillingSchedule.map((item) => <tr key={item.itemNo}><td>{item.holeType}</td><td>{item.quantity}</td><td>{item.drillingMethod}</td></tr>)}</tbody></table>
        <h3>weld schedule table</h3>
        <table><tbody>{selectedRun.drawingManufacturingPackage.weldSchedule.map((item) => <tr key={item.itemNo}><td>{item.weldType}</td><td>{item.weldLengthM}</td><td>{item.process}</td></tr>)}</tbody></table>
        <h3>coating schedule table</h3>
        <table><tbody>{selectedRun.drawingManufacturingPackage.coatingSchedule.map((item) => <tr key={item.itemNo}><td>{item.coatingSystem}</td><td>{item.areaM2}</td></tr>)}</tbody></table>
        <h3>production route panel</h3>
        <ol>{selectedRun.drawingManufacturingPackage.productionRoute.map((operation) => <li key={operation}>{operation}</li>)}</ol>
        <h3>manufacturing warnings panel</h3>
        <ul>{selectedRun.drawingManufacturingPackage.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
      </section>

      <section aria-label="Audit Event Table">
        <h2>audit event table</h2>
        <table>
          <thead>
            <tr><th>Order</th><th>Type</th><th>Message</th></tr>
          </thead>
          <tbody>
            {selectedRun.auditEvents.map((event) => (
              <tr key={event.order}><td>{event.order}</td><td>{event.type}</td><td>{event.message}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="Model-Role Audit Event Table">
        <h2>model-role audit event table</h2>
        <table>
          <thead>
            <tr><th>Capability</th><th>Task</th><th>Requested Role</th><th>Fallback</th><th>Sensitive Route</th></tr>
          </thead>
          <tbody>
            {selectedRun.modelRoleAuditEvents.map((event) => (
              <tr key={event.order}>
                <td>{event.capability}</td>
                <td>{event.task}</td>
                <td>{event.requestedRole}</td>
                <td>{event.fallbackRole}</td>
                <td>{event.sensitiveDataRouteRole}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="Export Metadata Panel">
        <h2>export metadata panel</h2>
        <ul>
          {selectedRun.exports.map((exportRecord) => (
            <li key={exportRecord.filename}>{exportRecord.exportType}: {exportRecord.filename} at {exportRecord.createdAt}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Export HTML">
        <h2>Export HTML</h2>
        <a download={`${selectedRun.packageId}-${selectedRun.revision}.html`} href={htmlExportHref}>
          <button type="button">Export HTML</button>
        </a>
        <p>Print / Save as PDF instruction: open the exported HTML package in a browser, then choose Print / Save as PDF.</p>
      </section>
    </main>
  );
}

export default PackageHistoryConsole;
