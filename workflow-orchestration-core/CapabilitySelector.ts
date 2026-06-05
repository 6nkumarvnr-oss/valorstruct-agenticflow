import type { WorkflowIntent } from './WorkflowIntentClassifier.js';
import type { OrchestrationCapabilityId } from './OrchestrationResult.js';

function insertAfter(capabilityIds: OrchestrationCapabilityId[], capabilityId: OrchestrationCapabilityId, afterId: OrchestrationCapabilityId): OrchestrationCapabilityId[] {
  if (capabilityIds.includes(capabilityId)) {
    return capabilityIds;
  }
  const afterIndex = capabilityIds.indexOf(afterId);
  if (afterIndex !== -1) {
    return [...capabilityIds.slice(0, afterIndex + 1), capabilityId, ...capabilityIds.slice(afterIndex + 1)];
  }
  const reportIndex = capabilityIds.indexOf('consolidated-report');
  return reportIndex === -1
    ? [...capabilityIds, capabilityId]
    : [...capabilityIds.slice(0, reportIndex), capabilityId, ...capabilityIds.slice(reportIndex)];
}

export function selectCapabilities(intent: WorkflowIntent): OrchestrationCapabilityId[] {
  if (intent.name === 'fabrication-quotation-package') {
    let base: OrchestrationCapabilityId[] = ['knowledge-graph', 'manufacturing-core', 'steel-design-pack', 'valor-quotation-pack', 'consolidated-report'];
    if (intent.includeShopDrawingAssistant) {
      base = insertAfter(base, 'shop_drawing_assistant', 'knowledge-graph');
    }
    if (intent.includeDrawingBOQExtractor) {
      base = insertAfter(base, 'drawing_to_boq_extractor', 'shop_drawing_assistant');
    }
    if (intent.includeDrawingManufacturingPackage) {
      base = insertAfter(base, 'drawing_to_manufacturing_package', 'drawing_to_boq_extractor');
    }
    return base;
  }
  let base: OrchestrationCapabilityId[] = ['knowledge-graph', 'consolidated-report'];
  if (intent.includeShopDrawingAssistant) {
    base = insertAfter(base, 'shop_drawing_assistant', 'knowledge-graph');
  }
  if (intent.includeDrawingBOQExtractor) {
    base = insertAfter(base, 'drawing_to_boq_extractor', 'shop_drawing_assistant');
  }
  if (intent.includeDrawingManufacturingPackage) {
    base = insertAfter(base, 'drawing_to_manufacturing_package', 'drawing_to_boq_extractor');
  }
  return base;
}
