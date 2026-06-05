export type AuditEventType =
  | 'SIGNAL_RECEIVED'
  | 'STABILITY_CLASSIFIED'
  | 'GOVERNANCE_DECIDED'
  | 'EXECUTION_EMITTED'
  | 'RECOVERY_DETECTED'
  | 'POLICY_ADAPTED';

export interface AuditEntry {
  id: string;
  atMs: number;
  type: AuditEventType;
  message: string;
  data: Record<string, unknown>;
}

export class InMemoryAuditLog {
  private entries: AuditEntry[] = [];

  append(type: AuditEventType, message: string, data: Record<string, unknown>, atMs = 0): AuditEntry {
    const entry: AuditEntry = {
      id: `${type}-${this.entries.length + 1}`,
      atMs,
      type,
      message,
      data,
    };
    this.entries.push(entry);
    return entry;
  }

  list(): AuditEntry[] {
    return [...this.entries];
  }
}
