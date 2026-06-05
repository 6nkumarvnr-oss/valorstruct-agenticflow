import type { KnowledgeEdge } from '../edges/edge-types.js';
import type { KnowledgeGraph } from '../nodes/base-plate-graph.js';
import type { KnowledgeNode, KnowledgeNodeType } from '../nodes/node-types.js';

export function findNode(graph: KnowledgeGraph, id: string): KnowledgeNode | undefined {
  return graph.nodes.find((node) => node.id === id);
}

export function findNodesByType(graph: KnowledgeGraph, type: KnowledgeNodeType): KnowledgeNode[] {
  return graph.nodes.filter((node) => node.type === type);
}

export function findOutgoing(graph: KnowledgeGraph, nodeId: string): KnowledgeEdge[] {
  return graph.edges.filter((edge) => edge.from === nodeId);
}

export function findNeighbors(graph: KnowledgeGraph, nodeId: string): KnowledgeNode[] {
  return findOutgoing(graph, nodeId)
    .map((edge) => findNode(graph, edge.to))
    .filter((node): node is KnowledgeNode => Boolean(node));
}

export function tracePath(graph: KnowledgeGraph, startId: string, endId: string): KnowledgeNode[] {
  const queue: string[][] = [[startId]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const path = queue.shift() ?? [];
    const current = path[path.length - 1];
    if (current === endId) return path.map((id) => findNode(graph, id)).filter((node): node is KnowledgeNode => Boolean(node));
    if (visited.has(current)) continue;
    visited.add(current);
    for (const edge of findOutgoing(graph, current)) queue.push([...path, edge.to]);
  }

  return [];
}
