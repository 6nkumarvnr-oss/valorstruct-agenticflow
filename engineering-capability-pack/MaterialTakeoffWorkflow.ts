import { calculateMemberWeight } from '../engineering-core/calculators/member-weight.js';
import { calculatePlateWeight } from '../engineering-core/calculators/plate-weight.js';
import type { MemberWeightInput } from '../engineering-core/calculators/member-weight.js';
import type { PlateWeightInput } from '../engineering-core/calculators/plate-weight.js';

export interface MaterialTakeoffInput {
  members: MemberWeightInput[];
  plates: PlateWeightInput[];
}

export interface MaterialTakeoffWorkflowResult {
  status: 'completed';
  workflow: 'MaterialTakeoffWorkflow';
  members: ReturnType<typeof calculateMemberWeight>[];
  plates: ReturnType<typeof calculatePlateWeight>[];
  totalWeightKg: number;
}

export function runMaterialTakeoffWorkflow(input: MaterialTakeoffInput): MaterialTakeoffWorkflowResult {
  const members = input.members.map(calculateMemberWeight);
  const plates = input.plates.map(calculatePlateWeight);
  const totalWeightKg = Number((
    members.reduce((total, member) => total + member.totalWeightKg, 0)
    + plates.reduce((total, plate) => total + plate.totalWeightKg, 0)
  ).toFixed(2));
  return { status: 'completed', workflow: 'MaterialTakeoffWorkflow', members, plates, totalWeightKg };
}
