import { generateBOQ, type BOQItem } from './BOQGenerator.js';
import { generateQuotation, type QuotationResult } from './QuotationGenerator.js';
import type { QuotationInput } from './QuotationInput.js';
import { calculateCommercialSummary, type CommercialSummary } from './RateCalculator.js';
import { generateReport, type ReportResult } from './ReportGenerator.js';
import { calculateSteelMemberWeight, type SimpleCalculationResult } from './SimpleCalculationEngine.js';
import { sampleQuotationInput, validateQuotationInput } from './schema.js';

export interface QuotationWorkflowResult {
  status: 'completed';
  input: QuotationInput;
  boq: BOQItem[];
  summary: CommercialSummary;
  calculation?: SimpleCalculationResult;
  quotation: QuotationResult;
  report: ReportResult;
}

export function runQuotationWorkflow(input: QuotationInput = sampleQuotationInput): QuotationWorkflowResult {
  validateQuotationInput(input);
  const boq = generateBOQ(input.items);
  const summary = calculateCommercialSummary(boq, input.currency, input.overheadPercent, input.profitPercent, input.vatPercent);
  const calculation = input.simpleCalculation ? calculateSteelMemberWeight(input.simpleCalculation) : undefined;
  const quotation = generateQuotation(input, boq, summary, calculation);
  const report = generateReport(input, quotation);
  return {
    status: 'completed',
    input,
    boq,
    summary,
    calculation,
    quotation,
    report,
  };
}

const isDirectRun = typeof process !== 'undefined' && process.argv[1]?.endsWith('runQuotationWorkflow.js');

declare const process: { argv: string[] } | undefined;

if (isDirectRun) {
  console.log(JSON.stringify(runQuotationWorkflow(), null, 2));
}
