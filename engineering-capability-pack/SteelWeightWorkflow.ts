import { calculateMemberWeight } from '../engineering-core/calculators/member-weight.js';
import type { MemberWeightInput, MemberWeightResult } from '../engineering-core/calculators/member-weight.js';

export interface SteelWeightWorkflowResult {
  status: 'completed';
  workflow: 'SteelWeightWorkflow';
  input: MemberWeightInput;
  result: MemberWeightResult;
}

export function runSteelWeightWorkflow(input: MemberWeightInput): SteelWeightWorkflowResult {
  return {
    status: 'completed',
    workflow: 'SteelWeightWorkflow',
    input,
    result: calculateMemberWeight(input),
  };
}
