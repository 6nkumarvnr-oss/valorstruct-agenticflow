import { getCapability } from './CapabilityRegistry.js';
import type { OrchestrationCapabilityId, WorkflowPlanStep } from './OrchestrationResult.js';

const TITLES: Record<OrchestrationCapabilityId, string> = {
  'knowledge-graph': 'Query Knowledge Graph for BP-01',
  'manufacturing-core': 'Run Manufacturing Core estimate',
  'steel-design-pack': 'Run Steel Design Pack preliminary check',
  'valor-quotation-pack': 'Run Quotation Pack',
  'shop_drawing_assistant': 'Run Shop Drawing Assistant',
  'drawing_to_boq_extractor': 'Run Drawing-to-BOQ Extractor',
  'drawing_to_manufacturing_package': 'Build Drawing-to-Manufacturing Package',
  'consolidated-report': 'Generate consolidated markdown report',
};

export function buildWorkflowPlan(capabilityIds: OrchestrationCapabilityId[]): WorkflowPlanStep[] {
  return capabilityIds.map((capabilityId, index) => ({
    order: index + 1,
    capabilityId: getCapability(capabilityId).id,
    title: TITLES[capabilityId],
    status: 'pending',
  }));
}
