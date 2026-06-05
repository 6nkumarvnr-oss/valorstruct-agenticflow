import { runQuotationWorkflow, type QuotationWorkflowResult } from '../../capability-packs/valor-quotation-pack/runQuotationWorkflow.js';
import { runEngineeringCapabilityWorkflow, type EngineeringCapabilityWorkflowResult } from '../../../engineering-capability-pack/runEngineeringCapabilityWorkflow.js';
import { reasonAboutBasePlateGraph, type KnowledgeGraphReasoningResult } from '../../../knowledge-graph/reasoning/graph-reasoner.js';
import { runVerticalSlice, type VerticalSliceResult } from '../../patchd-core/vertical-slice/runVerticalSlice.js';
import { runWorkflowOrchestration, type OrchestrationResult } from '../../../workflow-orchestration-core/index.js';
import { AgentDiagnostics, type AgentAuditSummary } from '../diagnostics/AgentDiagnostics.js';
import { AgentLifecycleManager } from '../lifecycle/AgentLifecycleManager.js';
import { InMemoryAgentMemory } from '../memory/InMemoryAgentMemory.js';
import { isEngineeringGoal, isKnowledgeGraphGoal, isQuotationGoal, isSteelDesignGoal, isWorkflowOrchestrationGoal, TaskPlanner, type AgentTask } from '../planner/TaskPlanner.js';

export interface AgentRunResult {
  goal: string;
  plan: AgentTask[];
  status: 'completed';
  verticalSliceResult?: VerticalSliceResult;
  capabilityResult?: QuotationWorkflowResult;
  engineeringResult?: EngineeringCapabilityWorkflowResult;
  knowledgeResult?: KnowledgeGraphReasoningResult;
  orchestrationResult?: OrchestrationResult;
  auditSummary: AgentAuditSummary;
  memoryEntryId: string;
}

export class AgentRuntime {
  constructor(
    private readonly planner = new TaskPlanner(),
    private readonly memory = new InMemoryAgentMemory(),
    private readonly lifecycle = new AgentLifecycleManager(),
    private readonly diagnostics = new AgentDiagnostics(),
  ) {}

  run(goal: string): AgentRunResult {
    this.lifecycle.transition('planning');
    const plan = this.planner.createPlan(goal);
    plan[0].status = 'completed';

    this.lifecycle.transition('executing');
    if (isWorkflowOrchestrationGoal(goal)) {
      return this.runWorkflowOrchestrationGoal(goal, plan);
    }
    if (isKnowledgeGraphGoal(goal)) {
      return this.runKnowledgeGraphGoal(goal, plan);
    }
    if (isQuotationGoal(goal)) {
      return this.runQuotationGoal(goal, plan);
    }
    if (isSteelDesignGoal(goal)) {
      return this.runEngineeringGoal(goal, plan);
    }
    if (isEngineeringGoal(goal)) {
      return this.runEngineeringGoal(goal, plan);
    }
    return this.runStabilityGoal(goal, plan);
  }

  getMemory() {
    return this.memory;
  }

  private runStabilityGoal(goal: string, plan: AgentTask[]): AgentRunResult {
    plan[1].status = 'completed';
    const verticalSliceResult = runVerticalSlice({ capabilityId: this.capabilityIdFromGoal(goal) });
    plan[2].status = 'completed';

    const auditSummary = this.diagnostics.summarizeAudit(verticalSliceResult.auditTimeline);
    const memoryEntry = this.memory.save(goal, { verticalSliceResult, auditSummary });
    plan[3].status = 'completed';

    this.lifecycle.transition('completed');
    plan[4].status = 'completed';

    return {
      goal,
      plan,
      status: 'completed',
      verticalSliceResult,
      auditSummary,
      memoryEntryId: memoryEntry.id,
    };
  }

