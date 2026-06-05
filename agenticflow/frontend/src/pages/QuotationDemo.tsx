import { useState } from 'react';
import type { QuotationInput, QuotationItemInput } from '../../../capability-packs/valor-quotation-pack/QuotationInput.js';
import { runQuotationWorkflow } from '../../../capability-packs/valor-quotation-pack/runQuotationWorkflow.js';
import { sampleQuotationInput } from '../../../capability-packs/valor-quotation-pack/schema.js';

type ProjectTextField = 'projectName' | 'clientName' | 'location' | 'scopeDescription';
type CommercialField = 'overheadPercent' | 'profitPercent' | 'vatPercent';
type ItemTextField = 'description' | 'unit';
type ItemNumberField = 'quantity' | 'materialRate' | 'laborRate';

interface FieldEvent {
  target: {
    value: string;
  };
}

function updateFirstItem(input: QuotationInput, patch: Partial<QuotationItemInput>): QuotationInput {
  const [firstItem, ...remainingItems] = input.items;
  return { ...input, items: [{ ...firstItem, ...patch }, ...remainingItems] };
}

export function QuotationDemo() {
  const [input, setInput] = useState<QuotationInput>(sampleQuotationInput);
  const [result, setResult] = useState(() => runQuotationWorkflow(sampleQuotationInput));
  const item = input.items[0];

  const updateProjectText = (field: ProjectTextField, event: FieldEvent) => {
    setInput({ ...input, [field]: event.target.value });
  };
  const updateCommercialNumber = (field: CommercialField, event: FieldEvent) => {
    setInput({ ...input, [field]: Number(event.target.value) });
  };
  const updateItemText = (field: ItemTextField, event: FieldEvent) => {
    setInput(updateFirstItem(input, { [field]: event.target.value }));
  };
  const updateItemNumber = (field: ItemNumberField, event: FieldEvent) => {
    setInput(updateFirstItem(input, { [field]: Number(event.target.value) }));
  };

  return (
    <main className="quotation-demo">
      <h1>Valor Quotation + BOQ Demo</h1>

      <section aria-label="Project Input">
        <h2>Project Input</h2>
        <label>project name input<input name="projectName" value={input.projectName} onChange={(event: FieldEvent) => updateProjectText('projectName', event)} /></label>
        <label>client name input<input name="clientName" value={input.clientName} onChange={(event: FieldEvent) => updateProjectText('clientName', event)} /></label>
        <label>location input<input name="location" value={input.location} onChange={(event: FieldEvent) => updateProjectText('location', event)} /></label>
        <label>scope description<textarea name="scopeDescription" value={input.scopeDescription} onChange={(event: FieldEvent) => updateProjectText('scopeDescription', event)} /></label>
      </section>

      <section aria-label="Add/Edit BOQ Item Section">
        <h2>Add/edit BOQ item section</h2>
        <label>Description<input name="description" value={item.description} onChange={(event: FieldEvent) => updateItemText('description', event)} /></label>
        <label>Unit<input name="unit" value={item.unit} onChange={(event: FieldEvent) => updateItemText('unit', event)} /></label>
        <label>Quantity<input name="quantity" type="number" value={item.quantity} onChange={(event: FieldEvent) => updateItemNumber('quantity', event)} /></label>
        <label>Material Rate<input name="materialRate" type="number" value={item.materialRate} onChange={(event: FieldEvent) => updateItemNumber('materialRate', event)} /></label>
        <label>Labor Rate<input name="laborRate" type="number" value={item.laborRate} onChange={(event: FieldEvent) => updateItemNumber('laborRate', event)} /></label>
      </section>

      <section aria-label="Commercial Inputs">
        <h2>Commercial Inputs</h2>
        <label>overhead %<input name="overheadPercent" type="number" value={input.overheadPercent} onChange={(event: FieldEvent) => updateCommercialNumber('overheadPercent', event)} /></label>
        <label>profit %<input name="profitPercent" type="number" value={input.profitPercent} onChange={(event: FieldEvent) => updateCommercialNumber('profitPercent', event)} /></label>
        <label>VAT %<input name="vatPercent" type="number" value={input.vatPercent} onChange={(event: FieldEvent) => updateCommercialNumber('vatPercent', event)} /></label>
        <button type="button" onClick={() => setResult(runQuotationWorkflow(input))}>Run quotation</button>
      </section>

      <section aria-label="BOQ Table Output">
        <h2>BOQ table output</h2>
        <table>
          <tbody>
            {result.boq.map((boqItem) => (
              <tr key={boqItem.itemNo}>
                <td>{boqItem.itemNo}</td>
                <td>{boqItem.description}</td>
                <td>{boqItem.directAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="Commercial Summary Output">
        <h2>Commercial summary output</h2>
        <p>Grand total: {result.summary.currency} {result.summary.grandTotal}</p>
      </section>

      <section aria-label="Report Markdown Preview">
        <h2>Report markdown preview</h2>
        <pre>{result.report.reportMarkdown}</pre>
      </section>
    </main>
  );
}

export default QuotationDemo;
