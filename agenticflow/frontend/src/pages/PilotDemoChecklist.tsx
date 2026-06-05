const expectedTotals = {
  materialKg: '48.92 kg',
  cuttingNos: '4 nos',
  drillingNos: '8 nos',
  weldingM: '3.20 m',
  coatingM2: '1.10 m2',
  laborHr: '3.30 hr',
  productionHr: '9.80 hr',
  quotation: '837.94 SAR',
};

export function PilotDemoChecklist() {
  return (
    <main className="pilot-demo-checklist">
      <header>
        <p>Valor Struct / AgenticFlow</p>
        <h1>Pilot Demo Checklist</h1>
        <p>Canopy Base Plates Demo — governed engineering AI platform walkthrough.</p>
        <p>Demo Mode badge: MVP local demo mode enabled.</p>
        <p>review-required badge: preliminary package requires Senior Structural Engineer approval.</p>
      </header>

      <section aria-label="Pilot Demo Steps">
        <h2>Guided pilot demo steps</h2>
        <ol>
          <li>login step — sign in as senior.engineer@valorstruct.local with ValorDemo123!</li>
          <li>dashboard step — open the Project Dashboard and confirm workspace context.</li>
          <li>multi-part package step — open the Multi-Part Package Console for Canopy Base Plates Demo.</li>
          <li>review BOQ step — verify material, cutting, drilling, welding, coating, and inspection totals.</li>
          <li>review manufacturing step — verify labor and production hours.</li>
          <li>review quotation step — verify the combined quotation summary.</li>
          <li>approval step — approve as Senior Structural Engineer.</li>
          <li>export step — export JSON/Markdown/HTML and use browser Print / Save as PDF.</li>
        </ol>
      </section>

      <section aria-label="Expected Totals Panel">
        <h2>expected totals panel</h2>
        <ul>
          <li>material 48.92 kg: {expectedTotals.materialKg}</li>
          <li>cutting 4 nos: {expectedTotals.cuttingNos}</li>
          <li>drilling 8 nos: {expectedTotals.drillingNos}</li>
          <li>welding 3.20 m: {expectedTotals.weldingM}</li>
          <li>coating 1.10 m2: {expectedTotals.coatingM2}</li>
          <li>labor 3.30 hr: {expectedTotals.laborHr}</li>
          <li>production 9.80 hr: {expectedTotals.productionHr}</li>
          <li>quotation 837.94 SAR: {expectedTotals.quotation}</li>
        </ul>
      </section>

      <section aria-label="Demo Parts Panel">
        <h2>Canopy Base Plates Demo parts</h2>
        <ul>
          <li>BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.</li>
          <li>BP-02 Plate 300x300x16 S275 with 4-M16 holes and 6mm fillet weld all around.</li>
          <li>BR-01 RHS80x40x2.8 S275 length 2.5m.</li>
        </ul>
      </section>

      <section aria-label="Limitations Disclaimer Panel">
        <h2>limitations/disclaimer panel</h2>
        <p>Preliminary and review-required: this deterministic pilot demo is not a final code-compliant engineering design.</p>
        <p>No OCR, DWG/DXF parsing, CAD automation, external auth provider, or production identity hardening is included in this phase.</p>
      </section>
    </main>
  );
}

export default PilotDemoChecklist;