  private runQuotationGoal(goal: string, plan: AgentTask[]): AgentRunResult {
    plan[1].status = 'completed';
    const capabilityResult = runQuotationWorkflow();
    plan[2].status = 'completed';
    plan[3].status = 'completed';
    plan[4].status = 'completed';

    const auditSummary: AgentAuditSummary = {
      eventCount: 5,
      eventTypes: ['GOAL_READ', 'PACK_SELECTED', 'BOQ_GENERATED', 'QUOTE_CALCULATED', 'REPORT_GENERATED'],
      firstEvent: 'Quotation goal received.',
      lastEvent: 'Quotation report generated.',
    };
    const memoryEntry = this.memory.save(goal, { capabilityResult, auditSummary });
    plan[5].status = 'completed';

    this.lifecycle.transition('completed');
    plan[6].status = 'completed';

    return {
      goal,
      plan,
      status: 'completed',
      capabilityResult,
      auditSummary,
      memoryEntryId: memoryEntry.id,
    };
  }




  private runWorkflowOrchestrationGoal(goal: string, plan: AgentTask[]): AgentRunResult {
    const orchestrationResult = runWorkflowOrchestration(goal);
    for (let index = 1; index <= 5; index += 1) plan[index].status = 'completed';

    const auditSummary: AgentAuditSummary = {
      eventCount: orchestrationResult.auditSummary.eventCount + 2,
      eventTypes: [...orchestrationResult.auditSummary.eventTypes, 'P_AGENT_MEMORY_STORED', 'AUDIT_SUMMARY_RETURNED'],
      firstEvent: orchestrationResult.auditSummary.firstEvent,
      lastEvent: 'P-Agent returned orchestration audit summary.',
    };
    const memoryEntry = this.memory.save(goal, { orchestrationResult, auditSummary });
    plan[6].status = 'completed';

    this.lifecycle.transition('completed');
    plan[7].status = 'completed';

    return {
      goal,
      plan,
      status: 'completed',
      orchestrationResult,
      auditSummary,
      memoryEntryId: memoryEntry.id,
    };
  }

  private runKnowledgeGraphGoal(goal: string, plan: AgentTask[]): AgentRunResult {
    plan[1].status = 'completed';
    const knowledgeResult = reasonAboutBasePlateGraph('BP-01');
    plan[2].status = 'completed';

    const auditSummary: AgentAuditSummary = {
      eventCount: 4,
      eventTypes: ['GOAL_READ', 'GRAPH_QUERIED', 'GRAPH_PATH_TRACED', 'CAPABILITY_RECOMMENDED'],
      firstEvent: 'Knowledge graph goal received.',
      lastEvent: `Graph reasoning completed for ${knowledgeResult.subject}.`,
    };
    const memoryEntry = this.memory.save(goal, { knowledgeResult, auditSummary });
    plan[3].status = 'completed';

    this.lifecycle.transition('completed');
    plan[4].status = 'completed';

    return {
      goal,
      plan,
      status: 'completed',
      knowledgeResult,
      auditSummary,
      memoryEntryId: memoryEntry.id,
    };
  }

  private runEngineeringGoal(goal: string, plan: AgentTask[]): AgentRunResult {
    plan[1].status = 'completed';
    const verticalSliceResult = runVerticalSlice({ capabilityId: 'engineering-capability-pack' });
    plan[2].status = 'completed';

    const engineeringResult = runEngineeringCapabilityWorkflow(goal);
    plan[3].status = 'completed';
    if (plan[4]?.title === 'Generate steel design report') {
      plan[4].status = 'completed';
    }

    const patchDAuditSummary = this.diagnostics.summarizeAudit(verticalSliceResult.auditTimeline);
    const auditSummary: AgentAuditSummary = {
      eventCount: patchDAuditSummary.eventCount + 2,
      eventTypes: [...patchDAuditSummary.eventTypes, 'ENGINEERING_PACK_SELECTED', engineeringResult.selectedWorkflow],
      firstEvent: patchDAuditSummary.firstEvent,
      lastEvent: `${engineeringResult.selectedWorkflow} completed under Patch D governance.`,
    };
    const memoryEntry = this.memory.save(goal, { verticalSliceResult, engineeringResult, auditSummary });
    const storeTaskIndex = plan.findIndex((task) => task.title === 'Store result in memory');
    plan[storeTaskIndex].status = 'completed';

    this.lifecycle.transition('completed');
    plan[plan.length - 1].status = 'completed';

    return {
      goal,
      plan,
      status: 'completed',
      verticalSliceResult,
      engineeringResult,
      auditSummary,
      memoryEntryId: memoryEntry.id,
    };
  }

  private capabilityIdFromGoal(goal: string): string {
    return goal.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'demo-capability';
  }
}
