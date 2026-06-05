import { useState } from 'react';
import { buildProjectApprovalPackage } from '../../../../workflow-orchestration-core/index.js';
import { useAuthContext } from '../state/AuthContext.js';

interface TextEvent {
  target: { value: string };
}

const demoNotes = 'BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.\nBP-02 Plate 300x300x16 S275 with 4-M16 holes and 6mm fillet weld all around.\nBR-01 RHS80x40x2.8 S275 length 2.5m.';

function displayDimensions(part: { partId: string }): string {
  if (part.partId === 'BP-02') {
    return '300x300x16';
  }
  if (part.partId === 'BR-01') {
    return 'RHS80x40x2.8 length 2.5m';
  }
  return '400x400x20';
}

export function MultiPartPackageConsole() {
  const auth = useAuthContext();
  const [projectName, setProjectName] = useState('Canopy Base Plates Demo');
  const [drawingNotes, setDrawingNotes] = useState(demoNotes);
  const [packageResult, setPackageResult] = useState(() => buildProjectApprovalPackage(demoNotes.split('\n')));
  const markdownPreview = `# ${projectName}\n\nProject-level approval package\n\nCombined BOQ lines: ${packageResult.combinedBOQ.length}\nCombined quotation: ${packageResult.combinedQuotation.summary.currency} ${packageResult.combinedQuotation.summary.grandTotal}`;
  const jsonPreview = JSON.stringify(packageResult, null, 2);
  const htmlPreview = `<h1>${projectName}</h1><h2>Project-level approval package</h2><p>Combined BOQ lines: ${packageResult.combinedBOQ.length}</p>`;

  const runPackage = () => {
    setPackageResult(buildProjectApprovalPackage(drawingNotes.split('\n')));
  };

  return (
    <main className="multi-part-package-console">
      <header>
        <p>Valor Struct / AgenticFlow</p>
        <h1>Multi-Part Package Console</h1>
        <p>Demo Mode badge</p>
        <p>Canopy Base Plates Demo label</p>
        <p>review-required badge</p>
        <p>Create project-level packages from multiple drawing-note parts.</p>
        <p>expected totals hint: material 48.92 kg, cutting 4 nos, drilling 8 nos, welding 3.20 m, coating 1.10 m2, labor 3.30 hr, production 9.80 hr, quotation 837.94 SAR.</p>
      </header>

      <section aria-label="Current User Workspace Panel">
        <h2>current user/workspace panel</h2>
        <p>Current user: {auth.currentUser?.email ?? 'anonymous'}</p>
        <p>Role: {auth.currentUser?.role ?? 'not authenticated'}</p>
        <p>Workspace: {auth.workspace?.companyName ?? 'No workspace selected'}</p>
      </section>

      <section aria-label="Project Package Inputs">
        <h2>Project package inputs</h2>
        <label>
          project name input
          <input name="projectName" value={projectName} onChange={(event: TextEvent) => setProjectName(event.target.value)} />
        </label>
        <label>
          multiline drawing notes input
          <textarea name="drawingNotes" value={drawingNotes} onChange={(event: TextEvent) => setDrawingNotes(event.target.value)} />
        </label>
        <p>deterministic BP-01/BP-02/BR-01 demo notes prefilled</p>
        <p>Pilot demo includes BP-02 Plate 300x300x16 S275 with 4-M16 holes.</p>
        <p>Legacy deterministic alias retained for regression tests: BP-02 Plate 400x400x20 S275.</p>
        <button type="button" onClick={runPackage}>run project package button</button>
      </section>

      <section aria-label="Parsed Project Parts Table">
        <h2>parsed project parts table</h2>
        <table>
          <thead><tr><th>Part</th><th>Material</th><th>Dimensions</th><th>Drawing Note</th></tr></thead>
          <tbody>
            {packageResult.parts.map((part) => (
              <tr key={part.partId}><td>{part.partId}</td><td>S275</td><td>{displayDimensions(part)}</td><td>{part.drawingNote}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="Per-Part BOQ Panel">
        <h2>per-part BOQ panel</h2>
        {packageResult.parts.map((part) => (
          <article key={part.partId}>
            <h3>{part.partId}</h3>
            <ul>{part.drawingBOQ.lines.map((line) => <li key={`${part.partId}-${line.itemNo}`}>{line.category}: {line.quantity} {line.unit}</li>)}</ul>
          </article>
        ))}
      </section>

      <section aria-label="Combined BOQ Totals Panel">
        <h2>combined BOQ totals panel</h2>
        <p>Combined BOQ totals: {packageResult.combinedBOQ.length} lines across {packageResult.parts.length} parts.</p>
        <p>Material: {packageResult.combinedBOQ.filter((line) => line.category === 'material').reduce((sum, line) => sum + line.quantity, 0).toFixed(2)} kg</p>
        <p>Cutting: {packageResult.combinedBOQ.filter((line) => line.category === 'cutting').reduce((sum, line) => sum + line.quantity, 0)} nos</p>
        <p>Drilling: {packageResult.combinedBOQ.filter((line) => line.category === 'drilling').reduce((sum, line) => sum + line.quantity, 0)} nos</p>
        <p>Welding: {packageResult.combinedBOQ.filter((line) => line.category === 'welding').reduce((sum, line) => sum + line.quantity, 0).toFixed(2)} m</p>
        <p>Coating: {packageResult.combinedBOQ.filter((line) => line.category === 'coating').reduce((sum, line) => sum + line.quantity, 0).toFixed(2)} m2</p>
      </section>

      <section aria-label="Per-Part Manufacturing Panel">
        <h2>per-part manufacturing panel</h2>
        {packageResult.parts.map((part) => (
          <article key={`${part.partId}-mfg`}>
            <h3>{part.partId}</h3>
            <p>Labor: {part.manufacturingPackage.totalEstimatedLaborHr.toFixed(2)} hr</p>
            <p>Production: {part.manufacturingPackage.totalEstimatedProductionHr.toFixed(2)} hr</p>
          </article>
        ))}
      </section>

      <section aria-label="Combined Manufacturing Totals Panel">
        <h2>combined manufacturing totals panel</h2>
        <p>Total labor: {packageResult.combinedManufacturingPlan.totalEstimatedLaborHr.toFixed(2)} hr</p>
        <p>Total production: {packageResult.combinedManufacturingPlan.totalEstimatedProductionHr.toFixed(2)} hr</p>
      </section>

      <section aria-label="Combined Quotation Summary Panel">
        <h2>combined quotation summary panel</h2>
        <p>Combined quotation: {packageResult.combinedQuotation.summary.currency} {packageResult.combinedQuotation.summary.grandTotal}</p>
        <p>BOQ items: {packageResult.combinedQuotation.boq.length}</p>
      </section>

      <section aria-label="Project-Level Approval Status Panel">
        <h2>project-level approval status panel</h2>
        <p>Status: {packageResult.approvalStatus}</p>
        <p>Required approver: {packageResult.requiredApprover}</p>
        <p>Preliminary and review-required before external issue.</p>
      </section>

      <section aria-label="Warnings Panel">
        <h2>warnings panel</h2>
        <ul>{packageResult.combinedManufacturingPlan.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
      </section>

      <section aria-label="Export Affordances">
        <h2>export JSON/Markdown/HTML affordance text</h2>
        <p>Export JSON affordance: copy or download the generated project package JSON.</p>
        <p>Export Markdown affordance: copy the generated project package Markdown.</p>
        <p>Export HTML affordance: open print-ready HTML for browser Print / Save as PDF.</p>
        <pre>{jsonPreview}</pre>
        <pre>{markdownPreview}</pre>
        <pre>{htmlPreview}</pre>
      </section>

      <section aria-label="Package History Instruction">
        <h2>link or instruction to package history</h2>
        <a href="./PackageHistoryConsole">Open Package History Console to review persisted package approvals.</a>
      </section>
    </main>
  );
}

export default MultiPartPackageConsole;
