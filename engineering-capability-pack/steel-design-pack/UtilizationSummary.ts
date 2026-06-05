import type { DesignCheckResult, UtilizationSummaryResult } from './types.js';

export function summarizeUtilization(checks: DesignCheckResult[]): UtilizationSummaryResult {
  const governing = checks.reduce((max, check) => (check.utilization > max.utilization ? check : max), checks[0]);
  return {
    checks,
    governingUtilization: governing.utilization,
    governingCheck: governing.checkName,
    status: checks.every((check) => check.status === 'pass') ? 'pass' : 'fail',
  };
}
