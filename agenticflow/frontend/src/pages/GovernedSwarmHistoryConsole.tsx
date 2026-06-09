import { useState } from 'react';
import { runGovernedSwarmReasoning } from '../../../../workflow-orchestration-core/index.js';

type ApprovalStatus = 'pending-human-approval' | 'approved' | 'rejected' | 'needs-revision';

interface ApprovalDecisionView {
  id: string;
  decision: string;
  decidedBy: string;
  userEmail: string;
  userRole: string;
  reason: string;
  decidedAt: string;
}

interface PersistedSwarmRunView {
  id: string;
  request: string;
  riskLevel: string;
  governanceDecision: string;
  approvalStatus: ApprovalStatus;
  humanApprovalRequired: boolean;
  selectedAgents: { agentId: string; agentName: string; agentType: string; modelRole: string }[];
  selectedPlan: string[];
  auditEvents: string[];
  approvalDecisions: ApprovalDecisionView[];
  createdAt: string;
}

const demoRun = runGovernedSwarmReasoning('Prepare engineering quotation package for BP-01 with BOQ, critic review, verification, and human approval');

const initialRuns: PersistedSwarmRunView[] = [
  {
    id: demoRun.runId,
    request: demoRun.request,
    riskLevel: demoRun.riskLevel,
    governanceDecision: demoRun.governanceDecision,
    approvalStatus: 'pending-human-approval',
    humanApprovalRequired: demoRun.humanApprovalRequired,
    selectedAgents: demoRun.selectedAgents,
    selectedPlan: demoRun.selectedPlan,
    auditEvents: demoRun.auditEvents,
    approvalDecisions: [],
    createdAt: '2026-06-09T00:00:00.000Z',
  },
];

export function GovernedSwarmHistoryConsole() {
  const [runs, setRuns] = useState(initialRuns);
  const [selectedRunId, setSelectedRunId] = useState(initialRuns[0].id);
  const selectedRun = runs.find((run) => run.id === selectedRunId) ?? runs[0];

  const recordDecision = (decision: ApprovalStatus) => {
    const nextRuns = runs.map((run: PersistedSwarmRunView) => {
      if (run.id !== selectedRun.id) return run;
      const normalizedDecision = decision === 'needs-revision' ? 'needs_revision' : decision;
      return {
        ...run,
        approvalStatus: decision,
        approvalDecisions: [
          ...run.approvalDecisions,
          {
            id: `demo-gsrp-decision-${run.approvalDecisions.length + 1}`,
            decision: normalizedDecision,
            decidedBy: 'Senior Structural Engineer',
            userEmail: 'senior.engineer@valorstruct.local',
            userRole: 'Senior Structural Engineer',
            reason: 'Human review decision recorded in the GSRP approval history console.',
            decidedAt: '2026-06-09T00:00:00.000Z',
          },
        ],
      };
    });
    setRuns(nextRuns);
  };

  return (
    <main className="governed-swarm-history-console">
      <header>
        <p>AGENTICFLOW / GSRP</p>
        <h1>Governed Swarm Approval History</h1>
        <p>Persistent run review pattern for human approval, rejection, revision, and audit history.</p>
      </header>

      <section aria-label="GSRP Run List">
        <h2>gsrp run list</h2>
        <ul>
          {runs.map((run) => (
            <li key={run.id}>
              <button type="button" onClick={() => setSelectedRunId(run.id)}>{run.id}</button>
              {' '}— {run.riskLevel} — {run.approvalStatus}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="GSRP Run Detail">
        <h2>gsrp run detail</h2>
        <p>Request: {selectedRun.request}</p>
        <p>Governance decision: {selectedRun.governanceDecision}</p>
        <p>Human approval required: {String(selectedRun.humanApprovalRequired)}</p>
        <p>Created at: {selectedRun.createdAt}</p>
      </section>

      <section aria-label="GSRP Selected Agents">
        <h2>selected agents</h2>
        <ul>{selectedRun.selectedAgents.map((agent) => <li key={agent.agentId}>{agent.agentName} — {agent.agentType} — {agent.modelRole}</li>)}</ul>
      </section>

      <section aria-label="GSRP Approval Actions">
        <h2>approval actions</h2>
        <button type="button" onClick={() => recordDecision('approved')}>approve GSRP run</button>
        <button type="button" onClick={() => recordDecision('needs-revision')}>request revision</button>
        <button type="button" onClick={() => recordDecision('rejected')}>reject GSRP run</button>
      </section>

      <section aria-label="GSRP Approval Decision History">
        <h2>approval decision history</h2>
        {selectedRun.approvalDecisions.length ? (
          <ol>
            {selectedRun.approvalDecisions.map((decision) => (
              <li key={decision.id}>{decision.decision} by {decision.decidedBy} ({decision.userRole}) — {decision.reason}</li>
            ))}
          </ol>
        ) : (
          <p>No human approval decision has been recorded yet.</p>
        )}
      </section>

      <section aria-label="GSRP Audit Trail">
        <h2>audit trail</h2>
        <ol>{selectedRun.auditEvents.map((event) => <li key={event}>{event}</li>)}</ol>
      </section>
    </main>
  );
}

export default GovernedSwarmHistoryConsole;
