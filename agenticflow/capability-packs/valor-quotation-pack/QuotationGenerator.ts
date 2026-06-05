import type { BOQItem } from './BOQGenerator.js';
import type { CommercialSummary } from './RateCalculator.js';
import type { QuotationInput } from './QuotationInput.js';
import type { SimpleCalculationResult } from './SimpleCalculationEngine.js';

export interface QuotationResult {
  quotationId: string;
  projectName: string;
  clientName: string;
  boq: BOQItem[];
  summary: CommercialSummary;
  calculation?: SimpleCalculationResult;
  terms: string[];
  generatedAt: string;
}

export const DEFAULT_TERMS = [
  'Quotation is valid for 15 days from issue date.',
  'Quantities are based on provided project input and subject to final verification.',
  'Taxes are calculated as shown in the commercial summary.',
];

export function generateQuotation(
  input: QuotationInput,
  boq: BOQItem[],
  summary: CommercialSummary,
  calculation?: SimpleCalculationResult,
): QuotationResult {
  return {
    quotationId: 'VS-QTN-20260302-001',
    projectName: input.projectName,
    clientName: input.clientName,
    boq,
    summary,
    calculation,
    terms: DEFAULT_TERMS,
    generatedAt: '2026-03-02T00:00:00.000Z',
  };
}
