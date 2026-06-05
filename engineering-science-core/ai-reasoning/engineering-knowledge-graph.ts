export interface KnowledgeNode { id: string; type: 'Material' | 'Section' | 'Connection' | 'Load' | 'Code' | 'Fabrication' | 'Cost' | 'Risk'; label: string }
export interface KnowledgeEdge { from: string; to: string; relation: string }

export function createEngineeringKnowledgeGraph(nodes: KnowledgeNode[], edges: KnowledgeEdge[]) {
  return {
    nodes,
    edges,
    findLinked(nodeId: string) {
      const linkedIds = edges.filter((edge) => edge.from === nodeId).map((edge) => edge.to);
      return nodes.filter((node) => linkedIds.includes(node.id));
    },
  };
}
