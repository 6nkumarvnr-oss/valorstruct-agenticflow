import type { QuotationItemInput } from './QuotationInput.js';

export interface BOQItem {
  itemNo: number;
  description: string;
  unit: string;
  quantity: number;
  materialRate: number;
  laborRate: number;
  directRate: number;
  directAmount: number;
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

export function generateBOQ(items: QuotationItemInput[]): BOQItem[] {
  return items.map((item, index) => {
    const directRate = roundMoney(item.materialRate + item.laborRate);
    return {
      itemNo: index + 1,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      materialRate: item.materialRate,
      laborRate: item.laborRate,
      directRate,
      directAmount: roundMoney(item.quantity * directRate),
    };
  });
}
