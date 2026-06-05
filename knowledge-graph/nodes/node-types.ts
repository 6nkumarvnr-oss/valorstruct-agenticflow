export type KnowledgeNodeType =
  | 'Project'
  | 'Material'
  | 'Section'
  | 'Part'
  | 'Drawing'
  | 'Connection'
  | 'Fabrication'
  | 'Inspection'
  | 'Supplier'
  | 'Cost'
  | 'Code'
  | 'Risk';

export interface KnowledgeNode<TData extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  data: TData;
}

export function createNode<TData extends Record<string, unknown>>(type: KnowledgeNodeType, id: string, label: string, data: TData): KnowledgeNode<TData> {
  return { id, type, label, data };
}
