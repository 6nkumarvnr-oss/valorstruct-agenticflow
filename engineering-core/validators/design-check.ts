import type { ValidationResult } from '../types.js';

export interface DesignCheckInput {
  demand: number;
  capacity: number;
  label: string;
}

export function validateDesignCapacity(input: DesignCheckInput): ValidationResult {
  if (input.capacity <= 0) {
    return { status: 'fail', message: `${input.label} capacity must be greater than zero.` };
  }
  const utilisation = Number((input.demand / input.capacity).toFixed(3));
  if (utilisation <= 0.9) {
    return { status: 'pass', utilisation, message: `${input.label} passes with reserve capacity.` };
  }
  if (utilisation <= 1) {
    return { status: 'review', utilisation, message: `${input.label} is close to capacity and needs engineering review.` };
  }
  return { status: 'fail', utilisation, message: `${input.label} exceeds capacity.` };
}
