import type { InMemoryAuditLog } from '../audit/InMemoryAuditLog.js';
import type { StabilityEngine, StabilityState } from '../stability/StabilityEngine.js';
import { GovernanceFeedbackLoop, type PolicyAdaptation } from '../governance/GovernanceFeedbackLoop.js';
import { AnalyticsStateStore } from './AnalyticsStateStore.js';

export interface RecoveryAnalysis {
  recovered: boolean;
  recoveryTimeMs: number;
  state: StabilityState;
  policyAdaptation: PolicyAdaptation;
}

export class AnalyticsPipeline {
  private readonly feedbackLoop: GovernanceFeedbackLoop;

  constructor(
    private readonly stabilityEngine: StabilityEngine,
    private readonly store: AnalyticsStateStore,
    auditLog?: InMemoryAuditLog,
  ) {
    this.feedbackLoop = new GovernanceFeedbackLoop(store, auditLog);
  }

  analyzeRecovery(previous: StabilityState, observedValue: number, recoveryTimeMs: number): RecoveryAnalysis {
    const state = this.stabilityEngine.detectRecovery(previous, observedValue, recoveryTimeMs);
    this.store.setRecoveryTime(recoveryTimeMs);
    const policyAdaptation = this.feedbackLoop.adaptAfterRecovery(recoveryTimeMs);
    return {
      recovered: state.status === 'RECOVERED',
      recoveryTimeMs,
      state,
      policyAdaptation,
    };
  }
}
