import type { OrchestrationCapabilityId } from './OrchestrationResult.js';

export interface RegisteredCapability {
  id: OrchestrationCapabilityId;
  name: string;
  layer: 'graph' | 'manufacturing' | 'engineering' | 'commercial' | 'drawing-intelligence-core' | 'drawing-to-boq-core' | 'drawing-to-manufacturing-core' | 'reporting';
  description: string;
  output: string[];
}

export const CAPABILITY_REGISTRY: RegisteredCapability[] = [
  { id: 'knowledge-graph', name: 'Engineering Knowledge Graph', layer: 'graph', description: 'Trace BP-01 relationships across drawing, part, material, fabrication, inspection, cost and risk.', output: ['linked path', 'recommended capabilities', 'risk context'] },
  { id: 'manufacturing-core', name: 'Manufacturing Core', layer: 'manufacturing', description: 'Estimate base-plate fabrication operations, labor, production time and cost.', output: ['fabrication operations', 'labor estimate', 'production cost'] },
  { id: 'steel-design-pack', name: 'Steel Design Pack', layer: 'engineering', description: 'Run preliminary steel member demand/capacity checks.', output: ['utilization summary', 'governing check', 'engineering warnings'] },
  { id: 'valor-quotation-pack', name: 'Valor Quotation Pack', layer: 'commercial', description: 'Generate BOQ, rate calculation and quotation report.', output: ['BOQ', 'rate calculation', 'quotation summary'] },
  {
    id: 'shop_drawing_assistant',
    name: 'Shop Drawing Assistant',
    layer: 'drawing-intelligence-core',
    description: 'Generate a governed text-based shop drawing package summary from drawing notes without DWG/DXF automation.',
    output: ['part list', 'hole schedule', 'weld notes', 'fabrication notes', 'inspection checklist', 'revision log', 'drawing issue checklist'],
  },
  {
    id: 'drawing_to_boq_extractor',
    name: 'Drawing-to-BOQ Extractor',
    layer: 'drawing-to-boq-core',
    description: 'Convert governed text-based shop drawing summaries into structured BOQ lines and quotation item seeds.',
    output: ['structured BOQ lines', 'quotation item seeds'],
  },
  {
    id: 'drawing_to_manufacturing_package',
    name: 'Drawing-to-Manufacturing Package',
    layer: 'drawing-to-manufacturing-core',
    description: 'Convert drawing intelligence and drawing BOQ outputs into a deterministic fabrication package.',
    output: ['cutting list', 'drilling schedule', 'weld schedule', 'coating schedule', 'inspection plan', 'production route', 'labor estimate', 'production time estimate'],
  },
  { id: 'consolidated-report', name: 'Consolidated Report', layer: 'reporting', description: 'Combine graph, fabrication, engineering and quotation outputs into one markdown package.', output: ['markdown report', 'JSON export', 'HTML/PDF-ready export'] },
];

export function getCapability(id: OrchestrationCapabilityId): RegisteredCapability {
  return CAPABILITY_REGISTRY.find((capability) => capability.id === id) ?? CAPABILITY_REGISTRY[0];
}
