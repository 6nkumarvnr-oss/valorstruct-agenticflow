import type { QuotationItemInput } from '../agenticflow/capability-packs/valor-quotation-pack/QuotationInput.js';
import type { ShopDrawingAssistantOutput } from '../drawing-intelligence-core/ShopDrawingAssistant.js';

export type DrawingBOQCategory = 'material' | 'cutting' | 'drilling' | 'welding' | 'coating' | 'inspection' | 'fabrication' | 'allowance';
export type DrawingBOQUnit = 'kg' | 'nos' | 'm' | 'm2' | 'lot' | 'hr';
export type DrawingBOQConfidence = 'high' | 'medium' | 'low';

export interface DrawingBOQLine {
  itemNo: number;
  category: DrawingBOQCategory;
  description: string;
  unit: DrawingBOQUnit;
  quantity: number;
  sourcePartId?: string;
  sourceNote?: string;
  confidence: DrawingBOQConfidence;
  warnings: string[];
}

export interface DrawingBOQResult {
  source: 'shop_drawing_assistant' | 'drawing_note';
  partId: string;
  lines: DrawingBOQLine[];
  warnings: string[];
  generatedAt: string;
}

export interface ShopDrawingSummaryInput extends Partial<ShopDrawingAssistantOutput> {
  shopDrawingSummary?: ShopDrawingAssistantOutput;
  parserWarnings?: string[];
}

export type DrawingBOQQuotationItemSeed = QuotationItemInput;
