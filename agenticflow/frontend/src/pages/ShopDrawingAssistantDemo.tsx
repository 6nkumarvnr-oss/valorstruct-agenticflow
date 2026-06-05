import { useState } from 'react';
import { generateShopDrawingAssistantPackage } from '../../../../drawing-intelligence-core/index.js';

interface FieldEvent {
  target: { value: string };
}

const demoNote = 'BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.';

export function ShopDrawingAssistantDemo() {
  const [drawingNote, setDrawingNote] = useState(demoNote);
  const [assistantPackage, setAssistantPackage] = useState(() => generateShopDrawingAssistantPackage(demoNote));

  return (
    <main className="shop-drawing-assistant-demo">
      <header>
        <p>VALOR STRUCT / AGENTICFLOW</p>
        <h1>Shop Drawing Assistant MVP</h1>
        <p>Text-based assistant for extracting part list, hole schedule, weld notes, fabrication notes, inspection checklist, revision log, and drawing issue checklist.</p>
      </header>

      <section aria-label="Drawing Note Input">
        <h2>drawing note input</h2>
        <textarea value={drawingNote} onChange={(event: FieldEvent) => setDrawingNote(event.target.value)} />
        <button type="button" onClick={() => setAssistantPackage(generateShopDrawingAssistantPackage(drawingNote))}>Generate shop drawing assistant package</button>
      </section>

      <section aria-label="Part List Panel">
        <h2>part list</h2>
        <ul>
          {assistantPackage.partList.map((part) => (
            <li key={part.part}>Part: {part.part}; Material: {part.material}; Dimensions: {part.dimensions}; Shape: {part.shapeType}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Hole Schedule Panel">
        <h2>hole schedule</h2>
        <ul>{assistantPackage.holeSchedule.map((hole) => <li key={hole}>{hole}</li>)}</ul>
      </section>

      <section aria-label="Weld Notes Panel">
        <h2>weld notes</h2>
        <ul>{assistantPackage.weldNotes.map((weld) => <li key={weld}>{weld}</li>)}</ul>
      </section>

      <section aria-label="Fabrication Notes Panel">
        <h2>fabrication notes</h2>
        <ul>{assistantPackage.fabricationNotes.map((note) => <li key={note}>{note}</li>)}</ul>
      </section>

      <section aria-label="Inspection Checklist Panel">
        <h2>inspection checklist</h2>
        <ul>{assistantPackage.inspectionChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section aria-label="Revision Log Panel">
        <h2>revision log</h2>
        <ul>{assistantPackage.revisionLog.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section aria-label="Drawing Issue Checklist Panel">
        <h2>drawing issue checklist</h2>
        <ul>{assistantPackage.drawingIssueChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
    </main>
  );
}

export default ShopDrawingAssistantDemo;
