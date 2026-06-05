import { createGatewayRequest, routeGatewayRequest } from '../../ai-gateway/ModelRoleGateway.js';
import type { GatewayRequest, GatewayRouteDecision } from '../../ai-gateway/ModelRoleGateway.js';
import type { InMemoryAuditLog } from '../audit/InMemoryAuditLog.js';
import type { AnalyticsStateStore } from '../analytics/AnalyticsStateStore.js';

export interface PolicyAdaptation {
  previousPolicyWeight: number;
  nextPolicyWeight: number;
  reason: string;
  gatewayRequest: GatewayRequest;
  gatewayRoute: GatewayRouteDecision;
}

export class GovernanceFeedbackLoop {
  constructor(
    private readonly store: AnalyticsStateStore,
    private readonly auditLog?: InMemoryAuditLog,
  ) {}

  adaptAfterRecovery(recoveryTimeMs: number): PolicyAdaptation {
    const previousPolicyWeight = this.store.snapshot().policyWeight;
    const nextPolicyWeight = Number((previousPolicyWeight + 0.05).toFixed(2));
    const gatewayRequest = createGatewayRequest('PatchD GovernanceFeedbackLoop', 'adapt_policy', {
      recoveryTimeMs,
      previousPolicyWeight,
      nextPolicyWeight,
    });
    const gatewayRoute = routeGatewayRequest(gatewayRequest);
    this.store.setPolicyWeight(nextPolicyWeight);
    const adaptation: PolicyAdaptation = {
      previousPolicyWeight,
      nextPolicyWeight,
      reason: `Recovery at ${recoveryTimeMs}ms confirms DECREASE_TRAFFIC policy; increase policy weight by 0.05.`,
      gatewayRequest,
      gatewayRoute,
    };
    this.auditLog?.append('POLICY_ADAPTED', adaptation.reason, adaptation as unknown as Record<string, unknown>, recoveryTimeMs);
    return adaptation;
  }
}
