import { validateCodeSelection } from '../engineering-core/validators/code-check.js';
import { validateDesignCapacity } from '../engineering-core/validators/design-check.js';
import type { EngineeringCodeId } from '../engineering-core/types.js';

export interface CodeValidationInput {
  codeId: EngineeringCodeId;
  checks: Array<{ label: string; demand: number; capacity: number }>;
}

export function runCodeValidationWorkflow(input: CodeValidationInput) {
  const code = validateCodeSelection(input.codeId);
  const designChecks = input.checks.map(validateDesignCapacity);
  const status = code.status === 'fail' || designChecks.some((check) => check.status === 'fail')
    ? 'fail'
    : designChecks.some((check) => check.status === 'review')
      ? 'review'
      : 'pass';
  return {
    status: 'completed' as const,
    workflow: 'CodeValidationWorkflow' as const,
    input,
    validationStatus: status,
    code,
    designChecks,
  };
}
