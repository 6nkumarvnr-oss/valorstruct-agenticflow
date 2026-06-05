export { createEdge } from './edges/edge-types.js';
export type { KnowledgeEdge, KnowledgeEdgeType } from './edges/edge-types.js';
export { createBasePlateKnowledgeGraph } from './nodes/base-plate-graph.js';
export type { KnowledgeGraph } from './nodes/base-plate-graph.js';
export { createNode } from './nodes/node-types.js';
export type { KnowledgeNode, KnowledgeNodeType } from './nodes/node-types.js';
export { findNeighbors, findNode, findNodesByType, findOutgoing, tracePath } from './queries/graph-queries.js';
export { reasonAboutBasePlateGraph } from './reasoning/graph-reasoner.js';
export type { KnowledgeGraphReasoningResult } from './reasoning/graph-reasoner.js';
