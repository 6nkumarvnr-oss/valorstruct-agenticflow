import { AgentRuntime, type AgentRunResult } from '../runtime/AgentRuntime.js';

export interface RunAgentRequest {
  goal: string;
}

export function runAgent(request: RunAgentRequest, runtime = new AgentRuntime()): AgentRunResult {
  return runtime.run(request.goal);
}

const isDirectRun = typeof process !== 'undefined' && process.argv[1]?.endsWith('runAgent.js');

declare const process: { argv: string[] } | undefined;

if (isDirectRun) {
  const goal = process.argv[2] || 'Stabilize demo capability';
  console.log(JSON.stringify(runAgent({ goal }), null, 2));
}
