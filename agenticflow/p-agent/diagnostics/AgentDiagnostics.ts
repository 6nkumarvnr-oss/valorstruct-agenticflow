import type { AuditEntry } from '../../patchd-core/audit/InMemoryAuditLog.js';

export interface AgentAuditSummary {
  eventCount: number;
  eventTypes: string[];
  firstEvent?: string;
  lastEvent?: string;
}

export class AgentDiagnostics {
  summarizeAudit(auditTimeline: AuditEntry[]): AgentAuditSummary {
    return {
      eventCount: auditTimeline.length,
      eventTypes: auditTimeline.map((entry) => entry.type),
      firstEvent: auditTimeline[0]?.message,
      lastEvent: auditTimeline.at(-1)?.message,
    };
  }
}
