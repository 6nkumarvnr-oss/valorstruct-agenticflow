import { createBasePlateKnowledgeGraph } from '../nodes/base-plate-graph.js';
import { findNeighbors, findNode, findNodesByType, tracePath } from '../queries/graph-queries.js';

export interface KnowledgeGraphReasoningResult {
  status: 'completed';
  subject: string;
  linkedPath: string[];
  material?: string;
  weightKg?: number;
  fabricationOperations: string[];
  inspectionPlan: string[];
  estimatedCost?: string;
  risks: string[];
  recommendedCapabilities: string[];
}

export function reasonAboutBasePlateGraph(subject = 'BP-01'): KnowledgeGraphReasoningResult {
  const graph = createBasePlateKnowledgeGraph();
  const part = findNodesByType(graph, 'Part').find((node) => node.label.toLowerCase() === subject.toLowerCase()) ?? findNode(graph, 'part-bp-01');
  if (!part) {
    return { status: 'completed', subject, linkedPath: [], fabricationOperations: [], inspectionPlan: [], risks: ['Part not found.'], recommendedCapabilities: [] };
  }

  const neighbors = findNeighbors(graph, part.id);
  const material = findNode(graph, 'material-s275');
  const cost = neighbors.find((node) => node.type === 'Cost');
  const inspection = neighbors.find((node) => node.type === 'Inspection');
  const risks = neighbors.filter((node) => node.type === 'Risk').map((node) => node.label);
  const operationLabels = neighbors.filter((node) => node.type === 'Fabrication').map((node) => node.label);
  const drilling = findNode(graph, 'fabrication-drill-holes');
  if (drilling) operationLabels.splice(1, 0, drilling.label);

  return {
    status: 'completed',
    subject: part.label,
    linkedPath: tracePath(graph, 'drawing-bp-001', 'cost-bp-01').map((node) => node.label),
    material: material?.label,
    weightKg: typeof cost?.data.weightKg === 'number' ? cost.data.weightKg : undefined,
    fabricationOperations: operationLabels,
    inspectionPlan: Array.isArray(inspection?.data.checks) ? inspection.data.checks as string[] : [],
    estimatedCost: cost?.label,
    risks,
    recommendedCapabilities: ['Drawing Intelligence Core', 'Manufacturing Core', 'Steel Design Pack', 'Valor Quotation Pack'],
  };
}
