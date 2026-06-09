import { useState } from 'react';
import { runGovernedSwarmReasoning } from '../../../../workflow-orchestration-core/index.js';

interface TextEvent {
  target: { value: string };
}

const defaultRequest = 'Prepare governed engineering quotation package for BP-01 with drawing review, BOQ, quotation, critic review, and human approval packet';

export function GovernedSwarmConsole() {
  const [request, setRequest] = useState(defaultRequest);
  const [result, setResult] = useState(() => runGovernedSwarmReasoning(defaultRequest));

  return (
    <main className="governed-swarm-console">
      <header>
        <p>AGENTICFLOW RESEARCH PROTOCOL</p>
        <h1>Governed Swarm Reasoning Console</h1>
        <p>Planner → Specialist → Critic → Verifier → Governance Judge → Human Approval.</p>
      </header>

      <section aria-label="Swarm Request Input">
        <h2>research request</h2>
        <textarea name="swarmRequest" value={request} onChange={(event: TextEvent) => setRequest(event.target.value)} />
        <button type="button" onClick={() => setResult(runGovernedSwarmReasoning(request))}>Run governed swarm</button>
      </section>

      <section aria-label="Governance Summary">
        <h2>governance summary</h2>
        <p>Run ID: {result.runId}</p>
        <p>Risk level: {result.riskLevel}</p>
        <p>Human approval required: {String(result.humanApprovalRequired)}</p>
        <p>Governance decision: {result.governanceDecision}</p>
      </section>

      <section aria-label="Selected Agents">
        <h2>selected agents</h2>
        <ul>
          {result.selectedAgents.map((agent) => (
            <li key={agent.agentId}>{agent.agentName} — {agent.agentType} — {agent.modelRole} — approval: {agent.approvalRequired}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Capability Contracts">
        <h2>capability contracts</h2>
        <ul>
          {result.capabilityContracts.map((contract) => (
            <li key={contract.capabilityId}>{contract.name}: inputs {contract.inputs.join(', ')} → outputs {contract.outputs.join(', ')}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Selected Plan">
        <h2>selected plan</h2>
        <ol>
          {result.selectedPlan.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section aria-label="Candidate Outputs">
        <h2>candidate outputs</h2>
        <ul>
          {result.candidateOutputs.map((candidate) => (
            <li key={`${candidate.agentId}-${candidate.title}`}>{candidate.title}: {candidate.summary} confidence {candidate.confidenceScore}</li>
          ))}
        </ul>
      </section>

      <section aria-label="Critique and Verification">
        <h2>critique and verification</h2>
        <p>Verification status: {result.verification.status}</p>
        <p>Checks passed: {result.verification.checksPassed.join(', ')}</p>
        <p>Checks failed: {result.verification.checksFailed.join(', ') || 'none'}</p>
        <ul>
          {result.critiques.map((critique) => (
            <li key={`${critique.criticAgentId}-${critique.targetAgentId}`}>{critique.criticAgentId} → {critique.targetAgentId}: {critique.findings.join('; ')} [{critique.recommendation}]</li>
          ))}
        </ul>
      </section>

      <section aria-label="Approval Packet">
        <h2>approval packet</h2>
        <p>{result.finalOutputPackage.summary}</p>
        <ul>
          {result.finalOutputPackage.approvalPacket.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section aria-label="Audit Trail">
        <h2>audit trail</h2>
        <ol>
          {result.auditEvents.map((event) => <li key={event}>{event}</li>)}
        </ol>
      </section>
    </main>
  );
}

export default GovernedSwarmConsole;
