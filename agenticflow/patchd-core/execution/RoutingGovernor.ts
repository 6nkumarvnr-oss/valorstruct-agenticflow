import type { GovernanceDecision } from '../governance/GovernancePolicyEngine.js';

export interface RoutingState {
  trafficWeight: number;
}

export interface RoutingResult {
  previousWeight: number;
  nextWeight: number;
  applied: boolean;
  action: GovernanceDecision['action'];
}

export class RoutingGovernor {
  apply(decision: GovernanceDecision, state: RoutingState): RoutingResult {
    const nextWeight = decision.action === 'DECREASE_TRAFFIC' ? 0.85 : state.trafficWeight;
    return {
      previousWeight: state.trafficWeight,
      nextWeight,
      applied: nextWeight !== state.trafficWeight,
      action: decision.action,
    };
  }
}
