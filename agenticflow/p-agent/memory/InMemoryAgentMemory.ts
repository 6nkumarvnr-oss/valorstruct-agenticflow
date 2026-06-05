export interface AgentMemoryEntry<T = unknown> {
  id: string;
  goal: string;
  result: T;
  createdAt: string;
}

export class InMemoryAgentMemory {
  private entries: AgentMemoryEntry[] = [];

  save<T>(goal: string, result: T): AgentMemoryEntry<T> {
    const entry: AgentMemoryEntry<T> = {
      id: `memory-${this.entries.length + 1}`,
      goal,
      result,
      createdAt: new Date().toISOString(),
    };
    this.entries.push(entry as AgentMemoryEntry);
    return entry;
  }

  get(id: string): AgentMemoryEntry | undefined {
    return this.entries.find((entry) => entry.id === id);
  }

  list(): AgentMemoryEntry[] {
    return [...this.entries];
  }
}
