import { createGatewayRequest, routeGatewayRequest } from '../../ai-gateway/ModelRoleGateway.js';
import type { GatewayRequest, GatewayRouteDecision } from '../../ai-gateway/ModelRoleGateway.js';
import type { InMemoryAuditLog } from '../audit/InMemoryAuditLog.js';
import type { StabilityState } from '../stability/StabilityEngine.js';

export type GovernanceAction = 'DECREASE_TRAFFIC' | 'OBSERVE' | 'NO_ACTION';

export interface GovernanceDecision {
  action: GovernanceAction;
  reason: string;
  confidence: number;
  policyWeightBefore: number;
  gatewayRequest: GatewayRequest;
  gatewayRoute: GatewayRouteDecision;
}

export class GovernancePolicyEngine {
  constructor(private readonly auditLog?: InMemoryAuditLog) {}

  decide(stability: StabilityState, policyWeight: number): GovernanceDecision {
    const gatewayRequest = createGatewayRequest('PatchD GovernancePolicyEngine', 'decide_governance_policy', {
      stabilityStatus: stability.status,
      severity: stability.severity,
      policyWeight,
    });
    const gatewayRoute = routeGatewayRequest(gatewayRequest);
    const decision: GovernanceDecision =
      stability.status === 'UNSTABLE'
        ? {
            action: 'DECREASE_TRAFFIC',
            reason: 'Unstable latency signal requires traffic reduction before healing.',
            confidence: Math.min(1, 0.9 * policyWeight),
            policyWeightBefore: policyWeight,
            gatewayRequest,
            gatewayRoute,
          }
        : stability.status === 'WATCH'
          ? {
              action: 'OBSERVE',
              reason: 'Signal is elevated but not unstable; continue observation.',
              confidence: 0.65,
              policyWeightBefore: policyWeight,
              gatewayRequest,
              gatewayRoute,
            }
          : {
              action: 'NO_ACTION',
              reason: 'System is stable.',
              confidence: 0.8,
              policyWeightBefore: policyWeight,
              gatewayRequest,
              gatewayRoute,
            };

    this.auditLog?.append('GOVERNANCE_DECIDED', `Governance decided ${decision.action}`, decision as unknown as Record<string, unknown>, stability.signal.receivedAtMs);
    return decision;
  }
}
