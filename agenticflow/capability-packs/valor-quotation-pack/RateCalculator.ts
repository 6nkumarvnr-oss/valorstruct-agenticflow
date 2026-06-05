import type { BOQItem } from './BOQGenerator.js';
import type { Currency } from './QuotationInput.js';

export interface CommercialSummary {
  currency: Currency;
  subtotal: number;
  overhead: number;
  profit: number;
  beforeVat: number;
  vat: number;
  grandTotal: number;
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateCommercialSummary(
  boq: BOQItem[],
  currency: Currency,
  overheadPercent: number,
  profitPercent: number,
  vatPercent: number,
): CommercialSummary {
  const subtotal = roundMoney(boq.reduce((total, item) => total + item.directAmount, 0));
  const overhead = roundMoney((subtotal * overheadPercent) / 100);
  const profit = roundMoney(((subtotal + overhead) * profitPercent) / 100);
  const beforeVat = roundMoney(subtotal + overhead + profit);
  const vat = roundMoney((beforeVat * vatPercent) / 100);
  const grandTotal = roundMoney(beforeVat + vat);
  return { currency, subtotal, overhead, profit, beforeVat, vat, grandTotal };
}
