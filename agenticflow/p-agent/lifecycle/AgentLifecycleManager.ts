export type AgentLifecycleStatus = 'idle' | 'planning' | 'executing' | 'completed' | 'failed';

export class AgentLifecycleManager {
  private status: AgentLifecycleStatus = 'idle';

  transition(status: AgentLifecycleStatus): AgentLifecycleStatus {
    this.status = status;
    return this.status;
  }

  current(): AgentLifecycleStatus {
    return this.status;
  }
}
