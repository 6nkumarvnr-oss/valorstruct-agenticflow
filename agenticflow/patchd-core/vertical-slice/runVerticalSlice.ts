import { AnalyticsPipeline } from '../analytics/AnalyticsPipeline.js';
import { AnalyticsStateStore } from '../analytics/AnalyticsStateStore.js';
import { InMemoryAuditLog, type AuditEntry } from '../audit/InMemoryAuditLog.js';
import { CompositeEmitter, type ExecutionResult } from '../execution/CompositeEmitter.js';
import type { GatewayRequest, GatewayRouteDecision } from '../../ai-gateway/ModelRoleGateway.js';
import { GovernancePolicyEngine, type GovernanceDecision } from '../governance/GovernancePolicyEngine.js';
import { StabilityEngine, type DriftSignal, type StabilityState } from '../stability/StabilityEngine.js';

export interface VerticalSliceSignalInput {
  capabilityId: string;
  latencyMs: number;
  errorRate: number;
  drift: number;
  tenantImpact: number;
}

export interface PolicyState {
  basePolicyWeight: number;
  adaptedPolicyWeight: number;
  previousWeight: number;
  newWeight: number;
  reason: string;
  gatewayRequest: GatewayRequest;
  gatewayRoute: GatewayRouteDecision;
}

export interface RecoveryMetrics {
  recoveryTimeMs: number;
  actionEffectiveness: number;
  success: boolean;
  stabilityBefore: StabilityState['status'];
  stabilityAfter: StabilityState['status'];
}

export interface VerticalSliceReport {
  signal: DriftSignal;
  decision: GovernanceDecision;
  execution: ExecutionResult;
  audit: AuditEntry[];
  analytics: RecoveryMetrics;
  feedback: PolicyState;
}

export interface VerticalSliceResult {
  signal: DriftSignal;
  stabilityState: StabilityState;
  recoveredState: StabilityState;
  governanceDecision: GovernanceDecision;
  executionResult: ExecutionResult;
  trafficWeightBefore: number;
  trafficWeightAfter: number;
  recoveryDetectedAtMs: number;
  policyWeightBefore: number;
  policyWeightAfter: number;
  policyState: PolicyState;
  recoveryMetrics: RecoveryMetrics;
  report: VerticalSliceReport;
  auditTimeline: AuditEntry[];
}

const DEFAULT_INPUT: VerticalSliceSignalInput = {
  capabilityId: 'workspace-routing-monitor',
  latencyMs: 1200,
  errorRate: 0.03,
  drift: 0.4,
  tenantImpact: 0.6,
};

declare const process: { argv: string[] } | undefined;

export function createDriftSignal(input: Partial<VerticalSliceSignalInput> = {}): DriftSignal {
  const merged = { ...DEFAULT_INPUT, ...input };
  return {
    id: `signal-${merged.capabilityId}`,
    source: 'custom-signal-input-panel',
    capabilityId: merged.capabilityId,
    metric: 'latency_ms',
    value: merged.latencyMs,
    threshold: 500,
    latencyMs: merged.latencyMs,
    errorRate: merged.errorRate,
    drift: merged.drift,
    tenantImpact: merged.tenantImpact,
    receivedAtMs: 0,
  };
}

export function exportVerticalSliceReport(result: VerticalSliceResult): VerticalSliceReport {
  return {
    signal: result.signal,
    decision: result.governanceDecision,
    execution: result.executionResult,
    audit: result.auditTimeline,
    analytics: result.recoveryMetrics,
    feedback: result.policyState,
  };
}

export function createVerticalSliceReportJson(result: VerticalSliceResult): string {
  return JSON.stringify(exportVerticalSliceReport(result), null, 2);
}

export function runVerticalSlice(input: Partial<VerticalSliceSignalInput> = {}): VerticalSliceResult {
  const auditLog = new InMemoryAuditLog();
  const store = new AnalyticsStateStore();
  const stabilityEngine = new StabilityEngine(auditLog);
  const governancePolicyEngine = new GovernancePolicyEngine(auditLog);
  const emitter = new CompositeEmitter(auditLog);
  const analytics = new AnalyticsPipeline(stabilityEngine, store, auditLog);

  const signal = createDriftSignal(input);
  auditLog.append('SIGNAL_RECEIVED', 'Signal received from custom input panel.', signal as unknown as Record<string, unknown>, 0);

  const stabilityState = stabilityEngine.classify(signal);
  const policyWeightBefore = store.snapshot().policyWeight;
  const governanceDecision = governancePolicyEngine.decide(stabilityState, policyWeightBefore);
  const trafficWeightBefore = store.snapshot().trafficWeight;
  const executionResult = emitter.emit(governanceDecision, { trafficWeight: trafficWeightBefore }, 100);
  store.setTrafficWeight(executionResult.routing.nextWeight);

  const recoveredLatency = Math.min(signal.threshold - 80, Math.round(signal.latencyMs * 0.35));
  const recovery = analytics.analyzeRecovery(stabilityState, recoveredLatency, 5000);
  const policyWeightAfter = store.snapshot().policyWeight;
  const trafficWeightAfter = store.snapshot().trafficWeight;
  const actionEffectiveness = Number((trafficWeightBefore - trafficWeightAfter).toFixed(2));
  const policyState: PolicyState = {
    basePolicyWeight: 1.0,
    adaptedPolicyWeight: policyWeightAfter,
    previousWeight: recovery.policyAdaptation.previousPolicyWeight,
    newWeight: recovery.policyAdaptation.nextPolicyWeight,
    reason: recovery.policyAdaptation.reason,
    gatewayRequest: recovery.policyAdaptation.gatewayRequest,
    gatewayRoute: recovery.policyAdaptation.gatewayRoute,
  };
  const recoveryMetrics: RecoveryMetrics = {
    recoveryTimeMs: recovery.recoveryTimeMs,
    actionEffectiveness,
    success: recovery.recovered,
    stabilityBefore: stabilityState.status,
    stabilityAfter: recovery.state.status,
  };
  const auditTimeline = auditLog.list();
  const result: Omit<VerticalSliceResult, 'report'> = {
    signal,
    stabilityState,
    recoveredState: recovery.state,
    governanceDecision,
    executionResult,
    trafficWeightBefore,
    trafficWeightAfter,
    recoveryDetectedAtMs: recovery.recoveryTimeMs,
    policyWeightBefore,
    policyWeightAfter,
    policyState,
    recoveryMetrics,
    auditTimeline,
  };

  return {
    ...result,
    report: exportVerticalSliceReport(result as VerticalSliceResult),
  };
}

const isDirectRun = typeof process !== 'undefined' && process.argv[1]?.endsWith('runVerticalSlice.js');

if (isDirectRun) {
  console.log(JSON.stringify(runVerticalSlice(), null, 2));
}
