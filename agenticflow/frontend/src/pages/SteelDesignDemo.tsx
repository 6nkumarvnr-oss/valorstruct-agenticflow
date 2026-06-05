import { runSteelDesignWorkflow, sampleSteelDesignInput } from '../../../../engineering-capability-pack/steel-design-pack/runSteelDesignWorkflow.js';

export function SteelDesignDemo() {
  const result = runSteelDesignWorkflow(sampleSteelDesignInput);

  return (
    <main className="steel-design-demo">
      <h1>Steel Design Pack MVP</h1>
      <p>Preliminary engineering check — not final code-compliant design.</p>

      <section aria-label="Project and Member Input">
        <h2>project/member input</h2>
        <label>Project<input name="projectName" defaultValue={sampleSteelDesignInput.projectName} /></label>
        <label>Member<input name="memberId" defaultValue={sampleSteelDesignInput.memberId} /></label>
      </section>

      <section aria-label="Material and Section Input">
        <h2>material and section input</h2>
        <label>Material<input name="materialGrade" defaultValue={sampleSteelDesignInput.materialGrade} /></label>
        <label>Section<input name="sectionName" defaultValue={sampleSteelDesignInput.sectionName} /></label>
      </section>

      <section aria-label="Demand Input">
        <h2>demand input</h2>
        <label>Axial demand<input name="axialDemandKN" type="number" defaultValue={sampleSteelDesignInput.axialDemandKN} /></label>
        <label>Shear demand<input name="shearDemandKN" type="number" defaultValue={sampleSteelDesignInput.shearDemandKN} /></label>
        <label>Moment demand<input name="momentDemandKNm" type="number" defaultValue={sampleSteelDesignInput.momentDemandKNm} /></label>
        <label>Deflection demand<input name="deflectionDemandMm" type="number" defaultValue={sampleSteelDesignInput.deflectionDemandMm} /></label>
        <button type="button">Run design</button>
      </section>

      <section aria-label="Utilization Table">
        <h2>utilization table</h2>
        <table>
          <tbody>
            {result.summary.checks.map((check) => (
              <tr key={check.checkName}>
                <td>{check.checkName}</td>
                <td>{check.utilization}</td>
                <td>{check.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="Pass/Fail Status">
        <h2>pass/fail status</h2>
        <p>{result.summary.status}</p>
      </section>

      <section aria-label="Markdown Report Preview">
        <h2>markdown report preview</h2>
        <pre>{result.reportMarkdown}</pre>
      </section>
    </main>
  );
}

export default SteelDesignDemo;
