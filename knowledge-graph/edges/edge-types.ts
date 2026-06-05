export type KnowledgeEdgeType =
  | 'CONTAINS'
  | 'SPECIFIES'
  | 'USES_MATERIAL'
  | 'HAS_WEIGHT'
  | 'REQUIRES_OPERATION'
  | 'HAS_HOLE_PATTERN'
  | 'HAS_COATING'
  | 'REQUIRES_INSPECTION'
  | 'HAS_COST'
  | 'GOVERNED_BY'
  | 'HAS_RISK'
  | 'SUPPLIED_BY';

export interface KnowledgeEdge {
  id: string;
  from: string;
  to: string;
  type: KnowledgeEdgeType;
  label: string;
}

export function createEdge(from: string, to: string, type: KnowledgeEdgeType, label: string = type): KnowledgeEdge {
  return { id: `${from}-${type}-${to}`, from, to, type, label };
}
