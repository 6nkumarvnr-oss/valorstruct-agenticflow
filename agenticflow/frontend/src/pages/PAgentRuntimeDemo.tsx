import { AgentRuntime } from '../../../p-agent/runtime/AgentRuntime.js';

const defaultGoal = 'Stabilize demo capability';

export function PAgentRuntimeDemo() {
  const runtime = new AgentRuntime();
  const result = runtime.run(defaultGoal);
  const patchDResult = result.verticalSliceResult;

  return (
    <main className="p-agent-runtime-demo">
      <h1>P-Agent Runtime Demo</h1>

      <section aria-label="Goal Input">
        <h2>Goal input</h2>
        <input name="goal" defaultValue={defaultGoal} />
      </section>

      <section aria-label="Generated Task Plan">
        <h2>Generated task plan</h2>
        <ol>
          {result.plan.map((task) => (
            <li key={task.id}>{task.order}. {task.title} — {task.status}</li>
          ))}
        </ol>
      </section>

      <section aria-label="Execution Status">
        <h2>Execution status</h2>
        <p>{result.status}</p>
      </section>

      <section aria-label="Patch D Result Summary">
        <h2>Patch D result summary</h2>
        <p>Stability: {patchDResult?.stabilityState.status || 'not run'}</p>
        <p>Decision: {patchDResult?.governanceDecision.action || 'not run'}</p>
        <p>Traffic: {patchDResult?.trafficWeightBefore || 0} → {patchDResult?.trafficWeightAfter || 0}</p>
      </section>

      <section aria-label="Audit Summary">
        <h2>Audit summary</h2>
        <p>Events: {result.auditSummary.eventCount}</p>
        <p>Last: {result.auditSummary.lastEvent}</p>
      </section>

      <section aria-label="Memory Entry">
        <h2>Memory entry</h2>
        <p>{result.memoryEntryId}</p>
      </section>
    </main>
  );
}

export default PAgentRuntimeDemo;
