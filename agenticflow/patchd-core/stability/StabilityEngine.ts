import { createGatewayRequest, routeGatewayRequest } from '../../ai-gateway/ModelRoleGateway.js';
import type { GatewayRequest, GatewayRouteDecision } from '../../ai-gateway/ModelRoleGateway.js';
import type { InMemoryAuditLog } from '../audit/InMemoryAuditLog.js';

export type StabilityStatus = 'STABLE' | 'WATCH' | 'UNSTABLE' | 'RECOVERED';

export interface DriftSignal {
  id: string;
  source: string;
  capabilityId: string;
  metric: 'latency_ms';
  value: number;
  threshold: number;
  latencyMs: number;
  errorRate: number;
  drift: number;
  tenantImpact: number;
  receivedAtMs: number;
}

export interface StabilityState {
  status: StabilityStatus;
  reason: string;
  severity: number;
  signal: DriftSignal;
  gatewayRequest: GatewayRequest;
  gatewayRoute: GatewayRouteDecision;
}

export class StabilityEngine {
  constructor(private readonly auditLog?: InMemoryAuditLog) {}

  classify(signal: DriftSignal): StabilityState {
    const latencyRatio = signal.threshold === 0 ? 1 : signal.latencyMs / signal.threshold;
    const riskScore = latencyRatio + signal.errorRate * 2 + signal.drift + signal.tenantImpact;
    const status: StabilityStatus = riskScore >= 2.4 ? 'UNSTABLE' : riskScore >= 1.2 ? 'WATCH' : 'STABLE';
    const severity = status === 'UNSTABLE' ? 5 : status === 'WATCH' ? 3 : 1;
    const gatewayRequest = createGatewayRequest('PatchD StabilityEngine', 'classify_stability', {
      capabilityId: signal.capabilityId,
      metric: signal.metric,
      latencyMs: signal.latencyMs,
      threshold: signal.threshold,
    });
    const gatewayRoute = routeGatewayRequest(gatewayRequest);
    const state: StabilityState = {
      status,
      severity,
      signal,
      gatewayRequest,
      gatewayRoute,
      reason: [
        `${signal.capabilityId} risk=${riskScore.toFixed(2)}`,
        `latency=${signal.latencyMs}ms threshold=${signal.threshold}ms`,
        `errorRate=${signal.errorRate}`,
        `drift=${signal.drift}`,
        `tenantImpact=${signal.tenantImpact}`,
      ].join('; '),
    };
    this.auditLog?.append(
      'STABILITY_CLASSIFIED',
      `Stability classified as ${status}`,
      state as unknown as Record<string, unknown>,
      signal.receivedAtMs,
    );
    return state;
  }

  detectRecovery(previous: StabilityState, observedValue: number, observedAtMs: number): StabilityState {
    const recovered = observedValue <= previous.signal.threshold;
    const recoveredSignal: DriftSignal = {
      ...previous.signal,
      value: observedValue,
      latencyMs: observedValue,
    };
    const state: StabilityState = {
      ...previous,
      signal: recoveredSignal,
      gatewayRequest: previous.gatewayRequest,
      gatewayRoute: previous.gatewayRoute,
      status: recovered ? 'RECOVERED' : previous.status,
      severity: recovered ? 1 : previous.severity,
      reason: recovered
        ? `Recovery detected at ${observedAtMs}ms; latency=${observedValue}ms is within threshold=${previous.signal.threshold}ms`
        : `No recovery at ${observedAtMs}ms`,
    };
    if (recovered) {
      this.auditLog?.append('RECOVERY_DETECTED', state.reason, { observedValue, threshold: previous.signal.threshold }, observedAtMs);
    }
    return state;
  }
}
