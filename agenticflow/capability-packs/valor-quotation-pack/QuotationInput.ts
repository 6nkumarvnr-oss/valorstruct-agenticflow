import type { SimpleCalculationInput } from './SimpleCalculationEngine.js';

export type Currency = 'SAR' | 'USD' | 'AED';

export interface QuotationItemInput {
  description: string;
  unit: string;
  quantity: number;
  materialRate: number;
  laborRate: number;
}

export interface QuotationInput {
  projectName: string;
  clientName: string;
  location: string;
  scopeDescription: string;
  currency: Currency;
  items: QuotationItemInput[];
  overheadPercent: number;
  profitPercent: number;
  vatPercent: number;
  simpleCalculation?: SimpleCalculationInput;
}
