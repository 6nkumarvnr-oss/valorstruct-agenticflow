import type { DrawingBOQConfidence, DrawingBOQLine, DrawingBOQUnit } from './types.js';

interface LineOptions {
  itemNo: number;
  description: string;
  unit: DrawingBOQUnit;
  quantity: number;
  sourcePartId?: string;
  sourceNote?: string;
  confidence?: DrawingBOQConfidence;
  warnings?: string[];
}

function line(category: DrawingBOQLine['category'], options: LineOptions): DrawingBOQLine {
  return {
    itemNo: options.itemNo,
    category,
    description: options.description,
    unit: options.unit,
    quantity: options.quantity,
    sourcePartId: options.sourcePartId,
    sourceNote: options.sourceNote,
    confidence: options.confidence ?? 'high',
    warnings: options.warnings ?? [],
  };
}

export function buildMaterialLine(options: LineOptions): DrawingBOQLine {
  return line('material', options);
}

export function buildCuttingLine(options: LineOptions): DrawingBOQLine {
  return line('cutting', options);
}

export function buildDrillingLine(options: LineOptions): DrawingBOQLine {
  return line('drilling', options);
}

export function buildWeldingLine(options: LineOptions): DrawingBOQLine {
  return line('welding', options);
}

export function buildCoatingLine(options: LineOptions): DrawingBOQLine {
  return line('coating', options);
}

export function buildInspectionLine(options: LineOptions): DrawingBOQLine {
  return line('inspection', options);
}
