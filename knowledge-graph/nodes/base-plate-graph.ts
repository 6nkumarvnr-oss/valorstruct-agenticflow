import { createEdge, type KnowledgeEdge } from '../edges/edge-types.js';
import { createNode, type KnowledgeNode } from './node-types.js';

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export function createBasePlateKnowledgeGraph(): KnowledgeGraph {
  const nodes: KnowledgeNode[] = [
    createNode('Project', 'project-demo-steel-platform', 'Sample Steel Platform', { location: 'Saudi Arabia' }),
    createNode('Drawing', 'drawing-bp-001', 'BP-001 Base Plate Drawing', { drawingNo: 'BP-001', revision: 'A' }),
    createNode('Part', 'part-bp-01', 'BP-01', { shape: 'Plate', dimensions: '400x400x20', holes: '4-M20' }),
    createNode('Connection', 'connection-4-m20', '4-M20 Holes', { count: 4, diameterMm: 20 }),
    createNode('Material', 'material-s275', 'S275', { grade: 'S275', densityKgPerM3: 7850 }),
    createNode('Section', 'section-plate-400x400x20', 'Plate 400x400x20', { widthMm: 400, lengthMm: 400, thicknessMm: 20 }),
    createNode('Fabrication', 'fabrication-plasma-cut', 'Plasma Cut', { operation: 'cutting' }),
    createNode('Fabrication', 'fabrication-drill-holes', 'Drill 4 Holes', { operation: 'drilling' }),
    createNode('Fabrication', 'fabrication-paint-c3', 'Paint System C3', { coatingSystem: 'C3' }),
    createNode('Inspection', 'inspection-base-plate', 'Inspection Plan', { checks: ['Dimension Check', 'Hole Check', 'Weld Check', 'DFT Check'] }),
    createNode('Cost', 'cost-bp-01', 'SAR 195', { currency: 'SAR', amount: 195, weightKg: 25.12 }),
    createNode('Code', 'code-sbc', 'SBC', { profile: 'Saudi Building Code' }),
    createNode('Risk', 'risk-preliminary-only', 'Preliminary Engineering Review', { level: 'review', reason: 'MVP estimate; verify before fabrication release.' }),
    createNode('Supplier', 'supplier-valor-fab', 'Valor Fabrication Supplier', { type: 'internal-demo' }),
  ];

  const edges: KnowledgeEdge[] = [
    createEdge('project-demo-steel-platform', 'drawing-bp-001', 'CONTAINS', 'project contains drawing'),
    createEdge('drawing-bp-001', 'part-bp-01', 'SPECIFIES', 'drawing specifies BP-01'),
    createEdge('part-bp-01', 'section-plate-400x400x20', 'SPECIFIES', 'part uses plate dimensions'),
    createEdge('section-plate-400x400x20', 'material-s275', 'USES_MATERIAL', 'plate uses S275'),
    createEdge('material-s275', 'cost-bp-01', 'HAS_WEIGHT', 'material contributes 25.12kg'),
    createEdge('part-bp-01', 'fabrication-plasma-cut', 'REQUIRES_OPERATION', 'requires plasma cut'),
    createEdge('part-bp-01', 'connection-4-m20', 'HAS_HOLE_PATTERN', 'requires 4-M20 holes'),
    createEdge('connection-4-m20', 'fabrication-drill-holes', 'REQUIRES_OPERATION', 'requires drilling'),
    createEdge('part-bp-01', 'fabrication-paint-c3', 'HAS_COATING', 'requires paint C3'),
    createEdge('part-bp-01', 'inspection-base-plate', 'REQUIRES_INSPECTION', 'requires inspection plan'),
    createEdge('part-bp-01', 'cost-bp-01', 'HAS_COST', 'estimated at SAR 195'),
    createEdge('part-bp-01', 'code-sbc', 'GOVERNED_BY', 'governed by SBC profile'),
    createEdge('part-bp-01', 'risk-preliminary-only', 'HAS_RISK', 'requires engineering review'),
    createEdge('part-bp-01', 'supplier-valor-fab', 'SUPPLIED_BY', 'fabrication supplier candidate'),
  ];

  return { nodes, edges };
}
