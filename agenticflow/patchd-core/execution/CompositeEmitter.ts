import type { InMemoryAuditLog } from '../audit/InMemoryAuditLog.js';
import type { GovernanceDecision } from '../governance/GovernancePolicyEngine.js';
import { RoutingGovernor, type RoutingResult, type RoutingState } from './RoutingGovernor.js';

export interface ExecutionResult {
  decision: GovernanceDecision;
  routing: RoutingResult;
  emittedAtMs: number;
}

export class CompositeEmitter {
  private readonly routingGovernor = new RoutingGovernor();

  constructor(private readonly auditLog?: InMemoryAuditLog) {}

  emit(decision: GovernanceDecision, routingState: RoutingState, emittedAtMs: number): ExecutionResult {
    const routing = this.routingGovernor.apply(decision, routingState);
    const result: ExecutionResult = { decision, routing, emittedAtMs };
    this.auditLog?.append(
      'EXECUTION_EMITTED',
      `Executed ${decision.action}; traffic weight ${routing.previousWeight} → ${routing.nextWeight}`,
      result as unknown as Record<string, unknown>,
      emittedAtMs,
    );
    return result;
  }
}
