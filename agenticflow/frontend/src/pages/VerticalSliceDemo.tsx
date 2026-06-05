import {
  createVerticalSliceReportJson,
  runVerticalSlice,
  type VerticalSliceSignalInput,
} from '../../../patchd-core/vertical-slice/runVerticalSlice.js';

const defaultSignal: VerticalSliceSignalInput = {
  capabilityId: 'workspace-routing-monitor',
  latencyMs: 1200,
  errorRate: 0.03,
  drift: 0.4,
  tenantImpact: 0.6,
};

function downloadReport(input: VerticalSliceSignalInput): void {
  const reportJson = createVerticalSliceReportJson(runVerticalSlice(input));
  const blob = new Blob([reportJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `agenticflow-vertical-slice-${input.capabilityId}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function readSignalForm(form: HTMLFormElement): VerticalSliceSignalInput {
  const formData = new FormData(form);
  return {
    capabilityId: String(formData.get('capabilityId') || defaultSignal.capabilityId),
    latencyMs: Number(formData.get('latencyMs') || defaultSignal.latencyMs),
    errorRate: Number(formData.get('errorRate') || defaultSignal.errorRate),
    drift: Number(formData.get('drift') || defaultSignal.drift),
    tenantImpact: Number(formData.get('tenantImpact') || defaultSignal.tenantImpact),
  };
}

export function VerticalSliceDemo() {
  const demo = runVerticalSlice(defaultSignal);

  return (
    <main className="vertical-slice-demo">
      <h1>Patch D Organism Vertical Slice</h1>

      <section aria-label="Custom Signal Input Panel">
        <h2>Custom Signal Input Panel</h2>
        <form id="vertical-slice-signal-form">
          <label>
            capabilityId
            <input name="capabilityId" defaultValue={defaultSignal.capabilityId} />
          </label>
          <label>
            latencyMs
            <input name="latencyMs" type="number" defaultValue={defaultSignal.latencyMs} />
          </label>
          <label>
            errorRate
            <input name="errorRate" type="number" step="0.01" defaultValue={defaultSignal.errorRate} />
          </label>
          <label>
            drift
            <input name="drift" type="number" step="0.1" defaultValue={defaultSignal.drift} />
          </label>
          <label>
            tenantImpact
            <input name="tenantImpact" type="number" step="0.1" defaultValue={defaultSignal.tenantImpact} />
          </label>
          <button
            type="button"
            onClick={(event: { currentTarget: { form: HTMLFormElement } }) => downloadReport(readSignalForm(event.currentTarget.form))}
          >
            Export Report
          </button>
        </form>
      </section>

      <section aria-label="Signal received">
        <h2>Signal received</h2>
        <p>Capability: {demo.signal.capabilityId}</p>
        <p>latencyMs: {demo.signal.latencyMs} / threshold {demo.signal.threshold}</p>
        <p>errorRate: {demo.signal.errorRate}</p>
        <p>drift: {demo.signal.drift}</p>
        <p>tenantImpact: {demo.signal.tenantImpact}</p>
      </section>

      <section aria-label="Stability state">
        <h2>Stability state</h2>
        <p>{demo.stabilityState.status}</p>
      </section>

      <section aria-label="Governance decision">
        <h2>Governance decision</h2>
        <p>{demo.governanceDecision.action}</p>
      </section>

      <section aria-label="Execution result">
        <h2>Execution result</h2>
        <p>{demo.executionResult.routing.applied ? 'Routing updated' : 'No routing change'}</p>
      </section>

      <section aria-label="Traffic weight">
        <h2>Traffic weight</h2>
        <p>{demo.trafficWeightBefore} → {demo.trafficWeightAfter}</p>
      </section>

      <section aria-label="Recovery Metrics Viewer">
        <h2>Recovery Metrics Viewer</h2>
        <p>Recovery time: {demo.recoveryMetrics.recoveryTimeMs}ms</p>
        <p>Action effectiveness: {demo.recoveryMetrics.actionEffectiveness}</p>
        <p>Success status: {demo.recoveryMetrics.success ? 'successful' : 'not recovered'}</p>
        <p>Stability before/after: {demo.recoveryMetrics.stabilityBefore} → {demo.recoveryMetrics.stabilityAfter}</p>
      </section>

      <section aria-label="Policy State Viewer">
        <h2>Policy State Viewer</h2>
        <p>Base policy weight: {demo.policyState.basePolicyWeight}</p>
        <p>Adapted policy weight: {demo.policyState.adaptedPolicyWeight}</p>
        <p>Previous weight: {demo.policyState.previousWeight}</p>
        <p>New weight: {demo.policyState.newWeight}</p>
        <p>Reason: {demo.policyState.reason}</p>
      </section>

      <section aria-label="Audit Event Viewer">
        <h2>Audit Event Viewer</h2>
        <ol>
          {demo.auditTimeline.map((entry) => (
            <li key={entry.id}>{entry.atMs}ms — {entry.type}: {entry.message}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}

export default VerticalSliceDemo;
