import { AISC } from '../codes/AISC.js';
import { Eurocode } from '../codes/Eurocode.js';
import { SBC } from '../codes/SBC.js';
import type { EngineeringCodeId, ValidationResult } from '../types.js';

const supportedCodes = [SBC, AISC, Eurocode];

export function validateCodeSelection(codeId: EngineeringCodeId): ValidationResult {
  const code = supportedCodes.find((profile) => profile.id === codeId);
  if (!code) {
    return { status: 'fail', message: `Unsupported engineering code: ${codeId}` };
  }
  return { status: 'pass', message: `${code.name} is available for governed checks.` };
}
