import type { OrchestrationAuditSummary, WorkflowAuditEvent, WorkflowPlanStep } from './OrchestrationResult.js';

export function createWorkflowAuditEvents(plan: WorkflowPlanStep[]): WorkflowAuditEvent[] {
  return plan.map((step) => ({
    order: step.order,
    type: `${step.capabilityId.toUpperCase().replace(/-/g, '_')}_COMPLETED`,
    message: `${step.title} completed.`,
  }));
}

export function summarizeWorkflowAudit(events: WorkflowAuditEvent[]): OrchestrationAuditSummary {
  return {
    eventCount: events.length,
    eventTypes: events.map((event) => event.type),
    firstEvent: events[0]?.message ?? 'No workflow events.',
    lastEvent: events[events.length - 1]?.message ?? 'No workflow events.',
  };
}
