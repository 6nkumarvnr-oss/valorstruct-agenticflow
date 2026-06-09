import { useState } from 'react';

interface AgentPerformanceView {
  agentId: string;
  agentName: string;
  agentType: string;
  ownerDomain: string;
  totalRuns: number;
  approvals: number;
  rejections: number;
  revisionRequests: number;
  score: number;
  lastDecision: string;
  lastUpdatedAt: string;
}

const initialPerformance: AgentPerformanceView[] = [
  {
    agentId: 'planner.agenticflow.v1',
    agentName: 'P-Agent Planner',
    agentType: 'planner',
    ownerDomain: 'agenticflow-core',
    totalRuns: 1,
    approvals: 1,
    rejections: 0,
    revisionRequests: 0,
    score: 1,
    lastDecision: 'approved',
    lastUpdatedAt: '2026-06-09T00:00:00.000Z',
  },
  {
    agentId: 'engineering.critic.v1',
    agentName: 'Engineering Critic',
    agentType: 'critic',
    ownerDomain: 'engineering',
    totalRuns: 1,
    approvals: 0,
    rejections: 0,
    revisionRequests: 1,
    score: 0.5,
    lastDecision: 'needs_revision',
    lastUpdatedAt: '2026-06-09T00:00:00.000Z',
  },
];

export function GovernedSwarmLearningConsole() {
  const [performance] = useState(initialPerformance);
  const averageScore = performance.reduce((sum, agent) => sum + agent.score, 0) / performance.length;

  return (
    <main className="governed-swarm-learning-console">
      <header>
        <p>AGENTICFLOW / GSRP PHASE 8</p>
        <h1>Governed Swarm Learning Loop</h1>
        <p>Human approval outcomes update agent confidence scores without removing human approval gates.</p>
      </header>

      <section aria-label="GSRP Learning Summary">
        <h2>learning summary</h2>
        <p>Tracked agents: {performance.length}</p>
        <p>Average score: {averageScore.toFixed(3)}</p>
        <p>Rule: approvals increase confidence, revision requests create partial confidence, and rejections reduce confidence.</p>
      </section>

      <section aria-label="GSRP Agent Performance Table">
        <h2>agent performance table</h2>
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Type</th>
              <th>Approvals</th>
              <th>Revision Requests</th>
              <th>Rejections</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {performance.map((agent) => (
              <tr key={agent.agentId}>
                <td>{agent.agentName}</td>
                <td>{agent.agentType}</td>
                <td>{agent.approvals}</td>
                <td>{agent.revisionRequests}</td>
                <td>{agent.rejections}</td>
                <td>{agent.score.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="GSRP Safety Note">
        <h2>safety note</h2>
        <p>Scores guide routing and review priority only. They do not authorize autonomous engineering, quotation, manufacturing, deployment, or release approval.</p>
      </section>
    </main>
  );
}

export default GovernedSwarmLearningConsole;
