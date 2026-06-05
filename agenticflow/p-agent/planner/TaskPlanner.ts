export type AgentTaskStatus = 'pending' | 'completed';

export interface AgentTask {
  id: string;
  order: number;
  title: string;
  status: AgentTaskStatus;
}

const STABILITY_TASK_TITLES = [
  'Read goal',
  'Create stability signal',
  'Run Patch D vertical slice',
  'Store result in memory',
  'Return execution summary',
];

const QUOTATION_TASK_TITLES = [
  'Read user goal',
  'Select Valor Quotation Pack',
  'Generate BOQ',
  'Calculate quotation',
  'Generate report',
  'Store result in memory',
  'Return summary',
];

const ENGINEERING_TASK_TITLES = [
  'Read user goal',
  'Select Engineering Capability Pack',
  'Run Patch D governance gate',
  'Execute Engineering Core workflow',
  'Store result in memory',
  'Return engineering summary',
];

const STEEL_DESIGN_TASK_TITLES = [
  'Read steel design goal',
  'Select Steel Design Pack',
  'Run Patch D governance gate',
  'Execute preliminary steel design checks',
  'Generate steel design report',
  'Store result in memory',
  'Return steel design summary',
];

const KNOWLEDGE_GRAPH_TASK_TITLES = [
  'Read graph reasoning goal',
  'Query Engineering Knowledge Graph',
  'Trace part manufacturing and cost path',
  'Store result in memory',
  'Return graph reasoning summary',
];

const ORCHESTRATION_TASK_TITLES = [
  'Read orchestration request',
  'Query Knowledge Graph for BP-01',
  'Run Manufacturing Core estimate',
  'Run Steel Design Pack preliminary check',
  'Run Quotation Pack',
  'Generate consolidated markdown report',
  'Store result in P-Agent memory',
  'Return audit summary',
];

export function isWorkflowOrchestrationGoal(goal: string): boolean {
  return /fabrication and quotation package|fabrication package|quotation package|prepare .*BP-?01|orchestration/i.test(goal);
}

export function isKnowledgeGraphGoal(goal: string): boolean {
  return /knowledge graph|graph query|trace|BP-?01|linked to|reason across graph/i.test(goal);
}

export function isQuotationGoal(goal: string): boolean {
  return /quotation|boq|estimate|price|cost/i.test(goal);
}

export function isSteelDesignGoal(goal: string): boolean {
  return /steel design|member check|axial|bending|shear|deflection/i.test(goal);
}

export function isEngineeringGoal(goal: string): boolean {
  return /engineering|steel|member|plate|section|connection|bolt|anchor|code|validation|takeoff|material/i.test(goal);
}

export class TaskPlanner {
  createPlan(goal: string): AgentTask[] {
    const taskTitles = isWorkflowOrchestrationGoal(goal)
      ? ORCHESTRATION_TASK_TITLES
      : isKnowledgeGraphGoal(goal)
        ? KNOWLEDGE_GRAPH_TASK_TITLES
        : isQuotationGoal(goal)
          ? QUOTATION_TASK_TITLES
          : isSteelDesignGoal(goal)
            ? STEEL_DESIGN_TASK_TITLES
            : isEngineeringGoal(goal)
              ? ENGINEERING_TASK_TITLES
              : STABILITY_TASK_TITLES;
    return taskTitles.map((title, index) => ({
      id: `task-${index + 1}`,
      order: index + 1,
      title,
      status: 'pending',
    }));
  }
}
