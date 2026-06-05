import type { SteelDesignInput } from './SteelDesignInput.js';

export interface SteelDesignContext {
  input: SteelDesignInput;
  areaMm2: number;
  yieldStrengthMpa: number;
  estimatedInertiaMm4: number;
  estimatedSectionModulusMm3: number;
  warnings: string[];
}

export interface DesignCheckResult {
  checkName: string;
  demand: number;
  capacity: number;
  utilization: number;
  status: 'pass' | 'fail';
  formula: string;
  notes: string;
}

export interface UtilizationSummaryResult {
  checks: DesignCheckResult[];
  governingUtilization: number;
  governingCheck: string;
  status: 'pass' | 'fail';
}
