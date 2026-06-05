import { useState } from 'react';
import { createPackageExportBundle, runWorkflowOrchestration } from '../../../../workflow-orchestration-core/index.js';
import { useAuthContext } from '../state/AuthContext.js';

interface FieldEvent {
  target: {
    value: string;
    checked?: boolean;
  };
}

const demoSeeds = [
  {
    id: 'bp-01',
    label: 'BP-01 base plate package',
    request: 'Prepare fabrication and quotation package for BP-01',
  },
  {
    id: 'bp-01-shop-drawing',
    label: 'BP-01 shop drawing package',
    request: 'Prepare fabrication and quotation package for BP-01 with shop drawing, hole schedule, and weld notes',
  },
];

const demoShopDrawingNotes = 'BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.';

export function EngineeringPackageConsole() {
  const auth = useAuthContext();
  const [seedId, setSeedId] = useState(demoSeeds[0].id);
  const [request, setRequest] = useState(demoSeeds[0].request);
  const [includeShopDrawingAssistant, setIncludeShopDrawingAssistant] = useState(false);
  const [includeDrawingBOQExtractor, setIncludeDrawingBOQExtractor] = useState(false);
  const [includeDrawingManufacturingPackage, setIncludeDrawingManufacturingPackage] = useState(false);
  const [shopDrawingNotes, setShopDrawingNotes] = useState(demoShopDrawingNotes);
  const [result, setResult] = useState(() => runWorkflowOrchestration(demoSeeds[0].request));
  const exportBundle = createPackageExportBundle(result);
  const htmlExportHref = `data:text/html;charset=utf-8,${encodeURIComponent(exportBundle.html)}`;

  const selectSeed = (nextSeedId: string) => {
    const seed = demoSeeds.find((candidate) => candidate.id === nextSeedId) ?? demoSeeds[0];
    setSeedId(seed.id);
    setRequest(seed.request);
    setIncludeShopDrawingAssistant(seed.id === 'bp-01-shop-drawing');
    setIncludeDrawingBOQExtractor(seed.id === 'bp-01-shop-drawing');
    setIncludeDrawingManufacturingPackage(seed.id === 'bp-01-shop-drawing');
  };

  return (
    <main className="engineering-package-console">
      <header>
        <p>VALOR STRUCT</p>
        <h1>Engineering Package Console</h1>
        <p>Package ID: {result.reportMetadata.packageId} | Revision: {result.reportMetadata.revision}</p>
      </header>

      <section aria-label="Current User Workspace Panel">
        <h2>current user panel</h2>
        <p>role display: {auth.currentUser?.role ?? 'Not authenticated'}</p>
        <p>workspace display: {auth.workspace?.companyName ?? 'No workspace selected'}</p>
        <p>Current user: {auth.currentUser?.email ?? 'anonymous'}</p>
        <button type="button" onClick={auth.logout}>logout button</button>
        <p>Approval actions are tied to the logged-in current user for this MVP workspace flow.</p>
      </section>

      <section aria-label="Demo Seed Selector">
        <h2>Demo seed selector</h2>
        <select name="demoSeed" value={seedId} onChange={(event: FieldEvent) => selectSeed(event.target.value)}>
          {demoSeeds.map((seed) => (
            <option key={seed.id} value={seed.id}>{seed.label}</option>
          ))}
        </select>
      </section>

      <section aria-label="Input Request Box">
        <h2>Input request box</h2>
        <textarea name="packageRequest" value={request} onChange={(event: FieldEvent) => setRequest(event.target.value)} />
      </section>

      <section aria-label="Shop Drawing Assistant Controls">
        <h2>Shop drawing assistant controls</h2>
        <label>
          shop drawing notes input
          <textarea name="shopDrawingNotes" value={shopDrawingNotes} onChange={(event: FieldEvent) => setShopDrawingNotes(event.target.value)} />
        </label>
        <label>
          <input
            checked={includeShopDrawingAssistant}
            name="includeShopDrawingAssistant"
            type="checkbox"
            onChange={(event: FieldEvent) => setIncludeShopDrawingAssistant(Boolean(event.target.checked))}
          />
          include shop drawing assistant checkbox
        </label>
        <label>
          <input
            checked={includeDrawingBOQExtractor}
            name="includeDrawingBOQExtractor"
            type="checkbox"
            onChange={(event: FieldEvent) => {
              const checked = Boolean(event.target.checked);
              setIncludeDrawingBOQExtractor(checked);
              if (checked) {
                setIncludeShopDrawingAssistant(true);
              }
            }}
          />
          include drawing-to-BOQ checkbox
        </label>
        <label>
          <input
            checked={includeDrawingManufacturingPackage}
            name="includeDrawingManufacturingPackage"
            type="checkbox"
            onChange={(event: FieldEvent) => {
              const checked = Boolean(event.target.checked);
              setIncludeDrawingManufacturingPackage(checked);
              if (checked) {
                setIncludeShopDrawingAssistant(true);
                setIncludeDrawingBOQExtractor(true);
              }
            }}
          />
          include drawing-to-manufacturing checkbox
        </label>
      </section>

      <section aria-label="BP-01 Package Run Button">
        <h2>BP-01 package run button</h2>
        <button
          type="button"
          onClick={() => setResult(runWorkflowOrchestration(request, { includeShopDrawingAssistant, includeDrawingBOQExtractor, includeDrawingManufacturingPackage, shopDrawingNotes }))}
        >
          Run BP-01 package
        </button>
      </section>

      <section aria-label="Workflow Step Status">
        <h2>Workflow step status</h2>
        <ol>
          {result.plan.map((step) => (
            <li key={step.order}>{step.order}. {step.title} — {step.status}</li>
          ))}
        </ol>
      </section>

      <section aria-label="Report Branding">
        <h2>Report branding</h2>
        <p>Prepared by: {result.reportMetadata.preparedBy}</p>
        <p>Checked by: {result.reportMetadata.checkedBy}</p>
        <p>Approved by: {result.reportMetadata.approvedBy}</p>
        <p>Export timestamp: {result.reportMetadata.exportTimestamp}</p>
      </section>

      <section aria-label="Package Markdown Preview">
        <h2>Package markdown preview</h2>
        <pre>{result.consolidatedMarkdownReport}</pre>
      </section>

      <section aria-label="Shop Drawing Assistant Summary Panel">
        <h2>Shop Drawing Assistant Summary panel</h2>
        {result.shopDrawingSummary ? (
          <div>
            <h3>Part List</h3>
            <ul>{result.shopDrawingSummary.partList.map((part) => <li key={part.part}>{part.part}: {part.material} {part.dimensions}</li>)}</ul>
            <h3>Hole Schedule</h3>
            <ul>{result.shopDrawingSummary.holeSchedule.map((hole) => <li key={hole}>{hole}</li>)}</ul>
            <h3>Weld Notes</h3>
            <ul>{result.shopDrawingSummary.weldNotes.map((weld) => <li key={weld}>{weld}</li>)}</ul>
            <h3>Fabrication Notes</h3>
            <ul>{result.shopDrawingSummary.fabricationNotes.map((note) => <li key={note}>{note}</li>)}</ul>
            <h3>Inspection Checklist</h3>
            <ul>{result.shopDrawingSummary.inspectionChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>Drawing Issue Checklist</h3>
            <ul>{result.shopDrawingSummary.drawingIssueChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ) : (
          <p>Enable the shop drawing assistant checkbox to add a governed drawing summary.</p>
        )}
      </section>

      <section aria-label="Drawing-to-BOQ Summary Panel">
        <h2>Drawing-to-BOQ Summary panel</h2>
        {result.drawingBOQ ? (
          <div>
            <table>
              <thead>
                <tr><th>item number</th><th>category</th><th>description</th><th>unit</th><th>quantity</th><th>confidence</th></tr>
              </thead>
              <tbody>
                {result.drawingBOQ.lines.map((line) => (
                  <tr key={line.itemNo}>
                    <td>{line.itemNo}</td><td>{line.category}</td><td>{line.description}</td><td>{line.unit}</td><td>{line.quantity}</td><td>{line.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>warnings panel</h3>
            <ul>{result.drawingBOQ.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          </div>
        ) : (
          <p>Enable the include drawing-to-BOQ checkbox to derive BOQ lines from drawing notes.</p>
        )}
      </section>

      <section aria-label="Drawing-to-Manufacturing Package Panel">
        <h2>Drawing-to-Manufacturing Package panel</h2>
        {result.drawingManufacturingPackage ? (
          <div>
            <h3>cutting list table</h3>
            <table><tbody>{result.drawingManufacturingPackage.cuttingList.map((item) => <tr key={item.itemNo}><td>{item.partId}</td><td>{item.material}</td><td>{item.dimensions}</td><td>{item.cuttingMethod}</td></tr>)}</tbody></table>
            <h3>drilling schedule table</h3>
            <table><tbody>{result.drawingManufacturingPackage.drillingSchedule.map((item) => <tr key={item.itemNo}><td>{item.holeType}</td><td>{item.quantity}</td><td>{item.drillingMethod}</td></tr>)}</tbody></table>
            <h3>weld schedule table</h3>
            <table><tbody>{result.drawingManufacturingPackage.weldSchedule.map((item) => <tr key={item.itemNo}><td>{item.weldType}</td><td>{item.weldSizeMm}</td><td>{item.weldLengthM}</td><td>{item.process}</td></tr>)}</tbody></table>
            <h3>coating schedule table</h3>
            <table><tbody>{result.drawingManufacturingPackage.coatingSchedule.map((item) => <tr key={item.itemNo}><td>{item.coatingSystem}</td><td>{item.areaM2}</td><td>{item.preparation}</td></tr>)}</tbody></table>
            <h3>production route panel</h3>
            <ol>{result.drawingManufacturingPackage.productionRoute.map((step) => <li key={step.stepNo}>{step.operation} — {step.station}</li>)}</ol>
            <h3>manufacturing warnings panel</h3>
            <ul>{result.drawingManufacturingPackage.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          </div>
        ) : (
          <p>Enable the include drawing-to-manufacturing checkbox to build a fabrication package.</p>
        )}
      </section>

      <section aria-label="Approval Workflow Status Panel">
        <h2>Approval workflow status panel</h2>
        <p>Status: {result.approvalStatus.status}</p>
        <p>Required approver: {result.approvalStatus.requiredApprover}</p>
        <p>Reason: {result.approvalStatus.reason}</p>
      </section>

      <section aria-label="Audit Trail Panel">
        <h2>Audit trail panel</h2>
        <ul>
          {result.auditEvents.map((event) => (
            <li key={event.order}>{event.type}: {event.message}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Disclaimer">
        <h2>Disclaimer</h2>
        <p>{result.reportMetadata.disclaimer}</p>
      </section>

      <section aria-label="Export JSON">
        <h2>Export JSON</h2>
        <a
          download={exportBundle.jsonFilename}
          href={`data:application/json;charset=utf-8,${encodeURIComponent(exportBundle.json)}`}
        >
          Export JSON
        </a>
        <pre>{exportBundle.json}</pre>
      </section>

      <section aria-label="Export Markdown">
        <h2>Export Markdown</h2>
        <a
          download={exportBundle.markdownFilename}
          href={`data:text/markdown;charset=utf-8,${encodeURIComponent(exportBundle.markdown)}`}
        >
          Export Markdown
        </a>
        <pre>{exportBundle.markdown}</pre>
      </section>

      <section aria-label="Export HTML">
        <h2>Export HTML</h2>
        <a download={exportBundle.htmlFilename} href={htmlExportHref}>
          <button type="button">Export HTML</button>
        </a>
        <p>Print / Save as PDF instruction: open the exported HTML in a browser, then choose Print / Save as PDF.</p>
      </section>

      <section aria-label="Export PDF">
        <h2>Export PDF</h2>
        <a
          download={exportBundle.pdfFilename}
          href={`data:application/pdf;charset=utf-8,${encodeURIComponent(exportBundle.pdf)}`}
        >
          Export PDF
        </a>
      </section>

      <footer>VALOR STRUCT | AgenticFlow demo package | Pending professional approval</footer>
    </main>
  );
}

export default EngineeringPackageConsole;
